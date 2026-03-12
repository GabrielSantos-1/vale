# ARCHITECTURE.md

## Visão geral da arquitetura

Este projeto utiliza arquitetura full-stack baseada em Next.js com separação clara entre:

- UI (interface)
- validação
- domínio
- persistência
- segurança

A arquitetura deve permanecer modular e previsível para permitir evolução futura sem reescrita completa.

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

### Banco de dados

- PostgreSQL

### ORM

- Prisma

### Validação

- Zod

### Autenticação

- Auth.js com sessão baseada em cookie HttpOnly

### Testes

- Vitest
- Playwright

---

## Estrutura de diretórios

```text
project-root/

app/
components/
lib/
prisma/
public/
tests/
docs/

AGENTS.md
README.md
Estrutura detalhada
app/

Responsável por rotas e páginas.

app/
  (public)/
  admin/
  api/
  layout.tsx
  globals.css
  sitemap.ts
(public)

Contém páginas públicas do site.

Exemplos:

home

planos

cobertura

suporte

contato

status

admin

Contém interface administrativa.

Exemplos:

dashboard

leads

planos

cobertura

faq

status

Todas as rotas admin devem exigir autenticação.

api

Contém rotas backend.

Exemplos:

api/
  contact/
  coverage-check/
  lead/
  admin/

Rotas administrativas devem verificar autenticação e autorização.

components/

Contém componentes reutilizáveis.

Divididos em:

components/
  ui/
  marketing/
  layout/
  forms/
  admin/
ui

Componentes base reutilizáveis.

Exemplos:

button

card

badge

input

textarea

skeleton

modal

marketing

Componentes usados nas páginas públicas.

Exemplos:

hero

features-grid

plan-card

bento-grid

status-banner

layout

Componentes estruturais.

Exemplos:

navbar

footer

page-shell

mobile-tabbar

forms

Componentes de formulário.

Exemplos:

contact-form

lead-form

login-form

admin

Componentes específicos da área administrativa.

Exemplos:

leads-table

plans-table

coverage-table

lib/

Contém lógica compartilhada.

lib/
  auth/
  db/
  validations/
  security/
  constants/
  utils/
  types/
auth

Responsável por autenticação.

Exemplos:

auth-options

session

roles

db

Responsável por acesso ao banco.

db/
  prisma.ts
  queries/
validations

Schemas Zod.

Cada entrada de dados deve possuir schema.

Exemplos:

contact

coverage

lead

auth

plan

faq

security

Módulos de segurança.

Exemplos:

headers

csrf

rate-limit

sanitize

audit

constants

Valores fixos do projeto.

Exemplos:

theme

metadata

site config

utils

Funções auxiliares.

Exemplos:

logger

formatters

helpers

types

Tipos TypeScript compartilhados.

prisma/

Contém schema e migrations do banco.

prisma/
  schema.prisma
  migrations/
public/

Arquivos públicos.

public/
  images/
  icons/
  logos/
  favicons/
tests/

Testes do projeto.

tests/
  unit/
  integration/
  e2e/
Regras de arquitetura

Separar UI de lógica de negócio.

Não colocar acesso a banco dentro de componentes.

Não colocar validação apenas no frontend.

Reutilizar módulos existentes antes de criar novos.

Não criar dependências cíclicas.

Não criar arquivos gigantes.

Preferir composição a herança.

Evitar abstração prematura.

Server Components

Por padrão:

usar Server Components.

Adicionar "use client" apenas quando necessário.

Exemplos de casos client:

interatividade

formulários dinâmicos

animações complexas

Responsividade

O projeto é mobile-first.

Breakpoints devem ser planejados para:

mobile pequeno

mobile grande

tablet

desktop

widescreen

Escalabilidade

A arquitetura deve permitir expansão futura para:

área do cliente

billing

integração com sistemas ISP

analytics

observabilidade

Sem reescrever a base.

Regra final

Se houver dúvida arquitetural:

preferir

simplicidade

legibilidade

modularidade