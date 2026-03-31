# Estado Atual de Produção

## Banco
- novo banco Supabase conectado;
- migrations aplicadas com sucesso;
- dados principais presentes.

## Produção Vercel
- deploy funcional;
- domínio principal:
  - `https://vale-gamma.vercel.app`

## Variáveis críticas
Devem existir e estar corretas:
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

## Admin
- usuário `admin@verdevale.com` existente;
- `role = admin`;
- `isActive = true`;
- hash funcional validado;
- login funcionando em produção.

## APIs validadas
- `/api/plans` respondendo corretamente em produção.

## Frontend
- cards de planos melhorados;
- bug do badge corrigido;
- render público operacional.

## Ponto importante
Produção está funcional, mas ainda não está na fase final de hardening. O sistema saiu do modo de recuperação emergencial e entrou em fase de estabilização e endurecimento.
