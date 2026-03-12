# Verde Vale 2.0

Redesign completo de um site de provedor de internet fibra óptica com estética Cyber-Professional / SaaS High-End, foco em performance, SEO, segurança e escalabilidade.

## Objetivo

Construir uma base moderna para presença digital premium de um provedor de fibra óptica, com capacidade de evoluir para:

- site institucional de alta conversão
- captação de leads
- consulta de cobertura
- gestão administrativa
- status de rede
- futura expansão para área do cliente

## Direção do projeto

Este projeto não é apenas uma landing page visualmente bonita.  
A meta é criar um produto com:

- visual técnico e premium
- responsividade real
- arquitetura sustentável
- segurança desde o início
- boa experiência em mobile e desktop
- potencial de crescimento sem reescrever tudo depois

## Stack

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

### Banco de dados
- PostgreSQL

### ORM
- Prisma

### Validação
- Zod

### Autenticação
- Auth.js com cookie HttpOnly

### Testes
- Vitest
- Playwright

## Documentação do projeto

Antes de alterar qualquer parte do sistema, leia:

1. `AGENTS.md`
2. `docs/PROJECT_BRIEF.md`
3. `docs/ARCHITECTURE.md`
4. `docs/SECURITY_RULES.md`
5. `docs/CODING_STANDARDS.md`
6. `docs/BACKLOG.md`

## Estrutura de documentação

```txt
AGENTS.md
README.md
docs/
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
Princípios obrigatórios

mobile-first real

segurança por padrão

validação server-side obrigatória

performance não opcional

SEO técnico desde a base

legibilidade acima de complexidade desnecessária

componentização consistente

evolução por sprint

Restrições importantes

não usar dangerouslySetInnerHTML

não usar tokens em localStorage

não usar SQL concatenado com input do usuário

não expor erro interno ao cliente

não criar páginas fora do padrão visual

não ignorar documentação do projeto

Status inicial

Fase atual:

documentação-base e blueprint do projeto

Próximo passo:

concluir documentação estrutural

inicializar Sprint 0

Público-alvo do produto

O site deve comunicar valor para:

usuários residenciais

usuários que buscam estabilidade

clientes exigentes em tecnologia

perfil que valoriza baixa latência, desempenho, suporte e confiabilidade

Identidade visual resumida

Dark mode profundo

Accent verde elétrico

Glassmorphism controlado

aparência limpa, tecnológica e premium

sem elementos visuais genéricos

Desenvolvimento assistido por IA

Este projeto foi estruturado para funcionar bem com agentes de código, mas o agente deve obedecer rigorosamente:

AGENTS.md

documentação em docs/

regras de arquitetura

regras de segurança

backlog por sprint

Observação importante

Qualquer mudança relevante de stack, arquitetura, segurança ou padrão visual deve ser registrada em docs/DECISIONS.md.