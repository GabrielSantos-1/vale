# Entregas do Dia - 2026-04-03

## Resumo executivo tecnico

Hoje foi consolidado o fechamento do ciclo 1.2 com estabilizacao operacional em GitHub Actions e evolucao para baseline documental 1.2.1.

## Linha do tempo tecnica (commits do dia)

- `3027009` - fechamento do ciclo 1.2 (hardening + observabilidade + CI).
- `2e3cfcc` / `add3bcf` - correcao de CI para auth secret no build (`NEXTAUTH_SECRET`/`AUTH_SECRET`) e fallback em runtime.
- `72377c1` - validacao obrigatoria de `DATABASE_URL` no gate CI/e2e para evitar falha tardia no prerender Prisma.
- `27ae119` - estabilizacao de E2E da home removendo acoplamento fragil ao copy.
- `25365bd` - calibracao operacional de alertas com severidade, anti-ruido e metadados no painel/admin API.

## Entregas tecnicas por frente

1. CI/CD e governanca remota
- workflows ajustados para previsibilidade de build e2e em ambiente GitHub;
- upgrade de actions para v5;
- dependencia de segredos obrigatorios explicitada e validada cedo no job.

2. Observabilidade e alertas
- thresholds por severidade (`warning`/`critical`) com fallback legado;
- cooldown por chave com severidade e registro de supressao anti-ruido;
- endpoint admin com `meta.calibration` e `meta.alertHealth`;
- dashboard admin com saude de alertas e thresholds ativos.

3. Documentacao e checkpoint
- estado oficial atualizado para `v1.2.1`;
- tarefas normalizadas com encerramento operacional da etapa 6.1;
- decisao de calibracao registrada e dependencia de `DATABASE_URL` no CI explicitada.

## Evidencias de validacao

- `npm test` aprovado;
- `npm run build` aprovado;
- `npm run e2e` (manual) aprovado em 2026-04-04T09:44:35-03:00 no commit `25365bd8f306c32efe9bf635e624977c262e03d3` com `1 passed` em `tests/e2e/home.spec.ts`;
- monitoramento de alertas por 24h concluido no Vercel (janela UTC: 2026-04-03T12:52:00Z -> 2026-04-04T12:52:00Z);
- ausencia de ocorrencias `PUBLIC_API_RATE_LIMITED` e `PUBLIC_API_ERROR` no periodo monitorado;
- calibracao mantida sem ajuste de thresholds/cooldown.
- checks remotos de PR normalizados apos configuracao de segredos obrigatorios;
- contratos publicos preservados, sem migration Prisma.

## Riscos residuais

- endpoint `GET /api/plans` segue dependente de conectividade externa em ambiente local;
- snapshot de saude de alerta em memoria pode ser particionado por instancia em ambiente distribuido;
- E2E permanece fora do gate de PR por decisao de custo/estabilidade.
