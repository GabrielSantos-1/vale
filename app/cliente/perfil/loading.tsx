import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/card";
import { LoadingState } from "@/components/ui/feedback/loading-state";

function PerfilCardSkeleton({ title }: { title: string }) {
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

export default function ClientProfileLoading() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 text-primary md:px-6 md:py-12">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <PerfilCardSkeleton title="Meu cadastro" />
        <PerfilCardSkeleton title="Seguranca" />
      </div>
    </main>
  );
}

