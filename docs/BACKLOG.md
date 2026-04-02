# BACKLOG.md

## Objetivo

Definir backlog macro por fases com execução incremental, auditável e segura.

---

## Fase concluída — Baseline 1.1.0 (2026-04-01)

### Escopo consolidado
- conversão e confiança em superfícies públicas;
- cobertura pública resiliente e comercialmente útil;
- recuperação de senha admin integrada com segurança;
- separação de superfície cliente/admin com placeholder público;
- hardening API-first em rotas públicas críticas;
- telemetria first-party sem PII;
- validação final e hotfix do loop de redirecionamento admin.

### Resultado
- baseline funcional e deployável consolidada em checkpoint v1.1.0.

---

## Próxima fase proposta — Fase 1.2 (hardening residual + observabilidade)

### Objetivo
Fechar lacunas residuais sem regressão de produto.

### Entregas alvo
- endurecimento progressivo de CSP global de páginas com validação controlada;
- estratégia de rate limit distribuído para ambientes com múltiplas instâncias;
- consolidação de observabilidade de eventos first-party (dashboards e alertas);
- suíte mínima de regressão para fluxos públicos e admin críticos.

### Restrições
- sem mudança de schema Prisma sem necessidade comprovada;
- sem enfraquecer auth/session/admin para ganhar velocidade;
- sem alteração ampla de UI fora de objetivo de hardening/observabilidade.

---

## Backlog contínuo de produto (não iniciado nesta baseline)

- evolução da Central do Cliente com modelagem de autenticação própria;
- expansão comercial de cobertura com fonte de dados oficial;
- melhoria de UX orientada por telemetria agregada;
- automação de validações de segurança em pipeline.

---

## Regra de governança

Toda fase deve terminar com:
1. validações técnicas obrigatórias;
2. riscos residuais explícitos;
3. checkpoint datado;
4. decisão registrada quando houver mudança de segurança/arquitetura.