import { Activity, WifiOff, Wifi } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/card";
import { StatusPill } from "@/components/ui/feedback/status-pill";
import { ClientConnectionStatus } from "@/lib/client/dashboard-view-model";

type ConnectionStatusCardProps = {
  status: ClientConnectionStatus;
  checkedAt: string;
  message: string;
};

function statusConfig(status: ClientConnectionStatus) {
  if (status === "offline") {
    return {
      tone: "danger" as const,
      label: "Offline",
      icon: WifiOff,
      dotClass: "bg-red-500",
    };
  }

  if (status === "unstable") {
    return {
      tone: "warning" as const,
      label: "Instavel",
      icon: Activity,
      dotClass: "bg-yellow-400",
    };
  }

  return {
    tone: "success" as const,
    label: "Online",
    icon: Wifi,
    dotClass: "bg-emerald-500",
  };
}

export function ConnectionStatusCard({
  status,
  checkedAt,
  message,
}: ConnectionStatusCardProps) {
  const config = statusConfig(status);
  const Icon = config.icon;

  return (
    <Card className="h-full hover:border-border-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
          Status da Conexao
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <span className={`h-2.5 w-2.5 rounded-full ${config.dotClass}`} aria-hidden="true" />
          <StatusPill label={config.label} tone={config.tone} />
          <span className="text-xs text-muted">Atualizado: {checkedAt}</span>
        </div>
        <p className="text-sm text-secondary">{message}</p>
      </CardContent>
    </Card>
  );
}
