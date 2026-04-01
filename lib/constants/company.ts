export type CompanyMetric = {
  label: string;
  value: string;
  helper: string;
};

export type CompanyDifferential = {
  title: string;
  description: string;
};

export const COMPANY_PROFILE = {
  name: "Verde Vale Connect",
  heroEyebrow: "Provedor regional | internet fibra | atendimento proximo",
  heroBadge: "Sobre a Verde Vale Connect",
  heroTitle: "Internet fibra com operacao regional transparente e atendimento proximo",
  heroDescription:
    "A Verde Vale Connect atua como provedor regional, conectando clientes residenciais e empresas com planos de internet fibra, cobertura consultavel e suporte acessivel.",
  summary:
    "Nosso foco e manter estabilidade, comunicacao clara e acompanhamento do servico do primeiro contato ate o pos-instalacao.",
  metrics: [
    {
      label: "Atuacao regional",
      value: "Presenca local continua",
      helper: "Operacao proxima da realidade de cada cidade e bairro atendido.",
    },
    {
      label: "Cobertura consultavel",
      value: "Cidade, bairro e CEP",
      helper: "Consultar cobertura para apoiar a decisao de contratacao.",
    },
    {
      label: "Transparencia operacional",
      value: "Status e suporte publicos",
      helper: "Atualizacoes da rede e canais de atendimento para reduzir duvidas.",
    },
  ] satisfies CompanyMetric[],
  differentials: [
    {
      title: "Atendimento proximo",
      description:
        "Equipe disponivel para orientar contratacao, suporte inicial e proximos passos com clareza.",
    },
    {
      title: "Informacao transparente",
      description:
        "Cobertura, status da rede e canais de contato sao apresentados de forma direta para consulta.",
    },
    {
      title: "Operacao voltada ao cliente",
      description:
        "Da consulta de cobertura ao suporte, o servico prioriza estabilidade e comunicacao objetiva.",
    },
  ] satisfies CompanyDifferential[],
  regionalScope: [
    "Consulta de cobertura por localidade antes da contratacao.",
    "Acompanhamento publico do status da rede para manutencoes e ocorrencias.",
    "Canais de atendimento para suporte e orientacao comercial.",
  ],
} as const;

export default COMPANY_PROFILE;
