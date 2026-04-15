import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import { PrismaClient, TaskEventLevel, TaskRunStatus } from "@prisma/client";
import { addTaskEvent, markTaskRunStatus, truncateText } from "../src/lib/task-runs";
import { buildScheduledDispatchPlan, getTaskRunLogPath } from "../src/lib/task-execution";

const DEFAULT_PATH_SEGMENTS = [
  process.env.HOME ? path.join(process.env.HOME, ".npm-global", "bin") : null,
  "/usr/local/sbin",
  "/usr/local/bin",
  "/usr/sbin",
  "/usr/bin",
  "/sbin",
  "/bin",
].filter((value): value is string => Boolean(value));

function buildCommandEnv() {
  const pathSegments = [
    ...DEFAULT_PATH_SEGMENTS,
    ...(process.env.PATH || "").split(":").filter(Boolean),
  ];

  return {
    ...process.env,
    PATH: Array.from(new Set(pathSegments)).join(":"),
  };
}

const commandEnv = buildCommandEnv();
const openClawCommand = process.env.OPENCLAW_BIN || (process.env.HOME ? path.join(process.env.HOME, ".npm-global", "bin", "openclaw") : "openclaw");

const prisma = new PrismaClient();
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(scriptDir, "..");

type RunCommandResult = {
  code: number | null;
  stdout: string;
  stderr: string;
};

type OpenClawSession = {
  key?: string;
  sessionId?: string;
  updatedAt?: number;
  kind?: string;
};

type OpenClawSessionsPayload = {
  sessions?: OpenClawSession[];
};

type OpenClawAgentInfo = {
  id?: string;
  identityName?: string;
};

async function appendLog(runId: string, content: string) {
  const logPath = getTaskRunLogPath(runId);
  await fs.mkdir(path.dirname(logPath), { recursive: true });
  await fs.appendFile(logPath, content);
}

function runCommand(command: string, args: string[], input?: string): Promise<RunCommandResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      env: commandEnv,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stdout, stderr }));

    if (input) child.stdin.end(input);
    else child.stdin.end();
  });
}

function normalizeAgentSlug(value: string | null | undefined) {
  return value?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || null;
}

function parseJsonBlock<T>(raw: string): T | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const arrayStart = trimmed.indexOf("[");
    if (arrayStart >= 0) {
      try {
        return JSON.parse(trimmed.slice(arrayStart)) as T;
      } catch {}
    }

    const objectStart = trimmed.indexOf("{");
    if (objectStart >= 0) {
      try {
        return JSON.parse(trimmed.slice(objectStart)) as T;
      } catch {}
    }
  }

  return null;
}

async function listOpenClawAgents() {
  const result = await runCommand(openClawCommand, ["agents", "list", "--json"]);
  if (result.code !== 0) return [] as OpenClawAgentInfo[];
  const parsed = parseJsonBlock<OpenClawAgentInfo[]>(result.stdout);
  return Array.isArray(parsed) ? parsed : [];
}

async function resolveAgentId(preferredAgentId?: string) {
  const agents = await listOpenClawAgents();
  const bySlug = new Map<string, string>();
  for (const agent of agents) {
    if (!agent.id) continue;
    bySlug.set(normalizeAgentSlug(agent.id) || "", agent.id);
    bySlug.set(normalizeAgentSlug(agent.identityName) || "", agent.id);
  }

  const preferredSlug = normalizeAgentSlug(preferredAgentId);
  if (preferredSlug && bySlug.has(preferredSlug)) {
    return bySlug.get(preferredSlug)!;
  }

  return agents.find((agent) => agent.id === "main")?.id || agents[0]?.id || "main";
}

function isUserFacingSession(session: OpenClawSession, agentId?: string) {
  const key = session.key || "";
  if (session.kind !== "direct" || !session.sessionId || !key.startsWith("agent:")) {
    return false;
  }

  if (agentId && !key.startsWith(`agent:${agentId}:`)) {
    return false;
  }

  return !key.includes(":subagent:")
    && !key.includes(":cron:")
    && !key.endsWith(":main");
}

function scoreUserFacingSession(session: OpenClawSession) {
  const key = session.key || "";
  if (key.includes(":telegram:direct:")) return 3;
  if (key.includes(":direct:")) return 2;
  return 1;
}

async function resolveLatestUserFacingSession(agentId?: string) {
  const result = await runCommand(openClawCommand, ["sessions", "--json"]);
  if (result.code !== 0) return null;

  const payload = parseJsonBlock<OpenClawSessionsPayload>(result.stdout);
  const sessions = Array.isArray(payload?.sessions) ? payload.sessions : [];
  const latest = sessions
    .filter((session) => isUserFacingSession(session, agentId))
    .sort((a, b) => {
      const scoreDiff = scoreUserFacingSession(b) - scoreUserFacingSession(a);
      if (scoreDiff !== 0) return scoreDiff;
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    })[0];

  return latest || null;
}

async function runOpenClawAgent(task: { id: string; executorType: string }, plan: ReturnType<typeof buildScheduledDispatchPlan>) {
  const agentId = await resolveAgentId(plan.preferredAgentId);
  const args = ["agent", "--agent", agentId, "--message", plan.commandOrPrompt, "--timeout", "600", "--json"];
  const routedSession = plan.routeThroughUserSession ? await resolveLatestUserFacingSession(agentId) : null;
  const targetSessionId = routedSession?.sessionId || null;

  if (targetSessionId) {
    args.push("--session-id", targetSessionId, "--deliver");
  } else {
    args.push("--session-id", `mission-control-scheduled-${task.id}`);
  }

  return {
    meta: {
      agentId,
      targetSessionId: targetSessionId || `mission-control-scheduled-${task.id}`,
      delivery: Boolean(targetSessionId),
      routedSessionKey: routedSession?.key || null,
      allowUserFacingReply: Boolean(plan.allowUserFacingReply),
      routeThroughUserSession: Boolean(plan.routeThroughUserSession),
    },
    result: await runCommand(openClawCommand, args),
  };
}

async function runSessionSend(task: { id: string }, plan: ReturnType<typeof buildScheduledDispatchPlan>) {
  const agentId = await resolveAgentId(plan.preferredAgentId);
  const routedSession = plan.routeThroughUserSession ? await resolveLatestUserFacingSession(agentId) : null;

  if (!routedSession?.sessionId) {
    throw new Error(`No routed user-facing session found for agent ${agentId}.`);
  }

  const args = [
    "agent",
    "--agent",
    agentId,
    "--session-id",
    routedSession.sessionId,
    "--message",
    plan.commandOrPrompt,
    "--deliver",
    "--channel",
    "telegram",
    "--reply-channel",
    "telegram",
    "--reply-to",
    "8531650863",
    "--reply-account",
    "default",
    "--timeout",
    "600",
    "--json",
  ];

  const result = await runCommand(openClawCommand, args);

  return {
    meta: {
      agentId,
      routedSessionKey: routedSession.key || null,
      routedSessionId: routedSession.sessionId || null,
      queued: result.code === 0,
      allowUserFacingReply: Boolean(plan.allowUserFacingReply),
      routeThroughUserSession: Boolean(plan.routeThroughUserSession),
      explicitDeliveryChannel: "telegram",
      explicitDeliveryTo: "8531650863",
      explicitDeliveryAccount: "default",
    },
    result,
  };
}

async function main() {
  const taskId = process.argv[2];
  const runId = process.argv[3];
  if (!taskId) throw new Error("Task id argument is required.");
  if (!runId) throw new Error("Task run id argument is required.");

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      title: true,
      description: true,
      executorType: true,
      cronEnabled: true,
      assignedTo: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!task) throw new Error(`Task ${taskId} was not found.`);

  const startedAt = new Date();
  await markTaskRunStatus(runId, {
    status: TaskRunStatus.running,
    startedAt,
    logPath: getTaskRunLogPath(runId),
    summary: `Running ${task.executorType} task \"${task.title}\"`,
  });
  await addTaskEvent({
    taskId,
    runId,
    eventType: "task.run.started",
    message: `Started ${task.executorType} task run.`,
    details: { startedAt: startedAt.toISOString(), title: task.title },
  });
  await appendLog(runId, `\n[${startedAt.toISOString()}] Starting scheduled execution for ${task.executorType} task \"${task.title}\"\n`);

  const plan = buildScheduledDispatchPlan(task);
  await addTaskEvent({
    taskId,
    runId,
    eventType: "task.run.plan",
    message: `Dispatch plan: ${plan.summary}`,
    details: { mode: plan.mode, summary: plan.summary },
  });
  await appendLog(runId, `[${new Date().toISOString()}] Dispatch plan: ${plan.summary}\n`);

  let result: RunCommandResult;
  let meta: Record<string, unknown> | undefined;
  if (plan.mode === "shell") {
    result = await runCommand("bash", ["-lc", plan.commandOrPrompt]);
  } else if (plan.mode === "session-send") {
    const sessionSendRun = await runSessionSend(task, plan);
    meta = sessionSendRun.meta as Record<string, unknown>;
    await addTaskEvent({
      taskId,
      runId,
      eventType: "task.run.dispatch",
      message: `Session send queued through ${sessionSendRun.meta.agentId}.`,
      details: sessionSendRun.meta,
    });
    await appendLog(runId, `[${new Date().toISOString()}] Session send agent: ${sessionSendRun.meta.agentId} | session key: ${sessionSendRun.meta.routedSessionKey} | session id: ${sessionSendRun.meta.routedSessionId || "none"} | queued: ${sessionSendRun.meta.queued} | routeThroughUserSession: ${sessionSendRun.meta.routeThroughUserSession} | allowUserFacingReply: ${sessionSendRun.meta.allowUserFacingReply} | delivery channel: ${sessionSendRun.meta.explicitDeliveryChannel} | delivery to: ${sessionSendRun.meta.explicitDeliveryTo} | delivery account: ${sessionSendRun.meta.explicitDeliveryAccount}\n`);
    result = sessionSendRun.result;
  } else {
    const openclawRun = await runOpenClawAgent(task, plan);
    meta = openclawRun.meta as Record<string, unknown>;
    await addTaskEvent({
      taskId,
      runId,
      eventType: "task.run.dispatch",
      message: `Agent dispatch queued through ${openclawRun.meta.agentId}.`,
      details: openclawRun.meta,
    });
    await appendLog(runId, `[${new Date().toISOString()}] OpenClaw agent: ${openclawRun.meta.agentId} | session: ${openclawRun.meta.targetSessionId} | deliver: ${openclawRun.meta.delivery} | routed session key: ${openclawRun.meta.routedSessionKey || "none"} | routeThroughUserSession: ${openclawRun.meta.routeThroughUserSession} | allowUserFacingReply: ${openclawRun.meta.allowUserFacingReply}\n`);
    result = openclawRun.result;
  }

  const finishedAt = new Date();
  const finalStatus = result.code === 0 ? (task.cronEnabled ? "scheduled" : "completed") : "waiting";
  const stdout = truncateText(result.stdout, 6000);
  const stderr = truncateText(result.stderr, 6000);
  const summary = result.code === 0 ? `Run finished successfully (${finalStatus}).` : `Run failed with exit code ${result.code ?? "null"}.`;

  await appendLog(
    runId,
    [
      `[${finishedAt.toISOString()}] Exit code: ${result.code ?? "null"}`,
      result.stdout ? `STDOUT:\n${result.stdout.trim()}\n` : "",
      result.stderr ? `STDERR:\n${result.stderr.trim()}\n` : "",
    ].filter(Boolean).join("\n") + "\n",
  );

  await prisma.task.update({
    where: { id: task.id },
    data: {
      status: finalStatus as never,
    },
  });

  await markTaskRunStatus(runId, {
    status: result.code === 0 ? TaskRunStatus.succeeded : TaskRunStatus.failed,
    finishedAt,
    exitCode: result.code,
    summary,
    errorMessage: result.code === 0 ? null : truncateText(result.stderr || result.stdout || `Exit code ${result.code ?? "null"}`, 1000),
    errorStack: result.code === 0 ? null : stderr,
    metadata: {
      ...(meta || {}),
      stdout,
      stderr,
      finalTaskStatus: finalStatus,
    },
  });

  await addTaskEvent({
    taskId,
    runId,
    level: result.code === 0 ? TaskEventLevel.info : TaskEventLevel.error,
    eventType: result.code === 0 ? "task.run.succeeded" : "task.run.failed",
    message: summary,
    details: {
      exitCode: result.code,
      stdout,
      stderr,
      finalTaskStatus: finalStatus,
      finishedAt: finishedAt.toISOString(),
    },
  });

  await appendLog(runId, `[${new Date().toISOString()}] Final task status: ${finalStatus}\n`);
}

main()
  .catch(async (error) => {
    const taskId = process.argv[2];
    const runId = process.argv[3];
    if (taskId && runId) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack || error.message : String(error);
      await appendLog(runId, `[${new Date().toISOString()}] Runner failed: ${stack}\n`);
      try {
        await prisma.task.update({ where: { id: taskId }, data: { status: "waiting" } });
      } catch {}
      try {
        await markTaskRunStatus(runId, {
          status: TaskRunStatus.failed,
          finishedAt: new Date(),
          errorMessage: truncateText(message, 1000),
          errorStack: truncateText(stack, 6000),
          summary: `Runner failed before completion: ${message}`,
        });
        await addTaskEvent({
          taskId,
          runId,
          level: TaskEventLevel.error,
          eventType: "task.run.crashed",
          message: `Runner crashed: ${message}`,
          details: { stack: truncateText(stack, 6000) },
        });
      } catch {}
    }
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
