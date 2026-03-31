# SECURITY_HARDENING_PLAN.md

## Objetivo

Definir o plano de endurecimento pós-deploy do Verde Vale 2 sem quebrar o ambiente funcional atual.

---

## Premissas obrigatórias

Não quebrar:
- banco novo Supabase;
- deploy atual na Vercel;
- login admin;
- `/api/plans`;
- CRUD de planos/admin.

---

## Ordem segura de implementação

### Fase 1 — Higiene operacional
- revisar `.gitignore`;
- remover scripts temporários;
- remover dumps e resíduos locais;
- revisar arquivos sensíveis;
- validar que `.env` e artefatos locais não estão versionados.

### Fase 2 — Segurança de headers e CSP
- revisar `lib/security/headers.ts`;
- identificar diretivas afrouxadas temporariamente;
- endurecer progressivamente com validação por ambiente;
- buscar caminho futuro com nonce/hash se necessário.

### Fase 3 — Auth/session/admin
- revisar fluxo de sessão;
- revisar `proxy.ts`;
- revisar callbacks de auth;
- validar persistência de sessão e role.

### Fase 4 — Rotas e abuso
- revisar rate limiting;
- revisar login, contato, lead e cobertura;
- revisar tratamento de erro;
- revisar logs sensíveis.

### Fase 5 — Recuperação de acesso
- implementar recuperação segura de senha/admin;
- proteger contra enumeração e abuso;
- usar expiração, token temporário e invalidação.

---

## Critérios de aceite

1. Nenhum secret ou artefato operacional indevido no repositório.
2. Login admin continua funcional em produção.
3. Banco novo e deploy permanecem intactos.
4. CSP mais controlada sem quebrar runtime.
5. Fluxo de recuperação de acesso definido com segurança.
