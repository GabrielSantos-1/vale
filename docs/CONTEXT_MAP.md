# CONTEXT_MAP.md

## Objetivo

Este documento funciona como o mapa de contexto do projeto.

Ele ajuda agentes de código e desenvolvedores a entender rapidamente:

- onde está cada informação
- qual documento governa qual área
- qual ordem de leitura correta

Este arquivo existe para evitar perda de contexto durante o desenvolvimento.

---

# Ordem recomendada de leitura

Antes de implementar qualquer funcionalidade, ler nesta ordem:

1. PROJECT_BRIEF.md
2. ARCHITECTURE.md
3. SECURITY_RULES.md
4. CODING_STANDARDS.md
5. UI_GUIDELINES.md
6. API_CONTRACTS.md
7. BACKLOG.md
8. TASKS.md
9. PROMPTING_RULES.md
10. DECISIONS.md

---

# Mapa de responsabilidade dos documentos

## PROJECT_BRIEF.md

Define:

- visão do produto
- objetivo do sistema
- identidade do projeto
- direcionamento estratégico

Este documento explica **o que estamos construindo e por quê**.

---

## ARCHITECTURE.md

Define:

- estrutura de diretórios
- organização do código
- responsabilidades de cada módulo
- divisão entre frontend, backend e domínio

Este documento governa **como o sistema deve ser estruturado**.

---

## SECURITY_RULES.md

Define:

- práticas obrigatórias de segurança
- proteção contra XSS
- proteção contra SQL Injection
- proteção contra IDOR
- tratamento de erros
- gestão de segredos

Este documento tem **prioridade máxima**.

---

## CODING_STANDARDS.md

Define:

- convenções de código
- nomenclatura
- organização de arquivos
- padrões de commits
- regras de legibilidade

Este documento governa **qualidade e consistência do código**.

---

## UI_GUIDELINES.md

Define:

- identidade visual
- paleta de cores
- tipografia
- layout
- componentes base
- responsividade

Este documento governa **interface e experiência visual**.

---

## API_CONTRACTS.md

Define:

- endpoints do sistema
- formato de requisição
- formato de resposta
- padrões de erro

Este documento governa **comunicação entre frontend e backend**.

---

## BACKLOG.md

Define:

- roadmap do projeto
- organização por sprints
- macro tarefas

Este documento governa **planejamento do desenvolvimento**.

---

## TASKS.md

Define:

- tarefas ativas
- progresso atual
- checklist de execução

Este documento governa **estado atual do projeto**.

---

## PROMPTING_RULES.md

Define:

- boas práticas de interação com IA
- estratégia de prompts
- forma correta de solicitar tarefas

Este documento governa **interação com agentes de código**.

---

## DECISIONS.md

Define:

- decisões arquiteturais
- mudanças importantes
- justificativas técnicas

Este documento governa **histórico de decisões do projeto**.

---

# Mapa da estrutura do projeto


project-root/

AGENTS.md
README.md

docs/
CONTEXT_MAP.md
PROJECT_BRIEF.md
ARCHITECTURE.md
SECURITY_RULES.md
CODING_STANDARDS.md
BACKLOG.md
TASKS.md
API_CONTRACTS.md
UI_GUIDELINES.md
PROMPTING_RULES.md
DECISIONS.md


---

# Fluxo correto de desenvolvimento

1. ler PROJECT_BRIEF.md
2. entender arquitetura
3. verificar regras de segurança
4. seguir padrões de código
5. consultar backlog
6. executar tarefa atual

---

# Regra importante

Nenhuma implementação deve:

- ignorar arquitetura
- ignorar regras de segurança
- quebrar padrões visuais
- ignorar backlog atual

---

# Regra de conflito

Se dois documentos entrarem em conflito:

1. SECURITY_RULES.md tem prioridade
2. ARCHITECTURE.md vem em seguida
3. CODING_STANDARDS.md vem depois
4. UI_GUIDELINES.md governa aparência
5. BACKLOG.md governa execução

---

# Diretriz final

Este arquivo existe para manter **consistência, previsibilidade e estabilidade do projeto**.

Sempre consultar este mapa antes de implementar mudanças grandes.