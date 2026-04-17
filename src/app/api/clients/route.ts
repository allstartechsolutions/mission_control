import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { saveClientLogoFile } from "@/lib/client-logo-storage";
import { normalizePhoneNumber } from "@/lib/phone";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function toNullableString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const companyNameValue = formData.get("companyName");
    const companyName = typeof companyNameValue === "string" ? companyNameValue.trim() : "";
    const statusValue = formData.get("status");
    const status = typeof statusValue === "string" ? statusValue.trim().toLowerCase() : "active";

    if (!companyName) {
      return NextResponse.json({ error: "Company name is required." }, { status: 400 });
    }

    const allowedStatuses = new Set(["active", "onboarding", "inactive"]);
    const logoFile = formData.get("logoFile");

    const client = await prisma.client.create({
      data: {
        companyName,
        businessEmail: toNullableString(formData.get("businessEmail")),
        website: toNullableString(formData.get("website")),
        addressLine1: toNullableString(formData.get("addressLine1")),
        addressLine2: toNullableString(formData.get("addressLine2")),
        city: toNullableString(formData.get("city")),
        state: toNullableString(formData.get("state")),
        zipCode: toNullableString(formData.get("zipCode")),
        country: toNullableString(formData.get("country")),
        phone: normalizePhoneNumber(toNullableString(formData.get("phone"))),
        mobile: normalizePhoneNumber(toNullableString(formData.get("mobile"))),
        whatsapp: normalizePhoneNumber(toNullableString(formData.get("whatsapp"))),
        primaryContactName: toNullableString(formData.get("primaryContactName")),
        primaryContactTitle: toNullableString(formData.get("primaryContactTitle")),
        primaryContactEmail: toNullableString(formData.get("primaryContactEmail")),
        primaryContactPhone: normalizePhoneNumber(toNullableString(formData.get("primaryContactPhone"))),
        status: allowedStatuses.has(status) ? status : "active",
      },
    });

    let finalClient = client;

    if (logoFile instanceof File && logoFile.size > 0) {
      const logoPath = await saveClientLogoFile(client.id, logoFile);
      finalClient = await prisma.client.update({ where: { id: client.id }, data: { logoPath } });
    }

    revalidatePath("/clients");
    revalidatePath(`/clients/${client.id}`);
    revalidatePath(`/clients/${client.id}/employees`);
    revalidatePath(`/clients/${client.id}/projects`);

    return NextResponse.json({ client: finalClient }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create client." }, { status: 500 });
  }
}
