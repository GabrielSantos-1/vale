import { Bell } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/card";
import { EmptyState } from "@/components/ui/feedback/empty-state";
import { StatusPill } from "@/components/ui/feedback/status-pill";
import {
  ClientActivity,
  ClientNotification,
} from "@/lib/client/dashboard-view-model";

type NotificationsCardProps = {
  notifications: ClientNotification[];
  recentActivities: ClientActivity[];
};

function toneFromLevel(level: ClientNotification["level"]) {
  if (level === "warning") return "warning" as const;
  if (level === "success") return "success" as const;
  return "info" as const;
}

export function NotificationsCard({
  notifications,
  recentActivities,
}: NotificationsCardProps) {
  return (
    <Card className="hover:border-border-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-5 w-5 text-accent" aria-hidden="true" />
          Notificacoes e atividades
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {notifications.length === 0 ? (
          <EmptyState
            title="Sem notificacoes no momento"
            description="Assim que houver atualizacoes importantes, elas aparecem aqui."
            className="py-8"
          />
        ) : (
          <ul className="space-y-3">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className="rounded-md border border-border bg-surface-secondary p-3"
              >
                <div className="mb-1 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-primary">{notification.title}</p>
                  <StatusPill
                    label={notification.level}
                    tone={toneFromLevel(notification.level)}
                    className="text-[10px]"
                  />
                </div>
                <p className="text-sm text-secondary">{notification.description}</p>
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.12em] text-muted">
            Ultimas atividades
          </p>
          <ul className="space-y-2">
            {recentActivities.map((activity) => (
              <li
                key={activity.id}
                className="flex items-center justify-between rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm"
              >
                <span className="text-secondary">{activity.label}</span>
                <span className="text-xs text-muted">{activity.at}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
