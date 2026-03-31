# ADMIN_PASSWORD_RECOVERY_PLAN.md

## Objetivo

Definir a implementação de um fluxo seguro de recuperação de acesso administrativo para evitar dependência de alteração manual no banco.

---

## Requisitos funcionais

- solicitar recuperação por e-mail/login administrativo;
- emitir token temporário de recuperação;
- expirar token em tempo curto;
- invalidar token após uso;
- permitir redefinição segura da senha;
- registrar auditoria do evento.

---

## Requisitos de segurança

- não confirmar explicitamente se a conta existe;
- aplicar rate limiting;
- não expor token em logs;
- usar hash forte para a nova senha;
- invalidar sessões antigas quando necessário;
- registrar tentativa e sucesso de recuperação em auditoria.

---

## Fluxo sugerido

1. admin solicita recuperação;
2. sistema gera token temporário com expiração;
3. token é armazenado de forma segura;
4. admin recebe link controlado;
5. admin redefine a senha;
6. sistema invalida token;
7. sistema registra auditoria.

---

## Fora de escopo imediato

- MFA completo;
- integração complexa com terceiros;
- painel avançado de gestão de identidades.

---

## Regra de implementação

Implementar em etapas pequenas.
Não misturar esse fluxo com refatoração ampla de auth.
