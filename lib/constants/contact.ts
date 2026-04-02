export type PublicContactAction = {
  label: string;
  href: string;
  description: string;
};

export const whatsappSupportUrl =
  "https://wa.me/5513996270950?text=Ol%C3%A1%2C%20quero%20suporte%20t%C3%A9cnico";

export const CUSTOMER_PORTAL_COMING_SOON_ITEMS = [
  "Central do Cliente",
  "2a via",
] as const;

export const PUBLIC_CONTACT_ACTIONS = {
  coverage: {
    label: "Consultar cobertura",
    href: "/cobertura#consulta-cobertura",
    description: "Verifique disponibilidade por cidade, bairro ou CEP.",
  },
  support: {
    label: "Falar com suporte",
    href: "/suporte",
    description: "Acesse orientacoes e canais para suporte tecnico.",
  },
  commercial: {
    label: "Contato comercial",
    href: "/contato#formulario-contato",
    description: "Envie solicitacao para planos, propostas e atendimento.",
  },
} as const satisfies Record<string, PublicContactAction>;

export default PUBLIC_CONTACT_ACTIONS;
