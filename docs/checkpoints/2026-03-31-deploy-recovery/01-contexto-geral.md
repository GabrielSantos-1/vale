# Contexto Geral

## Projeto
**Verde Vale 2**

## Stack principal
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Auth.js / NextAuth
- Supabase como Postgres hospedado
- Vercel para deploy

## Problema original
O projeto estava com ambiente inconsistente:
- banco anterior problemático;
- deploy parcial/inconsistente;
- login admin falhando;
- divergência entre ambiente local e produção;
- dúvidas sobre env, banco, sessão e renderização.

## Estratégia executada
1. abandonar a base anterior inconsistente;
2. criar e conectar um novo banco Supabase;
3. alinhar schema com migrations;
4. validar dados principais;
5. recuperar acesso admin;
6. investigar sessão em produção;
7. corrigir CSP que quebrava o runtime do login;
8. fazer redeploy e validar acesso administrativo.

## Resultado
O ambiente de produção voltou a operar com:
- banco novo funcional;
- admin acessível;
- API de planos respondendo corretamente;
- deploy coerente com a nova base.
