# PROJECT_STATE.md

## Objetivo

Registrar o estado tecnico oficial do projeto **Verde Vale Connect** para continuidade segura, rastreabilidade e execucao incremental sem regressao.

---

## Data de referencia

2026-04-04

---

## Release documental

### Versao: 1.2.1 (calibracao operacional de alertas)

Esta versao consolida o fechamento das etapas 2, 3, 4, 5 e 7 do ciclo 1.2:
- rate limit distribuido com fallback controlado;
- CSP global com rollout `report-only` e `enforce`;
- observabilidade first-party em `AuditLog`, dashboard admin e alerta por webhook;
- pipeline CI minimo em PR (`test + build`) e e2e separado manual/scheduled.
- calibracao de alertas com severidade (`warning`/`critical`), janela configuravel e anti-ruido.

---

## Resumo executivo

O sistema permanece funcional, com contratos publicos preservados e ganho de maturidade operacional para deteccao de anomalias e prevencao de regressao.

Consolidado em 1.2.1:
- rotas publicas e auth com rate limit compativel em ambiente distribuido;
- headers de seguranca e CSP unificados por modo de rollout;
- trilha operacional segura sem PII para eventos, rate-limit e erros;
- novo endpoint interno admin de observabilidade: `GET /api/admin/metrics/observability`;
- painel de observabilidade integrado ao dashboard admin;
- painel admin com metadados de calibracao e saude de alertas;
- governanca de entrega com workflows GitHub Actions para gate e e2e controlado.

Sem mudanca estrutural:
- sem alteracao de schema Prisma;
- sem migrations novas;
- sem quebra de contrato de API publica;
- sem alteracao do modelo de sessao NextAuth.

---

## Evidencias da baseline 1.2.1

- validacoes tecnicas locais:
  - `npm test`
  - `npm run build`
  - smoke de rotas criticas publicas e admin
- validacoes de seguranca/headers:
  - `X-Correlation-Id`, `X-RateLimit-*`, `Retry-After` preservados
  - `CSP_MODE=report-only` e `CSP_MODE=enforce` validados
- governanca CI:
  - `.github/workflows/ci-gate.yml`
  - `.github/workflows/e2e-playwright.yml`
- calibracao operacional:
  - `OBS_ALERT_WINDOW_MINUTES`
  - `OBS_ALERT_*_THRESHOLD_WARNING`
  - `OBS_ALERT_*_THRESHOLD_CRITICAL`
- checkpoint detalhado:
  - `docs/checkpoints/2026-04-03-v1-2-0-hardening-observabilidade-ci/`
  - `docs/checkpoints/2026-04-03-v1-2-1-calibracao-alertas/`

---

## Resumo do dia (2026-04-03)

### Entregas tecnicas consolidadas
1. fechamento oficial do ciclo 1.2 em branch dedicada e PR remoto;
2. correcao operacional de CI:
   - fallback de `NEXTAUTH_SECRET`/`AUTH_SECRET` em runtime;
   - padronizacao de actions para `checkout/setup-node` v5;
   - validacao obrigatoria de `DATABASE_URL` para build/e2e;
3. estabilizacao da suite e2e da home removendo acoplamento fragil ao copy;
4. calibracao de alertas com severidade (`warning`/`critical`), anti-ruido e metadados operacionais no dashboard/admin API.

### Evidencias de validacao
- `npm test` (local) aprovado ao longo do ciclo com regressao coberta;
- `npm run build` (local) aprovado apos ajustes de CI/observabilidade;
- `npm run e2e` (manual) aprovado em 2026-04-04T09:44:35-03:00 no commit `25365bd8f306c32efe9bf635e624977c262e03d3` (`tests/e2e/home.spec.ts`: `1 passed`);
- checks remotos de PR normalizados apos configuracao de segredos obrigatorios (`NEXTAUTH_SECRET`, `DATABASE_URL`).
- monitoramento operacional de alertas por 24h concluido (2026-04-03T12:52:00Z -> 2026-04-04T12:52:00Z) no projeto Vercel `vale`.

### Resultado operacional
- baseline 1.2.1 consistente para continuidade;
- contratos publicos preservados;
- governanca de entrega e observabilidade calibrada para rollout staging/prod;
- calibracao mantida sem ajuste de thresholds/cooldown apos janela de monitoramento (ausencia de eventos `PUBLIC_API_RATE_LIMITED` e `PUBLIC_API_ERROR` no periodo).

---

## Riscos residuais honestos

1. endpoint `GET /api/plans` depende de conectividade com banco externo no ambiente local;
2. alertas de webhook exigem configuracao operacional (`OBS_ALERT_*`) para efetiva notificacao;
3. e2e permanece fora do gate de PR por decisao de custo/estabilidade, podendo detectar regressao mais tarde que unit/integration.

---

## Proximos passos recomendados

1. executar e monitorar workflows no repositorio remoto apos push;
2. ajustar thresholds de alerta com base em trafego real;
3. evoluir cobertura e2e para fluxos publicos e admin mais criticos;
4. preparar proxima fase de produto (central do cliente e melhorias orientadas por telemetria agregada).

---

## Regra de manutencao

Atualizar este arquivo sempre que houver mudanca relevante em:
- deploy/producao;
- autenticacao, sessao, autorizacao ou gate admin;
- seguranca publica (headers/CSP/validacao/rate limit);
- contratos de API publica;
- baseline de checkpoint.
