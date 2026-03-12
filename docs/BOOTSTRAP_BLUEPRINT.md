 BOOTSTRAP_BLUEPRINT.md

## Objetivo

Este documento define o blueprint de inicialização do projeto Verde Vale 2.0.

Ele deve ser usado por agentes de código como instrução principal para construir a base do sistema sem improvisar arquitetura, sem quebrar segurança e sem sair do escopo definido.

Este blueprint cobre a fundação do projeto, equivalente à Sprint 0 e parte da Sprint 1 estrutural.

---

# Nome do projeto

Verde Vale 2.0

---

# Missão do agente

Inicializar um projeto full-stack moderno para um provedor de internet fibra óptica com estética Cyber-Professional / SaaS High-End, seguindo rigorosamente:

- AGENTS.md
- docs/CONTEXT_MAP.md
- docs/PROJECT_BRIEF.md
- docs/ARCHITECTURE.md
- docs/SECURITY_RULES.md
- docs/CODING_STANDARDS.md
- docs/BACKLOG.md
- docs/TASKS.md
- docs/API_CONTRACTS.md
- docs/UI_GUIDELINES.md
- docs/PROMPTING_RULES.md
- docs/DECISIONS.md

O agente não deve ignorar nenhum desses documentos.

---

# Stack obrigatória

## Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React

## Backend

- Next.js Route Handlers
- TypeScript

## Banco de dados

- PostgreSQL

## ORM

- Prisma

## Validação

- Zod

## Autenticação

- Auth.js com sessão baseada em cookie HttpOnly

## Testes

- Vitest
- Playwright

## Qualidade

- ESLint
- Prettier
- TypeScript strict mode

---

# Regras obrigatórias

## Segurança

- nunca usar dangerouslySetInnerHTML
- nunca usar localStorage para token
- nunca concatenar SQL manualmente
- toda entrada deve ser validada no servidor com Zod
- toda rota admin deve exigir autenticação e autorização
- não expor stack trace ao cliente
- aplicar headers de segurança
- preparar base para rate limiting

## Arquitetura

- usar Server Components por padrão
- usar "use client" apenas quando necessário
- separar UI, domínio, validação e persistência
- evitar arquivos monolíticos
- evitar abstrações desnecessárias

## UI

- mobile-first
- estética cyber-minimalist premium
- dark mode profundo
- accent verde elétrico
- tab bar inferior somente em mobile
- navbar tradicional em desktop
- priorizar SVG e assets leves

---

# Escopo desta inicialização

O agente deve construir apenas a base do projeto.

Não deve implementar ainda todas as páginas completas e refinadas do MVP.

O foco agora é:

1. fundação do projeto
2. estrutura de pastas
3. configuração de ferramentas
4. design tokens iniciais
5. base de autenticação
6. base de banco
7. validações iniciais
8. componentes base
9. esqueleto de rotas principais
10. documentação operacional mínima coerente com o projeto

---

# Ordem exata de execução

## Etapa 1 — Inicialização do projeto

Criar projeto com Next.js + TypeScript + App Router.

Configurar:

- Tailwind CSS
- ESLint
- Prettier
- TypeScript strict mode

Garantir que o projeto sobe sem erro.

---

## Etapa 2 — Dependências

Instalar e configurar dependências necessárias para o escopo atual.

### Dependências esperadas

- next
- react
- react-dom
- typescript
- tailwindcss
- framer-motion
- lucide-react
- zod
- prisma
- @prisma/client
- next-auth ou Auth.js compatível
- clsx
- class-variance-authority
- tailwind-merge

### Dev dependencies esperadas

- eslint
- prettier
- vitest
- playwright
- @types/node
- @types/react
- @types/react-dom

Não adicionar dependências extras sem necessidade real.

---

## Etapa 3 — Estrutura de pastas

Criar a estrutura abaixo:

```text
project-root/
  app/
    (public)/
      page.tsx
      planos/page.tsx
      cobertura/page.tsx
      suporte/page.tsx
      contato/page.tsx
      status/page.tsx
      sobre/page.tsx
      politica-de-privacidade/page.tsx
      termos/page.tsx
    admin/
      login/page.tsx
      dashboard/page.tsx
      leads/page.tsx
      planos/page.tsx
      cobertura/page.tsx
      faq/page.tsx
      status/page.tsx
    api/
      contact/route.ts
      lead/route.ts
      coverage-check/route.ts
      auth/[...nextauth]/route.ts
      admin/
        plans/route.ts
        coverage/route.ts
        faq/route.ts
        status/route.ts
        leads/route.ts
    layout.tsx
    globals.css
    sitemap.ts
    robots.ts
    not-found.tsx

  components/
    ui/
      button.tsx
      card.tsx
      badge.tsx
      input.tsx
      textarea.tsx
      container.tsx
      section.tsx
      skeleton.tsx
    layout/
      navbar.tsx
      mobile-tabbar.tsx
      footer.tsx
      page-shell.tsx
    marketing/
      hero.tsx
      features-grid.tsx
      bento-grid.tsx
      plan-card.tsx
      status-banner.tsx
      faq-preview.tsx
      coverage-form.tsx
    forms/
      contact-form.tsx
      lead-form.tsx
      login-form.tsx
    admin/
      leads-table.tsx
      plans-table.tsx
      coverage-table.tsx
      faq-table.tsx
      status-table.tsx

  lib/
    auth/
      auth-options.ts
      session.ts
      roles.ts
    db/
      prisma.ts
      queries/
        plans.ts
        leads.ts
        coverage.ts
        faq.ts
        status.ts
    validations/
      contact.ts
      lead.ts
      coverage.ts
      auth.ts
      plan.ts
      faq.ts
      status.ts
    security/
      headers.ts
      csrf.ts
      rate-limit.ts
      sanitize.ts
      audit.ts
    constants/
      site.ts
      metadata.ts
      theme.ts
    utils/
      cn.ts
      format.ts
      logger.ts
      response.ts
    types/
      api.ts
      auth.ts
      domain.ts

  prisma/
    schema.prisma

  public/
    images/
    icons/
    logos/
    favicons/

  tests/
    unit/
    integration/
    e2e/

Se algum arquivo ficar como placeholder, ele deve conter estrutura mínima válida e comentário curto explicando finalidade.

Etapa 4 — Configuração global do projeto

Criar e ajustar:

package.json

tsconfig.json

next.config.ts

.env.example

middleware.ts

A configuração deve refletir:

strict mode ativo

aliases se necessário

base pronta para auth

base pronta para headers de segurança

base pronta para Prisma

Etapa 5 — Tema e identidade visual base

Definir em lib/constants/theme.ts ou equivalente:

background principal: #080A0F

surface principal: #121721

accent: #00FF41

texto principal claro

texto secundário suave

borda translúcida

radius padrão

sombras suaves

espaçamentos principais

Criar base em globals.css para:

CSS variables do tema

reset consistente

fundo global

tipografia base

utilitários mínimos coerentes com Tailwind

Etapa 6 — Layout global

Implementar:

app/layout.tsx

components/layout/navbar.tsx

components/layout/mobile-tabbar.tsx

components/layout/footer.tsx

components/layout/page-shell.tsx

Regras

mobile-first

tab bar aparece apenas em viewport mobile

navbar aparece em desktop

layout precisa ser limpo, técnico e reutilizável

não exagerar em efeitos visuais ainda

Etapa 7 — Componentes base de UI

Implementar componentes reutilizáveis mínimos e funcionais:

Button

Card

Badge

Input

Textarea

Container

Section

Skeleton

Regras

tipados em TypeScript

reutilizáveis

acessíveis

sem lógica excessiva

estilização coerente com UI_GUIDELINES.md

Etapa 8 — Páginas placeholder estruturadas

Criar páginas públicas e administrativas com estrutura mínima válida.

Cada página deve conter:

título coerente

metadata básica quando aplicável

uso do PageShell

layout consistente

placeholder elegante, não quebrado

Páginas ainda não precisam estar visualmente finais.

Elas precisam existir e respeitar a arquitetura.

Etapa 9 — Prisma e banco de dados

Criar prisma/schema.prisma com entidades iniciais:

AdminUser

id

name

email

passwordHash

role

isActive

createdAt

updatedAt

Plan

id

name

slug

downloadMbps

uploadMbps

latencyTarget

priceCents

featured

benefitsJson

badge

isActive

createdAt

updatedAt

CoverageArea

id

city

district

cepStart

cepEnd

isAvailable

notes

createdAt

updatedAt

Lead

id

name

email

phone

city

district

cep

message

source

status

createdAt

updatedAt

ContactMessage

id

name

email

phone

subject

message

createdAt

FAQ

id

question

answer

category

order

isPublished

createdAt

updatedAt

NetworkStatus

id

title

slug

status

description

startedAt

resolvedAt

isVisible

createdAt

updatedAt

AuditLog

id

actorUserId

action

entity

entityId

metadataJson

createdAt

Regras

usar tipos adequados

preparar relacionamentos mínimos necessários

não exagerar em complexidade

refletir escopo do projeto

Etapa 10 — Prisma client e camada db

Criar:

lib/db/prisma.ts

arquivos em lib/db/queries/

Regras

centralizar acesso ao Prisma

não acessar banco diretamente em componentes

preparar consultas organizadas por domínio

Etapa 11 — Validações Zod

Criar schemas iniciais para:

contact

lead

coverage

auth

plan

faq

status

Regras

schemas devem validar tipo, tamanho e formato

validação server-side obrigatória

mensagens de erro podem ser objetivas

preparar reuso entre frontend e backend quando fizer sentido

Etapa 12 — API base

Implementar rotas iniciais:

POST /api/contact

POST /api/lead

POST /api/coverage-check

Criar placeholders estruturados também para rotas admin.

Regras

validar input com Zod

retornar padrão consistente

não expor erro interno

usar helper de resposta se criado

adicionar TODOs controlados apenas quando necessário

Padrão de resposta
Sucesso
{
  "success": true,
  "data": {}
}
Erro
{
  "success": false,
  "error": "error_message"
}
Etapa 13 — Autenticação base

Preparar Auth.js em:

app/api/auth/[...nextauth]/route.ts

lib/auth/auth-options.ts

lib/auth/session.ts

lib/auth/roles.ts

Nesta fase

deixar base pronta

criar estrutura coerente

preparar login admin

ainda pode usar implementação mínima até integração completa

Regras

cookie HttpOnly

nada em localStorage

estrutura pronta para roles

Etapa 14 — Segurança base

Criar módulos iniciais:

lib/security/headers.ts

lib/security/csrf.ts

lib/security/rate-limit.ts

lib/security/sanitize.ts

lib/security/audit.ts

Implementar pelo menos:

headers de segurança base

estrutura pronta para auditoria

base para rate limiting

Se alguma parte ficar parcial, deixar claramente estruturada para evolução sem gambiarra.

Etapa 15 — Testes base

Configurar:

Vitest

Playwright

Criar pelo menos:

1 teste unitário básico

1 teste de integração básico

1 estrutura inicial de E2E

Mesmo simples, a base precisa existir.

Etapa 16 — Qualidade e acabamento mínimo

Garantir:

lint funcionando

typecheck funcionando

build coerente

imports organizados

arquivos sem código morto óbvio

placeholders elegantes

Regras específicas para implementação
Não fazer

não implementar visual final completo da home ainda

não criar animações exageradas

não inventar CMS complexo

não criar área do cliente

não criar billing

não criar integrações externas complexas

não introduzir dependências pesadas sem necessidade

não usar mocks inseguros como solução final escondida

Fazer

preparar base sólida

manter código limpo

manter documentação coerente

respeitar escopo definido

deixar projeto pronto para Sprint 1 e Sprint 2

Resultado esperado ao final

Ao concluir este blueprint, o projeto deve ter:

fundação full-stack funcional

estrutura de pastas correta

tema base aplicado

layout global funcionando

componentes base criados

páginas placeholder criadas

Prisma schema inicial criado

validações iniciais criadas

APIs base criadas

auth base preparada

segurança base preparada

testes base configurados

Critérios de aceite

Considerar o bootstrap concluído somente se:

projeto sobe localmente sem erro

build não quebra

lint não quebra

estrutura de arquivos segue arquitetura definida

páginas principais existem

APIs base existem

Prisma schema existe

validações existem

base de auth existe

base de segurança existe

testes base existem

nada viola SECURITY_RULES.md

Instrução final ao agente

Implemente este blueprint em etapas pequenas, mas conclua toda a fundação definida neste documento.

Se houver dúvida:

prefira segurança

prefira simplicidade

prefira legibilidade

prefira consistência com a documentação

Não improvise arquitetura fora do escopo.