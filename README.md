# Verde Vale Connect

Aplicacao web full-stack para operacao comercial e suporte de um provedor de internet, com foco em conversao no site publico, operacao interna e autosservico do cliente.

## Visao geral

O sistema foi estruturado em tres superficies com responsabilidades separadas:

- site publico para apresentacao de servicos e captura de interesse
- painel administrativo para operacao e acompanhamento interno
- central do cliente para autenticacao, perfil e fluxos de conta

## Funcionalidades principais

- navegacao publica institucional/comercial com foco em UX responsiva
- autenticacao com sessao por cookie HttpOnly para contextos admin e cliente
- endpoints server-side com validacao Zod e contratos tipados
- fluxos de conta do cliente (cadastro, login, perfil e senha)
- base de dados relacional com Prisma + PostgreSQL

## Arquitetura

Arquitetura orientada a separacao de camadas:

- interface: `app/` e `components/`
- aplicacao e dominio: `lib/` (auth, seguranca, validacao e regras)
- persistencia: `prisma/` (schema, migrations, seed)
- qualidade: `tests/` (unitario/integracao/e2e) e workflows de CI

Documentacao tecnica de arquitetura: `docs/ARCHITECTURE.md`.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Prisma ORM + PostgreSQL
- Auth.js
- Zod
- Tailwind CSS + Framer Motion
- Vitest + Playwright

## Seguranca

Controles implementados por padrao:

- validacao de entrada server-side em mutacoes e endpoints sensiveis
- protecao CSRF nas mutacoes administrativas baseadas em cookie
- rate limiting em rotas criticas
- separacao de contexto admin/cliente
- respostas de erro seguras sem vazamento de detalhes internos
- higiene de segredos com variaveis de ambiente e pipeline de secret scan

Regras e politica detalhadas:

- `docs/SECURITY_RULES.md`
- `docs/OPEN_SOURCE_SECURITY_CHECKLIST.md`
- `docs/PUBLIC_DOCS_POLICY.md`
- `docs/GITHUB_PUBLICATION_RUNBOOK.md`

## Estrutura do projeto

```text
app/          rotas, paginas e route handlers
components/   UI reutilizavel e blocos por dominio
lib/          autenticacao, seguranca, validacao e utilitarios
prisma/       schema, migrations e seed
tests/        testes unitarios, integracao e e2e
.github/      workflows de CI, e2e, codeql e secret scan
docs/         documentacao publica do projeto
```

## Como executar localmente

1. Instalar dependencias:
   - `npm ci`
2. Configurar ambiente:
   - copiar `.env.example` para `.env`
   - preencher variaveis obrigatorias
3. Preparar Prisma:
   - `npx prisma generate`
   - `npx prisma migrate deploy` (ou fluxo de migracao local)
4. Rodar aplicacao:
   - `npm run dev`

## Qualidade e testes

- lint: `npm run lint`
- typecheck: `npm run typecheck`
- testes unitarios/integracao: `npm test`
- e2e: `npm run e2e`
- build de producao: `npm run build`

## CI/CD

O repositorio possui automacoes em `.github/workflows` para:

- CI Gate (lint, typecheck e build)
- E2E Playwright
- varredura de segredos
- analise estica com CodeQL (quando habilitada no repositório)

## Documentacao publica

Trilha recomendada:

- `docs/README_PUBLIC.md`
- `docs/PROJECT_BRIEF.md`
- `docs/ARCHITECTURE.md`
- `docs/API_CONTRACTS.md`
- `docs/SECURITY_RULES.md`
- `docs/CODING_STANDARDS.md`
- `docs/UI_GUIDELINES.md`
- `docs/OPEN_SOURCE_SECURITY_CHECKLIST.md`
- `docs/PUBLIC_DOCS_POLICY.md`

## Limitacoes atuais e roadmap

- evolucao continua de hardening e governanca para operacao publica
- monitoramento constante de dependencias e vulnerabilidades reportadas
- refinamentos incrementais de testes e observabilidade

## Licenca

Este repositorio utiliza a licenca definida no `package.json` (ISC), salvo alteracao posterior.
