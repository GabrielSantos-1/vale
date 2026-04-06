import * as React from "react";

type DashboardShellProps = {
  header: React.ReactNode;
  children: React.ReactNode;
};

export function DashboardShell({ header, children }: DashboardShellProps) {
  return (
    <main className="min-h-screen bg-background px-4 py-8 text-primary md:px-6 md:py-12">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        {header}
        {children}
      </div>
    </main>
  );
}
