# Regras para não quebrar o projeto

## 1. Não mexer em múltiplas camadas sensíveis ao mesmo tempo
Separar:
- banco;
- auth;
- CSP/headers;
- frontend;
- deploy.

## 2. Não publicar arquivos temporários
Nunca subir:
- dumps;
- scripts de hash temporários;
- arquivos de teste ad hoc;
- artefatos como `tsbuildinfo`;
- qualquer credencial ou saída sensível.

## 3. Confirmar antes de concluir
Antes de dizer que algo foi corrigido, validar:
- arquivo alterado;
- diff real;
- commit feito;
- push feito;
- deploy concluído;
- teste em produção.

## 4. Não confiar em preview para validar auth final
Usar o domínio real configurado em `NEXTAUTH_URL`.

## 5. Não mexer no banco sem necessidade
Banco novo está funcional. Alterações futuras devem ser controladas.

## 6. Não afrouxar segurança sem critério
Se flexibilizar CSP/headers:
- fazer de forma mínima;
- registrar a decisão;
- endurecer depois.

## 7. Ordem das próximas mudanças
1. limpeza;
2. hardening;
3. recuperação de senha/admin;
4. revisão fina de segurança.

## 8. Toda mudança futura deve preservar
- acesso admin funcional;
- APIs principais operacionais;
- compatibilidade com o banco novo;
- deploy limpo na Vercel.
