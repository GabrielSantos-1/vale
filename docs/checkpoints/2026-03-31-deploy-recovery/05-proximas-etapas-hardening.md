# Próximas Etapas — Hardening e Limpeza

## Objetivo
Sair do modo recuperação e entrar em modo de robustez operacional e segurança sem quebrar:
- banco novo;
- Vercel;
- login admin;
- deploy atual.

---

## Etapa 1 — limpeza e higiene do repositório
### Fazer
- remover scripts temporários de hash/teste;
- revisar `scripts/` e `prisma/` por arquivos auxiliares desnecessários;
- revisar `.gitignore`;
- garantir que dumps, artefatos e arquivos temporários não entrem no Git;
- revisar resíduos operacionais e qualquer arquivo sensível.

### Regra
Não misturar limpeza com refatoração ampla.

---

## Etapa 2 — revisão de segurança do runtime
### Fazer
- revisar CSP com mais precisão;
- evitar afrouxamento permanente desnecessário;
- revisar `securityHeaders()`;
- revisar headers aplicados globalmente;
- revisar cookies, sessão e escopo do auth;
- revisar `proxy.ts` com foco em proteção de `/admin/*`.

### Regra
Endurecer gradualmente sem quebrar o runtime já recuperado.

---

## Etapa 3 — revisão de autenticação e acesso administrativo
### Fazer
- revisar fluxo de sessão com calma;
- validar callbacks/auth guard;
- revisar mensagens de erro;
- revisar proteção de rota admin;
- revisar fluxo de sign-in e redirect.

### Regra
Não alterar múltiplas peças críticas de auth no mesmo passo sem evidência concreta.

---

## Etapa 4 — recuperação de senha/admin
### Fazer
Implementar fluxo seguro de recuperação de acesso administrativo, evitando depender de alteração manual no banco.

### Requisitos esperados
- fluxo explícito;
- protegido contra abuso;
- sem expor existência indevida de conta;
- com expiração e invalidação corretas;
- compatível com produção.

---

## Etapa 5 — revisão final de superfície de ataque
### Fazer
- revisar rotas públicas;
- revisar rate limiting;
- revisar logs;
- revisar exposição de erro;
- revisar possíveis segredos/artefatos esquecidos.

### Regra
Toda mudança deve preservar o ambiente atual funcional.
