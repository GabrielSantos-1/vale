# TASKS.md

## Objetivo

Este documento registra o estado atual de execução por sprint e as próximas tarefas reais do projeto.

---

## Data de referência

2026-03-31

---

## Sprint atual

Sprint 7 — Hardening, estabilização pós-deploy e higiene de segurança

---

## Status por sprint

## Sprint 0 — Fundação do projeto
- [x] projeto Next.js criado
- [x] TypeScript habilitado
- [x] Tailwind configurado
- [x] ESLint configurado
- [x] Prettier configurado
- [x] Prisma configurado com PostgreSQL
- [x] estrutura inicial de pastas consolidada
- [x] docs de governança criadas
- [x] Vitest e Playwright configurados

## Sprint 1 — Design System
- [x] layout base público e admin estruturado
- [x] Navbar e Footer públicos implementados
- [x] Mobile Tab Bar implementada
- [x] componentes base em uso
- [x] tokens visuais aplicados

## Sprint 2 — Home Page
- [x] Hero premium implementada
- [x] seções de valor e conversão presentes
- [x] CTA de cobertura e previews de status/faq presentes
- [x] metadata SEO base aplicada

## Sprint 3 — Páginas públicas
- [x] páginas públicas principais implementadas
- [x] shell público consolidado
- [x] módulo de atalhos no hero implementado
- [x] botão flutuante de WhatsApp integrado

## Sprint 4 — Formulários e persistência
- [x] endpoints públicos principais implementados
- [x] validação server-side com Zod em uso
- [x] persistência com Prisma em operação
- [~] hardening final de rate limit pendente
- [~] revisão final de contratos/erros padronizados pendente

## Sprint 5 — Autenticação admin
- [x] login admin implementado
- [x] sessão por cookie HttpOnly implementada
- [x] controle de autorização por role em rotas admin
- [x] acesso admin recuperado em produção
- [x] produção validada com domínio final correto
- [~] revisão final de segurança da sessão pendente
- [ ] recuperação de senha/admin ainda não implementada

## Sprint 6 — Painel administrativo
- [x] base do painel admin implementada
- [x] dashboard e layout admin ativos
- [x] gestão de planos/cobertura/faq/status/leads ativa
- [x] cards de planos refinados
- [x] bug do badge comercial corrigido no admin
- [ ] revisão final de estados vazios/form feedback ainda pode ser aprofundada

## Sprint 7 — Hardening e pós-deploy
- [x] novo banco Supabase conectado
- [x] migrations aplicadas com sucesso
- [x] produção validada com `/api/plans`
- [x] env principal da Vercel validada
- [x] CSP corrigida o suficiente para destravar login/admin
- [~] revisão fina da CSP pendente
- [ ] limpeza de arquivos temporários/sensíveis pendente
- [ ] revisão de `.gitignore` pendente
- [ ] revisão de scripts auxiliares pendente
- [ ] implementação de recuperação de senha/admin pendente
- [ ] rodada final de hardening de auth/headers/rate-limit pendente
- [ ] consolidar testes mínimos pós-estabilização

---

## Próximas tarefas objetivas (execução imediata)

1. Limpar arquivos temporários, artefatos e scripts auxiliares sem quebrar o projeto.
2. Revisar `.gitignore` e garantir que dumps, hashes temporários e resíduos operacionais não entrem no Git.
3. Revisar `lib/security/headers.ts` para endurecimento progressivo da CSP sem quebrar login/admin.
4. Revisar fluxo de autenticação/sessão e proteção admin com foco em estabilidade pós-deploy.
5. Implementar fluxo seguro de recuperação de senha/admin.
6. Revisar secrets, arquivos sensíveis e higiene operacional do repositório.
7. Consolidar checkpoint final pós-hardening.

---

## Regra

Nenhuma etapa nova deve:
- quebrar o banco novo;
- quebrar o deploy da Vercel;
- quebrar o login admin;
- misturar limpeza com refatoração ampla;
- alterar múltiplas camadas sensíveis ao mesmo tempo.
