# PROJECT_STATE.md

## Objetivo

Este documento registra o estado tecnico atual do projeto Verde Vale 2.0.
Ele funciona como snapshot oficial para retomada segura e continuidade por sprint/lote.

---

## Data de referencia

2026-03-30

---

## Resumo executivo

Estado atual confirmado no branch `main`, com grande volume de alteracoes locais em andamento e sem baseline de commit consolidada.

Panorama tecnico validado nesta data:

- `npm run lint`: OK
- `npm run typecheck`: OK

O sistema segue funcional em alto nivel, com evolucoes recentes em:

- camada publica (layout/marketing/microcopy);
- camada administrativa (copy/legibilidade/contraste);
- componentes base de UI e tokens;
- camada de seguranca e APIs em continuidade de hardening.

---

## Estado funcional por dominio

### Publico

- paginas principais ativas e padrao visual premium consolidado;
- shell publico separado em `components/layout/public`;
- ajustes de copy e legibilidade aplicados nos principais blocos de marketing.

### Administrativo

- dashboard, modulos de gestao e shell admin ativos;
- revisao textual e de contraste avancada nos componentes reutilizaveis do admin;
- lote 3 (admin: ortografia, consistencia e contraste) finalizado no estado atual.

### API e persistencia

- rotas publicas e admin permanecem segregadas;
- validacao server-side e auth/role-check permanecem ativos;
- sem mudancas de contrato exigidas para este snapshot documental.

---

## Qualidade tecnica e riscos atuais

### Qualidade

- baseline de `lint` e `typecheck` estavel no estado local atual.

### Riscos ativos

1. volume alto de alteracoes nao commitadas no workspace, elevando risco de regressao por escopo amplo;
2. necessidade de consolidar baseline em checkpoints curtos para rastreabilidade;
3. build pode continuar sensivel a dependencia externa de fontes em ambiente sem rede.

---

## Ordem recomendada de continuidade

1. consolidar checkpoint e estado documental (30/03/2026) como referencia unica;
2. fechar lotes pendentes de revisao de UX textual/legibilidade (incluindo formularios e estados vazios);
3. validar visual final por dominio (publico e admin, desktop/mobile);
4. consolidar baseline tecnico por rodada (`lint`, `typecheck`, testes essenciais);
5. reduzir risco de deploy em ambiente restrito (estrategia de fontes e resiliencia de build).

---

## Consistencia com documentos de governanca

Em caso de conflito documental, manter prioridade:

1. `SECURITY_RULES.md`
2. `ARCHITECTURE.md`
3. `CODING_STANDARDS.md`

`BACKLOG.md` e `TASKS.md` seguem como trilha de execucao; `DECISIONS.md` registra excecoes e decisoes de processo.

---

## Regra de manutencao

Atualizar este arquivo em toda mudanca relevante de:

- estado de sprint/lote;
- baseline de qualidade tecnica;
- riscos estruturais de build/deploy;
- seguranca, autenticacao ou arquitetura;
- padrao visual global.
