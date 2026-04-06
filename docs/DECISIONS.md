# DECISIONS.md

## Objetivo

Registrar decisões arquiteturais e operacionais com histórico auditável.

---

## Decisão 001 — Stack oficial

Next.js + TypeScript + Tailwind + PostgreSQL + Prisma.

**Motivo:** equilíbrio entre produtividade, segurança e escalabilidade.

---

## Decisão 002 — Autenticação por cookie HttpOnly

Sessão administrativa baseada em cookie HttpOnly.

**Motivo:** reduzir superfície de ataque de XSS sobre credenciais.

---

## Decisão 003 — Validação com Zod

Validação de entrada padronizada no servidor com schemas Zod.

**Motivo:** tipagem forte e contratos consistentes.

---

## Decisão 004 — Arquitetura modular

Separação entre UI, validação, segurança e persistência.

**Motivo:** evolução incremental com menor acoplamento.

---

## Decisão 005 — Política de checkpoint datado

Registrar checkpoints técnicos datados para continuidade e rastreabilidade.

**Motivo:** reduzir regressões e melhorar governança.

---

## Decisão 006 — Banco operacional consolidado em Supabase

Manter baseline em novo projeto Supabase após descarte do banco inconsistente.

**Motivo:** previsibilidade operacional e alinhamento de produção.

---

## Decisão 007 — Validação de auth no domínio canônico

Validação final de autenticação deve ocorrer no domínio principal (`NEXTAUTH_URL`).

**Motivo:** evitar falso diagnóstico por divergência de domínio/cookie.

---

## Decisão 008 — Prioridade de hardening pós-recovery

Após recuperação de deploy/admin, priorizar endurecimento antes de expansão ampla.

**Motivo:** consolidar base segura.

---

## Decisão 009 — Posicionamento verbal oficial público

Adotar posicionamento: provedor regional com operação transparente e atendimento próximo.

**Motivo:** consistência institucional e comercial.

---

## Decisão 010 — Refino textual sem mudança funcional

Permitir ciclos de copy/SEO on-page sem alterar lógica, contratos ou dados.

**Motivo:** elevar conversão preservando estabilidade.

---

## Decisão 011 — SEO on-page semântico orientado a utilidade

Padronizar vocabulário semântico útil (fibra, planos, cobertura, status, suporte).

**Motivo:** melhorar intenção de busca e legibilidade.

---

## Decisão 012 — Hardening API-first com parser único de JSON

Padronizar parse de body com limite real de bytes e erros consistentes (`INVALID_JSON`, `PAYLOAD_TOO_LARGE`, `UNSUPPORTED_MEDIA_TYPE`) nas APIs públicas críticas.

**Motivo:** reduzir superfícies de abuso e inconsistência de tratamento.

Impacto:
- melhora previsibilidade de erro para frontend;
- reduz risco de payload malicioso e parsing frágil.

---

## Decisão 013 — Telemetria first-party sem PII

Instrumentar eventos de conversão via endpoint interno `POST /api/events`, com allowlist de eventos e propriedades, sem coleta de dados pessoais.

**Motivo:** medir conversão com minimização de dados e menor risco LGPD.

Impacto:
- observabilidade comercial inicial sem provider externo;
- menor superfície de vazamento de dados sensíveis.

---

## Decisão 014 — Separação explícita admin/cliente

Criar rota pública de preparação `/cliente/login` sem autenticação real e sem reaproveitar sessão admin.

**Motivo:** preservar fronteiras de segurança e evitar mistura de perfis.

Impacto:
- prepara evolução futura de RBAC/ABAC para cliente;
- evita acoplamento inseguro com auth administrativa.

---

## Decisão 015 — Correção de leitura de sessão no proxy local

No `proxy.ts`, remover forçamento de `secureCookie` em `getToken` para evitar mismatch de cookie em `npm run start` local HTTP.

**Motivo:** resolver loop `/admin/login` ↔ `/admin/dashboard` sem alterar modelo de sessão.

Impacto:
- acesso admin local restabelecido;
- mantém proteção de rota por token + role.

---


## Decisao 016 - Rate limit distribuido com Upstash e fallback controlado

Adotar driver distribuido de rate limit via Upstash Redis (`RATE_LIMIT_DRIVER=upstash`) mantendo o driver in-memory como fallback de contingencia controlada por flag (`RATE_LIMIT_FAILOVER_TO_MEMORY`).

**Motivo:** preservar protecao contra abuso em ambiente com multiplas instancias sem quebrar contratos de API.

Impacto:
- preserva headers `X-RateLimit-*` e `Retry-After`;
- reduz risco de bypass de limite por distribuicao horizontal;
- mantem fail-open monitorado em indisponibilidade do backend distribuido.

---

## Regra

Toda decisao que altere seguranca, deploy, auth/session, API publica, banco ou governanca documental deve ser registrada aqui.

---

## Decisao 017 - Rollout de CSP global em modo progressivo

Centralizar a politica CSP em `lib/security/headers.ts` com chaveamento por ambiente e modo de rollout (`CSP_MODE=report-only|enforce`).

**Motivo:** endurecer superficie de frontend sem regressao abrupta em paginas publicas e administrativas.

Impacto:
- permite fase de observacao com `Content-Security-Policy-Report-Only`;
- habilita enforcement controlado com `Content-Security-Policy`;
- unifica diretivas de CSP entre middleware global e respostas de API via `request-meta`.

---

## Decisao 018 - Observabilidade first-party com AuditLog e alerta por webhook

Consolidar observabilidade operacional reaproveitando `AuditLog` (sem migration), com agregacao no painel admin e alertas por webhook para picos de `RATE_LIMITED` e erros.

**Motivo:** detectar anomalias em rotas publicas criticas com baixo acoplamento e sem dependencia obrigatoria de provider externo.

Impacto:
- cria trilha operacional segura sem PII para eventos/erros/rate-limit;
- adiciona visao executiva em `/admin/dashboard` para resposta rapida;
- preserva contratos publicos existentes e evita mudanca de schema Prisma.

---

## Decisao 019 - Governanca CI minima com e2e desacoplado do gate de PR

Adotar gate obrigatorio de PR/push com `test + build` e manter e2e Playwright em workflow separado manual/scheduled.

**Motivo:** reduzir risco de regressao funcional/compilacao no merge sem tornar o ciclo de PR instavel por flakiness de e2e.

Impacto:
- cria bloqueio tecnico objetivo para merge;
- preserva validacao end-to-end em trilha controlada;
- melhora rastreabilidade de qualidade no fechamento do ciclo 1.2.

---

## Decisao 020 - Segredo de auth no CI com fallback controlado

Nos workflows de CI (`CI Gate` e `E2E Playwright`), injetar `NEXTAUTH_SECRET` (e `AUTH_SECRET`) via `secrets.NEXTAUTH_SECRET` com fallback controlado para evitar falha de build por ausencia de segredo em contextos restritos.

**Motivo:** `auth-options.ts` valida segredo em tempo de import durante `npm run build`, e a falta da variavel quebra checks remotos mesmo sem execucao de login real.

Impacto:
- elimina falha estrutural de build nos checks de PR;
- preserva governanca por segredo em ambientes com configuracao completa;
- mantem compatibilidade sem alterar contrato de API ou fluxo de autenticacao.
- exige segredo `DATABASE_URL` no CI gate para prerender/build de rotas com Prisma.

---

## Decisao 021 - Calibracao de alertas com severidade e anti-ruido

Evoluir alertas operacionais para thresholds por severidade (`warning`/`critical`) com janela configuravel por ambiente e cooldown independente por chave (`kind + route + severity`).

**Motivo:** reduzir falso positivo e alert storm em producao, mantendo deteccao rapida de degradacao real.

Impacto:
- thresholds passam a ser calibraveis por ambiente (`OBS_ALERT_*_WARNING` e `OBS_ALERT_*_CRITICAL`);
- legado permanece compativel via fallback de `OBS_ALERT_RATE_LIMIT_THRESHOLD` e `OBS_ALERT_ERROR_THRESHOLD`;
- painel admin recebe metadados de calibracao e saude de alertas para operacao guiada.

---

## Decisao 022 - Separacao de incidentes auth admin vs APIs publicas no painel

Classificar incidentes de observabilidade entre superficie publica de conversao e superficie de autenticacao admin para reduzir falso "Atencao" em testes controlados de login.

**Motivo:** tentativas invalidas de senha em `/api/auth/*` sao sinal de seguranca, mas nao devem distorcer o status operacional de conversao publica.

Impacto:
- agregacao passa a expor campos aditivos (`publicRateLimited`, `publicErrors`, `authRateLimited`, `authErrors`, `authNoiseDetected`);
- status operacional do painel prioriza incidentes publicos;
- contrato interno de observabilidade permanece compativel (sem remocao de campos existentes);
- sem alteracao de schema Prisma, autenticacao/sessao ou contratos publicos.

---

## Decisao 023 - CSRF obrigatorio em mutacoes admin com cookie dupla-submissao

Aplicar validacao CSRF obrigatoria em todas as rotas administrativas mutaveis (`POST`, `PUT`, `PATCH`, `DELETE`) usando estrategia de dupla-submissao:
- cookie `vv_csrf_token` emitido na superficie admin;
- header `x-csrf-token` exigido e validado no servidor;
- validacao de origem (`origin`/`referer`) no mesmo host permitido.

**Motivo:** reduzir risco de mutacoes indevidas em sessao baseada em cookie HttpOnly sem depender de protecao no frontend.

Impacto:
- mutacoes admin sem token valido passam a retornar `403` com `CSRF_VALIDATION_FAILED`;
- frontend admin passa a enviar o token CSRF em mutacoes;
- trilha de bloqueio CSRF e mutacoes sensiveis passa a ser persistida em `AuditLog`;
- contratos publicos permanecem inalterados.
