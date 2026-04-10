# ARCHITECTURE.md

## Objetivo

Descrever a arquitetura publica de alto nivel do projeto Verde Vale Connect.

---

## Visao geral

Arquitetura full-stack com Next.js App Router e separacao clara entre:

- interface (UI)
- validacao
- autenticacao/autorizacao
- regras de negocio
- persistencia
- seguranca e observabilidade

A evolucao e incremental, com foco em manutencao e baixo acoplamento.

---

## Stack oficial

### Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React

### Backend

- Next.js Route Handlers
- Node.js runtime
- TypeScript

### Dados

- PostgreSQL
- Prisma ORM

### Validacao e auth

- Zod
- Auth.js com sessao baseada em cookie HttpOnly

### Testes

- Vitest
- Playwright

---

## Modulos principais

- `app/`: rotas e superficies (publico, admin, cliente, APIs)
- `components/`: componentes reutilizaveis por dominio
- `lib/`: autenticacao, seguranca, validacoes, utilitarios e acesso a dados
- `prisma/`: schema, migrations e seed
- `tests/`: testes unitarios, integracao e e2e

---

## Diretrizes arquiteturais

1. Server Components por padrao.
2. Validacao server-side obrigatoria para entrada externa.
3. Regras de negocio fora de camada visual.
4. Separacao de fronteira entre admin e cliente.
5. Mudancas estruturais devem preservar contratos e compatibilidade.