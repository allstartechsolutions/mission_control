import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { saveClientLogoFile } from "@/lib/client-logo-storage";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function toNullableString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
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

    const updateData = {
      companyName,
      addressLine1: toNullableString(formData.get("addressLine1")),
      addressLine2: toNullableString(formData.get("addressLine2")),
      city: toNullableString(formData.get("city")),
      state: toNullableString(formData.get("state")),
      zipCode: toNullableString(formData.get("zipCode")),
      country: toNullableString(formData.get("country")),
      phone: toNullableString(formData.get("phone")),
      mobile: toNullableString(formData.get("mobile")),
      whatsapp: toNullableString(formData.get("whatsapp")),
      primaryContactName: toNullableString(formData.get("primaryContactName")),
      primaryContactTitle: toNullableString(formData.get("primaryContactTitle")),
      primaryContactEmail: toNullableString(formData.get("primaryContactEmail")),
      primaryContactPhone: toNullableString(formData.get("primaryContactPhone")),
      status: allowedStatuses.has(status) ? status : "active",
    };

    let logoPath = toNullableString(formData.get("existingLogoPath"));
    if (logoFile instanceof File && logoFile.size > 0) {
      logoPath = await saveClientLogoFile(id, logoFile);
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...updateData,
        logoPath,
      },
    });

    revalidatePath("/clients");
    revalidatePath(`/clients/${id}`);
    revalidatePath(`/clients/${id}/employees`);
    revalidatePath(`/clients/${id}/projects`);
    revalidatePath(`/clients/${id}/edit`);

    return NextResponse.json({ client });
  } catch {
    return NextResponse.json({ error: "Unable to update client." }, { status: 500 });
  }
}
