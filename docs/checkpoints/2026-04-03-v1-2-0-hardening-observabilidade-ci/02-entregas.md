# 02 - Entregas

## Etapa 2 - Rate limit distribuido

- driver `upstash` com fallback controlado para `memory`;
- compatibilidade de headers e respostas preservada.

## Etapa 3 - CSP global

- politica CSP centralizada com `CSP_MODE=report-only|enforce`;
- aplicacao consistente em middleware global e respostas hardenizadas.

## Etapa 4 - Observabilidade first-party

- trilha operacional em `AuditLog` para eventos, rate-limit e erros publicos;
- endpoint admin `GET /api/admin/metrics/observability`;
- painel de observabilidade integrado no dashboard admin;
- alertas por webhook com cooldown e thresholds.

## Etapa 5 - Regressao continua e governanca

- workflow de gate (`npm ci`, `npm test`, `npm run build`);
- workflow e2e separado (`workflow_dispatch` + `schedule`);
- estado e decisoes atualizados na documentacao oficial.
