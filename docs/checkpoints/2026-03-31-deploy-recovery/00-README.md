# Checkpoint — Deploy Recovery e Estabilização do Admin

Este diretório registra o checkpoint técnico do projeto **Verde Vale 2** após:
- troca do banco;
- recuperação do deploy;
- correção do acesso admin;
- investigação de sessão em produção;
- correção de CSP que bloqueava o runtime;
- validação final do acesso administrativo.

## Ordem de leitura recomendada
1. `01-contexto-geral.md`
2. `02-o-que-foi-feito.md`
3. `03-incidentes-e-causa-raiz.md`
4. `04-estado-atual-producao.md`
5. `05-proximas-etapas-hardening.md`
6. `06-regras-para-nao-quebrar.md`

## Estado resumido
- banco novo Supabase conectado;
- migrations aplicadas;
- `/api/plans` validada em produção;
- admin recuperado;
- login admin funcionando em produção;
- CSP ajustada para não quebrar o runtime;
- próxima fase: hardening, limpeza e recuperação de acesso.
