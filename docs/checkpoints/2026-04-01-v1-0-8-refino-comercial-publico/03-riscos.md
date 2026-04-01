# 03 — Riscos e controles

## Riscos ativos

1. pendências de hardening técnico ainda abertas (CSP fina, headers, rate-limit);
2. possibilidade de mistura indevida de escopo textual com mudanças funcionais futuras;
3. necessidade de manter higiene de repositório e ambiente.

## Controles aplicados no lote 1.0.8

- escopo estrito em copy e documentação;
- preservação de rotas, APIs, schema, autenticação e lógica;
- validações de build durante o ciclo de refinamento;
- checkpoint técnico consolidado para rastreabilidade.

## Risco residual

Baixo para regressão funcional por este lote específico; médio para segurança operacional enquanto hardening final permanecer pendente.
