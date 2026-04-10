# OPEN_SOURCE_SECURITY_CHECKLIST.md

## Objetivo

Checklist operacional para publicar e manter este repositorio com risco reduzido de exposicao de segredos e com governanca continua de seguranca.

---

## 1) Contencao e rotacao de segredos (obrigatorio)

Antes de tornar publico:

1. Rotacionar segredos ativos:
   - `NEXTAUTH_SECRET`
   - `AUTH_SECRET`
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `OBS_ALERT_WEBHOOK_URL`
2. Rotacionar credenciais administrativas ja utilizadas em ambientes reais.
3. Invalidar tokens/chaves legadas potencialmente expostas no historico.

Regra:
- nunca manter segredo real em arquivo versionado.

---

## 2) Recursos de seguranca do GitHub (obrigatorio)

Ativar no repositório:

1. Secret scanning
2. Push protection
3. Dependabot alerts
4. Dependabot security updates
5. Code scanning (CodeQL)

Status esperado:
- alertas criticos resolvidos, mitigados ou com plano formal de tratamento.

---

## 3) Protecao da branch `main` (obrigatorio)

Configurar branch protection com:

1. Pull request obrigatorio para merge
2. Bloqueio de push direto em `main`
3. Minimo de 1 aprovacao
4. Required status checks (nomes exatos atuais dos jobs):
   - `Test and Build`
   - `Gitleaks`
   - `Analyze (javascript-typescript)`

Observacao:
- o workflow `E2E Playwright` esta configurado para `workflow_dispatch` e `schedule`; ele nao roda automaticamente em PR e nao deve ser marcado como required check nesse formato.

---

## 4) Politica de documentacao publica

Antes de abrir publico, revisar e remover/sanitizar documentacao interna com risco operacional.

Acoes permitidas:

1. remover do repositorio publico
2. mover para base privada
3. sanitizar hostnames, janelas operacionais, incidentes e detalhes internos

---

## 5) Verificacoes tecnicas obrigatorias pre-publicacao

Executar:

1. `npm run lint`
2. `npm run typecheck`
3. `npm test`
4. `npm run build`
5. `npx prisma validate`

Criterio de aprovacao:
- pipeline verde
- nenhum segredo real em `HEAD`
- nenhum alerta critico aberto sem plano explicito

---

## 6) Procedimento em caso de vazamento

1. revogar segredo imediatamente
2. rotacionar no provedor
3. atualizar GitHub Secrets
4. registrar impacto e janela de exposicao
5. reexecutar scanner de segredos
6. avaliar reescrita de historico Git quando aplicavel

---

## Regra final

Se houver conflito entre velocidade de publicacao e reducao de risco:
- priorizar reducao de risco.
