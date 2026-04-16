import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureProjectBoard } from "@/lib/boards";
import { parseCurrency, parseDate, projectPriorityOptions, projectStatusOptions, toNullableString } from "@/lib/projects";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const formData = await request.formData();
    const name = (typeof formData.get("name") === "string" ? String(formData.get("name")) : "").trim();
    const clientId = toNullableString(formData.get("clientId"));
    const requesterId = toNullableString(formData.get("requesterId"));
    const status = (toNullableString(formData.get("status")) || "planned").toLowerCase();
    const priority = (toNullableString(formData.get("priority")) || "medium").toLowerCase();
    if (!name) return NextResponse.json({ error: "Project name is required." }, { status: 400 });
    if (!clientId) return NextResponse.json({ error: "Client is required." }, { status: 400 });
    if (!projectStatusOptions.includes(status as never)) return NextResponse.json({ error: "Invalid project status." }, { status: 400 });
    if (!projectPriorityOptions.includes(priority as never)) return NextResponse.json({ error: "Invalid project priority." }, { status: 400 });

    const existingProject = await prisma.project.findUnique({ where: { id }, select: { id: true, clientId: true } });
    if (!existingProject) return NextResponse.json({ error: "Project not found." }, { status: 404 });

    if (requesterId) {
      const requester = await prisma.clientEmployee.findFirst({ where: { id: requesterId, clientId }, select: { id: true } });
      if (!requester) return NextResponse.json({ error: "Requester must belong to the selected client." }, { status: 400 });
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        clientId,
        requesterId,
        status,
        priority,
        description: toNullableString(formData.get("description")),
        estimatedPrice: parseCurrency(toNullableString(formData.get("estimatedPrice"))),
        finalPrice: parseCurrency(toNullableString(formData.get("finalPrice"))),
        startDate: parseDate(toNullableString(formData.get("startDate"))),
        dueDate: parseDate(toNullableString(formData.get("dueDate"))),
      },
    });

    await ensureProjectBoard(project.id);
    await prisma.board.updateMany({ where: { projectId: project.id }, data: { name: `${project.name} Board` } });

    revalidatePath("/projects");
    revalidatePath(`/projects/${project.id}`);
    revalidatePath(`/projects/${project.id}/edit`);
    revalidatePath(`/clients/${existingProject.clientId}`);
    revalidatePath(`/clients/${existingProject.clientId}/projects`);
    revalidatePath(`/clients/${clientId}`);
    revalidatePath(`/clients/${clientId}/projects`);

    return NextResponse.json({ project });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update project." }, { status: 500 });
  }
}
