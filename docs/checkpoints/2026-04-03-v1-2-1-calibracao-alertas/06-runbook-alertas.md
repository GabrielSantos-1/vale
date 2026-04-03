# Runbook de Alertas Operacionais

## Objetivo
Definir resposta padrao para alertas warning/critical de rate-limit e erro operacional.

## Sinais de acao imediata
- alerta `critical` em rota publica critica por duas janelas consecutivas;
- crescimento rapido de `PUBLIC_API_ERROR` em `/api/events`, `/api/contact`, `/api/leads`, `/api/coverage-check`;
- picos de `PUBLIC_API_RATE_LIMITED` com impacto em conversao.

## Triagem rapida (5-10 minutos)
1. Confirmar rota afetada no dashboard admin (`/admin/dashboard`).
2. Validar se houve deploy recente, alteracao de env ou incidente externo.
3. Verificar logs estruturados por `route`, `correlationId` e categoria.
4. Confirmar se o alerta e real ou ruido (spam local, scanner, burst legitimo).

## Acao por severidade
- warning:
  - monitorar por uma janela adicional;
  - abrir tarefa de investigacao se mantiver tendencia.
- critical:
  - acionar resposta imediata;
  - priorizar estabilizacao da rota;
  - comunicar impacto operacional no canal interno.

## Reducao de ruido / rollback operacional
- aumentar temporariamente `OBS_ALERT_*_THRESHOLD_WARNING` quando houver ruido conhecido;
- manter `*_CRITICAL` conservador para nao perder incidente real;
- ajustar `OBS_ALERT_COOLDOWN_SECONDS` para conter alert storm;
- rollback de calibracao: retornar para baseline legacy (`OBS_ALERT_RATE_LIMIT_THRESHOLD`, `OBS_ALERT_ERROR_THRESHOLD`) se necessario.

## Criterio de encerramento do incidente
- sem novos alertas critical por 2 janelas completas;
- erro/rate-limit retornando para patamar esperado;
- causa registrada e acao preventiva definida.
