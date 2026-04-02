# DECISIONS.md

## Objetivo

Registrar decisões arquiteturais e operacionais com histórico auditável.

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

Separação entre UI, validação, segurança e persistência.

**Motivo:** evolução incremental com menor acoplamento.

---

## Decisão 005 — Política de checkpoint datado

Registrar checkpoints técnicos datados para continuidade e rastreabilidade.

**Motivo:** reduzir regressões e melhorar governança.

---

## Decisão 006 — Banco operacional consolidado em Supabase

Manter baseline em novo projeto Supabase após descarte do banco inconsistente.

**Motivo:** previsibilidade operacional e alinhamento de produção.

---

## Decisão 007 — Validação de auth no domínio canônico

Validação final de autenticação deve ocorrer no domínio principal (`NEXTAUTH_URL`).

**Motivo:** evitar falso diagnóstico por divergência de domínio/cookie.

---

## Decisão 008 — Prioridade de hardening pós-recovery

Após recuperação de deploy/admin, priorizar endurecimento antes de expansão ampla.

**Motivo:** consolidar base segura.

---

## Decisão 009 — Posicionamento verbal oficial público

Adotar posicionamento: provedor regional com operação transparente e atendimento próximo.

**Motivo:** consistência institucional e comercial.

---

## Decisão 010 — Refino textual sem mudança funcional

Permitir ciclos de copy/SEO on-page sem alterar lógica, contratos ou dados.

**Motivo:** elevar conversão preservando estabilidade.

---

## Decisão 011 — SEO on-page semântico orientado a utilidade

Padronizar vocabulário semântico útil (fibra, planos, cobertura, status, suporte).

**Motivo:** melhorar intenção de busca e legibilidade.

---

## Decisão 012 — Hardening API-first com parser único de JSON

Padronizar parse de body com limite real de bytes e erros consistentes (`INVALID_JSON`, `PAYLOAD_TOO_LARGE`, `UNSUPPORTED_MEDIA_TYPE`) nas APIs públicas críticas.

**Motivo:** reduzir superfícies de abuso e inconsistência de tratamento.

Impacto:
- melhora previsibilidade de erro para frontend;
- reduz risco de payload malicioso e parsing frágil.

---

## Decisão 013 — Telemetria first-party sem PII

Instrumentar eventos de conversão via endpoint interno `POST /api/events`, com allowlist de eventos e propriedades, sem coleta de dados pessoais.

**Motivo:** medir conversão com minimização de dados e menor risco LGPD.

Impacto:
- observabilidade comercial inicial sem provider externo;
- menor superfície de vazamento de dados sensíveis.

---

## Decisão 014 — Separação explícita admin/cliente

Criar rota pública de preparação `/cliente/login` sem autenticação real e sem reaproveitar sessão admin.

**Motivo:** preservar fronteiras de segurança e evitar mistura de perfis.

Impacto:
- prepara evolução futura de RBAC/ABAC para cliente;
- evita acoplamento inseguro com auth administrativa.

---

## Decisão 015 — Correção de leitura de sessão no proxy local

No `proxy.ts`, remover forçamento de `secureCookie` em `getToken` para evitar mismatch de cookie em `npm run start` local HTTP.

**Motivo:** resolver loop `/admin/login` ↔ `/admin/dashboard` sem alterar modelo de sessão.

Impacto:
- acesso admin local restabelecido;
- mantém proteção de rota por token + role.

---

## Regra

Toda decisão que altere segurança, deploy, auth/session, API pública, banco ou governança documental deve ser registrada aqui.