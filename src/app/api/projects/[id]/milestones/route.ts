import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { milestoneStatusOptions, parseCurrency, parseDate, toNullableString } from "@/lib/projects";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const project = await prisma.project.findUnique({ where: { id }, select: { id: true } });
    if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

    const milestones = await prisma.projectMilestone.findMany({
      where: { projectId: id },
      include: { _count: { select: { tasks: true } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ milestones });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to fetch milestones." }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const project = await prisma.project.findUnique({ where: { id }, select: { id: true, clientId: true } });
    if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

    const formData = await request.formData();
    const title = (typeof formData.get("title") === "string" ? String(formData.get("title")) : "").trim();
    const status = (toNullableString(formData.get("status")) || "planned").toLowerCase();
    const description = toNullableString(formData.get("description"));

    if (!title) return NextResponse.json({ error: "Milestone title is required." }, { status: 400 });
    if (!milestoneStatusOptions.includes(status as never)) return NextResponse.json({ error: "Invalid milestone status." }, { status: 400 });

    const maxSort = await prisma.projectMilestone.aggregate({ where: { projectId: id }, _max: { sortOrder: true } });
    const sortOrder = (maxSort._max.sortOrder ?? 0) + 1;

    const milestone = await prisma.projectMilestone.create({
      data: {
        projectId: id,
        title,
        description,
        status,
        sortOrder,
        dueDate: parseDate(toNullableString(formData.get("dueDate"))),
        estimatedPrice: parseCurrency(toNullableString(formData.get("estimatedPrice"))),
        finalPrice: parseCurrency(toNullableString(formData.get("finalPrice"))),
      },
    });

    revalidatePath(`/projects/${id}`);
    revalidatePath(`/projects/${id}/milestones`);
    revalidatePath(`/clients/${project.clientId}/projects`);

    return NextResponse.json({ milestone }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create milestone." }, { status: 500 });
  }
}
