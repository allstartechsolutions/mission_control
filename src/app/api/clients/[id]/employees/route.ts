import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { saveClientEmployeeImageFile } from "@/lib/client-employee-storage";
import { normalizePhoneNumber } from "@/lib/phone";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function toNullableString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: clientId } = await context.params;
    const formData = await request.formData();
    const nameValue = formData.get("name");
    const name = typeof nameValue === "string" ? nameValue.trim() : "";
    const statusValue = formData.get("status");
    const status = typeof statusValue === "string" ? statusValue.trim().toLowerCase() : "active";

    if (!name) {
      return NextResponse.json({ error: "Employee name is required." }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true } });
    if (!client) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }

    const allowedStatuses = new Set(["active", "inactive"]);
    const profileImageFile = formData.get("profileImageFile");

    const primaryLocationId = toNullableString(formData.get("primaryLocationId"));
    let secondaryLocationIds: string[] = [];
    try {
      const raw = formData.get("secondaryLocationIds");
      if (typeof raw === "string" && raw) secondaryLocationIds = JSON.parse(raw);
    } catch { /* ignore */ }

    const employee = await prisma.clientEmployee.create({
      data: {
        clientId,
        name,
        title: toNullableString(formData.get("title")),
        email: toNullableString(formData.get("email")),
        phone: normalizePhoneNumber(toNullableString(formData.get("phone"))),
        mobile: normalizePhoneNumber(toNullableString(formData.get("mobile"))),
        whatsapp: normalizePhoneNumber(toNullableString(formData.get("whatsapp"))),
        status: allowedStatuses.has(status) ? status : "active",
        primaryLocationId,
        secondaryLocations: {
          create: secondaryLocationIds
            .filter((lid) => lid !== primaryLocationId)
            .map((lid) => ({ locationId: lid })),
        },
      },
    });

    let finalEmployee = employee;
    if (profileImageFile instanceof File && profileImageFile.size > 0) {
      const profileImagePath = await saveClientEmployeeImageFile(clientId, employee.id, profileImageFile);
      finalEmployee = await prisma.clientEmployee.update({ where: { id: employee.id }, data: { profileImagePath } });
    }

    revalidatePath("/clients");
    revalidatePath(`/clients/${clientId}`);
    revalidatePath(`/clients/${clientId}/employees`);
    revalidatePath(`/clients/${clientId}/employees/new`);

    return NextResponse.json({ employee: finalEmployee }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create employee." }, { status: 500 });
  }
}
