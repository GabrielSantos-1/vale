# 04 - Riscos residuais

1. **Rate limit in-memory**
- risco: efetividade parcial em múltiplas réplicas.
- mitigação futura: backend distribuído (Redis/edge-compatible).

2. **CSP global de páginas não endurecida nesta rodada**
- risco: superfície de front depende de fase dedicada para policy mais restritiva.
- mitigação futura: rollout gradual com testes visuais e funcionais.

3. **Observabilidade de eventos ainda básica**
- risco: detecção de anomalia depende de inspeção de logs.
- mitigação futura: dashboard/alerta para eventos e erros de rota.

4. **Cobertura comercial ainda sem seed operacional ampla**
- risco: percepção comercial limitada em algumas praças.
- mitigação futura: etapa dedicada de carga oficial de áreas.