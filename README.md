# God League Repository

Repositório principal do projeto **God League**, com o site web e documentação oficial.

## Estrutura

- `gods-league-web/`: aplicação Angular (site público + dashboard administrativo).
- `doc/`: documentação funcional e regulamentos da competição.

## Documentação

- `doc/regulamento-god-league-geral.md`: regulamento macro da God League (inter igrejas e inter denominações).
- `doc/regulamento-ujadb-god-league.md`: regulamento operacional da edição UJADB usando o mesmo sistema.
- `doc/especificacao-do-projeto.md`: documentação técnica e funcional do sistema.

## Aplicação Web

Projeto Angular localizado em `gods-league-web/` com:

- rotas públicas (`/`, `/liga`, `/regras`, `/classificacao`, `/times`, `/estatisticas`);
- autenticação;
- dashboard administrativo em `/dashboard`.

## Como rodar localmente

No diretório `gods-league-web/`:

```bash
npm install
npm start
```

