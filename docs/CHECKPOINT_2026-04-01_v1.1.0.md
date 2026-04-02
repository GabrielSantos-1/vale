# CHECKPOINT_2026-04-01_v1.1.0

## Resumo executivo

Checkpoint técnico da baseline **1.1.0**, consolidando etapas 1 a 8 do roadmap incremental, correção do incidente de redirecionamento admin e validações de prontidão para continuidade de deploy.

---

## Escopo fechado do ciclo

Incluído:
- conversão e confiança pública (header/footer/CTAs/WhatsApp);
- cobertura pública resiliente com fallback comercial;
- integração segura de recuperação de senha admin;
- separação de superfície cliente/admin com placeholder `/cliente/login`;
- hardening API-first em `contact`, `leads`, `coverage-check`, `plans`;
- telemetria first-party sem PII em `POST /api/events`;
- hotfix do loop `/admin/login` ↔ `/admin/dashboard`.

Não incluído:
- alteração de schema Prisma/migrations;
- implementação de autenticação real da área do cliente;
- endurecimento global de CSP de páginas (fora desta rodada);
- integração de provider externo de analytics.

---

## Incidente admin — causa raiz e correção

### Sintoma
Após login válido, navegação em loop entre `/admin/login?callbackUrl=...` e `/admin/dashboard` com `307`.

### Causa raiz
No `proxy.ts`, a leitura de token com `secureCookie` forçado em ambiente local HTTP causava mismatch de cookie para `npm run start` em produção local, impedindo reconhecimento de sessão no gate admin.

### Correção aplicada
Remoção do forçamento de `secureCookie` na chamada de `getToken`, mantendo `secret` e validação de role.

### Arquivo impactado
- `proxy.ts`

---

## Validações do ciclo

### Build/runtime
- `npm run build` executado com sucesso em 2026-04-01
- `npm run start` executado com sucesso em 2026-04-01

### Smoke de rotas críticas
- Públicas: `/`, `/planos`, `/cobertura`, `/contato`, `/status`, `/cliente/login`
- Admin/auth: `/admin/login`, `/recuperar-admin`
- APIs: `/api/contact`, `/api/leads`, `/api/coverage-check`, `/api/events`, `/api/plans`
- Resultado observado:
  - todas as páginas acima responderam `200`;
  - `GET /api/plans` respondeu `200` com `X-Correlation-Id`;
  - `POST` inválido (content-type incorreto) em `/api/contact`, `/api/leads`, `/api/coverage-check`, `/api/events` respondeu `415`;
  - `POST /api/events` válido respondeu `200` com `{ \"accepted\": true }`;
  - sem sessão, `/admin/dashboard` respondeu `307` para `/admin/login?callbackUrl=%2Fadmin%2Fdashboard`.

### Segurança básica confirmada
- sem `dangerouslySetInnerHTML` no escopo alterado;
- validação estrita e parse com limite nas APIs públicas críticas;
- respostas de erro sem stack trace para cliente;
- telemetria first-party sem coleta de PII;
- rotas públicas sem exposição de `/admin/*` indevida.

---

## Riscos residuais

1. rate limiting in-memory (limitação em ambiente distribuído);
2. CSP global de páginas ainda não apertada nesta rodada (estratégia API-first);
3. observabilidade dos eventos depende de consolidação operacional posterior;
4. necessidade de regressão contínua automatizada para fluxos críticos.

---

## Critérios de prontidão para deploy

1. build e start locais sem erro;
2. login admin sem loop de redirecionamento;
3. rotas públicas e APIs críticas respondendo conforme contrato;
4. documentação alinhada ao código staged;
5. riscos residuais documentados e conhecidos.

---

## Referências cruzadas

- `docs/PROJECT_STATE.md`
- `docs/TASKS.md`
- `docs/BACKLOG.md`
- `docs/DECISIONS.md`
- `docs/API_CONTRACTS.md`
- `docs/checkpoints/2026-04-01-v1-1-0-hardening-conversao/`
