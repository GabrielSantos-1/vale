import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardGrid } from "@/components/client/dashboard/dashboard-grid";
import { DashboardHeader } from "@/components/client/dashboard/dashboard-header";
import { DashboardShell } from "@/components/client/dashboard/dashboard-shell";
import { getClientSession } from "@/lib/auth/client-session";
import { buildClientDashboardViewModel } from "@/lib/client/dashboard-view-model";
import ClientLogoutButton from "./client-logout-button";

export const metadata = {
  title: "Dashboard | Central do Cliente - Verde Vale Connect",
};

export default async function ClientDashboardPage() {
  const cookieStore = await cookies();
  const session = await getClientSession({
    cookies: {
      get: (name: string) => cookieStore.get(name),
    },
  });

  if (!session) {
    redirect("/cliente/login");
  }

  const viewModel = buildClientDashboardViewModel({
    name: session.name,
    email: session.email,
  });

  return (
    <DashboardShell
      header={
        <DashboardHeader
          firstName={viewModel.account.firstName}
          statusLabel={viewModel.account.badgeLabel}
          action={<ClientLogoutButton />}
        />
      }
    >
      <DashboardGrid data={viewModel} />
    </DashboardShell>
  );
}
