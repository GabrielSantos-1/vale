import Link from "next/link";
import { ExternalLink, FileText, Headphones, UserCog, Zap } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/card";
import { ClientQuickAction } from "@/lib/client/dashboard-view-model";

type QuickActionsCardProps = {
  actions: ClientQuickAction[];
};

function actionIcon(actionId: string) {
  if (actionId === "invoice-2nd-copy") return FileText;
  if (actionId === "speed-test") return Zap;
  if (actionId === "open-ticket") return Headphones;
  return UserCog;
}

export function QuickActionsCard({ actions }: QuickActionsCardProps) {
  return (
    <Card className="h-full hover:border-border-strong">
      <CardHeader>
        <CardTitle className="text-base">Acoes rapidas</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = actionIcon(action.id);

          return (
            <Link
              key={action.id}
              href={action.href}
              target={action.external ? "_blank" : undefined}
              rel={action.external ? "noopener noreferrer" : undefined}
              className="group rounded-md border border-border bg-surface-secondary px-3 py-3 transition-colors hover:border-border-strong hover:bg-surface-tertiary"
            >
              <span className="inline-flex w-full items-center justify-between gap-2 text-sm font-medium text-primary">
                <span className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
                  {action.label}
                </span>
                {action.external ? (
                  <ExternalLink className="h-4 w-4 text-muted transition-colors group-hover:text-primary" />
                ) : null}
              </span>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
