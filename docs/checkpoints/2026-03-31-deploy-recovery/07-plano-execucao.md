# 07-plano-execucao.md

## Objetivo

Executar a próxima fase do projeto **Verde Vale 2** de forma controlada, sem quebrar:
- banco novo Supabase;
- deploy atual na Vercel;
- login admin;
- rotas principais;
- fluxo público já validado.

Este plano existe para guiar agentes de código e execução manual em ordem segura.

---

## Regra principal

Cada etapa deve ser concluída e validada antes da próxima.

Não misturar:
- limpeza ampla + hardening auth + CSP + banco
na mesma rodada.

---

## Ordem obrigatória de execução

1. `00-README.md`
2. `PROJECT_STATE.md`
3. `TASKS.md`
4. `DECISIONS.md`
5. `SAFE_EXECUTION_RULES.md`
6. este arquivo

---

# Etapa 1 — Higiene operacional do repositório

## Objetivo
Remover resíduos temporários e reduzir risco de exposição acidental.

## Escopo
- revisar `.gitignore`
- revisar arquivos temporários em `scripts/`
- revisar arquivos temporários em `prisma/`
- revisar presença de dumps
- revisar resíduos locais e artefatos de build
- revisar se existe qualquer arquivo sensível indevido no projeto

## Não fazer
- não refatorar auth
- não mexer em banco
- não mexer em CSP nesta etapa
- não mexer em páginas públicas
- não alterar regras de negócio

## Checklist
- [ ] revisar `.gitignore`
- [ ] garantir bloqueio de `*.dump`
- [ ] garantir bloqueio de `.env`, `.env.local`
- [ ] garantir bloqueio de artefatos locais temporários
- [ ] identificar scripts auxiliares que não devem permanecer
- [ ] remover apenas o que for claramente temporário
- [ ] validar que o projeto ainda sobe localmente

## Validação
- `git status` limpo ou sob controle
- nenhum arquivo sensível/temporário indevido pronto para commit
- `npm run build` continua passando

## Entregável
Resumo técnico do que foi removido/ajustado sem quebrar o projeto.

---

# Etapa 2 — Revisão controlada de CSP e headers

## Objetivo
Endurecer a segurança de headers gradualmente sem quebrar o runtime do login/admin recuperado.

## Escopo
- revisar `lib/security/headers.ts`
- mapear diretivas atuais de CSP
- identificar o que foi afrouxado para destravar o login
- reduzir permissões desnecessárias com cautela
- manter o login/admin funcional durante toda a etapa

## Não fazer
- não alterar banco
- não alterar schema
- não alterar fluxo de recuperação de senha ainda
- não fazer refatoração ampla do frontend

## Checklist
- [ ] documentar o estado atual da CSP
- [ ] identificar diretivas temporariamente relaxadas
- [ ] endurecer apenas uma diretiva por vez quando possível
- [ ] validar `/admin/login`
- [ ] validar `/api/auth/session`
- [ ] validar `/admin/dashboard`
- [ ] validar que o público continua funcional

## Validação
- login admin continua funcionando em produção
- `/api/auth/session` continua retornando sessão válida
- console sem regressão grave nova
- runtime do Next.js/Auth.js continua operacional

## Entregável
Resumo da CSP atual, o que foi endurecido e o que ainda precisa ficar temporariamente mais permissivo.

---

# Etapa 3 — Revisão de autenticação e sessão

## Objetivo
Consolidar o fluxo de auth/admin pós-recovery e reduzir fragilidade futura.

## Escopo
- revisar `lib/auth/*`
- revisar `proxy.ts`
- revisar fluxo de sessão
- revisar role propagation
- revisar proteção das rotas admin
- revisar fluxo de redirect/login

## Não fazer
- não mudar o banco
- não criar recovery flow nesta mesma etapa
- não fazer redesign do login
- não misturar com limpeza de UI

## Checklist
- [ ] mapear `authorize()`
- [ ] mapear callbacks `jwt` e `session`
- [ ] mapear proteção em `proxy.ts`
- [ ] validar coerência de role `admin`
- [ ] validar domínio final e sessão em produção
- [ ] revisar mensagens de erro e logs sensíveis
- [ ] manter compatibilidade com o ambiente atual

## Validação
- login entra em produção
- `/api/auth/session` retorna sessão válida
- `/admin/dashboard` abre autenticado
- deslogado continua redirecionado para login

## Entregável
Resumo do fluxo atual de auth e pontos reforçados.

---

# Etapa 4 — Implementação de recuperação de senha/admin

## Objetivo
Criar um fluxo seguro para recuperação de acesso administrativo sem depender de edição manual no banco.

## Escopo
- desenhar contrato do fluxo
- criar persistência/token seguro
- criar request de recuperação
- criar redefinição de senha
- invalidar token após uso
- registrar auditoria do processo

## Não fazer
- não transformar isso em sistema de identidade completo
- não misturar com MFA
- não alterar o restante do auth sem necessidade real
- não criar fluxo inseguro baseado em query simples e sem expiração

## Requisitos obrigatórios
- não expor se a conta existe
- aplicar rate limit
- expirar token
- invalidar token após uso
- usar hash forte para nova senha
- não logar segredo/token
- preservar deploy atual

## Checklist
- [ ] definir modelo de recuperação
- [ ] definir validações
- [ ] definir endpoint de solicitação
- [ ] definir endpoint de redefinição
- [ ] definir expiração e invalidação
- [ ] definir auditoria básica
- [ ] validar integração com produção

## Validação
- fluxo funciona localmente
- não enumera usuários
- não expõe token sensível
- não quebra login atual
- não quebra admin atual

## Entregável
Fluxo de recuperação documentado e implementado com segurança mínima adequada.

---

# Etapa 5 — Revisão de superfície sensível

## Objetivo
Reduzir risco residual após estabilização do deploy.

## Escopo
- revisar logs
- revisar exposição de erro
- revisar rotas públicas críticas
- revisar rate limiting
- revisar artefatos esquecidos
- revisar segredos e resíduos

## Checklist
- [ ] revisar login
- [ ] revisar contato
- [ ] revisar lead
- [ ] revisar coverage-check
- [ ] revisar logs administrativos
- [ ] revisar mensagens de erro expostas ao cliente
- [ ] revisar se há qualquer arquivo sensível esquecido

## Validação
- nenhuma rota crítica sem proteção mínima
- nenhum erro interno exposto de forma indevida
- nenhum segredo versionado
- nenhuma regressão no fluxo principal

## Entregável
Checklist final de hardening básico concluído.

---

# Etapa 6 — Consolidação final

## Objetivo
Congelar o novo estado técnico após hardening.

## Escopo
- atualizar `PROJECT_STATE.md`
- atualizar `TASKS.md`
- atualizar `DECISIONS.md` se necessário
- criar novo checkpoint datado
- registrar evidências mínimas de validação

## Checklist
- [ ] atualizar documentos de estado
- [ ] registrar o que foi endurecido
- [ ] registrar riscos remanescentes
- [ ] registrar validações executadas
- [ ] preparar continuidade futura

## Entregável
Novo checkpoint pós-hardening pronto para continuidade.

---

## Critério de sucesso do plano

O plano será considerado bem executado se, ao final:

- o projeto continuar funcional em produção;
- o admin continuar acessível;
- o banco novo permanecer íntegro;
- os arquivos temporários/sensíveis estiverem sob controle;
- a superfície de risco tiver sido reduzida;
- existir fluxo seguro de recuperação de senha/admin;
- a documentação refletir com precisão o novo estado do sistema.

---

## Regra final

Se houver dúvida entre:
- conveniência
- velocidade
- segurança
- estabilidade

priorizar:
1. estabilidade
2. segurança
3. rastreabilidade
4. velocidade
