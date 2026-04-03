# 04 - Riscos residuais

1. `GET /api/plans` depende de conectividade com banco externo e pode falhar localmente sem acesso ao Supabase.
2. alertas por webhook exigem configuracao `OBS_ALERT_*` em ambiente para efetiva notificacao.
3. e2e fora do gate de PR pode detectar regressao mais tarde que unit/integration.
