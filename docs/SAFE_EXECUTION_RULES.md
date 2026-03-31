# SAFE_EXECUTION_RULES.md

## Objetivo

Orientar agentes e desenvolvedores a continuar o projeto sem repetir erros do recovery.

---

## Regras

1. Sempre começar lendo:
   - `PROJECT_STATE.md`
   - `TASKS.md`
   - `DECISIONS.md`
   - `checkpoints/2026-03-31-deploy-recovery/00-README.md`

2. Não alterar banco, auth e CSP na mesma rodada sem evidência concreta.

3. Antes de qualquer deploy:
   - validar diff real;
   - validar commit real;
   - validar domínio certo;
   - validar produção após publish.

4. Não usar preview para validar auth final.

5. Não subir scripts temporários, dumps ou arquivos auxiliares locais.

6. Para novas tarefas:
   - fazer uma etapa por vez;
   - validar local;
   - publicar;
   - validar produção.

7. Prioridade atual:
   - limpeza;
   - hardening;
   - recuperação de senha/admin.

---

## Regra final

Se houver conflito entre conveniência e segurança, priorizar segurança.
