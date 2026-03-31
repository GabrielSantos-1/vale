# PROJECT_STATE.md

## Objetivo

Este documento registra o estado técnico atual do projeto **Verde Vale 2**.
Ele funciona como snapshot oficial para retomada segura, continuidade controlada e execução por etapas sem quebrar o ambiente atual.

---

## Data de referência

2026-03-31

---

## Resumo executivo

O projeto saiu do estado de recuperação emergencial e entrou em estado **funcional em produção**, com o novo banco Supabase conectado, migrations aplicadas, API principal validada, acesso administrativo restaurado e deploy operacional na Vercel.

Estado validado nesta data:

- banco novo Supabase ativo e coerente com produção;
- `DATABASE_URL` e `DIRECT_URL` configuradas para o novo ambiente;
- `NEXTAUTH_URL` e `NEXTAUTH_SECRET` existentes na Vercel;
- `/api/plans` em produção retornando corretamente os 5 planos;
- login admin funcionando em produção;
- acesso ao admin validado;
- cards de planos melhorados;
- bug de atualização/remoção do badge comercial corrigido no admin;
- CSP ajustada para não bloquear o runtime necessário do login/admin.

---

## Estado funcional por domínio

### Público

- home, planos, cobertura, suporte, contato, status, sobre, política e termos ativos;
- visual premium consolidado;
- cards de planos refinados;
- fluxo público principal operacional;
- API de planos validada em produção.

### Administrativo

- login admin funcional em produção;
- dashboard/admin acessível;
- gestão de planos funcional;
- correção aplicada no fluxo de badge comercial ao editar plano;
- autenticação baseada em cookie HttpOnly em operação.

### API e persistência

- rotas públicas e administrativas segregadas;
- banco novo Supabase em uso na produção;
- Prisma alinhado com schema e migrations;
- `/api/plans` validada em produção com dados corretos;
- backend principal operacional.

---

## Incidentes recentes consolidados

1. banco anterior inconsistente e abandonado;
2. ausência de `DIRECT_URL` no ambiente local durante parte da recuperação;
3. divergência entre login local e produção;
4. role do admin incorreta em parte da investigação;
5. hash/senha do admin precisando redefinição controlada;
6. `/api/auth/session` retornando `{}` em produção;
7. CSP excessivamente restritiva bloqueando runtime/login;
8. tentativas de validação em domínio preview em vez do domínio final;
9. mudanças locais não commitadas em alguns momentos do processo.

Todos esses pontos foram rastreados durante a recuperação até o estado atual funcional.

---

## Qualidade técnica e riscos atuais

### Estado atual
- aplicação operacional em produção;
- admin funcional;
- deploy funcional;
- ambiente principal estabilizado.

### Riscos ativos
1. necessidade de hardening pós-recuperação, especialmente em headers/CSP, auth e higiene de repositório;
2. possibilidade de arquivos temporários, scripts auxiliares ou resíduos operacionais permanecerem localmente;
3. necessidade de revisar a política CSP atual para endurecimento progressivo sem quebrar o runtime;
4. ausência, neste momento, de um fluxo formal de recuperação de senha/admin;
5. necessidade de revisão final de segredos, artefatos e arquivos sensíveis.

---

## Ordem recomendada de continuidade

1. congelar este checkpoint como base oficial pós-recovery;
2. executar limpeza controlada de arquivos temporários e resíduos operacionais;
3. revisar segurança do runtime sem quebrar o deploy atual;
4. implementar recuperação segura de acesso admin;
5. revisar repositório, `.gitignore`, scripts e superfície sensível;
6. só depois seguir para melhorias adicionais.

---

## Regra de manutenção

Atualizar este arquivo sempre que houver mudança relevante em:
- deploy/produção;
- banco, auth, sessão ou CSP;
- segurança/hardening;
- fluxo administrativo;
- recuperação de acesso;
- risco estrutural do projeto.
