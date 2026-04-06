import Link from "next/link";
import { CalendarClock, Wallet } from "lucide-react";

import { Button } from "@/components/ui/core/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/card";
import { StatusPill } from "@/components/ui/feedback/status-pill";
import { ClientBillingStatus } from "@/lib/client/dashboard-view-model";

type BillingCardProps = {
  status: ClientBillingStatus;
  amountLabel: string;
  dueDateLabel: string;
  nextInvoiceLabel: string;
  payNowHref: string;
};

function mapBillingTone(status: ClientBillingStatus) {
  if (status === "ATRASADO") {
    return { tone: "danger" as const, label: "Atrasado" };
  }

  return { tone: "success" as const, label: "Em dia" };
}

export function BillingCard({
  status,
  amountLabel,
  dueDateLabel,
  nextInvoiceLabel,
  payNowHref,
}: BillingCardProps) {
  const mapped = mapBillingTone(status);

  return (
    <Card className="h-full hover:border-border-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Wallet className="h-5 w-5 text-accent" aria-hidden="true" />
          Financeiro
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <StatusPill label={mapped.label} tone={mapped.tone} />
          <span className="text-sm font-semibold text-primary">{amountLabel}</span>
        </div>
        <p className="inline-flex items-center gap-2 text-sm text-secondary">
          <CalendarClock className="h-4 w-4 text-muted" aria-hidden="true" />
          {dueDateLabel}
        </p>
        <p className="text-sm text-secondary">{nextInvoiceLabel}</p>
        <Button asChild className="w-full">
          <Link href={payNowHref}>Pagar agora</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
