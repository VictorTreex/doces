# Como Configurar o Administrador

## Dados da Conta Admin
- **Email**: admindoces@admin.com
- **Senha**: valdivitor123

## Problema
Você criou uma conta mas não consegue acessar o painel admin porque falta a permissão de administrador no banco de dados.

## Solução

### Passo 1: Crie a Conta na Aplicação
1. Acesse: http://localhost:8080/admin
2. Clique em "Criar conta"
3. Use os dados:
   - Email: admindoces@admin.com
   - Senha: valdivitor123

### Passo 2: Acesse o Painel do Supabase
1. Vá para https://supabase.com/dashboard
2. Entre na sua conta
3. Selecione seu projeto (npszxmwibblroncjixes)

### Passo 3: Encontre seu User ID
1. No menu lateral, vá em **Authentication** > **Users**
2. Encontre a conta: admindoces@admin.com
3. Copie o **ID** do usuário (UUID)

### Passo 4: Execute o SQL
1. No menu lateral, vá em **SQL Editor** > **New query**
2. Cole e execute o seguinte comando, substituindo `SEU_USER_ID_AQUI` pelo ID copiado:

```sql
INSERT INTO public.user_roles (user_id, role) 
VALUES ('SEU_USER_ID_AQUI', 'admin');
```

### Passo 5: Verifique
Execute este SQL para confirmar:

```sql
SELECT ur.*, u.email 
FROM public.user_roles ur 
JOIN auth.users u ON ur.user_id = u.id 
WHERE ur.role = 'admin';
```

### Passo 6: Teste
1. Faça logout da sua aplicação
2. Faça login novamente com: admindoces@admin.com / valdivitor123
3. Acesse `/admin`

## Exemplo Prático
Se o user_id encontrado for `12345678-1234-1234-1234-123456789012`:

```sql
INSERT INTO public.user_roles (user_id, role) 
VALUES ('12345678-1234-1234-1234-123456789012', 'admin');
```

## Troubleshooting
- **Erro de permissão**: Verifique se você está usando a chave correta do projeto
- **User ID não encontrado**: Confirme que o usuário existe em Authentication > Users
- **Já existe admin**: Verifique na tabela user_roles se já não há um registro
