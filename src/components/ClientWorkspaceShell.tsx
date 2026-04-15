import Image from "next/image";
import Link from "next/link";
import { Building2, Mail, MapPin, Pencil, Phone, Plus, Users, type LucideIcon } from "lucide-react";
import { formatEnumLabel } from "@/lib/format";

const statusStyles: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  onboarding: "bg-amber-50 text-amber-700 ring-amber-600/20",
  inactive: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export type ClientWorkspaceSummary = {
  id: string;
  companyName: string;
  logoPath: string | null;
  status: string;
  primaryContactName: string | null;
  primaryContactTitle: string | null;
  primaryContactEmail: string | null;
  primaryContactPhone: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  employeeCount?: number;
  projectCount?: number;
  locationCount?: number;
};

const tabs = [
  { label: "Overview", href: (id: string) => `/clients/${id}` },
  { label: "Locations", href: (id: string) => `/clients/${id}/locations` },
  { label: "Employees", href: (id: string) => `/clients/${id}/employees` },
  { label: "Projects", href: (id: string) => `/clients/${id}/projects` },
];

function isImagePath(value: string | null) {
  return !!value && (value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://"));
}

function getInitials(companyName: string) {
  return companyName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function ClientWorkspaceShell({
  client,
  activeTab,
  children,
}: {
  client: ClientWorkspaceSummary;
  activeTab: "overview" | "locations" | "employees" | "projects";
  children: React.ReactNode;
}) {
  const location = [client.city, client.state].filter(Boolean).join(", ") || "Location pending";
  const primaryContact = client.primaryContactName || "No primary contact assigned";
  const primaryContactMeta = [client.primaryContactTitle, client.primaryContactEmail].filter(Boolean).join(" • ") || "Contact details pending";
  const preferredPhone = client.primaryContactPhone || client.phone || "No phone on file";

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-gradient-to-r from-[#405189] via-[#4b5fa3] to-[#6d83c8] px-5 py-5 text-white sm:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 text-lg font-semibold text-white">
                {isImagePath(client.logoPath) ? (
                  <Image src={client.logoPath!} alt={`${client.companyName} logo`} fill unoptimized className="object-cover" />
                ) : (
                  getInitials(client.companyName)
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <nav className="text-sm text-white/70">
                    <Link href="/clients" className="hover:text-white">Clients</Link>
                    <span className="mx-2">&rsaquo;</span>
                    <span className="text-white">{client.companyName}</span>
                  </nav>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-semibold tracking-tight">{client.companyName}</h1>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusStyles[client.status] || statusStyles.inactive}`}>
                      {formatEnumLabel(client.status)}
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 text-sm text-white/90 sm:grid-cols-3">
                  <div className="rounded-lg border border-white/10 bg-white/10 px-3 py-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-white/60">Primary contact</div>
                    <div className="mt-1 font-medium text-white">{primaryContact}</div>
                    <div className="text-xs text-white/70">{primaryContactMeta}</div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/10 px-3 py-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-white/60">Phone</div>
                    <div className="mt-1 font-medium text-white">{preferredPhone}</div>
                    <div className="text-xs text-white/70">Fastest outreach path</div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/10 px-3 py-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-white/60">Location</div>
                    <div className="mt-1 font-medium text-white">{location}</div>
                    <div className="text-xs text-white/70">Workspace summary</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 xl:justify-end">
              <Link
                href={`/tasks/new?clientId=${client.id}`}
                className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/15"
              >
                <Plus size={15} />
                New task
              </Link>
              <Link
                href={`/clients/${client.id}/edit`}
                className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/15"
              >
                <Pencil size={15} />
                Edit client
              </Link>
              {client.primaryContactEmail ? (
                <a
                  href={`mailto:${client.primaryContactEmail}`}
                  className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-[#405189] hover:bg-slate-100"
                >
                  <Mail size={15} />
                  Email contact
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 bg-gray-50 px-3 sm:px-4">
          <div className="flex flex-wrap gap-2 py-3">
            {tabs.map((tab) => {
              const href = tab.href(client.id);
              const isActive =
                (activeTab === "overview" && tab.label === "Overview") ||
                (activeTab === "locations" && tab.label === "Locations") ||
                (activeTab === "employees" && tab.label === "Employees") ||
                (activeTab === "projects" && tab.label === "Projects");

              return (
                <Link
                  key={tab.label}
                  href={href}
                  className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#405189] text-white shadow-sm"
                      : "bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:text-[#405189]"
                  }`}
                >
                  {tab.label}
                  {tab.label === "Locations" && typeof client.locationCount === "number" ? (
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${isActive ? "bg-white/15 text-white" : "bg-gray-100 text-gray-500"}`}>
                      {client.locationCount}
                    </span>
                  ) : null}
                  {tab.label === "Employees" && typeof client.employeeCount === "number" ? (
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${isActive ? "bg-white/15 text-white" : "bg-gray-100 text-gray-500"}`}>
                      {client.employeeCount}
                    </span>
                  ) : null}
                  {tab.label === "Projects" && typeof client.projectCount === "number" ? (
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${isActive ? "bg-white/15 text-white" : "bg-gray-100 text-gray-500"}`}>
                      {client.projectCount}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {children}
    </div>
  );
}

export function InfoCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4">
        <div className="rounded-md bg-[#405189]/10 p-2 text-[#405189]">
          <Icon size={16} />
        </div>
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function DetailList({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg bg-gray-50 px-4 py-3">
          <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">{item.label}</dt>
          <dd className="mt-1 text-sm font-medium text-gray-800">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#405189]/10 text-[#405189]">
        <Icon size={20} />
      </div>
      <h2 className="mt-4 text-base font-semibold text-gray-800">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">{description}</p>
    </div>
  );
}
