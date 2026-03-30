# TASKS.md

## Objetivo

Este documento registra o estado atual de execucao por sprint.
Ele deve refletir progresso real, sem substituir o roadmap macro de `BACKLOG.md`.

---

## Data de referencia

2026-03-30

---

## Sprint atual

Sprint 7 - Hardening e testes

---

## Status por sprint

## Sprint 0 - Fundacao do projeto

- [x] projeto Next.js criado
- [x] TypeScript habilitado
- [x] Tailwind configurado
- [x] ESLint configurado
- [x] Prettier configurado
- [x] Prisma configurado com PostgreSQL
- [x] estrutura inicial de pastas consolidada
- [x] docs de governanca criadas
- [x] Vitest e Playwright configurados

## Sprint 1 - Design System

- [x] layout base publico e admin estruturado
- [x] Navbar e Footer publicos implementados
- [x] Mobile Tab Bar em contexto mobile implementada
- [x] componentes base (`Button`, `Card`, `Badge`, `Input`, `Textarea`) em uso
- [x] tokens visuais e base de tema aplicados

## Sprint 2 - Home Page

- [x] Hero section premium implementada
- [x] secoes de valor e conversao na home implementadas
- [x] CTA de cobertura e previews de status/faq presentes
- [x] metadata SEO base aplicada
- [x] refinamento visual premium consolidado

## Sprint 3 - Paginas publicas

- [x] paginas publicas principais implementadas
- [x] padrao visual premium unificado entre paginas
- [x] shell publico consolidado (navbar, footer, fundo, tabbar)
- [x] modulo de atalhos no hero publico implementado
- [x] botao flutuante de WhatsApp integrado ao shell publico

## Sprint 4 - Formularios e persistencia

- [x] endpoints publicos principais implementados (`contact`, `lead`, `coverage-check`)
- [x] validacao server-side com Zod em uso
- [x] persistencia com Prisma em operacao
- [~] rate limit basico implementado e em revisao de hardening
- [~] revisao final de contratos/erros padronizados pendente

## Sprint 5 - Autenticacao admin

- [x] login admin implementado
- [x] sessao por cookie HttpOnly implementada
- [x] middleware/regras de autenticacao em uso
- [x] controle de autorizacao por role em rotas admin
- [~] revisao final de seguranca e auditoria de sessoes pendente

## Sprint 6 - Painel administrativo

- [x] base do painel admin implementada
- [x] dashboard e layout admin premium consolidados
- [x] modulos de gestao (leads, planos, cobertura, faq, status) ativos
- [x] Lote 1 concluido (tokens/componentes base de contraste)
- [x] Lote 2 concluido (paginas publicas: ortografia/microcopy/legibilidade)
- [x] Lote 3 concluido (admin: ortografia/consistencia/contraste)
- [ ] Lote 4 pendente (formularios, placeholders, labels, erros e estados vazios)

## Sprint 7 - Hardening e testes

- [~] revisao de seguranca aplicada por modulos (`lib/security`) e em consolidacao
- [x] baseline de lint e typecheck estabilizada no estado atual
- [ ] consolidar testes unitarios/integracao/e2e no baseline final
- [ ] revisar performance de imagens publicas e `next/image` (`sizes`, preload/prioridade)
- [ ] tratar estrategia de fonte para build em ambiente sem rede externa
- [ ] fechar revisao de responsividade final (publico e admin)

---

## Proximas tarefas objetivas (execucao imediata)

1. Fechar Lote 4 com auditoria de formularios e estados de feedback.
2. Executar validacao final por dominio (publico/admin, desktop/mobile).
3. Consolidar rodada de testes minima para regressao (unit/integration/e2e prioritarios).
4. Tratar resiliencia de build em ambiente com restricao de rede para fontes.
5. Congelar checkpoint tecnico com status de riscos e evidencias de validacao.

---

## Regra

Atualizar este documento ao final de cada checkpoint relevante.
