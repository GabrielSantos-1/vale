# OPEN_SOURCE_SECURITY_CHECKLIST.md

## Objetivo

Checklist operacional para publicar e manter este repositório com risco reduzido de exposição de segredos e governança de segurança contínua.

---

## 1) Bloqueio de exposição imediata (obrigatório)

Antes de tornar público:

1. rotacionar segredos ativos:
   - `NEXTAUTH_SECRET`
   - `AUTH_SECRET`
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - webhooks operacionais (`OBS_ALERT_WEBHOOK_URL`)
2. rotacionar senha de qualquer conta admin criada via seed antiga.
3. invalidar tokens/chaves legadas eventualmente expostas em histórico.

Regra:
- nunca manter segredo real em arquivo versionado.

---

## 2) GitHub Security (obrigatório)

Ativar no repositório:

1. Secret Scanning
2. Push Protection
3. Dependabot alerts
4. Dependabot security updates
5. Code scanning com CodeQL

Status esperado:
- alertas críticos resolvidos ou justificados com prazo.

---

## 3) Proteção de branch `main` (obrigatório)

Configurar branch protection com:

1. pull request obrigatório
2. bloqueio de push direto
3. mínimo de 1 aprovação
4. checks obrigatórios:
   - `Run lint`
   - `Run typecheck`
   - `Run unit and integration tests`
   - `Run production build`
   - `Gitleaks`
   - `CodeQL`

---

## 4) Política de documentação pública

Antes de abrir público, revisar docs com potencial de inteligência operacional:

- `docs/PROJECT_STATE.md`
- `docs/TASKS.md`
- `docs/BACKLOG.md`
- `docs/checkpoints/**`
- `AGENTS.md`
- `docs/PROMPTING_RULES.md`
- `docs/SAFE_EXECUTION_RULES.md`

Ações permitidas:
1. remover do repositório público;
2. mover para base privada;
3. sanitizar (hostnames, incidentes, janelas e detalhes internos).

---

## 5) Verificações obrigatórias pré-publicação

Executar:

1. `npm run lint`
2. `npm run typecheck`
3. `npm test`
4. `npm run build`
5. `npx prisma validate`

Critério de aprovação:
- pipeline verde;
- nenhuma credencial em `HEAD`;
- nenhum alerta crítico aberto sem plano explícito.

---

## 6) Procedimento em caso de vazamento

1. revogar segredo imediatamente;
2. rotacionar no provedor;
3. atualizar `secrets` no GitHub;
4. registrar incidente e impacto;
5. reexecutar scanner de segredos;
6. avaliar reescrita de histórico Git quando aplicável.

---

## Regra final

Se houver dúvida entre velocidade de publicação e redução de risco:
- priorizar redução de risco.
