# DECISIONS.md

## Objetivo

Registrar decisões arquiteturais e operacionais relevantes, mantendo histórico auditável.

---

## Decisão 001 — Stack oficial

Next.js + TypeScript + Tailwind + PostgreSQL + Prisma.

**Motivo:** equilíbrio entre produtividade, segurança e escalabilidade.

---

## Decisão 002 — Autenticação por cookie HttpOnly

Sessão baseada em cookie HttpOnly para área administrativa.

**Motivo:** reduzir superfície de ataque de XSS sobre credenciais.

---

## Decisão 003 — Validação com Zod

Validação de entrada padronizada no servidor com schemas Zod.

**Motivo:** tipagem forte e contratos consistentes.

---

## Decisão 004 — Arquitetura modular

Separação clara entre UI, aplicação, segurança e persistência.

**Motivo:** manutenção e evolução incremental sem reescrita ampla.

---

## Decisão 005 — Direção visual premium pública

Hero premium reutilizável com fundo de fibra, superfícies profundas e contraste controlado.

**Motivo:** alinhar percepção de qualidade entre público e admin.

---

## Decisão 006 — Política de checkpoint datado

Registrar checkpoints técnicos datados para continuidade e rastreabilidade.

**Motivo:** reduzir regressão e melhorar governança do workspace.

---

## Decisão 007 — Abandono do banco anterior inconsistente

O banco anterior foi considerado inconsistente e substituído por um novo projeto Supabase.

**Motivo:** recuperar previsibilidade operacional, alinhar produção com uma base limpa e evitar continuar sobre fundação comprometida.

---

## Decisão 008 — Produção deve usar somente o domínio canônico para validação final de auth

A validação final de autenticação deve ser feita no domínio principal configurado em `NEXTAUTH_URL`, e não em previews.

**Motivo:** evitar falso diagnóstico por divergência de domínio/cookie/sessão.

---

## Decisão 009 — Fase atual é hardening pós-recovery, não expansão funcional ampla

Após o recovery do deploy e do admin, o projeto entra primeiro em limpeza, endurecimento e recuperação de acesso, antes de novas expansões maiores.

**Motivo:** reduzir risco de regressão e consolidar base segura.

---

## Regra

Toda decisão que altere segurança, deploy, banco, auth ou fluxo administrativo deve ser registrada aqui.
