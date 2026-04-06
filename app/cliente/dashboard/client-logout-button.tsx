"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/core/button";

export default function ClientLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/client/logout", { method: "POST" });
    router.push("/cliente/login");
    router.refresh();
  }

  return (
    <Button onClick={handleLogout} variant="outline" size="sm">
      <LogOut className="mr-2 h-4 w-4" />
      Sair
    </Button>
  );
}
