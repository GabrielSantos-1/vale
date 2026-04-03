# TASKS.md

## Objetivo

Registrar status de execução por ciclo e próximas tarefas objetivas do projeto.

---

## Data de referência

2026-04-01

---

## Ciclo atual

Ciclo 1.1.0 — Conversão pública + hardening incremental + validação operacional final.

---

## Status das etapas de execução

## Etapa 1 — Quick wins de conversão e confiança
- [x] Header/footer com reforço de acesso e confiança institucional
- [x] WhatsApp oficial ajustado para checkpoint antigo (`5513996270950`)
- [x] Central do Cliente e 2ª via tratadas como "Em breve"/preparação
- [x] Sem mudança em auth/admin/API sensível

## Etapa 2 — Cobertura mais crível e mais segura
- [x] Página `/cobertura` resiliente à falha de leitura do banco
- [x] Fallback comercial para estados sem áreas publicadas
- [x] Mensagens sem reflexão insegura de input
- [x] Contrato de `POST /api/coverage-check` preservado

## Etapa 3 — Login admin com recuperação integrada
- [x] Link "Esqueceu sua senha?" no login admin
- [x] UX de recuperação/reset integrada ao fluxo existente
- [x] Validação client-side de senha alinhada ao contrato server-side
- [x] Respostas neutras e seguras mantidas no request de recovery

## Etapa 4 — Estrutura futura da área do cliente
- [x] Placeholder seguro criado em `/cliente/login`
- [x] Separação explícita entre superfícies cliente e admin
- [x] Sem reutilização insegura de sessão/role admin

## Etapa 5 — Rodapé institucional
- [x] Rodapé reforçado com links institucionais e presença operacional
- [x] Central do Cliente apontando para rota pública de preparação
- [x] Sem criação de informação jurídica/regulatória inventada

## Etapa 6 — Hardening de superfície pública
- [x] Parser único de JSON com limite real de payload em APIs públicas críticas
- [x] Validação estrita e rejeição de campos inesperados
- [x] Headers de segurança + `X-Correlation-Id` nas respostas hardenizadas
- [x] Sanitização de saída textual pública (ex.: `notes` de cobertura)

## Etapa 7 — Medição de conversão first-party
- [x] Endpoint `POST /api/events` com allowlist e rate limit
- [x] Instrumentação de eventos públicos sem PII
- [x] Logs estruturados com metadados mínimos seguros

## Etapa 8 — Pente-fino final de prontidão
- [x] build/start e smoke checks executados no ciclo
- [x] revisão final de links, fluxos críticos e segurança básica
- [x] ausência de `dangerouslySetInnerHTML` no escopo revisado

## Hotfix pós-etapas — loop de redirecionamento admin
- [x] causa raiz identificada no gate de token do `proxy.ts`
- [x] ajuste aplicado removendo forçamento de `secureCookie`
- [x] comportamento esperado restabelecido para ambiente local

---

## Próximas tarefas objetivas (deploy e verificação)

1. preparar commit final da baseline 1.1.0 (código + docs);
2. validar novamente login admin end-to-end em ambiente de release;
3. executar deploy monitorado e checar rotas críticas pós-deploy;
4. abrir ciclo de observabilidade e hardening residual (CSP global/rate limit distribuído).

---

## Regra de execução

Nenhuma tarefa futura deve:
- quebrar login/admin e proteção de rotas;
- alterar schema sem decisão explícita e checkpoint;
- expandir escopo além do ciclo definido;
- reduzir controles de validação, rate limit ou tratamento seguro de erro.
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
