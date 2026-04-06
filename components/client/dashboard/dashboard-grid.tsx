"use client";

import dynamic from "next/dynamic";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/card";
import { EmptyState } from "@/components/ui/feedback/empty-state";
import { LoadingState } from "@/components/ui/feedback/loading-state";
import { ClientDashboardViewModel } from "@/lib/client/dashboard-view-model";
import { AccountCard } from "./account-card";
import { BillingCard } from "./billing-card";
import { ConnectionStatusCard } from "./connection-status-card";
import { PlanCard } from "./plan-card";
import { QuickActionsCard } from "./quick-actions-card";

function SecondaryCardFallback({ title }: { title: string }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <LoadingState label="Carregando..." size="sm" className="py-8" />
      </CardContent>
    </Card>
  );
}

const SupportCard = dynamic(
  () => import("./support-card").then((mod) => mod.SupportCard),
  {
    loading: () => <SecondaryCardFallback title="Suporte" />,
  }
);

const NotificationsCard = dynamic(
  () => import("./notifications-card").then((mod) => mod.NotificationsCard),
  {
    loading: () => <SecondaryCardFallback title="Notificacoes" />,
  }
);

type DashboardGridProps = {
  data: ClientDashboardViewModel;
};

export function DashboardGrid({ data }: DashboardGridProps) {
  if (data.state === "loading") {
    return <LoadingState label="Carregando seu painel..." />;
  }

  if (data.state === "error") {
    return (
      <EmptyState
        title="Nao foi possivel carregar sua central"
        description="Tente novamente em alguns instantes."
      />
    );
  }

  if (data.state === "empty") {
    return (
      <EmptyState
        title="Nenhum dado disponivel"
        description="Assim que sua conta tiver dados de plano e faturamento, eles aparecerao aqui."
      />
    );
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-4 lg:grid-cols-2">
        <ConnectionStatusCard
          status={data.connection.status}
          checkedAt={data.connection.checkedAt}
          message={data.connection.message}
        />
        <BillingCard
          status={data.billing.status}
          amountLabel={data.billing.amountLabel}
          dueDateLabel={data.billing.dueDateLabel}
          nextInvoiceLabel={data.billing.nextInvoiceLabel}
          payNowHref={data.billing.payNowHref}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <PlanCard
          name={data.plan.name}
          speedLabel={data.plan.speedLabel}
          benefits={data.plan.benefits}
          usagePercent={data.plan.usagePercent}
          usageLabel={data.plan.usageLabel}
        />
        <AccountCard fullName={data.account.fullName} email={data.account.email} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <QuickActionsCard actions={data.quickActions} />
        <SupportCard
          title={data.support.title}
          description={data.support.description}
          ctaLabel={data.support.ctaLabel}
          ctaHref={data.support.ctaHref}
        />
      </section>

      <section>
        <NotificationsCard
          notifications={data.notifications}
          recentActivities={data.recentActivities}
        />
      </section>
    </div>
  );
}
