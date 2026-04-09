# PUBLIC_DOCS_POLICY.md

## Objetivo

Definir a fronteira entre documentação pública e documentação interna para evitar exposição operacional desnecessária.

---

## Documentação recomendada para público

Pode permanecer pública:

1. `README.md`
2. `docs/PROJECT_BRIEF.md`
3. `docs/ARCHITECTURE.md` (sanitizado)
4. `docs/API_CONTRACTS.md` (sem segredos e sem detalhes de infraestrutura interna)
5. `docs/SECURITY_RULES.md` (políticas, sem valores reais)
6. `docs/CODING_STANDARDS.md`
7. `docs/UI_GUIDELINES.md`

---

## Documentação recomendada para privado/sanitização forte

Recomenda-se remover de versão pública ou sanitizar agressivamente:

1. `docs/PROJECT_STATE.md`
2. `docs/TASKS.md`
3. `docs/BACKLOG.md`
4. `docs/checkpoints/**`
5. `AGENTS.md`
6. `docs/PROMPTING_RULES.md`
7. `docs/SAFE_EXECUTION_RULES.md`
8. documentos com:
   - nomes de host/infra;
   - incidentes detalhados;
   - janelas operacionais;
   - trilha de resposta interna.

---

## Regra de sanitização

Antes de publicar:

1. remover hostnames, IDs e rotas internas não públicas;
2. remover detalhes de incidentes com contexto operacional sensível;
3. manter apenas informação necessária para onboarding técnico externo;
4. manter evidências de segurança em nível de política, não em nível de detalhe operacional.
