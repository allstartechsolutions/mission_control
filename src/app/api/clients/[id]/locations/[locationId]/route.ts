import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { normalizePhoneNumber } from "@/lib/phone";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function toNullableString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string; locationId: string }> }) {
  try {
    const { id: clientId, locationId } = await context.params;
    const formData = await request.formData();
    const nameValue = formData.get("name");
    const name = typeof nameValue === "string" ? nameValue.trim() : "";
    const statusValue = formData.get("status");
    const status = typeof statusValue === "string" ? statusValue.trim().toLowerCase() : "active";

    if (!name) {
      return NextResponse.json({ error: "Location name is required." }, { status: 400 });
    }

    const location = await prisma.clientLocation.findFirst({ where: { id: locationId, clientId }, select: { id: true } });
    if (!location) {
      return NextResponse.json({ error: "Location not found." }, { status: 404 });
    }

    const allowedStatuses = new Set(["active", "inactive"]);

    const updatedLocation = await prisma.clientLocation.update({
      where: { id: locationId },
      data: {
        name,
        addressLine1: toNullableString(formData.get("addressLine1")),
        addressLine2: toNullableString(formData.get("addressLine2")),
        city: toNullableString(formData.get("city")),
        state: toNullableString(formData.get("state")),
        zipCode: toNullableString(formData.get("zipCode")),
        country: toNullableString(formData.get("country")),
        phone: normalizePhoneNumber(toNullableString(formData.get("phone"))),
        status: allowedStatuses.has(status) ? status : "active",
      },
    });

    revalidatePath("/clients");
    revalidatePath(`/clients/${clientId}`);
    revalidatePath(`/clients/${clientId}/locations`);
    revalidatePath(`/clients/${clientId}/locations/${locationId}/edit`);

    return NextResponse.json({ location: updatedLocation });
  } catch {
    return NextResponse.json({ error: "Unable to update location." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string; locationId: string }> }) {
  try {
    const { id: clientId, locationId } = await context.params;

    const location = await prisma.clientLocation.findFirst({ where: { id: locationId, clientId }, select: { id: true } });
    if (!location) {
      return NextResponse.json({ error: "Location not found." }, { status: 404 });
    }

    await prisma.clientLocation.delete({ where: { id: locationId } });

    revalidatePath("/clients");
    revalidatePath(`/clients/${clientId}`);
    revalidatePath(`/clients/${clientId}/locations`);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete location." }, { status: 500 });
  }
}
