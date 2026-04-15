import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCurrency, parseDate, resolveTaskActorId, sanitizeCronFields, taskBillingTypeOptions, taskExecutorTypeOptions, taskStatusOptions, toNullableString } from "@/lib/tasks";

export const dynamic = "force-dynamic";

function normalizeTaskEnums({ status, executorType, billingType }: { status: string; executorType: string; billingType: string }) {
  if (!taskStatusOptions.includes(status as never)) throw new Error("Invalid task status.");
  if (!taskExecutorTypeOptions.includes(executorType as never)) throw new Error("Invalid executor type.");
  if (!taskBillingTypeOptions.includes(billingType as never)) throw new Error("Invalid billing type.");
}

async function validateRelationships({ clientId, projectId, milestoneId, requesterEmployeeId }: { clientId: string | null; projectId: string | null; milestoneId: string | null; requesterEmployeeId: string | null; }) {
  let resolvedClientId = clientId;

  if (projectId) {
    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true, clientId: true } });
    if (!project) throw new Error("Selected project was not found.");
    if (resolvedClientId && resolvedClientId !== project.clientId) throw new Error("Project must belong to the selected client.");
    resolvedClientId = project.clientId;
  }

  if (milestoneId) {
    const milestone = await prisma.projectMilestone.findUnique({ where: { id: milestoneId }, select: { id: true, projectId: true, project: { select: { clientId: true } } } });
    if (!milestone) throw new Error("Selected milestone was not found.");
    if (projectId && milestone.projectId !== projectId) throw new Error("Milestone must belong to the selected project.");
    if (resolvedClientId && resolvedClientId !== milestone.project.clientId) throw new Error("Milestone must belong to the selected client.");
    resolvedClientId = milestone.project.clientId;
  }

  if (requesterEmployeeId) {
    const requester = await prisma.clientEmployee.findUnique({ where: { id: requesterEmployeeId }, select: { id: true, clientId: true } });
    if (!requester) throw new Error("Requester not found.");
    if (resolvedClientId && requester.clientId !== resolvedClientId) throw new Error("Requester must belong to the selected client.");
    resolvedClientId = requester.clientId;
  }

  return { resolvedClientId };
}

export async function GET() {
  const tasks = await prisma.task.findMany({
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      client: { select: { id: true, companyName: true } },
      project: { select: { id: true, name: true } },
      milestone: { select: { id: true, title: true } },
      requesterEmployee: { select: { id: true, name: true } },
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = (typeof formData.get("title") === "string" ? String(formData.get("title")) : "").trim();
    const dueDateValue = toNullableString(formData.get("dueDate"));
    const assignedToId = toNullableString(formData.get("assignedToId"));
    const status = (toNullableString(formData.get("status")) || "scheduled").toLowerCase();
    const executorType = (toNullableString(formData.get("executorType")) || "human").toLowerCase();
    const billable = formData.get("billable") === "true";
    const billingType = (toNullableString(formData.get("billingType")) || (billable ? "fixed" : "none")).toLowerCase();
    const projectId = toNullableString(formData.get("projectId"));
    const milestoneId = toNullableString(formData.get("milestoneId"));
    const requesterEmployeeId = toNullableString(formData.get("requesterEmployeeId"));
    const clientId = toNullableString(formData.get("clientId"));
    const cronEnabled = formData.get("cronEnabled") === "true";

    if (!title) return NextResponse.json({ error: "Task title is required." }, { status: 400 });
    if (!assignedToId) return NextResponse.json({ error: "Assigned to is required." }, { status: 400 });
    if (!dueDateValue) return NextResponse.json({ error: "Due date is required." }, { status: 400 });

    normalizeTaskEnums({ status, executorType, billingType });

    const assignedTo = await prisma.user.findFirst({ where: { id: assignedToId, status: "active" }, select: { id: true } });
    if (!assignedTo) return NextResponse.json({ error: "Assigned team member was not found." }, { status: 404 });

    const { resolvedClientId } = await validateRelationships({ clientId, projectId, milestoneId, requesterEmployeeId });
    const createdById = await resolveTaskActorId();
    const cronFields = sanitizeCronFields({
      executorType,
      cronEnabled,
      cronExpression: toNullableString(formData.get("cronExpression")),
      cronTimezone: toNullableString(formData.get("cronTimezone")),
    });

    const task = await prisma.task.create({
      data: {
        title,
        description: toNullableString(formData.get("description")),
        status: status as never,
        executorType: executorType as never,
        billingType: (billable ? billingType : "none") as never,
        billable,
        amount: billable ? parseCurrency(toNullableString(formData.get("amount"))) : null,
        startDate: parseDate(toNullableString(formData.get("startDate")), "start date"),
        dueDate: parseDate(dueDateValue, "due date")!,
        createdById,
        assignedToId,
        clientId: resolvedClientId,
        projectId,
        milestoneId,
        requesterEmployeeId,
        ...cronFields,
      },
    });

    revalidatePath("/tasks");
    revalidatePath(`/tasks/${task.id}`);
    revalidatePath(`/tasks/${task.id}/edit`);
    if (resolvedClientId) revalidatePath(`/clients/${resolvedClientId}`);
    if (projectId) revalidatePath(`/projects/${projectId}`);

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create task." }, { status: 500 });
  }
}
