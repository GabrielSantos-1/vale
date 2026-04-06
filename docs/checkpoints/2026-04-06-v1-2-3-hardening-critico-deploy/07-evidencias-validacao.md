# Evidencias de Validacao - v1.2.3

Janela local: 2026-04-06 (America/Sao_Paulo)

## Comandos executados

- `npm run typecheck` -> aprovado
- `npm run lint` -> aprovado
- `npm test` -> aprovado (35 testes)
- `npm run build` -> aprovado

## Testes adicionados no ciclo

- `tests/unit/csrf.test.ts`
- `tests/integration/admin-faq-security.test.ts`
- `tests/integration/security-smoke.test.ts`
- `tests/e2e/admin-security.spec.ts` (executa com segredos E2E)

## Observacao operacional

- A execução local dedicada de `npm run test:security-smoke` apresentou intermitencia `spawn EPERM` no sandbox ao iniciar `esbuild`.
- A mesma suite de verificacao foi validada via `npm test`, sem falhas funcionais.

