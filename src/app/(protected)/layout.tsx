import AppShell from "@/components/AppShell";
import { getAppEnvironmentLabel, getAppEnvironmentTone } from "@/lib/app-env";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      environmentLabel={getAppEnvironmentLabel()}
      environmentTone={getAppEnvironmentTone()}
    >
      {children}
    </AppShell>
  );
}
