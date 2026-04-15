import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";

const TASK_RUNS_DIR = path.join(process.cwd(), "task-runs");
const RUNNER_ENTRY = path.join(process.cwd(), "scripts", "run-scheduled-task.ts");

export type ScheduledDispatchPlan = {
  mode: "shell" | "openclaw-agent" | "session-send";
  commandOrPrompt: string;
  summary: string;
  preferredAgentId?: string;
  allowUserFacingReply?: boolean;
  routeThroughUserSession?: boolean;
};

export function getTaskRunLogPath(taskId: string) {
  return path.join(TASK_RUNS_DIR, `${taskId}.log`);
}

function extractShellSnippet(description: string) {
  const trimmed = description.trim();
  if (!trimmed) return null;

  if (trimmed.toLowerCase().startsWith("shell:")) {
    return trimmed.slice(6).trim();
  }

  const fencedMatch = trimmed.match(/```(?:bash|sh|shell)?\n([\s\S]*?)```/i);
  if (fencedMatch?.[1]?.trim()) {
    return fencedMatch[1].trim();
  }

  return null;
}

function shouldAllowUserFacingReply(description: string) {
  return /(message|reply|send|tell|notify|text|telegram|dm)/i.test(description)
    && /(jr|me|user|chat|telegram|direct message|dm)/i.test(description);
}

export function buildScheduledDispatchPlan(task: { executorType: string; description: string | null; title: string; id: string; assignedTo?: { name: string | null; email: string | null } | null; }) {
  const description = task.description?.trim() || "";
  if (!description) {
    throw new Error("Task description is required for scheduled execution.");
  }

  const shellSnippet = extractShellSnippet(description);
  if (task.executorType === "automation") {
    if (!shellSnippet) {
      throw new Error("Scheduled automation tasks require a shell runbook in the description. Use shell: <command> or a fenced bash block.");
    }

    return {
      mode: "shell",
      commandOrPrompt: shellSnippet,
      summary: "automation shell runbook queued",
    } satisfies ScheduledDispatchPlan;
  }

  if (task.executorType === "hulk") {
    return {
      mode: "session-send",
      preferredAgentId: "main",
      allowUserFacingReply: shouldAllowUserFacingReply(description),
      routeThroughUserSession: true,
      commandOrPrompt: [
        `You are Hulk executing Mission Control scheduled task ${task.id}.`,
        `Task title: ${task.title}`,
        "This wake was injected into JR's real routed chat session. Stay in that session and handle the task there.",
        "Carry out the task as JR's assistant in the normal chat path, not as an isolated cron runner.",
        "Use the assistant's normal tools and workflows when needed to complete the task for real.",
        "Send any user-visible updates or results back through this same routed chat instead of leaving them only in an internal summary.",
        "If the description includes a shell runbook, you may use it, but natural-language instructions should be completed directly through the assistant workflow.",
        "Keep the run self-contained and avoid unrelated work.",
        "If you create files, keep them inside /home/jr/MissionControl unless the task explicitly requires another location.",
        "When the task is complete, give a brief result summary.",
        "Task instructions:",
        description,
      ].join("\n\n"),
      summary: shellSnippet ? "Hulk main-session wake queued (shell-capable)" : "Hulk main-session wake queued",
    } satisfies ScheduledDispatchPlan;
  }

  if (task.executorType === "agent") {
    const assigneeLabel = task.assignedTo?.name?.trim() || task.assignedTo?.email?.trim() || "assigned agent";
    return {
      mode: "openclaw-agent",
      preferredAgentId: task.assignedTo?.email?.split("@")[0]?.trim() || task.assignedTo?.name?.trim() || undefined,
      allowUserFacingReply: shouldAllowUserFacingReply(description),
      routeThroughUserSession: true,
      commandOrPrompt: [
        `You are executing Mission Control scheduled task ${task.id} for ${assigneeLabel}.`,
        `Task title: ${task.title}`,
        "Act as the scheduled agent itself, not as a narrow shell runner.",
        "Work only on the instructions below and keep the run self-contained.",
        "If the task calls for a user-visible reply or outbound message, send that reply directly when practical.",
        "If you create files, keep them inside /home/jr/MissionControl unless the task explicitly says otherwise.",
        "When finished, provide a short completion summary.",
        "Task instructions:",
        description,
      ].join("\n\n"),
      summary: `agent wake queued for ${assigneeLabel}`,
    } satisfies ScheduledDispatchPlan;
  }

  throw new Error(`Unsupported scheduled executor type: ${task.executorType}`);
}

export async function dispatchScheduledTask(task: { id: string; title: string; description: string | null; executorType: string; assignedTo?: { name: string | null; email: string | null } | null; }) {
  buildScheduledDispatchPlan(task);
  await fs.mkdir(TASK_RUNS_DIR, { recursive: true });
  const logPath = getTaskRunLogPath(task.id);
  const output = await fs.open(logPath, "a");
  const child = spawn(process.execPath, [path.join(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs"), RUNNER_ENTRY, task.id], {
    cwd: process.cwd(),
    detached: true,
    stdio: ["ignore", output.fd, output.fd],
    env: process.env,
  });
  output.close().catch(() => undefined);
  child.unref();
  return { queued: true, logPath: getTaskRunLogPath(task.id) };
}

export async function dispatchTaskNow(task: { id: string; title: string; description: string | null; executorType: string; assignedTo?: { name: string | null; email: string | null } | null; }) {
  return dispatchScheduledTask(task);
}
