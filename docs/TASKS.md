# TASKS.md

## Objetivo

Registrar status de execucao por ciclo e proximas tarefas objetivas do projeto.

---

## Data de referencia

2026-04-04

---

## Ciclo atual

Ciclo 1.2.1 - Hardening residual + observabilidade first-party + governanca operacional.

---

## Historico consolidado (legado)

### Ciclo 1.1.0 - Conversao publica + hardening incremental + validacao operacional final.

## Etapa 1 - Quick wins de conversao e confianca
- [x] Header/footer com reforco de acesso e confianca institucional
- [x] WhatsApp oficial ajustado para checkpoint antigo (`5513996270950`)
- [x] Central do Cliente e 2a via tratadas como "Em breve"/preparacao
- [x] Sem mudanca em auth/admin/API sensivel

## Etapa 2 - Cobertura mais crivel e mais segura
- [x] Pagina `/cobertura` resiliente a falha de leitura do banco
- [x] Fallback comercial para estados sem areas publicadas
- [x] Mensagens sem reflexao insegura de input
- [x] Contrato de `POST /api/coverage-check` preservado

## Etapa 3 - Login admin com recuperacao integrada
- [x] Link "Esqueceu sua senha?" no login admin
- [x] UX de recuperacao/reset integrada ao fluxo existente
- [x] Validacao client-side de senha alinhada ao contrato server-side
- [x] Respostas neutras e seguras mantidas no request de recovery

## Etapa 4 - Estrutura futura da area do cliente
- [x] Placeholder seguro criado em `/cliente/login`
- [x] Separacao explicita entre superficies cliente e admin
- [x] Sem reutilizacao insegura de sessao/role admin

## Etapa 5 - Rodape institucional
- [x] Rodape reforcado com links institucionais e presenca operacional
- [x] Central do Cliente apontando para rota publica de preparacao
- [x] Sem criacao de informacao juridica/regulatoria inventada

## Etapa 6 - Hardening de superficie publica
- [x] Parser unico de JSON com limite real de payload em APIs publicas criticas
- [x] Validacao estrita e rejeicao de campos inesperados
- [x] Headers de seguranca + `X-Correlation-Id` nas respostas hardenizadas
- [x] Sanitizacao de saida textual publica (ex.: `notes` de cobertura)

## Etapa 7 - Medicao de conversao first-party
- [x] Endpoint `POST /api/events` com allowlist e rate limit
- [x] Instrumentacao de eventos publicos sem PII
- [x] Logs estruturados com metadados minimos seguros

## Etapa 8 - Pente-fino final de prontidao
- [x] build/start e smoke checks executados no ciclo
- [x] revisao final de links, fluxos criticos e seguranca basica
- [x] ausencia de `dangerouslySetInnerHTML` no escopo revisado

## Hotfix pos-etapas - loop de redirecionamento admin
- [x] causa raiz identificada no gate de token do `proxy.ts`
- [x] ajuste aplicado removendo forcemento de `secureCookie`
- [x] comportamento esperado restabelecido para ambiente local

---

## Ciclo 1.2 - Etapa 2 (rate limit distribuido)

- [x] Driver distribuido com Upstash Redis implementado em `lib/security/rate-limit.ts`
- [x] Fallback controlado por flag (`RATE_LIMIT_FAILOVER_TO_MEMORY`) com fail-open monitorado
- [x] Integracao mantida nas rotas publicas e auth sem quebra de contrato
- [x] Testes unitarios do core de rate limit adicionados
- [x] Validacao de integracao com retorno `429` + headers de rate limit

## Ciclo 1.2 - Etapa 3 (CSP global com rollout seguro)

- [x] Politica CSP centralizada por ambiente com `CSP_MODE=report-only|enforce`
- [x] Aplicacao global mantida no `proxy.ts` via `securityHeaders`
- [x] Consistencia de diretivas entre camada global e APIs hardenizadas
- [x] Validacao funcional em modo `report-only` e `enforce`
- [x] Regressao tecnica validada com testes e build

## Ciclo 1.2 - Etapa 4 (observabilidade first-party)

- [x] Ingestao operacional em `AuditLog` para eventos, rate-limit e erros sem PII
- [x] Endpoint admin de metricas operacionais (`/api/admin/metrics/observability`)
- [x] Alertas por webhook com cooldown e thresholds configuraveis
- [x] Painel de observabilidade integrado no `/admin/dashboard`
- [x] Validacao tecnica com testes, build e smoke de fluxo critico

## Ciclo 1.2 - Etapa 5 (regressao continua e fechamento oficial)

- [x] Workflow de gate em PR/push criado com `npm ci`, `npm test`, `npm run build`
- [x] Workflow e2e separado com `workflow_dispatch` + `schedule` diario
- [x] Atualizacao de estado oficial em `docs/PROJECT_STATE.md`
- [x] Contrato interno admin de observabilidade documentado em `docs/API_CONTRACTS.md`
- [x] Checkpoint completo de fechamento 1.2.0 criado em `docs/checkpoints/2026-04-03-v1-2-0-hardening-observabilidade-ci/`

## Ciclo 1.2 - Etapa 6.1 (operacao remota de CI e checks)

- [x] Correcao de secrets de auth no workflow (`NEXTAUTH_SECRET`/`AUTH_SECRET`) sem alterar contrato de API
- [x] Correcao de dependencia de build com `DATABASE_URL` no CI gate e no e2e workflow
- [x] Atualizacao de actions para `actions/checkout@v5` e `actions/setup-node@v5`
- [x] Checks remotos normalizados apos configuracao de segredos obrigatorios no repositorio
- [x] Evidencias operacionais registradas no PR de fechamento do ciclo

## Ciclo 1.2 - Etapa 7 (calibracao operacional de alertas)

- [x] Janela de alerta configuravel por ambiente (`OBS_ALERT_WINDOW_MINUTES`)
- [x] Thresholds por severidade (`warning`/`critical`) com fallback legado
- [x] Cooldown por chave com severidade e trilha de supressao anti-ruido
- [x] Endpoint admin com metadados de calibracao e saude de alertas
- [x] Dashboard admin com visao de saude de alertas e thresholds ativos
- [x] Runbook operacional curto registrado em checkpoint datado

---

## Proximas tarefas objetivas

1. [x] Executar E2E Playwright manual no PR de fechamento e anexar evidencia final.
   Evidencia: execucao manual concluida em 2026-04-04T09:44:35-03:00 no commit `25365bd8f306c32efe9bf635e624977c262e03d3` com `npm run e2e` -> `1 passed` (`tests/e2e/home.spec.ts`).
2. [x] Monitorar calibracao de alertas em staging por 24h e ajustar thresholds se necessario.
   Evidencia: janela operacional completa de 24h (2026-04-03T12:52:00Z -> 2026-04-04T12:52:00Z) via runtime logs Vercel (`preview` + `production`), sem ocorrencias de `PUBLIC_API_RATE_LIMITED`/`PUBLIC_API_ERROR`; calibracao mantida sem ajuste de thresholds/cooldown.
3. Iniciar proxima etapa de produto com base no runbook e sinais reais de observabilidade.

---

## Regra de execucao

Nenhuma tarefa futura deve:
- quebrar login/admin e protecao de rotas;
- alterar schema sem decisao explicita e checkpoint;
- expandir escopo alem do ciclo definido;
- reduzir controles de validacao, rate limit ou tratamento seguro de erro.
