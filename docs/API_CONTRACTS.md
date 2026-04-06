# API_CONTRACTS.md

## Objetivo

Definir contratos atuais das APIs públicas críticas do sistema, com foco em compatibilidade, segurança e observabilidade.

---

## Envelope padrão de resposta

### Sucesso

```json
{
  "success": true,
  "data": {}
}
```

### Erro

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensagem segura",
    "details": {},
    "correlationId": "uuid"
  }
}
```

Observações:
- `details` é opcional;
- `correlationId` é incluído quando disponível;
- respostas públicas hardenizadas incluem `X-Correlation-Id` e headers de segurança.

---

## Headers de segurança aplicados (rotas hardenizadas)

- `X-Correlation-Id`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy` (estratégia API-first)

Quando há rate limit:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
- `Retry-After` (em cenário de bloqueio)

---

## Contratos públicos vigentes

## `POST /api/contact`

### Objetivo
Receber mensagem de contato institucional/comercial.

### Body esperado
```json
{
  "name": "string",
  "email": "string",
  "phone": "string | optional",
  "subject": "string | optional",
  "message": "string",
  "website": "string | optional (honeypot)"
}
```

### Segurança/validação
- validação server-side com Zod;
- body JSON obrigatório;
- limite de payload (~8KB);
- rate limit por origem;
- sanitização antes de persistir;
- resposta de sucesso neutra para honeypot acionado.

### Respostas típicas
- `201` sucesso: `{ success: true, data: { success: true } }`
- `400` `INVALID_JSON`
- `413` `PAYLOAD_TOO_LARGE`
- `415` `UNSUPPORTED_MEDIA_TYPE`
- `422` `VALIDATION_ERROR`
- `429` `RATE_LIMITED`
- `500` `INTERNAL_SERVER_ERROR`

---

## `POST /api/leads`

### Objetivo
Registrar interesse comercial em planos/contratação.

### Body esperado
```json
{
  "name": "string",
  "email": "string | optional",
  "phone": "string | optional",
  "city": "string | optional",
  "district": "string | optional",
  "cep": "string | optional",
  "message": "string | optional",
  "planSlug": "string | optional",
  "website": "string | optional (honeypot)"
}
```

### Segurança/validação
- schema Zod `.strict()` (campos inesperados rejeitados);
- parse JSON com limite (~8KB);
- rate limit;
- normalização/sanitização de email/telefone/CEP/slug;
- validação de `planSlug` contra planos ativos.

### Respostas típicas
- `201` sucesso com `data.id`, `data.createdAt`
- `400` `INVALID_JSON`
- `400` `INVALID_PLAN`
- `413` `PAYLOAD_TOO_LARGE`
- `415` `UNSUPPORTED_MEDIA_TYPE`
- `422` `VALIDATION_ERROR`
- `429` `RATE_LIMITED`
- `500` `INTERNAL_SERVER_ERROR`

---

## `POST /api/coverage-check`

### Objetivo
Consultar disponibilidade de cobertura por CEP/cidade/bairro.

### Body esperado
```json
{
  "cep": "string | optional",
  "city": "string | optional",
  "district": "string | optional"
}
```

### Segurança/validação
- schema Zod `.strict()`;
- parse JSON com limite (~4KB);
- rate limit;
- sanitização de entrada e saída (`notes`);
- exige ao menos um campo de busca.

### Respostas típicas
- `200` sucesso com:
  - `{ available: true, notes: "..." }`
  - `{ available: false, notes: null }`
- `400` `MISSING_SEARCH_FIELDS`
- `400` `INVALID_JSON`
- `413` `PAYLOAD_TOO_LARGE`
- `415` `UNSUPPORTED_MEDIA_TYPE`
- `422` `VALIDATION_ERROR`
- `429` `RATE_LIMITED`
- `500` `INTERNAL_SERVER_ERROR`

---

## `GET /api/plans`

### Objetivo
Listar planos ativos públicos.

### Segurança/validação
- leitura somente de planos ativos;
- tratamento de erro interno genérico;
- `X-Correlation-Id` e headers de segurança via `withRequestMeta`.

### Respostas típicas
- `200` sucesso com array de planos em `data`
- `500` `INTERNAL_SERVER_ERROR`

---

## `POST /api/events`

### Objetivo
Receber eventos de conversão first-party sem PII.

### Body esperado (allowlist)
```json
{
  "eventName": "cta_click | coverage_check_submitted | coverage_check_result | contact_submit | plan_interest",
  "page": "string",
  "component": "string",
  "target": "string | optional",
  "status": "click | submitted | success | error | available | unavailable | optional"
}
```

### Segurança/validação
- schema Zod `.strict()`;
- parse JSON com limite (~2KB);
- rate limit;
- sanitização de metadados antes de log;
- rejeição de campos fora da allowlist.

### Respostas típicas
- `200` sucesso: `{ success: true, data: { accepted: true, timestamp: "..." } }`
- `400` `INVALID_JSON`
- `413` `PAYLOAD_TOO_LARGE`
- `415` `UNSUPPORTED_MEDIA_TYPE`
- `422` `VALIDATION_ERROR`
- `429` `RATE_LIMITED`
- `500` `INTERNAL_SERVER_ERROR`

---

## Regras de compatibilidade

- sem mudança de schema Prisma nesta baseline;
- sem alteração do contrato de autenticação/sessão NextAuth;
- mudanças de contrato público exigem decisão em `docs/DECISIONS.md` e checkpoint.
---

## Contrato interno admin (observabilidade)

## Regras de seguranca para mutacoes admin (interno)

Aplicavel a:
- `POST`, `PUT`, `PATCH`, `DELETE` em `/api/admin/*`.

Requisitos:
- sessao admin valida;
- `origin`/`referer` valido para o mesmo host;
- cookie CSRF `vv_csrf_token` presente;
- header `x-csrf-token` presente e igual ao cookie (double-submit).

Falha de CSRF:
- `403` com envelope padrao:
  - `error.code = CSRF_VALIDATION_FAILED`
  - `error.message = Falha de validacao CSRF.`
  - `error.correlationId` quando disponivel.

Validação de body (mutações admin):
- parse JSON com limite de payload por rota;
- rejeicao de `Content-Type` invalido (`UNSUPPORTED_MEDIA_TYPE`);
- rejeicao de payload acima do limite (`PAYLOAD_TOO_LARGE`);
- rejeicao de JSON invalido (`INVALID_JSON`);
- validacao Zod estrita (`.strict()`) com rejeicao de campos inesperados.

## `GET /api/admin/metrics/observability`

### Objetivo
Expor visao operacional de eventos first-party, rate limit e erros publicos para uso no dashboard admin.

### Autenticacao
- exige sessao administrativa valida;
- sem sessao: `401` `UNAUTHORIZED`.

### Query params
- `view`: `daily` | `weekly` | `monthly` (opcional, default `daily`).

### Resposta de sucesso
`200` com:
- `data`: serie temporal de eventos aceitos no periodo;
- `meta.summary`: totais, taxa de erro, status operacional, distribuicao por rota e ultimo evento critico.
  - campos aditivos de classificacao de incidente:
    - `publicRateLimited`
    - `publicErrors`
    - `authRateLimited`
    - `authErrors`
    - `authNoiseDetected`
- `meta.calibration`: janela efetiva, cooldown e thresholds ativos de alerta.
- `meta.alertHealth`: status consolidado por thresholds, contagem de alertas disparados/suprimidos e ultimo snapshot em memoria (quando disponivel).

### Erros
- `401` `UNAUTHORIZED`
- `500` `INTERNAL_SERVER_ERROR`

---

## Contratos da Central do Cliente (interno)

### `POST /api/client/auth/login`

#### Objetivo
Autenticar cliente com email e senha, retornando cookie de sessao JWT HttpOnly.

#### Body esperado
```json
{
  "email": "string",
  "password": "string"
}
```

#### Seguranca/validacao
- rate limit por IP (5 tentativas/min);
- validacao de formato de email;
- resposta neutra em falha (sem revelar se email existe);
- sessao JWT em cookie HttpOnly (`client-next-auth.session-token`);
- sem stack trace ou erro interno ao cliente.

#### Respostas tipicas
- `200` sucesso: `{ success: true }`
- `400` JSON invalido / campos faltando
- `401` `Credenciais invalidadas.`
- `429` `RATE_LIMITED`

---

### `POST /api/client/register`

#### Objetivo
Criar conta de cliente nova no sistema.

#### Body esperado
```json
{
  "name": "string",
  "email": "string",
  "phone": "string | optional",
  "password": "string"
}
```

#### Seguranca/validacao
- rate limit por IP (3 tentativas/min);
- nome min 2 caracteres, max 120;
- email valido e unico;
- senha min 8 caracteres;
- hash bcrypt com salt 12;
- sanitizacao de entrada.

#### Respostas tipicas
- `201` sucesso: `{ success: true }`
- `409` `Ja existe uma conta com este e-mail.`
- `422` validacao falhou
- `429` `RATE_LIMITED`
- `500` `Nao foi possivel criar a conta.`

---

### `POST /api/client/logout`

#### Objetivo
Invalidar sessao do cliente (limpar cookies).

#### Respostas tipicas
- `200` sucesso: `{ success: true }`

---

### `GET /api/client/me`

#### Objetivo
Retornar dados de perfil do cliente autenticado.

#### Autenticacao
- sessao de cliente obrigatoria.

#### Resposta de sucesso
- `200` com `data`:
  - `name`
  - `email`
  - `phone`
  - `cpfCnpj`
  - `isActive`
  - `createdAt`

#### Erros tipicos
- `401` `UNAUTHORIZED`
- `404` `NOT_FOUND`
- `500` `INTERNAL_SERVER_ERROR`

---

### `PATCH /api/client/me`

#### Objetivo
Atualizar dados cadastrais permitidos da conta autenticada.

#### Body esperado
```json
{
  "name": "string | optional",
  "phone": "string | optional",
  "cpfCnpj": "string | optional"
}
```

#### Seguranca/validacao
- sessao de cliente obrigatoria;
- schema Zod `.strict()` (campos fora da whitelist sao rejeitados);
- parse JSON com limite de payload;
- rate limit dedicado.

#### Erros tipicos
- `400` `INVALID_JSON`
- `401` `UNAUTHORIZED`
- `413` `PAYLOAD_TOO_LARGE`
- `415` `UNSUPPORTED_MEDIA_TYPE`
- `422` `VALIDATION_ERROR`
- `429` `RATE_LIMITED`
- `500` `INTERNAL_SERVER_ERROR`

---

### `POST /api/client/password/change`

#### Objetivo
Trocar senha para cliente autenticado.

#### Body esperado
```json
{
  "currentPassword": "string",
  "newPassword": "string",
  "confirmPassword": "string"
}
```

#### Seguranca/validacao
- sessao obrigatoria;
- validacao de senha atual com hash;
- atualizacao com bcrypt (salt 12);
- rate limit dedicado;
- mensagens seguras sem enumeracao de conta.

#### Erros tipicos
- `400` `INVALID_CREDENTIALS` ou `PASSWORD_REUSE_NOT_ALLOWED`
- `401` `UNAUTHORIZED`
- `422` `VALIDATION_ERROR`
- `429` `RATE_LIMITED`
- `500` `INTERNAL_SERVER_ERROR`

---

### `POST /api/client/password-recovery/request`

#### Objetivo
Solicitar recuperacao de senha da Central do Cliente.

#### Body esperado
```json
{
  "email": "string"
}
```

#### Seguranca/validacao
- resposta neutra para evitar enumeracao de conta;
- rate limit por origem e por hash de e-mail;
- parse JSON com limite e schema Zod `.strict()`;
- envio de email em modo stub quando provider nao configurado.

#### Respostas tipicas
- `200` sucesso neutro
- `422` `VALIDATION_ERROR`
- `429` `RATE_LIMITED`

---

### `POST /api/client/password-recovery/reset`

#### Objetivo
Redefinir senha com token de recuperacao.

#### Body esperado
```json
{
  "token": "string",
  "newPassword": "string",
  "confirmPassword": "string"
}
```

#### Seguranca/validacao
- token validado em backend (fase A: store temporario em memoria);
- token invalido/expirado retorna erro seguro;
- atualizacao de senha com bcrypt (salt 12);
- rate limit dedicado.

#### Erros tipicos
- `400` `INVALID_OR_EXPIRED_TOKEN` ou `PASSWORD_REUSE_NOT_ALLOWED`
- `422` `VALIDATION_ERROR`
- `429` `RATE_LIMITED`
- `500` `INTERNAL_SERVER_ERROR`
