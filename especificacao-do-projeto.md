# Gods League - Especificacao do Projeto

## Introducao

A AdBangu realiza anualmente um campeonato de futebol para jovens em formato de pontos corridos, envolvendo matriz e setores. Historicamente, as informacoes da competicao ficaram dispersas em WhatsApp, papel e comunicacao verbal.

A plataforma **Gods League** centraliza a operacao com:
- **Site publico** para divulgacao oficial.
- **Painel administrativo (dashboard)** para gestao por perfil, com foco operacional no `admin_master`.

---

## Problema

Principais dores que o projeto resolve:
- Falta de local unico para regulamento, jogos, classificacao, times e estatisticas.
- Ausencia de historico confiavel por temporada.
- Cadastro de times e jogadores sem padronizacao central.
- Dificuldade de validar se estatisticas e jogadores estao corretos.
- Baixa rastreabilidade das alteracoes da competicao.

---

## Objetivos

### Objetivo Geral

Disponibilizar uma plataforma web para publicar, operar e auditar o campeonato de jovens da AdBangu.

### Objetivos Especificos

- Publicar dados oficiais em paginas publicas de facil consulta.
- Concentrar operacao administrativa no painel do `admin_master`.
- Garantir login sem auto-cadastro.
- Manter historico por temporada e vinculo consistente entre jogos, times, jogadores e estatisticas.

---

## Escopo Atual Implementado

## Site Publico
Rotas publicas implementadas:
- `/` (Inicio)
- `/classificacao`
- `/times`
- `/estatisticas`

Funcionalidades implementadas:
- Home com:
  - times inscritos;
  - tabela de jogos (rodada, data, horario, mandante e visitante);
  - resumo MVP (Top 3: artilheiro, assistente, defesas, cartoes, drible).
- Classificacao por pontos baseada em resultados de partidas (`homeGoals`, `awayGoals`).
- Lista de todos os times da temporada ativa.
- Estatisticas detalhadas com filtro por categoria:
  - `gols`
  - `chute_a_gol`
  - `defesas`
  - `goleiro`
  - `cartoes`
  - `mvp_jogo`
  - `mvp_rodada`

## Autenticacao e Controle de Acesso

- Login por e-mail/senha (Firebase Auth).
- Sem cadastro publico.
- Guards:
  - `guestGuard` em `/login`;
  - `authGuard` + `roleGuard` em `/dashboard`.
- Perfis aceitos:
  - `time`
  - `admin_master`

Fontes de permissao aceitas no app:
1. `users/{uid}`
2. `admin_users/{uid}` (compatibilidade)

Mapeamento de `admin_users.tipo`:
- `MASTER` -> `admin_master`
- `ADMIN` -> `admin_master`

## Dashboard Administrativo

- Rota `/dashboard` sem barra superior global.
- Layout com barra lateral propria.
- Secoes implementadas:
  - Visao geral.
  - Usuarios admin (listar/cadastrar).
  - Temporadas (criar/ativar).
  - Times (adicionar/remover/editar por salvar com mesmo ID).
  - Jogadores (adicionar/remover/editar).
  - Tabela/Jogos (cadastrar confrontos).
  - Resultados (placar + estatisticas por jogador por partida).
  - MVP Estatisticas (Top 3 por categoria para `mvp_summary`).

Observacao:
- O formulario de usuario admin escreve em `admin_users`.
- Criacao de conta no Firebase Authentication continua sendo etapa separada (console/admin backend).

---

## Regras de Negocio

- Nao existe auto-cadastro publico.
- Dados oficiais do campeonato sao publicados/operados pelo `admin_master`.
- Operacao de rotina (temporadas, times, jogos, resultados, MVP) deve ser feita no dashboard.
- Cada estatistica deve estar vinculada a jogador existente.
- Jogadores validos para ranking/publicacao: `status` vazio, `validado` ou `validated`.
- Deve existir uma temporada ativa em `seasons` para renderizacao correta da home.

---

## Modelo de Dados (Firestore)

Colecoes usadas pelo sistema:
- `admin_users`
- `users`
- `seasons`
- `teams`
- `players`
- `matches`
- `mvp_summary`

Campos relevantes por colecao:
- `seasons`: `name`, `year`, `active`
- `teams`: `name`, `shieldUrl`, `seasonId`, `active`
- `players`: `name`, `teamId`, `status`, campos de estatistica (`gols`, `chute_a_gol`, `defesas`, `goleiro`, `cartoes`, `mvp_jogo`, `mvp_rodada`)
- `matches`: `seasonId`, `round`, `date`, `time`, `homeTeamId`, `awayTeamId`, `homeGoals`, `awayGoals`, `playerStats[]`
- `mvp_summary`: `seasonId`, `category`, `rankings[]`

Categorias MVP aceitas:
- `artilheiro`
- `assistente`
- `defesas`
- `cartoes`
- `drible`

---

## Stack Tecnica

- Frontend: Angular 21 (standalone components)
- Backend: Firebase
- Banco: Cloud Firestore
- Auth: Firebase Authentication
- Storage: Firebase Storage
- Hosting: Firebase Hosting

---

## Requisitos Nao Funcionais

- Interface responsiva (desktop/mobile)
- Tema escuro como base visual
- Controle de acesso por perfil
- Persistencia em nuvem
- Disponibilidade para consulta publica

---

## Criterios de Aceite Atualizados

- Visitante acessa Inicio, Classificacao, Times e Estatisticas sem login.
- Home exibe times, jogos e resumo MVP com dados reais do Firestore.
- Classificacao e calculada por pontos com base nos resultados cadastrados.
- Usuario logado visualiza menu de perfil com acesso ao painel administrativo.
- Em `/dashboard`, navegacao ocorre por barra lateral e sem topbar publica.
- `admin_master` consegue operar usuarios admin, temporadas, times, jogadores, jogos, resultados e MVP.

---

## Fora do Escopo (ate o momento)

- Cadastro aberto ao publico.
- Aplicativo mobile nativo.
- Pagamentos.
- Integracoes externas de arbitragem/video.
