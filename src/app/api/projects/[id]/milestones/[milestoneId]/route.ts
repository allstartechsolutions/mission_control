import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { milestoneStatusOptions, parseCurrency, parseDate, toNullableString } from "@/lib/projects";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string; milestoneId: string }> }) {
  try {
    const { id, milestoneId } = await context.params;
    const milestone = await prisma.projectMilestone.findFirst({
      where: { id: milestoneId, projectId: id },
      include: {
        tasks: {
          select: { id: true, title: true, status: true, dueDate: true, assignedTo: { select: { name: true } } },
          orderBy: { dueDate: "asc" },
        },
      },
    });

    if (!milestone) return NextResponse.json({ error: "Milestone not found." }, { status: 404 });
    return NextResponse.json({ milestone });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to fetch milestone." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string; milestoneId: string }> }) {
  try {
    const { id, milestoneId } = await context.params;
    const existing = await prisma.projectMilestone.findFirst({
      where: { id: milestoneId, projectId: id },
      select: { id: true, project: { select: { clientId: true } } },
    });
    if (!existing) return NextResponse.json({ error: "Milestone not found." }, { status: 404 });

    const formData = await request.formData();
    const title = (typeof formData.get("title") === "string" ? String(formData.get("title")) : "").trim();
    const status = (toNullableString(formData.get("status")) || "planned").toLowerCase();
    const description = toNullableString(formData.get("description"));

    if (!title) return NextResponse.json({ error: "Milestone title is required." }, { status: 400 });
    if (!milestoneStatusOptions.includes(status as never)) return NextResponse.json({ error: "Invalid milestone status." }, { status: 400 });

    const sortOrderRaw = toNullableString(formData.get("sortOrder"));
    const sortOrder = sortOrderRaw ? parseInt(sortOrderRaw, 10) : undefined;

    const milestone = await prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: {
        title,
        description,
        status,
        ...(sortOrder !== undefined && !isNaN(sortOrder) ? { sortOrder } : {}),
        dueDate: parseDate(toNullableString(formData.get("dueDate"))),
        estimatedPrice: parseCurrency(toNullableString(formData.get("estimatedPrice"))),
        finalPrice: parseCurrency(toNullableString(formData.get("finalPrice"))),
      },
    });

    revalidatePath(`/projects/${id}`);
    revalidatePath(`/projects/${id}/milestones`);
    revalidatePath(`/projects/${id}/milestones/${milestoneId}`);
    revalidatePath(`/clients/${existing.project.clientId}/projects`);

    return NextResponse.json({ milestone });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update milestone." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string; milestoneId: string }> }) {
  try {
    const { id, milestoneId } = await context.params;
    const existing = await prisma.projectMilestone.findFirst({
      where: { id: milestoneId, projectId: id },
      include: {
        _count: { select: { tasks: true } },
        project: { select: { clientId: true } },
      },
    });
    if (!existing) return NextResponse.json({ error: "Milestone not found." }, { status: 404 });

    if (existing._count.tasks > 0) {
      const milestone = await prisma.projectMilestone.update({
        where: { id: milestoneId },
        data: { status: "archived" },
      });

      revalidatePath(`/projects/${id}`);
      revalidatePath(`/projects/${id}/milestones`);
      revalidatePath(`/clients/${existing.project.clientId}/projects`);

      return NextResponse.json({ milestone, archived: true, message: `Milestone archived because it has ${existing._count.tasks} linked task(s).` });
    }

    await prisma.projectMilestone.delete({ where: { id: milestoneId } });

    revalidatePath(`/projects/${id}`);
    revalidatePath(`/projects/${id}/milestones`);
    revalidatePath(`/clients/${existing.project.clientId}/projects`);

    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete milestone." }, { status: 500 });
  }
}
