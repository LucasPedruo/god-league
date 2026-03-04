# Firebase Setup (leigo) - estado atual do projeto

Este guia explica o que precisa estar no Firebase para o sistema atual funcionar.

## Objetivo
- Site publico com dados reais.
- Painel administrativo (`/dashboard`) para operacao do campeonato.

## Importante
- O Firestore e a base de dados.
- A operacao diaria deve ser feita pelo dashboard do master.
- Nao use Firestore manualmente como rotina, exceto bootstrap/correcao.

---

## 1) O que voce ja possui (ok)
Colecoes existentes no `(default)`:
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

Nao precisa apagar as colecoes antigas do outro sistema.

---

## 2) Login e permissao

## Authentication
- Ativar `Email/Password`.
- Criar usuarios no Firebase Authentication.

## Permissao (aceita 2 formatos)
1. `users/{uid}`
2. `admin_users/{uid}` (compatibilidade)

No seu caso atual, `admin_users` com:
- `tipo = MASTER` ou `ADMIN`
- `ativo = true`

ja libera acesso administrativo.

Observacao critica:
- O ID do documento deve ser o mesmo `UID` do usuario no Authentication.

---

## 3) Colecoes usadas pelo app

## `seasons`
Exemplo:
```json
{
  "name": "Temporada 2026",
  "year": 2026,
  "active": true
}
```

Regra: manter apenas 1 temporada ativa.

## `teams`
Exemplo:
```json
{
  "name": "Matriz FC",
  "shieldUrl": "https://...",
  "seasonId": "season_2026",
  "active": true
}
```

## `players`
Exemplo:
```json
{
  "name": "Lucas Silva",
  "teamId": "team_matriz",
  "status": "validado",
  "gols": 7,
  "chute_a_gol": 12,
  "defesas": 0,
  "goleiro": 0,
  "cartoes": 1,
  "mvp_jogo": 2,
  "mvp_rodada": 1
}
```

## `matches`
Exemplo:
```json
{
  "seasonId": "season_2026",
  "round": 1,
  "date": "2026-03-15",
  "time": "15:00",
  "homeTeamId": "team_matriz",
  "awayTeamId": "team_esperanca",
  "homeGoals": 2,
  "awayGoals": 1,
  "playerStats": [
    {
      "playerId": "player_lucas",
      "gols": 1,
      "chute_a_gol": 3,
      "defesas": 0,
      "goleiro": 0,
      "cartoes": 0,
      "mvp_jogo": 1,
      "mvp_rodada": 0
    }
  ]
}
```

## `mvp_summary`
Exemplo:
```json
{
  "seasonId": "season_2026",
  "category": "artilheiro",
  "rankings": [
    { "playerId": "player_lucas", "value": 7 },
    { "playerId": "player_pedro", "value": 5 },
    { "playerId": "player_gabriel", "value": 4 }
  ]
}
```

Categorias permitidas (`category`):
- `artilheiro`
- `assistente`
- `defesas`
- `cartoes`
- `drible`

---

## 4) O que o site publico mostra

Rotas publicas:
- `/` Inicio
- `/classificacao`
- `/times`
- `/estatisticas`

Dependencias:
- Home usa `seasons`, `teams`, `matches`, `players`, `mvp_summary`.
- Classificacao depende de `homeGoals` e `awayGoals` em `matches`.
- Estatisticas avancadas usam campos de estatistica em `players`.

---

## 5) O que o dashboard master opera

No `/dashboard`, o master administra:
- usuarios admin
- temporadas
- times
- jogadores
- tabela/jogos
- resultados por partida
- MVP de estatisticas

---

## 6) Checklist rapido

- [ ] Email/Password ativo.
- [ ] Usuario master criado no Authentication.
- [ ] Documento `admin_users/{uid}` do master com `tipo: MASTER` e `ativo: true`.
- [ ] Existe 1 temporada ativa.
- [ ] Times cadastrados para a temporada ativa.
- [ ] Jogos cadastrados.
- [ ] Resultados preenchidos (placar) para classificacao.
- [ ] Jogadores com estatisticas preenchidas.
- [ ] `mvp_summary` com Top 3 por categoria.

---

## 7) Seguranca

- Nao armazenar senha em Firestore.
- Senha deve ficar apenas no Firebase Authentication.
- Firestore Rules devem permitir leitura publica somente do necessario para o site.
- Escrita administrativa deve ficar restrita a usuarios admin/master.
