import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string; employeeId: string }> }) {
  try {
    const { id: clientId, employeeId } = await context.params;
    const body = (await request.json().catch(() => ({}))) as { status?: string };
    const requestedStatus = typeof body.status === "string" ? body.status.trim().toLowerCase() : "";

    if (!new Set(["active", "inactive"]).has(requestedStatus)) {
      return NextResponse.json({ error: "Invalid employee status." }, { status: 400 });
    }

    const employee = await prisma.clientEmployee.findFirst({ where: { id: employeeId, clientId }, select: { id: true } });
    if (!employee) {
      return NextResponse.json({ error: "Employee not found." }, { status: 404 });
    }

    const updatedEmployee = await prisma.clientEmployee.update({ where: { id: employeeId }, data: { status: requestedStatus } });

    revalidatePath("/clients");
    revalidatePath(`/clients/${clientId}`);
    revalidatePath(`/clients/${clientId}/employees`);
    revalidatePath(`/clients/${clientId}/employees/${employeeId}/edit`);

    return NextResponse.json({ employee: updatedEmployee });
  } catch {
    return NextResponse.json({ error: "Unable to update employee status." }, { status: 500 });
  }
}
