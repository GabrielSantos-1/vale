# CONTEXT_MAP.md

## Objetivo

Este documento funciona como mapa de contexto do projeto e orienta leitura, governança e rastreabilidade do estado técnico atual.

---

## Ordem recomendada de leitura

1. `PROJECT_BRIEF.md`
2. `ARCHITECTURE.md`
3. `SECURITY_RULES.md`
4. `CODING_STANDARDS.md`
5. `UI_GUIDELINES.md`
6. `API_CONTRACTS.md`
7. `BACKLOG.md`
8. `TASKS.md`
9. `PROJECT_STATE.md`
10. `PROMPTING_RULES.md`
11. `DECISIONS.md`
12. `checkpoints/2026-03-31-deploy-recovery/00-README.md`

---

## Mapa de módulos com mudanças recentes (snapshot 2026-03-31)

### Público
- `app/(public)` e `components/marketing`
- foco recente: ajustes visuais, cards de planos e consistência pública

### Admin
- `app/admin` e componentes ligados ao painel
- foco recente: recuperação do acesso administrativo, correção de badge em planos e validação do CRUD

### Auth / Sessão / Proteção
- `lib/auth`, `app/api/auth`, `proxy.ts`
- foco recente: estabilização do acesso admin em produção

### Segurança e headers
- `lib/security`
- foco recente: CSP/headers para não quebrar o runtime do login e do admin

### Persistência / banco
- `prisma`, `lib/db`
- foco recente: troca de banco, migrations e validação do ambiente produtivo

### Documentação de estado
- `PROJECT_STATE.md`
- `TASKS.md`
- `DECISIONS.md`
- `checkpoints/2026-03-31-deploy-recovery/*`

---

## Diretriz de continuidade

O sistema já está funcional em produção.
As próximas mudanças devem priorizar:
1. limpeza/higiene;
2. hardening;
3. recuperação de senha/admin;
4. revisão de segurança e resíduos operacionais.

Mudanças fora dessa ordem precisam justificativa explícita.
