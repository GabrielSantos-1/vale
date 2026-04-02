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