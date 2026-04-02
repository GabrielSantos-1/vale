# 05 - Próximos passos

## Pré-deploy

1. revisar `git diff --cached` final (código + docs);
2. confirmar build/start e smoke de admin login;
3. gerar commit de baseline v1.1.0.

## Deploy monitorado

1. publicar em ambiente alvo;
2. validar páginas e APIs críticas em produção;
3. validar login admin e fluxo de recuperação.

## Pós-deploy

1. monitorar logs de erro e correlação por rota crítica;
2. iniciar fase de hardening residual (CSP global + rate limit distribuído);
3. consolidar suíte mínima de regressão em pipeline CI.