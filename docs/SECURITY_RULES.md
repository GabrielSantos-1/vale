
# Arquivo: `docs/SECURITY_RULES.md`

Copie **apenas o bloco abaixo**.

```md
# SECURITY_RULES.md

## Objetivo

Este documento define as regras obrigatórias de segurança do projeto.

Todas as implementações devem respeitar estas regras.

---

## Princípios fundamentais

1. Nunca confiar em input do cliente.
2. Validar todos os dados no servidor.
3. Evitar exposição de informações internas.
4. Aplicar autenticação e autorização corretamente.
5. Minimizar superfície de ataque.

---

## Validação de entrada

Toda entrada deve:

- passar por validação Zod
- possuir limite de tamanho
- possuir tipo correto
- possuir formato validado

Entradas incluem:

- body
- query params
- route params
- headers
- cookies

---

## Proteção contra SQL Injection

Regras obrigatórias:

- usar Prisma
- usar queries parametrizadas
- nunca concatenar SQL manualmente
- nunca interpolar input diretamente em queries

Proibido:

```text
SELECT * FROM users WHERE email = '${email}'
Proteção contra XSS

Proibições:

não usar dangerouslySetInnerHTML

não renderizar HTML arbitrário

não confiar em conteúdo vindo do usuário

Se HTML for necessário:

sanitizar no servidor

usar whitelist

Proteção contra IDOR

Toda rota deve verificar:

autenticação

autorização

escopo de acesso

Nunca confiar apenas no ID recebido.

Autenticação

Regras obrigatórias:

sessão baseada em cookie HttpOnly

cookie Secure em produção

SameSite configurado

hash forte para senha

Proibido:

tokens em localStorage

credenciais em query string

CSRF

Rotas que alteram dados devem:

usar POST, PUT, PATCH ou DELETE

validar origem

utilizar proteção CSRF quando necessário

Rate limiting

Aplicar rate limit em:

login

formulário de contato

formulário de lead

consulta de cobertura

Objetivo:

evitar spam

evitar brute force

evitar abuso

Headers de segurança

Aplicar:

Content-Security-Policy
X-Frame-Options
X-Content-Type-Options
Referrer-Policy
Permissions-Policy

Em produção:

Strict-Transport-Security

Logs de segurança

Registrar:

login admin

falha de login

criação de entidade

edição de entidade

exclusão de entidade

Nunca registrar:

senha

token

segredo

Variáveis de ambiente

Regras:

nunca versionar .env

usar .env.example

segredos não devem ser hardcoded

Tratamento de erro

Erros retornados ao cliente devem ser:

genéricos

sem stack trace

sem detalhes internos

Upload de arquivos

Se uploads forem implementados:

validar MIME

validar extensão

renomear arquivo

armazenar fora da raiz pública

Auditoria

Ações administrativas devem ser registradas em:

AuditLog

Campos sugeridos:

actorUserId

action

entity

entityId

metadata

timestamp

Regra final

Se houver dúvida entre:

funcionalidade vs segurança

priorizar segurança.