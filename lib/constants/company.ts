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
  name: "Verde Vale",
  heroEyebrow: "Institucional • operacao regional • atendimento confiavel",
  heroBadge: "Sobre a Verde Vale",
  heroTitle: "Conectividade com foco em estabilidade, atendimento e transparencia",
  heroDescription:
    "A Verde Vale organiza planos, cobertura, status e canais de contato em uma jornada simples e confiavel para clientes residenciais e comerciais.",
  summary:
    "Atuamos com operacao continua na regiao, mantendo comunicacao clara e suporte objetivo em todas as etapas da jornada.",
  metrics: [
    {
      label: "Tempo de empresa",
      value: "Atuacao continua",
      helper: "Operacao consolidada com rotina publica de atendimento.",
    },
    {
      label: "Presenca regional",
      value: "Cidades e bairros mapeados",
      helper: "Cobertura consultavel por cidade, bairro e CEP.",
    },
    {
      label: "Foco operacional",
      value: "Estabilidade e resposta",
      helper: "Suporte e status publico para reduzir duvidas.",
    },
  ] satisfies CompanyMetric[],
  differentials: [
    {
      title: "Comunicacao objetiva",
      description:
        "Status, cobertura e contato ficam em paginas diretas, com leitura clara para decidir rapido.",
    },
    {
      title: "Atendimento organizado",
      description:
        "Fluxos separados para comercial e suporte tecnico evitam retrabalho e melhoram o retorno.",
    },
    {
      title: "Jornada sem atrito",
      description:
        "Da consulta de cobertura ate a contratacao, a navegacao prioriza clareza e proximos passos.",
    },
  ] satisfies CompanyDifferential[],
  regionalScope: [
    "Cobertura publicada com consulta por localidade antes da contratacao.",
    "Atualizacao operacional com status publico para incidentes e manutencoes.",
    "Canais de contato para suporte inicial e atendimento comercial.",
  ],
} as const;

export default COMPANY_PROFILE;
