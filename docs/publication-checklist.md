# publication-checklist.md

## Checklist GO / NO-GO

- [~] Segredos rotacionados
- [~] Historico revisado ou limpo
- [x] Docs sensiveis removidos/sanitizados
- [x] README profissional criado
- [x] .env.example limpo
- [~] Nenhum dado real no repo
- [~] Branch protection ativa

## Evidencias por etapa

### Etapa 0
- auditoria estrutural e mapa de risco executados

### Etapa 1
- higiene de configuracao revisada em `HEAD`
- segredos reais nao versionados no estado atual

### Etapa 2
- historico com indicio confirmado de exposicao antiga
- plano de limpeza/rotacao necessario quando for publicar

### Etapa 3
- docs internos e checkpoints removidos da superficie publica

### Etapa 4
- `README.md` reescrito para portfolio tecnico publico

### Etapa 5
- seed validado por env obrigatoria
- placeholders e contato publico sanitizados

### Etapa 6
- workflows auditados
- runbook manual de branch protection e seguranca criado em `docs/GITHUB_PUBLICATION_RUNBOOK.md`

## Pendencias manuais (fora do repo)

1. ativar Code scanning na UI do GitHub (se ainda desativado)
2. ativar Secret scanning e Push protection
3. configurar Branch protection em `main` com checks obrigatorios
4. confirmar rotacao real de segredos no provedor e no GitHub
