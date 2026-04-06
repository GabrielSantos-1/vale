import { Mail, User } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/card";

type AccountCardProps = {
  fullName: string;
  email: string;
};

export function AccountCard({ fullName, email }: AccountCardProps) {
  return (
    <Card className="h-full hover:border-border-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-5 w-5 text-accent" aria-hidden="true" />
          Minha Conta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.12em] text-muted">Nome</p>
          <p className="text-sm font-medium text-primary">{fullName}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.12em] text-muted">E-mail</p>
          <p className="inline-flex items-center gap-2 text-sm text-secondary">
            <Mail className="h-4 w-4 text-muted" aria-hidden="true" />
            {email}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
