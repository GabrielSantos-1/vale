# CONTEXT_MAP.md

## Objetivo

Este documento funciona como mapa de contexto do projeto.
Ele orienta leitura, governanca e rastreabilidade do estado tecnico atual.

---

## Ordem recomendada de leitura

1. `PROJECT_BRIEF.md`
2. `ARCHITECTURE.md`
3. `SECURITY_RULES.md`
4. `CODING_STANDARDS.md`
5. `UI_GUIDELINES.md`
6. `API_CONTRACTS.md`
7. `BACKLOG.md`
8. `TASKS.md`
9. `PROJECT_STATE.md`
10. `PROMPTING_RULES.md`
11. `DECISIONS.md`

---

## Mapa de modulos com mudancas recentes (snapshot 2026-03-30)

### Publico

- `app/(public)` e `components/marketing`
- foco recente: copy, legibilidade e consistencia visual

### Admin

- `app/admin` e `components/admin`
- foco recente: ortografia PT-BR, contraste e consistencia textual

### UI Base e Layout

- `components/ui/*`, `components/layout/public`, `components/ui/layout/admin`, `app/globals.css`
- foco recente: tokens, foreground/muted e legibilidade em componentes reutilizaveis

### Seguranca e API

- `lib/security`, `app/api/*`, `lib/auth`, `lib/validations`
- foco recente: consolidacao de hardening e padronizacao de tratamento

### Documentacao de estado

- `docs/PROJECT_STATE.md`
- `docs/TASKS.md`
- `docs/CHECKPOINT_2026-03-30.md`

---

## Responsabilidade dos documentos

- `PROJECT_BRIEF.md`: direcao de produto e visao
- `ARCHITECTURE.md`: estrutura e separacao de camadas
- `SECURITY_RULES.md`: requisitos obrigatorios de seguranca (prioridade maxima)
- `CODING_STANDARDS.md`: consistencia tecnica e estilo
- `UI_GUIDELINES.md`: identidade visual e UX
- `API_CONTRACTS.md`: contratos de comunicacao
- `BACKLOG.md`: roadmap macro por sprint
- `TASKS.md`: execucao atual e progresso real
- `PROJECT_STATE.md`: snapshot tecnico oficial
- `PROMPTING_RULES.md`: uso operacional com agentes
- `DECISIONS.md`: historico de decisoes aprovadas

---

## Regra de conflito

1. `SECURITY_RULES.md`
2. `ARCHITECTURE.md`
3. `CODING_STANDARDS.md`
4. `UI_GUIDELINES.md`
5. `BACKLOG.md`/`TASKS.md`

---

## Diretriz final

Antes de qualquer mudanca ampla, alinhar escopo com este mapa e atualizar checkpoint datado ao final da rodada.
