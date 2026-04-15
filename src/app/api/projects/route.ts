import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCurrency, parseDate, projectPriorityOptions, projectStatusOptions, toNullableString } from "@/lib/projects";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
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

    const client = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true } });
    if (!client) return NextResponse.json({ error: "Client not found." }, { status: 404 });

    if (requesterId) {
      const requester = await prisma.clientEmployee.findFirst({ where: { id: requesterId, clientId }, select: { id: true } });
      if (!requester) return NextResponse.json({ error: "Requester must belong to the selected client." }, { status: 400 });
    }

    const project = await prisma.project.create({
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

    revalidatePath("/projects");
    revalidatePath(`/projects/${project.id}`);
    revalidatePath(`/projects/${project.id}/edit`);
    revalidatePath(`/clients/${clientId}`);
    revalidatePath(`/clients/${clientId}/projects`);

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create project." }, { status: 500 });
  }
}
