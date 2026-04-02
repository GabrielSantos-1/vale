# PROJECT_STATE.md

## Objetivo

Registrar o estado técnico oficial do projeto **Verde Vale Connect** para continuidade segura, rastreabilidade e execução incremental sem regressão.

---

## Data de referência

2026-04-01

---

## Release documental

### Versão: 1.1.0 (documental + validação operacional)

Esta versão consolida as entregas das etapas 1 a 8 do roadmap incremental e o hotfix de redirecionamento admin em ambiente local, com build/start e smoke checks de prontidão.

---

## Resumo executivo

O sistema está funcional e com baseline de segurança reforçada nas superfícies públicas críticas, preservando arquitetura, schema e contratos sensíveis.

Consolidado em 1.1.0:
- reforço de conversão pública em header/footer/quick actions;
- fallback resiliente em cobertura pública sem quebra quando a leitura do banco falha;
- integração de recuperação de senha admin com UX e validações alinhadas ao server;
- separação explícita de superfície cliente/admin com placeholder `/cliente/login`;
- hardening API-first (`/api/contact`, `/api/leads`, `/api/coverage-check`, `/api/plans`);
- telemetria first-party com allowlist e sem PII (`/api/events`);
- correção de loop `/admin/login` ↔ `/admin/dashboard` via ajuste de leitura de cookie no `proxy.ts`.

Sem mudança estrutural:
- sem alteração de schema Prisma;
- sem migrations novas;
- sem mudança de contrato de sessão/cookies NextAuth;
- sem criação de autenticação real de cliente.

---

## Estado funcional por domínio

### Público
- páginas estratégicas operacionais: `/`, `/planos`, `/cobertura`, `/contato`, `/status`, `/cliente/login`;
- CTAs de atendimento e conversão consistentes;
- cobertura com fallback comercial quando áreas não estão disponíveis;
- formulários públicos com tratamento de erro seguro.

### Admin
- login admin e dashboard protegidos por role;
- fluxo "Esqueceu sua senha?" integrado ao login;
- request/reset com proteção de enumeração e controles existentes.

### API e persistência
- contratos públicos preservados com robustez adicional de parsing/validação;
- correlação e headers de segurança aplicados nas rotas públicas hardenizadas;
- logs com contexto operacional mínimo, sem token/senha em payload de log.

---

## Superfícies de ataque revisadas (resumo)

- navegação pública e links externos (header/footer/CTAs);
- formulários e handlers públicos (`contact`, `leads`, `coverage-check`);
- endpoint de eventos (`/api/events`) com allowlist e rate limit;
- gate de sessão/role em rotas admin via `proxy.ts`.

---

## Evidências da baseline 1.1.0

- checkpoint principal: `docs/CHECKPOINT_2026-04-01_v1.1.0.md`;
- checkpoint detalhado: `docs/checkpoints/2026-04-01-v1-1-0-hardening-conversao/`;
- validações técnicas registradas no ciclo:
  - `npm run build`;
  - `npm run start`;
  - smoke de rotas públicas, admin/auth e APIs críticas.

---

## Riscos residuais honestos

1. rate limit permanece in-memory (eficácia reduzida em escala distribuída);
2. CSP global de páginas não foi endurecida nesta rodada (estratégia API-first);
3. monitoramento/alertas de eventos ainda dependem de observabilidade operacional posterior;
4. documentação histórica antiga ainda contém arquivos legados com formatação inconsistente fora do escopo desta baseline.

---

## Próximos passos recomendados

1. consolidar estratégia distribuída de rate limit (Redis/edge-store);
2. executar fase dedicada de hardening de CSP global de páginas com janela de regressão controlada;
3. conectar telemetria first-party a painel operacional/alerta;
4. rodar suíte automatizada mínima contínua em CI para fluxos críticos públicos e admin.

---

## Regra de manutenção

Atualizar este arquivo sempre que houver mudança relevante em:
- deploy/produção;
- autenticação, sessão, autorização ou gate admin;
- segurança pública (headers/CSP/validação/rate limit);
- contratos de API pública;
- baseline de checkpoint.