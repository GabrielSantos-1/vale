# TASKS.md

## Objetivo

Registrar o status de execução por sprint e as próximas tarefas reais do projeto.

---

## Data de referência

2026-04-01

---

## Sprint atual

Sprint 8 — Refino comercial/SEO on-page concluído + continuidade de hardening técnico

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
- [x] Hero principal implementada
- [x] seções de valor e conversão presentes
- [x] CTA de cobertura e previews de status/FAQ presentes
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
- [ ] recuperação de senha/admin ainda pendente de fechamento final

## Sprint 6 — Painel administrativo
- [x] base do painel admin implementada
- [x] dashboard e layout admin ativos
- [x] gestão de planos/cobertura/FAQ/status/leads ativa
- [x] bug do badge comercial corrigido no admin
- [ ] revisão final de estados vazios/form feedback ainda pode ser aprofundada

## Sprint 7 — Hardening e pós-deploy
- [x] novo banco Supabase conectado
- [x] migrations aplicadas com sucesso
- [x] produção validada com `/api/plans`
- [x] env principal da Vercel validada
- [x] CSP ajustada para destravar login/admin
- [~] revisão fina da CSP pendente
- [ ] limpeza de arquivos temporários/sensíveis pendente
- [ ] revisão de `.gitignore` pendente
- [ ] revisão de scripts auxiliares pendente
- [ ] rodada final de hardening de auth/headers/rate-limit pendente

## Sprint 8 — Refino comercial e SEO on-page (páginas públicas)
- [x] Home refinada (hero, blocos institucionais, planos, diferenciais, consistência verbal)
- [x] Página Planos refinada para clareza comercial e decisão
- [x] Página Cobertura refinada com foco em consulta de disponibilidade e próximos passos
- [x] Página Status refinada para transparência operacional e comunicação útil
- [x] Página Contato refinada para atendimento/suporte com linguagem objetiva
- [x] Página Sobre refinada com posicionamento institucional de provedor regional
- [x] Ajuste textual final no rodapé público
- [x] Consolidação documental da versão 1.0.8
- [x] Sem alterações funcionais em API/DB/auth/rotas/lógica

---

## Próximas tarefas objetivas (execução imediata)

1. finalizar hardening técnico pendente (CSP fina, headers e rate-limit);
2. concluir revisão de higiene operacional do repositório;
3. validar regressão mínima automatizada após fechamento do hardening;
4. consolidar checkpoint pós-hardening para nova baseline operacional.

---

## Regra

Nenhuma etapa nova deve:

- quebrar o banco em produção;
- quebrar o login admin;
- quebrar o deploy atual;
- misturar hardening sensível com refatoração ampla;
- alterar múltiplas camadas críticas sem checkpoint intermediário.
