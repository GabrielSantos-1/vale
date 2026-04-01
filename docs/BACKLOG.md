# BACKLOG.md

## Objetivo

Definir o backlog macro por fase/sprint, mantendo a evolução em ordem segura e auditável.

---

## Estrutura de desenvolvimento

O projeto evolui por sprints com escopo explícito, validação incremental e checkpoints datados.

---

## Sprint 0 — Fundação do projeto

### Objetivo
Criar base técnica segura e organizada.

### Entregas
- inicialização Next.js + TypeScript + Tailwind
- setup de lint/format
- setup Prisma + PostgreSQL
- estrutura inicial de pastas
- documentação de governança
- setup Vitest + Playwright

---

## Sprint 1 — Design System

### Objetivo
Criar base visual reutilizável para público e admin.

### Entregas
- layout base
- Navbar, Footer e Mobile Tab Bar
- componentes core de UI (Button/Card/Badge/Input/Textarea/Container/Section)
- tokens visuais

---

## Sprint 2 — Home Page

### Objetivo
Construir página principal com foco institucional e conversão.

### Entregas
- hero principal
- blocos de valor
- seção de planos
- CTA de cobertura
- preview de status e FAQ
- metadata SEO base

---

## Sprint 3 — Páginas públicas

### Entregas
- planos
- cobertura
- suporte
- contato
- status da rede
- sobre
- política de privacidade
- termos de uso

---

## Sprint 4 — Formulários e persistência

### Entregas
- contato
- leads
- consulta de cobertura
- validação Zod
- persistência com Prisma
- rate limit básico

---

## Sprint 5 — Autenticação admin

### Entregas
- login admin
- sessão por cookie HttpOnly
- middleware de autenticação
- controle de autorização por role

---

## Sprint 6 — Painel administrativo

### Entregas
- CRUD planos
- CRUD cobertura
- CRUD FAQ
- CRUD status
- gestão de leads
- auditoria básica

---

## Sprint 7 — Hardening e estabilização pós-deploy

### Entregas
- recuperação e estabilização de ambiente de produção
- alinhamento de banco/migrations com produção
- validação operacional de endpoints críticos
- ajustes iniciais de CSP para liberar runtime/admin

### Pendências abertas
- hardening final de CSP/headers/rate-limit
- higiene de repositório e artefatos temporários
- revisão final de segurança operacional

---

## Sprint 8 — Refino comercial + SEO on-page (concluída)

### Objetivo
Elevar percepção comercial/institucional das páginas públicas sem alteração funcional.

### Entregas
- refino de copy na Home
- refino de copy nas páginas Planos, Cobertura, Status, Contato e Sobre
- uniformização verbal de CTAs e microcopy
- reforço semântico para SEO on-page com linguagem de serviço local
- ajuste textual final no rodapé público
- consolidação documental da versão 1.0.8

### Regra aplicada
- sem mudanças em API, banco, autenticação, rotas, contratos ou comportamento funcional

---

## Próxima fase técnica (Sprint 9 proposta)

### Objetivo
Fechar hardening pendente com baixo risco de regressão.

### Entregas alvo
- revisão fina de CSP e headers de segurança
- validação final de rate-limit em rotas sensíveis
- revisão de higiene operacional (`.gitignore`, scripts auxiliares, resíduos)
- checklist de regressão pós-hardening

---

## Regra importante

Sempre evoluir por sprint, com checkpoint técnico ao final de cada lote relevante.
