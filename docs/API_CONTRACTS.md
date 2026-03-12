# API_CONTRACTS.md

## Objetivo

Definir contratos das APIs do sistema.

Padronizar requisições e respostas.

---

# Padrão de resposta

## Sucesso

```json
{
  "success": true,
  "data": {}
}
Erro
{
  "success": false,
  "error": "error_message"
}
Endpoint: contato

POST /api/contact

Body
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "message": "string"
}
Resposta
{
  "success": true
}
Endpoint: lead

POST /api/lead

Body
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "city": "string",
  "district": "string",
  "cep": "string"
}
Endpoint: cobertura

POST /api/coverage-check

Body
{
  "cep": "string"
}
Resposta
{
  "success": true,
  "data": {
    "available": true
  }
}
Endpoint admin: planos

GET /api/admin/plans

POST /api/admin/plans

PUT /api/admin/plans/{id}

DELETE /api/admin/plans/{id}

Endpoint admin: leads

GET /api/admin/leads

Endpoint admin: cobertura

CRUD cobertura.

Endpoint admin: status

CRUD status da rede.

Regra

Todos endpoints devem:

validar input

autenticar quando necessário

tratar erros

retornar padrão definido