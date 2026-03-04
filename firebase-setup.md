# Firebase Setup (leigo) - fluxo real do Gods League

Este guia foi ajustado para o que voce definiu:
- `sessoes`, `temporadas`, `times`, `jogadores`, `jogos` e `resumo MVP` devem ser criados no **dashboard do administrador master**.
- Nao e para ficar cadastrando tudo manualmente no Firestore no dia a dia.

## 1) O que ja existe no seu banco

Voce ja criou no `(default)`:
- `admin_cronograma`
- `admin_events`
- `admin_users`
- `inscricoes_acampamento_maio`
- `matches`
- `mvp_summary`
- `players`
- `seasons`
- `teams`
- `users`

Perfeito. Nao precisa apagar nada.

---

## 2) Como o sistema vai entender permissao (importante)

O sistema agora aceita 2 fontes para permissao:

1. `users/{uid}` (padrao novo)
2. `admin_users/{uid}` (compatibilidade com o que voce ja usa)

No seu caso atual, `admin_users` ja funciona com:
- `tipo: "MASTER"` ou `"ADMIN"`
- `ativo: true`

Mapeamento no sistema:
- `MASTER` => acesso de `admin_master`
- `ADMIN` => acesso de `admin_master`

Ou seja: seus admins atuais ja podem entrar e gerenciar pelo dashboard.

---

## 3) Regra operacional (como usar no dia a dia)

Depois do bootstrap inicial, o fluxo correto e:

1. Master faz login.
2. Master cria/edita temporada no dashboard.
3. Master cadastra times no dashboard.
4. Master cria sessoes/jogos no dashboard.
5. Master valida jogadores no dashboard.
6. Master publica resumo MVP no dashboard.

Firestore fica como base de dados, nao como tela principal de operacao.

---

## 4) Bootstrap minimo (uma vez so)

## A) Authentication
- Ativar `Email/Password` no Firebase Authentication.
- Criar usuarios manualmente (master/admin/time).

## B) admin_users (se voce continuar usando esse modelo)
Documento: `admin_users/{uid}`

Exemplo real do seu padrao:
```json
{
  "ativo": true,
  "email": "larissa@gmail.com",
  "nome": "lari",
  "tipo": "MASTER"
}
```

Tambem aceita:
- `tipo: "ADMIN"`

Observacao de seguranca:
- Nao salve `senha` no Firestore.
- Senha deve existir somente no Firebase Authentication.

## C) Temporada ativa
Precisa ter 1 temporada com `active: true` em `seasons`.

Exemplo:
```json
{
  "name": "Temporada 2026",
  "year": 2026,
  "active": true
}
```

---

## 5) Estrutura das colecoes usadas pela Home

A Home le estas colecoes:
- `seasons`
- `teams`
- `matches`
- `players`
- `mvp_summary`

Categorias aceitas em `mvp_summary.category`:
- `artilheiro`
- `assistente`
- `defesas`
- `cartoes`
- `drible`

---

## 6) Checklist rapido

- [ ] Email/Password ativo no Authentication.
- [ ] Usuario master existe e consegue logar.
- [ ] Em `admin_users/{uid}`, o master esta com `tipo: MASTER` e `ativo: true`.
- [ ] Existe 1 temporada ativa em `seasons`.
- [ ] Times, jogos, jogadores e MVP sendo alimentados pelo dashboard do master.
- [ ] Nao salvar senha em colecao do Firestore.

---

## 7) Nomes exatos de colecao

Use exatamente estes nomes:
- `admin_users`
- `seasons`
- `teams`
- `matches`
- `players`
- `mvp_summary`
- `users` (opcional para migracao futura)
