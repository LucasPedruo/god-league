# God League - Documentação do Projeto (Sistema)

Atualização: 04 de março de 2026

## 1) Objetivo deste Documento

Este documento descreve **como o projeto funciona tecnicamente**: arquitetura, fluxos, permissões, dados, rotas e operação.

Não é regulamento esportivo da competição. Para regulamentos, consultar:

- `regulamento-god-league-geral.md` (escopo macro da liga)
- `regulamento-ujadb-god-league.md` (escopo operacional UJADB)

## 2) Visão Geral do Sistema

O sistema God League é uma plataforma web composta por:

1. **Área pública** para consulta oficial da competição.
2. **Área administrativa** para operação da temporada.

Objetivo principal:

- centralizar informações;
- reduzir operação informal;
- garantir rastreabilidade e consistência dos dados.

## 3) Stack Tecnológica

- Frontend: Angular (standalone components)
- Autenticação: Firebase Authentication
- Banco: Cloud Firestore
- Arquivos de mídia: Firebase Storage
- Publicação: Firebase Hosting

## 4) Estrutura de Acesso e Perfis

### 4.1 Perfis de usuário

- `visitante`: acesso somente às rotas públicas.
- `time`: acesso autenticado conforme regras liberadas.
- `admin_master`: administração completa da operação.

### 4.2 Regras de autenticação

- Sem auto-cadastro público.
- Login por e-mail/senha (Firebase Auth).
- Rotas protegidas por guards de autenticação e papel.

### 4.3 Fontes de permissões aceitas

Compatibilidade em duas coleções:

1. `users/{uid}`
2. `admin_users/{uid}`

Mapeamento herdado para `admin_users.tipo`:

- `MASTER` => `admin_master`
- `ADMIN` => `admin_master`

## 5) Rotas do Frontend

### 5.1 Rotas públicas

- `/` página de abertura (Em breve)
- `/liga` página principal da liga
- `/regras` regulamento público da edição (atualmente UJADB)
- `/classificacao`
- `/times`
- `/estatisticas`
- `/login`

### 5.2 Rotas protegidas

- `/dashboard` (exige autenticação + perfil permitido)

### 5.3 Rota de fallback

- `**` página 404

## 6) Módulos Funcionais

### 6.1 Módulos públicos

- Home da liga com times, tabela e resumo de estatísticas.
- Classificação por pontuação a partir dos resultados cadastrados.
- Página de times.
- Estatísticas detalhadas por categoria.
- Página de regras da competição.

### 6.2 Módulos administrativos

- Gestão de usuários admin.
- Gestão de temporadas (criação e ativação).
- Gestão de times.
- Gestão de jogadores.
- Gestão de jogos/tabela.
- Lançamento de resultados.
- Consolidação de MVP/resumos por categoria.

## 7) Modelo de Dados (Firestore)

Coleções principais:

- `admin_users`
- `users`
- `seasons`
- `teams`
- `players`
- `matches`
- `mvp_summary`

### 7.1 `seasons`

Campos usuais:

- `name`
- `year`
- `active` (boolean)

Regra crítica: deve existir uma temporada ativa para publicação completa dos dados públicos.

### 7.2 `teams`

Campos usuais:

- `name`
- `shieldUrl`
- `seasonId`
- `active`

### 7.3 `players`

Campos usuais:

- `name`
- `teamId`
- `status`
- estatísticas acumuladas por categoria

Observação operacional: publicação de rankings considera jogadores válidos conforme regra de status adotada no sistema.

### 7.4 `matches`

Campos usuais:

- `seasonId`
- `round`
- `date`
- `time`
- `homeTeamId`
- `awayTeamId`
- `homeGoals`
- `awayGoals`
- `playerStats[]`

### 7.5 `mvp_summary`

Campos usuais:

- `seasonId`
- `category`
- `rankings[]`

## 8) Regras de Negócio do Sistema

- Não permitir auto-cadastro de usuários externos.
- Operação crítica concentrada no dashboard administrativo.
- Dados públicos devem ser lidos do Firestore (sem dados mock em produção).
- Estatísticas e MVP devem referenciar jogadores existentes e válidos.
- Publicação pública deve respeitar temporada ativa.

## 9) Categorias de Estatísticas

### 9.1 Resumo MVP (home)

- `artilheiro`
- `assistente`
- `defesas`
- `cartoes`
- `drible`

### 9.2 Estatística detalhada

- `gols`
- `chute_a_gol`
- `defesas`
- `goleiro`
- `cartoes`
- `mvp_jogo`
- `mvp_rodada`

## 10) Fluxo Operacional Recomendado

1. Criar temporada.
2. Marcar temporada ativa.
3. Cadastrar/atualizar times da temporada.
4. Cadastrar jogadores por time.
5. Publicar tabela de jogos.
6. Lançar resultados por rodada.
7. Atualizar estatísticas e resumos.
8. Validar classificação pública.

## 11) Critérios de Qualidade e Governança

- Rastreabilidade de mudanças no painel.
- Consistência entre jogos, placares e classificação.
- Consistência entre estatísticas e vínculo do jogador.
- Clareza de comunicação no frontend público.
- Atualização contínua da documentação.

## 12) Estrutura de Documentação do Repositório

Documentos de referência:

1. `regulamento-god-league-geral.md`
2. `regulamento-ujadb-god-league.md`
3. `especificacao-do-projeto.md` (este arquivo)
4. `firebase-setup.md`
5. `agente.md`

## 13) Fora de Escopo Atual

- Cadastro público aberto.
- Aplicativo mobile nativo.
- Pagamentos.
- Integrações avançadas de arbitragem por vídeo.

