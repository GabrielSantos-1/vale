# DECISIONS.md

## Objetivo

Registrar decisões arquiteturais e operacionais relevantes com histórico auditável.

---

## Decisão 001 — Stack oficial

Next.js + TypeScript + Tailwind + PostgreSQL + Prisma.

**Motivo:** equilíbrio entre produtividade, segurança e escalabilidade.

---

## Decisão 002 — Autenticação por cookie HttpOnly

Sessão administrativa baseada em cookie HttpOnly.

**Motivo:** reduzir superfície de ataque de XSS sobre credenciais.

---

## Decisão 003 — Validação com Zod

Validação de entrada padronizada no servidor com schemas Zod.

**Motivo:** tipagem forte e contratos consistentes.

---

## Decisão 004 — Arquitetura modular

Separação entre UI, aplicação, segurança e persistência.

**Motivo:** evolução incremental com menor acoplamento e melhor manutenção.

---

## Decisão 005 — Política de checkpoint datado

Registrar checkpoints técnicos datados para continuidade e rastreabilidade.

**Motivo:** reduzir regressões e melhorar governança.

---

## Decisão 006 — Abandono do banco anterior inconsistente

O banco anterior foi considerado inconsistente e substituído por novo projeto Supabase.

**Motivo:** recuperar previsibilidade operacional e alinhamento com produção.

---

## Decisão 007 — Validação final de auth no domínio canônico

A validação final de autenticação deve ser feita no domínio principal configurado em `NEXTAUTH_URL`, e não em preview.

**Motivo:** evitar falso diagnóstico por divergência de domínio/cookie/sessão.

---

## Decisão 008 — Fase pós-recovery prioriza hardening

Após recuperação do deploy/admin, priorizar limpeza e endurecimento antes de expansão funcional ampla.

**Motivo:** reduzir risco estrutural e consolidar base segura.

---

## Decisão 009 — Posicionamento verbal oficial (1.0.8)

Adotar posicionamento verbal público:

**“Provedor regional com identidade premium, operação transparente e atendimento próximo.”**

**Motivo:** alinhar comunicação institucional/comercial em Home e páginas públicas internas.

---

## Decisão 010 — Refino textual sem alteração funcional

Permitir ciclos de melhoria comercial/SEO on-page com escopo estrito em copy/headings/microcopy/CTAs, sem alterar lógica, dados, contratos ou comportamento.

**Motivo:** elevar conversão e percepção de marca preservando estabilidade operacional.

---

## Decisão 011 — Diretriz de SEO on-page semântico para páginas públicas

Padronizar vocabulário semântico útil ao usuário e à busca, evitando repetição artificial e promessa técnica não sustentada.

Eixo semântico prioritário:

- internet fibra
- planos de internet
- cobertura / consultar disponibilidade
- status da rede
- atendimento / suporte
- provedor regional

**Motivo:** melhorar legibilidade, intenção de busca e confiança sem inflar conteúdo.

---

## Regra

Toda decisão que altere segurança, deploy, banco, auth, fluxo administrativo ou padrão verbal institucional deve ser registrada aqui.
