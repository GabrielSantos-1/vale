import { sanitizeString } from "@/lib/security/sanitize";

export type ClientConnectionStatus = "online" | "unstable" | "offline";
export type ClientBillingStatus = "EM_DIA" | "ATRASADO";
export type ClientDashboardState = "ready" | "loading" | "empty" | "error";

export type ClientQuickAction = {
  id: string;
  label: string;
  href: string;
  external?: boolean;
};

export type ClientNotification = {
  id: string;
  title: string;
  description: string;
  level: "info" | "warning" | "success";
};

export type ClientActivity = {
  id: string;
  label: string;
  at: string;
};

export type ClientDashboardViewModel = {
  state: ClientDashboardState;
  account: {
    firstName: string;
    fullName: string;
    email: string;
    badgeLabel: string;
  };
  connection: {
    status: ClientConnectionStatus;
    checkedAt: string;
    message: string;
  };
  billing: {
    status: ClientBillingStatus;
    amountLabel: string;
    dueDateLabel: string;
    nextInvoiceLabel: string;
    payNowHref: string;
  };
  plan: {
    name: string;
    speedLabel: string;
    benefits: string[];
    usagePercent: number;
    usageLabel: string;
  };
  quickActions: ClientQuickAction[];
  support: {
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
  };
  notifications: ClientNotification[];
  recentActivities: ClientActivity[];
};

type SessionInput = {
  name: string;
  email: string;
};

function toFirstName(name: string): string {
  const safe = sanitizeString(name, { maxLength: 120 });
  const first = safe.split(" ").filter(Boolean)[0];
  return first || "Cliente";
}

export function buildClientDashboardViewModel(
  session: SessionInput
): ClientDashboardViewModel {
  const safeName = sanitizeString(session.name || "Cliente", { maxLength: 120 });
  const safeEmail = sanitizeString(session.email || "", {
    maxLength: 160,
    collapseWhitespace: false,
  });

  return {
    state: "ready",
    account: {
      firstName: toFirstName(safeName),
      fullName: safeName,
      email: safeEmail,
      badgeLabel: "Conta ativa",
    },
    connection: {
      status: "online",
      checkedAt: "Agora mesmo",
      message: "Sem instabilidade detectada na sua regiao.",
    },
    billing: {
      status: "EM_DIA",
      amountLabel: "R$ 129,90",
      dueDateLabel: "Vencimento em 12/04",
      nextInvoiceLabel: "Proxima fatura: abril/2026",
      payNowHref: "/suporte",
    },
    plan: {
      name: "Plano Fibra Pro",
      speedLabel: "500 Mb",
      benefits: [
        "Wi-Fi dual band incluso",
        "Suporte prioritario",
        "Instalacao e manutencao sem custo",
      ],
      usagePercent: 62,
      usageLabel: "Consumo medio no mes: 620 GB",
    },
    quickActions: [
      {
        id: "invoice-2nd-copy",
        label: "2a via de boleto",
        href: "/suporte",
      },
      {
        id: "speed-test",
        label: "Testar velocidade",
        href: "https://fast.com",
        external: true,
      },
      {
        id: "open-ticket",
        label: "Abrir chamado",
        href: "/contato#formulario-contato",
      },
      {
        id: "update-profile",
        label: "Atualizar cadastro",
        href: "/cliente/perfil",
      },
    ],
    support: {
      title: "Suporte especializado",
      description: "Nossa equipe responde rapido para quedas, lentidao e ajustes da sua conexao.",
      ctaLabel: "Falar com suporte",
      ctaHref: "/contato#formulario-contato",
    },
    notifications: [
      {
        id: "notif-invoice",
        title: "Fatura de abril gerada",
        description: "Sua proxima fatura ja esta disponivel para consulta.",
        level: "info",
      },
      {
        id: "notif-upgrade",
        title: "Upgrade de velocidade disponivel",
        description: "Sua regiao agora suporta plano de 700 Mb.",
        level: "success",
      },
      {
        id: "notif-maintenance",
        title: "Janela de manutencao programada",
        description: "Quinta-feira, 02:00-03:00, com impacto minimo.",
        level: "warning",
      },
    ],
    recentActivities: [
      {
        id: "activity-login",
        label: "Novo acesso na Central do Cliente",
        at: "Hoje, 09:31",
      },
      {
        id: "activity-ticket",
        label: "Chamado #1842 finalizado",
        at: "Ontem, 18:12",
      },
    ],
  };
}
