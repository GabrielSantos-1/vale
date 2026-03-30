# DECISIONS.md

## Objetivo

Registrar decisoes arquiteturais e de processo relevantes, mantendo historico auditavel.

---

## Decisao 001 - Stack oficial

Next.js + TypeScript + Tailwind + PostgreSQL + Prisma.

**Motivo:** equilibrio entre produtividade, seguranca e escalabilidade.

---

## Decisao 002 - Autenticacao por cookie HttpOnly

Sessao baseada em cookie HttpOnly para area administrativa.

**Motivo:** reduzir superficie de ataque de XSS sobre credenciais.

---

## Decisao 003 - Validacao com Zod

Validacao de entrada padronizada no servidor com schemas Zod.

**Motivo:** tipagem forte e contratos consistentes.

---

## Decisao 004 - Arquitetura modular

Separacao clara entre UI, aplicacao, seguranca e persistencia.

**Motivo:** manutencao e evolucao incremental sem reescrita ampla.

---

## Decisao 005 - Direcao visual premium publica

Hero premium reutilizavel com fundo de fibra, superficies profundas e contraste controlado.

**Motivo:** alinhar percepcao de qualidade entre publico e admin.

---

## Decisao 006 - Sistema visual publico com ativos curados

Padronizacao de hero e blocos visuais reutilizaveis para planos, cobertura, status, suporte e contato.

**Motivo:** consistencia visual e melhor conversao sem perder responsividade.

---

## Decisao 007 - Politica de checkpoint datado de estado

Sempre registrar checkpoint tecnico datado em `docs/CHECKPOINT_YYYY-MM-DD.md` ao consolidar rodada relevante.

Regras da politica:

- manter checkpoints anteriores como historico imutavel;
- refletir data igual em `PROJECT_STATE.md` e `TASKS.md`;
- registrar evidencias minimas de validacao (`lint` e `typecheck`) no checkpoint.

**Motivo:** melhorar rastreabilidade, continuidade e reducao de regressao em workspace com alto volume de alteracoes.

---

## Regra

Toda decisao arquitetural ou de processo que altere a forma de evolucao do projeto deve ser registrada aqui.
