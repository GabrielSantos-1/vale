# TASKS.md

## Objetivo

Registrar status de execucao por ciclo e proximas tarefas objetivas do projeto.

---

## Data de referencia

2026-04-06

---

## Ciclo atual

Ciclo 1.2.3 - Hardening critico para deploy/producao.

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

## Ciclo 1.2.1 - Etapa 4 Visual Publica (polimento final)

- [x] Padrao visual publico consolidado em `app/globals.css` com estados consistentes de `public-card`/`public-card-strong` (hover/focus/borda/sombra/transicao)
- [x] Contraste tipografico secundario calibrado em contexto publico (`.public-shell .text-secondary/.text-muted`)
- [x] Bloco de status da home normalizado para o padrao `public-card` em `app/(public)/page.tsx`
- [x] Validacao tecnica de nao regressao executada no fechamento (`npm run build` + `npm test`)
- [x] Evidencia documental registrada em `docs/PROJECT_STATE.md` e checkpoint datado de fechamento visual

## Ciclo 1.2.2 - Etapa de produto (fluxos publicos criticos guiados por observabilidade)

- [x] Refino de UX e hierarquia visual aplicado em `/planos`, `/contato` e `/status` sem alterar fluxo funcional
- [x] Cobertura com telemetria adicional de CTA em blocos criticos (`resultado`, `resumo` e `lista vazia`)
- [x] Telemetria aditiva de clique em CTA principal de planos (`plan_card`) e CTA de banner operacional (`status_banner`)
- [x] Telemetria de submissao em contato reforcada com status `submitted` (alem de `success`/`error`)
- [x] Validacao tecnica da etapa executada (`npm run build` + `npm test`)
- [x] Baseline T0 e metas operacionais registradas em `docs/PROJECT_STATE.md` e checkpoint datado da etapa
- [x] Hotfix de tipagem em telemetria de cobertura aplicado para restaurar `npm run build` e desbloquear `npm run start` sem mudanca funcional

---

## Ciclo 1.2.3 - Hardening critico (deploy/producao)

- [x] CSRF server-side centralizado em mutacoes admin com validacao de origem + `vv_csrf_token` + `x-csrf-token`
- [x] Emissao de cookie CSRF na superficie admin via `proxy.ts`
- [x] Frontend admin ajustado para enviar header CSRF em mutacoes (`faq`, `planos`, `cobertura`, `status`, `contato`, `leads`)
- [x] Rotas admin legadas (`faq`/`plans`) migradas para envelope seguro + parser com limite + validacao Zod estrita
- [x] Mutações admin criticas passaram a registrar auditoria persistente em `AuditLog` (create/update/delete/status/archive)
- [x] Testes adicionados: `tests/unit/csrf.test.ts`, `tests/integration/admin-faq-security.test.ts`, `tests/integration/security-smoke.test.ts`
- [x] Cenário e2e admin de CSRF adicionado em `tests/e2e/admin-security.spec.ts` (executa quando segredos E2E estão configurados)
- [x] Gate CI endurecido com `lint` + `typecheck` + `test` + `build` + etapa de smoke de segurança

---

## Ciclo 1.3.0 - Central do Cliente (autenticacao propria)

- [x] Modelo `ClientUser` adicionado ao schema Prisma (sem alterar models existentes)
- [x] Auth de cliente propria em `lib/auth/client-auth-options.ts`
- [x] API de login: `POST /api/client/auth/login` com rate limit e JWT customizado
- [x] API de registro: `POST /api/client/register` com validacao e rate limit
- [x] API de logout: `POST /api/client/logout` com invalidacao de cookie
- [x] Formulario de login em `components/ui/forms/client-login-form.tsx`
- [x] Formulario de registro em `components/ui/forms/client-register-form.tsx`
- [x] Pagina `/cliente/login` substitui placeholder anterior
- [x] Pagina `/cliente/registro` criada
- [x] Dashboard `/cliente/dashboard` protegido por proxy
- [x] `proxy.ts` atualizado para proteger `/cliente/dashboard` separadamente do admin
- [x] Helper de sessao em `lib/auth/client-session.ts`
- [x] Validacao tecnica: `npx tsc --noEmit` aprovado
- [x] Mitigacao operacional local aplicada: `DATABASE_URL` ajustado de `:6543` para `:5432` para destravar runtime de login/registro
- [x] Confirmacao operacional: migracoes Prisma em dia (`prisma migrate status` = schema up to date)

---

## Ciclo 1.3.1 - Bloco A (perfil, senha e recuperacao)

- [x] Endpoint `GET /api/client/me` com sessao obrigatoria e resposta minimizada
- [x] Endpoint `PATCH /api/client/me` com Zod `.strict()`, limite de payload e rate limit
- [x] Endpoint `POST /api/client/password/change` com validacao de senha atual e hash bcrypt (salt 12)
- [x] Endpoints preparatorios de recuperacao:
  - [x] `POST /api/client/password-recovery/request`
  - [x] `POST /api/client/password-recovery/reset`
- [x] Nova pagina `/cliente/perfil` com leitura/edicao de perfil e secao de seguranca
- [x] Nova pagina `/cliente/recuperar-senha` com fluxo request/reset por token
- [x] `proxy.ts` atualizado para proteger `/cliente/perfil` com mesmo gate da sessao cliente
- [x] `quick-actions` do dashboard atualizado para "Atualizar cadastro" -> `/cliente/perfil`
- [x] Regressao tecnica local aprovada:
  - [x] `npm run typecheck`
  - [x] `npm run lint`
  - [x] `npm test`
  - [x] `npm run build`
- [ ] Smoke completo de registro/login/senha em runtime depende de conectividade DB no ambiente local (host remoto indisponivel no teste atual)

---

## Proximas tarefas objetivas

1. [ ] Monitorar janela pos-implementacao (T+24h / T+72h) e registrar tendencia das metricas dos fluxos publicos criticos.
2. [ ] Validar execucao do novo cenário e2e admin-csrf em ambiente remoto com segredos `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD`.
3. [ ] Implementar `prisma migrate dev` para modelo `ClientUser` em ambiente local.
4. [ ] Adicionar cenários e2e para fluxo de cliente (registro, login, dashboard).
5. [ ] Bloco B: persistir tokens de recuperacao de senha de cliente em schema dedicado (substituir store em memoria).
6. [ ] Vincular `ClientUser` ao `Lead` existente para rastrear conversao de clientes registrados.

---

## Regra de execucao

Nenhuma tarefa futura deve:
- quebrar login/admin e protecao de rotas;
- alterar schema sem decisao explicita e checkpoint;
- expandir escopo alem do ciclo definido;
- reduzir controles de validacao, rate limit ou tratamento seguro de erro.
