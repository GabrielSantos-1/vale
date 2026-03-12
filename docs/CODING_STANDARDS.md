
# Arquivo: `docs/CODING_STANDARDS.md`

Copie **apenas o bloco abaixo**.

```md
# CODING_STANDARDS.md

## Objetivo

Definir padrões de código para manter consistência e legibilidade.

---

## Linguagem

TypeScript obrigatório.

Strict mode habilitado.

---

## Regras gerais

1. Código deve ser legível.
2. Evitar complexidade desnecessária.
3. Evitar arquivos gigantes.
4. Evitar duplicação.
5. Preferir funções pequenas.
6. Nomear variáveis de forma semântica.

---

## Convenções de nomes

### Componentes React

PascalCase

Exemplo:

HeroSection

---

### Arquivos utilitários

kebab-case

Exemplo:

format-date.ts

---

### Funções

camelCase

Exemplo:

createLead

---

### Constantes

UPPER_SNAKE_CASE quando globais.

---

### Schemas

NomeSchema

Exemplo:

LeadSchema

---

### Tipos

NomeType ou NomeDTO

---

## Estrutura de componentes

Componentes devem:

- ser pequenos
- ter responsabilidade clara
- evitar lógica pesada

Separar:

- UI
- lógica
- validação

---

## Server vs Client

Usar Server Components por padrão.

Adicionar `"use client"` apenas quando necessário.

---

## Formulários

Regras:

- validar no client
- validar novamente no server
- não confiar apenas no frontend

---

## API

Endpoints devem:

- validar input
- retornar resposta consistente
- tratar erros

---

## Banco

Regras:

- usar migrations
- evitar queries raw
- usar Prisma

---

## Comentários

Comentários devem explicar:

- intenção
- decisões
- complexidade

Evitar comentários óbvios.

---

## Commits

Padrão sugerido:

feat: nova funcionalidade  
fix: correção de bug  
refactor: refatoração  
style: ajustes visuais  
docs: documentação  
test: testes  
chore: manutenção  
security: correção de segurança

---

## Dependências

Evitar dependências desnecessárias.

Preferir:

- soluções simples
- bibliotecas maduras
- baixo impacto de bundle

---

## Regra final

Priorizar:

legibilidade  
consistência  
segurança  
manutenção futura