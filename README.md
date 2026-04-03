# Verde Vale Connect

Site institucional e plataforma operacional da Verde Vale Connect, construído com Next.js App Router, TypeScript, Prisma e PostgreSQL, com foco em segurança, conversão e continuidade de produção.

## Estado atual

Baseline documental: **v1.1.0** (2026-04-01).

Esta baseline consolida:
- etapas 1 a 8 do roadmap incremental de conversão + segurança;
- hardening API-first em rotas públicas críticas;
- telemetria first-party sem PII (`POST /api/events`);
- integração segura de recuperação de senha admin;
- placeholder público de futura central do cliente (`/cliente/login`);
- hotfix do loop de redirecionamento admin em ambiente local.

Referências:
- checkpoint principal: `docs/CHECKPOINT_2026-04-01_v1.1.0.md`
- checkpoint detalhado: `docs/checkpoints/2026-04-01-v1-1-0-hardening-conversao/`

## Stack

### Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React

### Backend
- Next.js Route Handlers
- TypeScript

### Dados
- PostgreSQL
- Prisma ORM

### Segurança e autenticação
- Auth.js com sessão por cookie HttpOnly
- Zod para validação server-side

### Testes
- Vitest
- Playwright

## Configuracao de ambiente (rate limit e CSP)

Use `.env.example` como base e configure:

- `RATE_LIMIT_DRIVER=memory|upstash`
- `RATE_LIMIT_FAILOVER_TO_MEMORY=true|false`
- `UPSTASH_REDIS_REST_URL` (obrigatorio quando `upstash`)
- `UPSTASH_REDIS_REST_TOKEN` (obrigatorio quando `upstash`)
- `CSP_MODE=report-only|enforce`
- `CSP_REPORT_URI` (opcional)
- `OBS_ALERT_ENABLED=true|false`
- `OBS_ALERT_WEBHOOK_URL` (opcional)
- `OBS_ALERT_COOLDOWN_SECONDS`
- `OBS_ALERT_RATE_LIMIT_THRESHOLD`
- `OBS_ALERT_ERROR_THRESHOLD`

Matriz operacional recomendada:
- `dev`: `RATE_LIMIT_DRIVER=memory`
- `staging`: `RATE_LIMIT_DRIVER=upstash` e `RATE_LIMIT_FAILOVER_TO_MEMORY=true`
- `prod`: `RATE_LIMIT_DRIVER=upstash` e `RATE_LIMIT_FAILOVER_TO_MEMORY=true`

## Documentação obrigatória

Antes de qualquer alteração, seguir:
1. `AGENTS.md`
2. `docs/PROJECT_BRIEF.md`
3. `docs/ARCHITECTURE.md`
4. `docs/SECURITY_RULES.md`
5. `docs/CODING_STANDARDS.md`
6. `docs/BACKLOG.md`
7. `docs/TASKS.md`
8. `docs/API_CONTRACTS.md`
9. `docs/UI_GUIDELINES.md`
10. `docs/PROMPTING_RULES.md`
11. `docs/DECISIONS.md`

## Princípios inegociáveis

- segurança como requisito estrutural;
- validação server-side em toda entrada externa;
- tratamento seguro de erros (sem leak de stack/segredo);
- separação clara de camadas (UI, validação, dados, segurança);
- evolução incremental com checkpoint auditável.

## Observação de governança

Mudanças relevantes de segurança, autenticação, API pública, deploy, schema ou decisões arquiteturais devem ser registradas em `docs/DECISIONS.md` e no checkpoint vigente.
