# 09 - Separacao Observabilidade Auth vs Publico

## Objetivo
Reduzir falso "Atencao" no dashboard quando houver rate-limit de autenticacao admin por teste controlado ou bloqueio de brute-force.

## Mudanca aplicada
- agregacao de observabilidade passou a classificar incidentes por origem:
  - `public`: `/api/contact`, `/api/leads`, `/api/coverage-check`, `/api/events`
  - `auth_admin`: `/api/auth/*`
  - `unknown`: fallback seguro
- `meta.summary` do endpoint admin recebeu campos aditivos:
  - `publicRateLimited`, `publicErrors`
  - `authRateLimited`, `authErrors`
  - `authNoiseDetected`
- status operacional do painel passou a refletir prioritariamente incidentes publicos.

## Compatibilidade
- sem remocao/renomeacao de campos existentes no contrato interno.
- sem mudanca de schema Prisma.
- sem mudanca de fluxo de sessao/auth.
- sem mudanca em APIs publicas.

## Validacao esperada
1. auth-only (`/api/auth/*` rate-limit): status do painel permanece `stable`.
2. publico com incidente: status sobe para `warning/critical` conforme taxa publica.
3. painel exibe bloco dedicado para `Auth Admin (seguranca)` com microcopy explicativa.
