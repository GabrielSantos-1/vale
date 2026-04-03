# 03 - Validacoes

## Validacoes tecnicas locais

- `npm test` -> sucesso
- `npm run build` -> sucesso
- smoke de rotas criticas publicas e admin -> sucesso

## Validacoes de seguranca

- `X-Correlation-Id`, `X-RateLimit-*` e `Retry-After` preservados;
- `CSP_MODE=report-only` validado;
- `CSP_MODE=enforce` validado;
- endpoint admin de observabilidade retorna `401` sem sessao e `200` com sessao admin.

## Validacoes de governanca

- workflow `.github/workflows/ci-gate.yml` criado;
- workflow `.github/workflows/e2e-playwright.yml` criado.
