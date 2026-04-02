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