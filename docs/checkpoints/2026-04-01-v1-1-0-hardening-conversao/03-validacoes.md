# 03 - Validações

## Build e runtime

- `npm run build`: sucesso (2026-04-01)
- `npm run start`: sucesso (2026-04-01)

## Smoke checks

### Páginas públicas
- `/`
- `/planos`
- `/cobertura`
- `/contato`
- `/status`
- `/cliente/login`

### Admin/auth
- `/admin/login`
- `/recuperar-admin`

### APIs críticas
- `POST /api/contact`
- `POST /api/leads`
- `POST /api/coverage-check`
- `POST /api/events`
- `GET /api/plans`

## Segurança validada no ciclo

- validação server-side e schema estrito nas rotas públicas críticas;
- limites de payload com erro consistente (`INVALID_JSON`, `PAYLOAD_TOO_LARGE`, `UNSUPPORTED_MEDIA_TYPE`);
- rate limit ativo nas rotas hardenizadas;
- respostas sem leak de stack trace;
- `X-Correlation-Id` e headers de segurança nas APIs revisadas.

## Evidência observada

- todas as rotas públicas/admin listadas responderam `200` no smoke;
- `GET /api/plans` respondeu `200` com `X-Correlation-Id`;
- `POST` inválido com content-type incorreto retornou `415` em `contact/leads/coverage-check/events`;
- `POST /api/events` válido retornou `200` com `accepted: true`;
- acesso sem sessão em `/admin/dashboard` retornou `307` para login com `callbackUrl`.
