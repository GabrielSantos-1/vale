# BACKLOG.md

## Objetivo

Este documento define o backlog macro do projeto.

Ele organiza o desenvolvimento em sprints e ajuda a evitar desenvolvimento desordenado.

---

# Estrutura de desenvolvimento

O projeto evolui em fases.

Cada sprint tem objetivos claros.

---

# Sprint 0 — Fundação do projeto

## Objetivo

Criar base técnica segura e organizada.

## Entregas

- inicialização do projeto Next.js
- configuração TypeScript
- configuração Tailwind
- configuração ESLint
- configuração Prettier
- configuração Prisma
- conexão com PostgreSQL
- criação de .env.example
- estrutura inicial de pastas
- criação da pasta docs
- criação dos arquivos de governança
- configuração de testes (Vitest)
- configuração de testes E2E (Playwright)

## Critério de aceite

- projeto inicia sem erros
- lint funcionando
- TypeScript funcionando
- banco conectado
- estrutura clara

---

# Sprint 1 — Design System

## Objetivo

Criar base visual reutilizável.

## Entregas

- layout base
- Navbar
- Footer
- Mobile Tab Bar
- Button
- Card
- Badge
- Input
- Textarea
- Container
- Section
- Skeleton Loader
- tokens visuais

## Critério de aceite

- UI consistente
- componentes reutilizáveis
- layout funcional

---

# Sprint 2 — Home Page

## Objetivo

Construir página principal.

## Entregas

- Hero Section
- seção diferenciais técnicos
- seção planos
- grid de benefícios
- CTA cobertura
- preview status rede
- preview FAQ
- SEO metadata

## Critério de aceite

- responsividade
- boa performance
- design premium

---

# Sprint 3 — Páginas públicas

## Entregas

- página planos
- página cobertura
- página suporte
- página contato
- página status rede
- página sobre
- política privacidade
- termos uso

---

# Sprint 4 — Formulários e persistência

## Entregas

- formulário contato
- formulário lead
- consulta cobertura
- validação Zod
- persistência banco
- rate limit básico

---

# Sprint 5 — Autenticação admin

## Entregas

- login admin
- sessão cookie HttpOnly
- middleware auth
- logout
- autorização por role

---

# Sprint 6 — Painel administrativo

## Entregas

- CRUD planos
- CRUD cobertura
- CRUD FAQ
- CRUD status rede
- listagem leads
- auditoria básica

---

# Sprint 7 — Hardening e testes

## Entregas

- revisão segurança
- testes unitários
- testes integração
- testes E2E
- revisão performance
- revisão acessibilidade

---

# Regra importante

Sempre implementar uma sprint por vez.

Nunca pular direto para funcionalidades avançadas.