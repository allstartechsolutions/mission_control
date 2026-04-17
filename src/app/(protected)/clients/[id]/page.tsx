import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { Building2, Mail, MapPin, UserRound } from "lucide-react";
import { ClientWorkspaceShell, DetailList, InfoCard } from "@/components/ClientWorkspaceShell";
import { formatEnumLabel, formatPhoneDisplay } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ClientOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  noStore();
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    select: {
      id: true,
      companyName: true,
      logoPath: true,
      status: true,
      businessEmail: true,
      website: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      state: true,
      zipCode: true,
      country: true,
      phone: true,
      mobile: true,
      whatsapp: true,
      primaryContactName: true,
      primaryContactTitle: true,
      primaryContactEmail: true,
      primaryContactPhone: true,
      _count: {
        select: {
          locations: true,
          employees: true,
          projects: true,
          accounts: true,
        },
      },
    },
  });

  if (!client) notFound();

  return (
    <ClientWorkspaceShell
      activeTab="overview"
      client={{
        id: client.id,
        companyName: client.companyName,
        logoPath: client.logoPath,
        status: client.status,
        primaryContactName: client.primaryContactName,
        primaryContactTitle: client.primaryContactTitle,
        primaryContactEmail: client.primaryContactEmail,
        primaryContactPhone: client.primaryContactPhone,
        businessEmail: client.businessEmail,
        website: client.website,
        phone: client.phone,
        city: client.city,
        state: client.state,
        employeeCount: client._count.employees,
        projectCount: client._count.projects,
        locationCount: client._count.locations,
        accountCount: client._count.accounts,
      }}
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <InfoCard title="Company info" icon={Building2}>
          <DetailList
            items={[
              { label: "Company name", value: client.companyName },
              { label: "Status", value: formatEnumLabel(client.status) },
              { label: "Locations", value: String(client._count.locations) },
              { label: "Employee records", value: String(client._count.employees) },
              { label: "Projects", value: String(client._count.projects) },
              { label: "Coverage", value: [client.city, client.state, client.country].filter(Boolean).join(", ") || "Not set" },
            ]}
          />
        </InfoCard>

        <InfoCard title="Communication info" icon={Mail}>
          <DetailList
            items={[
              { label: "Business email", value: client.businessEmail || "Not set" },
              { label: "Website", value: client.website || "Not set" },
              { label: "Main phone", value: formatPhoneDisplay(client.phone, "Not set") },
              { label: "Mobile", value: formatPhoneDisplay(client.mobile, "Not set") },
              { label: "WhatsApp", value: formatPhoneDisplay(client.whatsapp, "Not set") },
              { label: "Primary email", value: client.primaryContactEmail || "Not set" },
            ]}
          />
        </InfoCard>

        <InfoCard title="Address" icon={MapPin}>
          <DetailList
            items={[
              { label: "Address line 1", value: client.addressLine1 || "Not set" },
              { label: "Address line 2", value: client.addressLine2 || "Not set" },
              { label: "City / state", value: [client.city, client.state].filter(Boolean).join(", ") || "Not set" },
              { label: "ZIP / country", value: [client.zipCode, client.country].filter(Boolean).join(" • ") || "Not set" },
            ]}
          />
        </InfoCard>

        <InfoCard title="Primary contact" icon={UserRound}>
          <DetailList
            items={[
              { label: "Name", value: client.primaryContactName || "Not set" },
              { label: "Title", value: client.primaryContactTitle || "Not set" },
              { label: "Email", value: client.primaryContactEmail || "Not set" },
              { label: "Phone", value: formatPhoneDisplay(client.primaryContactPhone || client.phone, "Not set") },
            ]}
          />
        </InfoCard>
      </div>
    </ClientWorkspaceShell>
  );
}
