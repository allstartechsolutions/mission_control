import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import { PrismaClient } from "@prisma/client";

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

async function waitFor(check: () => Promise<boolean>, timeoutMs = 30_000, intervalMs = 500) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await check()) return;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(`Timed out after ${timeoutMs}ms waiting for scheduled execution.`);
}

async function exists(targetPath: string) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

type RunCommandResult = {
  code: number | null;
  stdout: string;
  stderr: string;
};

function runCommand(command: string, args: string[]): Promise<RunCommandResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      env: commandEnv,
      stdio: ["ignore", "pipe", "pipe"],
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
  });
}

async function fetchChatHistory(sessionKey: string) {
  const result = await runCommand(openClawCommand, [
    "--no-color",
    "gateway",
    "call",
    "chat.history",
    "--params",
    JSON.stringify({ sessionKey, limit: 40 }),
    "--json",
  ]);

  if (result.code !== 0) {
    throw new Error(`chat.history failed: ${result.stderr || result.stdout}`);
  }

  return JSON.parse(result.stdout) as {
    sessionKey: string;
    sessionId: string;
    messages: Array<{
      role: string;
      content?: Array<{ type?: string; text?: string }>;
    }>;
  };
}

async function main() {
  const appUrl = process.env.TEST_APP_URL || process.env.AUTH_URL || "http://127.0.0.1:3001";
  const cronSecret = process.env.CRON_SECRET || process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!cronSecret) throw new Error("Missing cron secret configuration.");

  const owner = await prisma.user.findFirst({ where: { status: "active" }, orderBy: { createdAt: "asc" } });
  if (!owner) throw new Error("No active user found for scheduled task test.");

  const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const runToken = `${Date.now()}`;
  const hulkChatMarker = `scheduled-hulk-chat-e2e-${runToken}`;
  const automationMarkerPath = path.join(rootDir, "task-runs", `e2e-automation-${runToken}.txt`);
  const targetSessionKey = "agent:main:telegram:direct:8531650863";

  const hulkTask = await prisma.task.create({
    data: {
      title: `E2E scheduled Hulk ${runToken}`,
      description: [
        `Send JR exactly this message in the normal chat: ${hulkChatMarker}`,
        "Do not leave the result only in an internal summary.",
        "Reply in JR's routed chat session.",
      ].join("\n"),
      status: "scheduled",
      executorType: "hulk",
      billingType: "none",
      billable: false,
      dueDate,
      createdById: owner.id,
      assignedToId: owner.id,
      cronEnabled: true,
      cronExpression: "* * * * *",
      cronTimezone: "America/New_York",
      cronNextRunAt: new Date(Date.now() - 60_000),
    },
  });

  const automationTask = await prisma.task.create({
    data: {
      title: `E2E scheduled automation ${runToken}`,
      description: `shell: printf 'automation ${runToken}\n' > ${JSON.stringify(automationMarkerPath)}`,
      status: "scheduled",
      executorType: "automation",
      billingType: "none",
      billable: false,
      dueDate,
      createdById: owner.id,
      assignedToId: owner.id,
      cronEnabled: true,
      cronExpression: "0 0 1 1 * 2000",
      cronTimezone: "America/New_York",
      cronNextRunAt: new Date(Date.now() - 60_000),
    },
  });

  const response = await fetch(`${appUrl.replace(/\/$/, "")}/api/cron/wake`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${cronSecret}`,
    },
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(`Wake failed (${response.status}): ${JSON.stringify(payload)}`);

  await waitFor(async () => {
    if (!(await exists(automationMarkerPath))) return false;
    const [currentHulk, currentAutomation, history] = await Promise.all([
      prisma.task.findUniqueOrThrow({ where: { id: hulkTask.id } }),
      prisma.task.findUniqueOrThrow({ where: { id: automationTask.id } }),
      fetchChatHistory(targetSessionKey),
    ]);
    const hasChatMarker = history.messages.some((message) => message.role === "assistant"
      && (message.content || []).some((part) => part.type === "text" && part.text?.includes(hulkChatMarker)));
    return currentHulk.status === "scheduled" && currentAutomation.status === "completed" && hasChatMarker;
  }, 120_000, 1_000);

  const refreshedHulk = await prisma.task.findUniqueOrThrow({ where: { id: hulkTask.id } });
  const refreshedAutomation = await prisma.task.findUniqueOrThrow({ where: { id: automationTask.id } });
  const hulkLogPath = path.join(rootDir, "task-runs", `${hulkTask.id}.log`);
  const automationLogPath = path.join(rootDir, "task-runs", `${automationTask.id}.log`);

  if (refreshedHulk.status !== "scheduled") throw new Error(`Recurring Hulk task finished with unexpected status ${refreshedHulk.status}.`);
  if (!refreshedHulk.cronLastRunAt) throw new Error("Recurring Hulk task did not record cronLastRunAt.");
  if (!refreshedHulk.cronNextRunAt || refreshedHulk.cronNextRunAt <= new Date()) throw new Error("Recurring Hulk task did not compute the next run.");
  if (refreshedAutomation.status !== "completed") throw new Error(`One-time automation task finished with unexpected status ${refreshedAutomation.status}.`);
  if (refreshedAutomation.cronEnabled !== false) throw new Error("One-time automation task was not disabled after running.");
  if (!refreshedAutomation.cronLastRunAt) throw new Error("One-time automation task did not record cronLastRunAt.");
  if (refreshedAutomation.cronNextRunAt !== null) throw new Error("One-time automation task should not have a next run after execution.");
  if (!(await exists(hulkLogPath))) throw new Error("Hulk task log file was not created.");
  if (!(await exists(automationLogPath))) throw new Error("Automation task log file was not created.");

  const hulkHistory = await fetchChatHistory(targetSessionKey);
  const hulkChatDelivered = hulkHistory.messages.some((message) => message.role === "assistant"
    && (message.content || []).some((part) => part.type === "text" && part.text?.includes(hulkChatMarker)));
  if (!hulkChatDelivered) throw new Error(`Hulk chat marker was not found in ${targetSessionKey}.`);

  console.log(JSON.stringify({
    wakePayload: payload,
    hulk: {
      id: refreshedHulk.id,
      status: refreshedHulk.status,
      cronLastRunAt: refreshedHulk.cronLastRunAt,
      cronNextRunAt: refreshedHulk.cronNextRunAt,
      sessionKey: targetSessionKey,
      chatMarker: hulkChatMarker,
      deliveredInChatHistory: hulkChatDelivered,
      logPath: hulkLogPath,
    },
    automation: {
      id: refreshedAutomation.id,
      status: refreshedAutomation.status,
      cronEnabled: refreshedAutomation.cronEnabled,
      cronLastRunAt: refreshedAutomation.cronLastRunAt,
      cronNextRunAt: refreshedAutomation.cronNextRunAt,
      markerPath: automationMarkerPath,
      logPath: automationLogPath,
    },
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
