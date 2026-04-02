# 01 - Contexto

## Estado inicial do ciclo

- baseline documental em v1.0.8 focada em refino comercial/SEO;
- pendências de hardening API público e telemetria segura;
- incidente local de loop admin após autenticação.

## Estado final do ciclo

- superfícies públicas críticas hardenizadas com parser único de JSON, limite de payload e validação estrita;
- eventos de conversão first-party sem PII operacionais;
- recuperação de senha admin integrada ao login;
- separação cliente/admin explícita com placeholder seguro;
- loop de redirecionamento admin corrigido no `proxy.ts`.

## Fronteiras preservadas

- sem alterações de schema Prisma;
- sem migração de banco;
- sem mudança de contrato de sessão/admin além do bugfix do gate local.