# O que foi feito

## 1. Troca do banco
- novo projeto Supabase criado;
- projeto local reconfigurado para apontar para o novo banco;
- ajuste de `DATABASE_URL` e `DIRECT_URL`.

## 2. Prisma e estrutura do banco
- `npx prisma generate` executado com sucesso;
- `npx prisma migrate status` usado para validar estado;
- `npx prisma migrate deploy` aplicado com sucesso;
- schema alinhado com o banco novo.

## 3. Build e estrutura
- `npm run build` passou localmente;
- rotas principais geradas sem falha de build.

## 4. Validação de dados
Foram validadas as tabelas principais:
- `AdminUser`
- `Plan`
- `FAQ`
- `CoverageArea`
- `NetworkStatus`
- `Lead`
- `ContactMessage`

## 5. Recuperação do admin
- usuário admin verificado no banco;
- `role` corrigida para `admin`;
- `isActive` confirmado como `true`;
- `passwordHash` redefinido e validado com bcrypt;
- login local recuperado.

## 6. Produção e env
- Vercel validada com:
  - `DATABASE_URL`
  - `DIRECT_URL`
  - `NEXTAUTH_URL`
  - `NEXTAUTH_SECRET`
- confirmação de coerência com o novo projeto Supabase;
- `/api/plans` em produção respondendo com os 5 planos.

## 7. Sessão e admin
- `/api/auth/session` inicialmente retornando `{}`;
- investigação do fluxo de autenticação/sessão;
- descarte de banco como causa principal;
- descoberta de bloqueio por CSP.

## 8. Correção de CSP
- política ajustada para permitir o runtime necessário;
- login/admin destravados em produção após redeploy.

## 9. Ajustes funcionais paralelos
- cards de planos melhorados;
- download/upload mais claros;
- bug do badge comercial corrigido no admin.
