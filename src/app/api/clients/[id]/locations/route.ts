import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
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
      return NextResponse.json({ error: "Location name is required." }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true } });
    if (!client) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }

    const allowedStatuses = new Set(["active", "inactive"]);

    const location = await prisma.clientLocation.create({
      data: {
        clientId,
        name,
        addressLine1: toNullableString(formData.get("addressLine1")),
        addressLine2: toNullableString(formData.get("addressLine2")),
        city: toNullableString(formData.get("city")),
        state: toNullableString(formData.get("state")),
        zipCode: toNullableString(formData.get("zipCode")),
        country: toNullableString(formData.get("country")),
        phone: toNullableString(formData.get("phone")),
        status: allowedStatuses.has(status) ? status : "active",
      },
    });

    revalidatePath("/clients");
    revalidatePath(`/clients/${clientId}`);
    revalidatePath(`/clients/${clientId}/locations`);

    return NextResponse.json({ location }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create location." }, { status: 500 });
  }
}
