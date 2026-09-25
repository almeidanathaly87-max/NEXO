# Nexo - Login e Perfis

## Como executar

1. Instale o Node.js.
2. Abra o terminal nesta pasta.
3. Execute:

```bash
npm install
npm start
```

4. Abra no navegador:

http://localhost:3000

## Fluxo

- Criar conta -> cria a conta principal.
- Primeiro acesso -> tela "Quem está acessando?" sem perfis.
- Criar perfil -> nome + avatar.
- Depois o perfil aparece na seleção.
- É possível adicionar até 6 perfis.
- Cada perfil pode ser selecionado e abre a página principal.
- Também existe opção para excluir perfis.

Os dados ficam em `data/usuarios.json` e as sessões em `data/sessoes.json`.

Para produção, recomenda-se trocar JSON por banco de dados e usar cookies de sessão HttpOnly/HTTPS.
