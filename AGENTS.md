# AGENTS.md

## Leitura obrigatória antes de qualquer alteração

Antes de criar, editar, remover ou refatorar qualquer arquivo deste projeto, leia nesta ordem:

1. README.md
2. docs/PROJECT_BRIEF.md
3. docs/ARCHITECTURE.md
4. docs/SECURITY_RULES.md
5. docs/CODING_STANDARDS.md
6. docs/BACKLOG.md
7. docs/TASKS.md
8. docs/API_CONTRACTS.md
9. docs/UI_GUIDELINES.md
10. docs/PROMPTING_RULES.md
11. docs/DECISIONS.md

Se houver conflito entre arquivos:
- SECURITY_RULES.md tem prioridade sobre qualquer decisão de implementação
- ARCHITECTURE.md tem prioridade sobre convenções locais
- CODING_STANDARDS.md define o estilo obrigatório
- BACKLOG.md e TASKS.md definem a execução atual
- DECISIONS.md registra exceções aprovadas

---

## Objetivo do projeto

Este projeto implementa o site Verde Vale 2.0, um redesign completo de um provedor de internet fibra óptica com estética Cyber-Professional / SaaS High-End.

O foco é:
- performance
- SEO
- responsividade real
- visual premium
- arquitetura escalável
- segurança desde a base
- código legível e sustentável

---

## Stack obrigatória

### Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React

### Backend
- Next.js Route Handlers
- TypeScript

### Banco
- PostgreSQL

### ORM
- Prisma

### Validação
- Zod

### Autenticação
- Auth.js com sessão baseada em cookie HttpOnly

### Testes
- Vitest
- Playwright

Não trocar a stack sem registrar em `docs/DECISIONS.md`.

---

## Regras obrigatórias de segurança

1. Nunca confiar em input do cliente.
2. Toda entrada deve ser validada no servidor com Zod.
3. Nunca usar `dangerouslySetInnerHTML`.
4. Nunca usar `localStorage`, `sessionStorage` ou `window` storage para token de autenticação.
5. Nunca concatenar SQL manualmente com input do usuário.
6. Nunca expor stack trace, erro interno de banco ou segredo ao cliente.
7. Toda rota administrativa deve exigir autenticação e autorização.
8. Toda mutação sensível deve seguir proteção contra CSRF quando baseada em cookie.
9. Aplicar headers de segurança.
10. Não criar endpoints sem validação, tratamento de erro e tipagem adequados.

---

## Regras obrigatórias de arquitetura

1. Server Components por padrão quando possível.
2. Usar `"use client"` somente quando necessário.
3. Separar UI, validação, acesso a dados e regras de negócio.
4. Não criar componentes gigantes.
5. Não criar abstrações desnecessárias cedo demais.
6. Não duplicar componentes se já existir base reutilizável.
7. Reutilizar design tokens e padrões visuais existentes.
8. Manter a estrutura de pastas definida em `docs/ARCHITECTURE.md`.

---

## Regras obrigatórias de UI/UX

1. O projeto é mobile-first.
2. O site deve funcionar bem em telas pequenas, médias e grandes.
3. A estética deve seguir o padrão Cyber-Minimalist / High-End.
4. Não usar fotos genéricas de banco de imagem.
5. Priorizar SVG, WebP, AVIF e imagens leves.
6. Tipografia deve seguir a combinação definida em `docs/UI_GUIDELINES.md`.
7. Tab bar inferior só deve existir em contexto mobile.
8. Desktop deve usar navegação tradicional apropriada.

---

## Proibições explícitas

Não faça:
- autenticação baseada em localStorage
- renderização de HTML arbitrário vindo do usuário
- SQL inseguro
- arquivos monolíticos enormes
- uso excessivo de dependências sem necessidade real
- efeitos visuais pesados que prejudiquem performance
- criação de páginas sem metadados básicos
- código com `any` sem justificativa real
- lógica crítica escondida apenas no frontend
- rotas sensíveis sem checagem de permissão

---

## Comportamento esperado do agente

Ao implementar algo:
1. Leia os arquivos de contexto.
2. Respeite a sprint atual.
3. Escolha a solução mais simples que atenda bem o problema.
4. Escolha a solução mais segura quando houver dúvida.
5. Priorize legibilidade e manutenção.
6. Não reestruture o projeto inteiro sem necessidade.
7. Em mudanças arquiteturais relevantes, registre em `docs/DECISIONS.md`.

---

## Estratégia de execução

Sempre trabalhar em incrementos pequenos e verificáveis.

Preferir esta ordem:
1. fundação
2. design system
3. páginas públicas
4. formulários
5. persistência
6. autenticação
7. admin
8. hardening
9. testes
10. refinamento

---

## Definition of Done resumido

Uma tarefa só está pronta quando:
- compila sem erro
- respeita a arquitetura
- respeita as regras de segurança
- respeita o padrão visual
- está tipada corretamente
- não quebra responsividade
- não introduz duplicação evitável
- possui tratamento de erro adequado
- está coerente com a sprint atual

---

## Instrução final

Se houver dúvida:
- prefira segurança
- prefira simplicidade
- prefira legibilidade
- prefira consistência com os documentos do projeto

Não improvise padrões fora do que foi definido.


## Regra obrigatória contra duplicação

Antes de criar qualquer arquivo, função ou componente:

1. verificar se o arquivo já existe
2. verificar se a função já existe
3. verificar se o componente já existe
4. reutilizar implementações existentes

É proibido:

- duplicar funções
- duplicar componentes
- duplicar imports
- duplicar testes

Se algo já existir, o agente deve **editar ou estender**, nunca recriar.

## Anti-Duplication Rule

Before creating any code the agent MUST:

1. search the project for existing implementation
2. reuse existing modules
3. never duplicate exports
4. never create a second implementation of the same function

If a function/component already exists:
the agent must EDIT it instead of creating a new one.