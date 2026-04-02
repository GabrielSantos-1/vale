# 02 - Entregas por etapa

## Etapa 1
- reforço de conversão e confiança em navbar/footer/quick actions;
- WhatsApp oficial atualizado para `5513996270950`;
- central/2ª via tratadas como preparação sem rota sensível.

## Etapa 2
- `/cobertura` resiliente a falha de banco com fallback comercial;
- mensagens seguras sem reflexão de input bruto.

## Etapa 3
- link "Esqueceu sua senha?" em `/admin/login`;
- validação de senha no reset alinhada ao server (`min 12` e complexidade);
- UX de retorno para login no fluxo recovery.

## Etapa 4
- criação de `/cliente/login` como placeholder público e seguro;
- separação explícita entre superfícies cliente e admin.

## Etapa 5
- rodapé institucional reforçado com links e contexto operacional.

## Etapa 6
- hardening API-first em `/api/contact`, `/api/leads`, `/api/coverage-check`, `/api/plans`;
- padronização de parse/erros/headers/correlation id;
- sanitização de saída em cobertura.

## Etapa 7
- novo `POST /api/events` com allowlist de eventos, rate limit e sem PII;
- instrumentação de CTAs, cobertura, contato e interesse em plano.

## Etapa 8
- revisão final de regressão e segurança básica;
- validações de build/start e rotas críticas.

## Hotfix pós-etapas
- correção do loop admin no `proxy.ts` removendo forçamento de `secureCookie` em ambiente local.