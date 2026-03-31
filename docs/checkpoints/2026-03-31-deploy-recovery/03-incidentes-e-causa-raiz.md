# Incidentes e Causa Raiz

## Incidente 1 — Banco anterior inconsistente
### Sintoma
Ambiente instável e pouco confiável.

### Causa raiz
Base anterior inconsistente.

### Ação
Criação de novo banco Supabase e migração do projeto para essa base.

---

## Incidente 2 — Prisma falhando por `DIRECT_URL`
### Sintoma
Comandos do Prisma falhando no ambiente local.

### Causa raiz
Variável `DIRECT_URL` ausente.

### Ação
Mapeamento correto de `DATABASE_URL` e `DIRECT_URL`.

---

## Incidente 3 — Login admin falhando
### Sintoma
Login não passava em parte da investigação.

### Causas encontradas ao longo do processo
- role incorreta em momento anterior;
- hash/senha inconsistentes durante parte dos testes;
- validação em domínio preview em vez do domínio final;
- principalmente: CSP rígida bloqueando o runtime necessário ao login/admin em produção.

### Ação
Correção de role, hash, validação no domínio correto e ajuste de CSP.

---

## Incidente 4 — `/api/auth/session` retornando `{}`
### Sintoma
Sessão vazia e loop para login.

### Causa raiz relevante
Runtime prejudicado pela CSP, impedindo o fluxo correto do frontend/auth em produção.

### Ação
Investigação via Console/Network, correção de CSP e redeploy.

---

## Incidente 5 — Correções não refletidas em produção em alguns momentos
### Sintoma
Deploy sem refletir a correção esperada.

### Causa raiz
Mudanças não commitadas/staged corretamente ou redeploy ainda não refletido.

### Ação
Revisão de `git status`, staged files e controle de publish.
