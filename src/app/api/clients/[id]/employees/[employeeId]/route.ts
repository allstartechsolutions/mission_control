import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { saveClientEmployeeImageFile } from "@/lib/client-employee-storage";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function toNullableString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string; employeeId: string }> }) {
  try {
    const { id: clientId, employeeId } = await context.params;
    const formData = await request.formData();
    const nameValue = formData.get("name");
    const name = typeof nameValue === "string" ? nameValue.trim() : "";
    const statusValue = formData.get("status");
    const status = typeof statusValue === "string" ? statusValue.trim().toLowerCase() : "active";

    if (!name) {
      return NextResponse.json({ error: "Employee name is required." }, { status: 400 });
    }

    const employee = await prisma.clientEmployee.findFirst({ where: { id: employeeId, clientId }, select: { id: true } });
    if (!employee) {
      return NextResponse.json({ error: "Employee not found." }, { status: 404 });
    }

    const allowedStatuses = new Set(["active", "inactive"]);
    const profileImageFile = formData.get("profileImageFile");
    let profileImagePath = toNullableString(formData.get("existingProfileImagePath"));

    if (profileImageFile instanceof File && profileImageFile.size > 0) {
      profileImagePath = await saveClientEmployeeImageFile(clientId, employeeId, profileImageFile);
    }

    const primaryLocationId = toNullableString(formData.get("primaryLocationId"));
    let secondaryLocationIds: string[] = [];
    try {
      const raw = formData.get("secondaryLocationIds");
      if (typeof raw === "string" && raw) secondaryLocationIds = JSON.parse(raw);
    } catch { /* ignore */ }

    const updatedEmployee = await prisma.clientEmployee.update({
      where: { id: employeeId },
      data: {
        name,
        title: toNullableString(formData.get("title")),
        email: toNullableString(formData.get("email")),
        phone: toNullableString(formData.get("phone")),
        mobile: toNullableString(formData.get("mobile")),
        whatsapp: toNullableString(formData.get("whatsapp")),
        status: allowedStatuses.has(status) ? status : "active",
        profileImagePath,
        primaryLocationId,
        secondaryLocations: {
          deleteMany: {},
          create: secondaryLocationIds
            .filter((lid) => lid !== primaryLocationId)
            .map((lid) => ({ locationId: lid })),
        },
      },
    });

    revalidatePath("/clients");
    revalidatePath(`/clients/${clientId}`);
    revalidatePath(`/clients/${clientId}/employees`);
    revalidatePath(`/clients/${clientId}/employees/${employeeId}/edit`);

    return NextResponse.json({ employee: updatedEmployee });
  } catch {
    return NextResponse.json({ error: "Unable to update employee." }, { status: 500 });
  }
}
