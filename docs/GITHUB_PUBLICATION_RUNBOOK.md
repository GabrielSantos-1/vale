# GITHUB_PUBLICATION_RUNBOOK.md

## Objetivo

Passo a passo manual para finalizar governanca no GitHub antes de tornar o repositorio publico.

## 1) Habilitar Code Scanning

1. Ir em `Settings` > `Security and analysis`.
2. Em `Code scanning`, clicar em `Set up`.
3. Selecionar `CodeQL` e manter o workflow versionado em `.github/workflows/codeql.yml`.
4. Confirmar que o primeiro run cria o check `Analyze (javascript-typescript)`.

## 2) Habilitar Secret Scanning e Push Protection

1. Em `Settings` > `Security and analysis`:
   - habilitar `Secret scanning`
   - habilitar `Push protection`
2. Confirmar que alertas aparecem na aba `Security`.

## 3) Configurar Branch Protection em `main`

1. Ir em `Settings` > `Branches`.
2. Criar regra para branch `main`.
3. Marcar:
   - `Require a pull request before merging`
   - `Require approvals` (minimo: 1)
   - `Require status checks to pass before merging`
   - `Do not allow bypassing the above settings` (recomendado)
4. Selecionar checks obrigatorios:
   - `Test and Build`
   - `Gitleaks`
   - `Analyze (javascript-typescript)`
5. Salvar regra.

## 4) Verificar permissao de workflow

1. Em `Settings` > `Actions` > `General`, confirmar permissoes padrao para leitura de conteudo.
2. Garantir que o workflow `CodeQL` mantenha `security-events: write` (ja definido no YAML).

## 5) Configurar secrets obrigatorios do repositorio

1. Ir em `Settings` > `Secrets and variables` > `Actions`.
2. Garantir presenca dos segredos:
   - `NEXTAUTH_SECRET`
   - `AUTH_SECRET`
   - `DATABASE_URL`
   - `E2E_ADMIN_EMAIL`
   - `E2E_ADMIN_PASSWORD`
3. Confirmar que os valores foram rotacionados recentemente.

## 6) Validacao final antes de abrir publico

1. Abrir um PR de teste e validar checks verdes.
2. Confirmar que `Security` nao mostra bloqueios criticos sem plano.
3. Somente depois alterar visibilidade para publico.
