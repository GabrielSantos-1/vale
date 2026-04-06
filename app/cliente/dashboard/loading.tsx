import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/card";
import { LoadingState } from "@/components/ui/feedback/loading-state";

function DashboardCardSkeleton({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <LoadingState label="Carregando..." size="sm" className="py-8" />
      </CardContent>
    </Card>
  );
}

export default function ClientDashboardLoading() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 text-primary md:px-6 md:py-12">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <Card>
          <CardContent className="py-6">
            <LoadingState label="Preparando sua central..." />
          </CardContent>
        </Card>
        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardCardSkeleton title="Status da Conexao" />
          <DashboardCardSkeleton title="Financeiro" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardCardSkeleton title="Meu Plano" />
          <DashboardCardSkeleton title="Minha Conta" />
        </div>
      </div>
    </main>
  );
}
