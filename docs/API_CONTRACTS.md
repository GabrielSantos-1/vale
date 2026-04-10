# API_CONTRACTS.md

## Objetivo

Documentar os contratos publicos estaveis e a forma de resposta padrao.

---

## Envelope de resposta

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

Notas:

- `details` e opcional.
- `correlationId` e retornado quando disponivel.

---

## APIs publicas

### `POST /api/contact`

Objetivo: receber mensagem institucional/comercial.

Body esperado:

```json
{
  "name": "string",
  "email": "string",
  "phone": "string | optional",
  "subject": "string | optional",
  "message": "string",
  "website": "string | optional"
}
```

Codigos comuns: `201`, `400`, `413`, `415`, `422`, `429`, `500`.

### `POST /api/leads`

Objetivo: registrar interesse comercial.

Body esperado:

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
  "website": "string | optional"
}
```

Codigos comuns: `201`, `400`, `413`, `415`, `422`, `429`, `500`.

### `POST /api/coverage-check`

Objetivo: consultar disponibilidade por cep/cidade/bairro.

Body esperado:

```json
{
  "cep": "string | optional",
  "city": "string | optional",
  "district": "string | optional"
}
```

Codigos comuns: `200`, `400`, `413`, `415`, `422`, `429`, `500`.

### `GET /api/plans`

Objetivo: listar planos ativos publicos.

Codigos comuns: `200`, `500`.

### `POST /api/events`

Objetivo: receber eventos first-party sem PII.

Body esperado:

```json
{
  "eventName": "string",
  "page": "string",
  "component": "string",
  "target": "string | optional",
  "status": "string | optional"
}
```

Codigos comuns: `200`, `400`, `413`, `415`, `422`, `429`, `500`.

---

## Regras de compatibilidade

- evitar breaking changes em rotas publicas sem versao/documentacao.
- manter mensagens seguras sem vazar detalhes internos.
- manter validacao server-side obrigatoria.