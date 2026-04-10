# Contributing

Obrigado por contribuir com o projeto Vale.

## Fluxo de contribuição

1. Abra uma issue antes de implementar mudanças relevantes.
2. Crie branch a partir de `main`.
3. Mantenha mudanças pequenas, coesas e com objetivo claro.
4. Envie Pull Request com contexto técnico e evidências de validação.

## Requisitos mínimos para PR

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build` (quando aplicável à alteração)

Inclua no PR:

- resumo do problema e da solução
- impacto em segurança (se houver)
- impacto em contratos/API (se houver)
- riscos e plano de rollback (quando relevante)

## Regras de qualidade

- Não commitar segredos, credenciais, tokens ou dados reais.
- Não incluir arquivos temporários/caches no versionamento.
- Preservar arquitetura e separação de camadas do projeto.
- Evitar alterações fora de escopo.

## Segurança

Para reportar vulnerabilidades, **não abra issue pública**.
Siga a política em `SECURITY.md`.
