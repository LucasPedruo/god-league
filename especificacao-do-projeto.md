# Gods League - Especificacao do Projeto

## Introducao

A AdBangu realiza anualmente um campeonato de futebol para jovens, em formato de pontos corridos, envolvendo a igreja matriz e seus setores. Hoje, grande parte da organizacao do campeonato acontece de forma descentralizada, com comunicacoes por WhatsApp, registros em papel e repasses verbais.

Esse modelo gera dificuldade para consultar informacoes basicas como regulamento, calendario, resultados, classificacao, elenco de cada time e estatisticas individuais dos jogadores. Tambem nao existe um historico consolidado por temporada, nem uma trilha auditavel de quem cadastrou ou alterou informacoes.

A **Gods League** surge como uma plataforma digital para centralizar a gestao e a divulgacao do campeonato, com duas frentes principais:

- **Site publico** para exibir informacoes oficiais da competicao.
- **Dashboard administrativo** para os times atualizarem seus dados, sob controle de acesso do administrador master.

---

## Problema

A operacao atual do campeonato apresenta os seguintes desafios:

- Informacoes oficiais (regras, rodadas, local de jogos, horarios e resultados) ficam dispersas em diferentes canais.
- Nao existe um repositorio unico e confiavel para consulta historica de temporadas.
- Cadastro de times e jogadores ocorre sem padrao unico, com risco de dados inconsistentes.
- Nao ha validacao central clara para confirmar se um jogador esta devidamente vinculado ao time.
- Estatisticas de jogadores e times nao sao armazenadas de forma estruturada.
- Comunicacao depende de mensagens informais e memoria das liderancas.

Como consequencia, ha perda de transparencia, risco de conflitos por divergencia de informacao e dificuldade para profissionalizar a organizacao do campeonato.

---

## Objetivos

### Objetivo Geral

Desenvolver uma plataforma web chamada **Gods League** para centralizar a gestao, publicacao e historico do campeonato anual de futebol de jovens da AdBangu.

### Objetivos Especificos

- Publicar em um **site oficial** o regulamento, calendario, classificacao, resultados e estatisticas da competicao.
- Disponibilizar um **dashboard por time** para manutencao de elenco, dados do time e acompanhamento da temporada.
- Implementar **autenticacao sem auto-cadastro**, onde apenas o administrador master cria os acessos de cada time.
- Garantir rastreabilidade das operacoes por meio de registros de criacao e atualizacao.
- Criar base historica por temporada para consulta futura.
- Reduzir dependencia de comunicacao informal via WhatsApp e registros manuais.

---

## Justificativa

A digitalizacao da gestao do campeonato traz ganhos diretos para a AdBangu:

- **Transparencia:** todos consultam a mesma fonte oficial de informacao.
- **Confiabilidade:** dados estruturados e validados reduzem inconsistencias.
- **Memoria institucional:** historico por temporada preserva resultados e estatisticas.
- **Governanca:** o administrador master controla acessos e permissoes.
- **Escalabilidade:** facilita crescimento do campeonato e novos formatos no futuro.

Com Angular no frontend e Firebase no backend (Auth, Firestore e Storage), o projeto pode ser implementado rapidamente, com baixo custo operacional e boa capacidade de evolucao.

---

## Publico-Alvo

A plataforma atende os seguintes perfis:

- **Jovens atletas e membros da igreja:** acompanham jogos, tabelas e estatisticas no site publico.
- **Responsaveis de times (setores e matriz):** gerenciam dados da equipe no dashboard.
- **Administrador master da competicao:** cria acessos, valida cadastros e supervisiona a temporada.
- **Lideranca da AdBangu:** consulta dados consolidados e historico oficial.
- **Publico visitante:** acompanha informacoes do campeonato sem necessidade de login.

---

## Perfis de Usuarios

### Visitante (Publico)

| Campo | Descricao |
| --- | --- |
| **Descricao** | Pessoa que acessa o site para acompanhar o campeonato. |
| **Necessidades** | Ver regulamento, tabela, resultados, artilharia, calendario e noticias oficiais. |

### Responsavel de Time

| Campo | Descricao |
| --- | --- |
| **Descricao** | Usuario vinculado a um time especifico (matriz ou setor), com acesso ao dashboard. |
| **Necessidades** | Gerenciar elenco, atualizar dados do time, acompanhar desempenho e status de inscricoes. |

### Administrador Master

| Campo | Descricao |
| --- | --- |
| **Descricao** | Usuario com permissao total sobre a plataforma e sobre os acessos. |
| **Necessidades** | Criar contas de times, ativar/desativar acessos, validar dados, publicar informacoes oficiais e garantir integridade da competicao. |

---

## Historias de Usuarios

| EU COMO... (QUEM) | QUERO/PRECISO... (O QUE) | PARA... (POR QUE) |
| --- | --- | --- |
| Visitante | Acessar a classificacao atualizada sem login | Acompanhar a posicao dos times na competicao. |
| Visitante | Visualizar regulamento oficial em uma pagina fixa | Entender claramente as regras do campeonato. |
| Visitante | Consultar calendario de jogos com data, horario e local | Me organizar para assistir e apoiar meu time. |
| Responsavel de Time | Fazer login com conta fornecida pelo administrador | Acessar o dashboard do meu time com seguranca. |
| Responsavel de Time | Cadastrar e atualizar elenco do time | Manter os jogadores regularizados e visiveis no sistema. |
| Responsavel de Time | Ver historico de alteracoes do meu time | Ter confianca sobre quem alterou os dados e quando. |
| Administrador Master | Criar contas de acesso para cada time | Garantir que nao exista auto-cadastro e que os acessos sejam controlados. |
| Administrador Master | Validar jogadores vinculados aos times | Evitar inconsistencias e garantir conformidade com o regulamento. |
| Administrador Master | Publicar resultados e atualizar tabela | Manter o site publico com informacoes oficiais e atualizadas. |
| Administrador Master | Fechar uma temporada e manter historico | Preservar memoria institucional para consultas futuras. |

---

## Escopo Funcional Inicial (MVP)

- Login com Firebase Authentication (sem tela de cadastro publico).
- Cadastro de usuarios apenas pelo administrador master.
- Gestao de times e elencos no dashboard.
- Publicacao de regulamento, calendario, resultados e classificacao no site publico.
- Registro de estatisticas basicas (jogos, gols, cartoes e artilharia).
- Controle de temporada (ano atual e historico).

---

## Regras de Negocio Iniciais

- Nao existe auto-cadastro de usuarios.
- Cada conta de time so pode editar dados do proprio time.
- Apenas o administrador master pode criar, bloquear ou remover acessos.
- Cadastro e manutencao de sessoes, temporadas, times, jogos e estatisticas oficiais devem ocorrer no dashboard do administrador master.
- Informacoes oficiais publicadas no site (tabela, resultados e regulamento) sao de responsabilidade do administrador master.
- Todo jogador deve estar vinculado a um unico time por temporada (salvo regra excepcional definida pela organizacao).

---

## Requisitos Nao Funcionais Iniciais

- Interface responsiva para celular e desktop.
- Controle de acesso por perfil (visitante, time, admin master).
- Persistencia em nuvem com backup e historico por temporada.
- Logs de auditoria para alteracoes criticas.
- Disponibilidade continua do site durante o periodo do campeonato.

---

## Tecnologias (A priori)

- **Frontend:** Angular
- **Backend BaaS:** Firebase
- **Banco de dados:** Cloud Firestore
- **Autenticacao:** Firebase Authentication
- **Arquivos (documentos/imagens):** Firebase Storage
- **Hospedagem:** Firebase Hosting

---

## Contrato de Dados da Home (API/Firestore)

Para exibir os blocos publicos da home sem mock, o sistema deve consultar os seguintes conjuntos:

- `seasons`:
  - Campo `active` (boolean) para identificar a temporada ativa.
- `teams`:
  - Campos minimos: `name`, `shieldUrl`, `seasonId`, `active`.
- `matches`:
  - Campos minimos: `seasonId`, `round`, `date`, `time`, `homeTeamId`, `awayTeamId`.
- `players`:
  - Campos minimos: `name`, `teamId`, `status`.
- `mvp_summary`:
  - Campos minimos: `seasonId`, `category`, `rankings`.
  - `rankings` e uma lista com `{ playerId, value }`.

Categorias MVP aceitas na home:
- `artilheiro`
- `assistente`
- `defesas`
- `cartoes`
- `drible`

Regras de publicacao:
- Apenas o `admin_master` pode publicar/editar `mvp_summary`.
- Cada linha de ranking deve referenciar `playerId` existente e validado.
- O jogador deve pertencer a time ativo da temporada exibida.

---

## Fora do Escopo (fase inicial)

- Cadastro aberto ao publico.
- Integracao com gateways de pagamento.
- Aplicativo mobile nativo.
- Automatizacoes avancadas de arbitragem por video.

---

## Requisitos Funcionais Detalhados por Modulo

### Modulo 1: Site Publico

| ID | Requisito Funcional | Prioridade |
| --- | --- | --- |
| RF-SP-00 | A home publica deve centralizar as informacoes principais da temporada ativa. | Alta |
| RF-SP-01 | O sistema deve exibir a classificacao geral da temporada ativa em pagina publica. | Alta |
| RF-SP-02 | O sistema deve exibir calendario de jogos com data, horario, local e status da partida. | Alta |
| RF-SP-03 | O sistema deve exibir resultados das partidas ja encerradas. | Alta |
| RF-SP-04 | O sistema deve exibir pagina de regulamento oficial da competicao. | Alta |
| RF-SP-05 | O sistema deve exibir estatisticas publicas (artilharia, gols por time e cartoes). | Media |
| RF-SP-06 | O sistema deve exibir elenco publico de cada time, conforme configuracao do admin. | Media |
| RF-SP-07 | O sistema deve permitir filtrar informacoes por temporada (ano). | Media |
| RF-SP-08 | O sistema deve disponibilizar pagina de detalhes de cada time com desempenho na temporada. | Media |
| RF-SP-09 | O sistema deve permitir compartilhamento de paginas publicas por URL. | Baixa |
| RF-SP-10 | O sistema deve exibir na home a lista de times inscritos da temporada, com escudo e nome. | Alta |
| RF-SP-11 | O sistema deve exibir na home uma tabela de jogos da temporada com rodada, data, horario, escudo e nome dos dois times. | Alta |
| RF-SP-12 | O sistema deve exibir na home um resumo MVP de estatisticas de jogadores com Top 3 para: artilheiro, assistente, defesas, cartoes e drible. | Alta |
| RF-SP-13 | O resumo MVP de estatisticas da home deve ser alimentado exclusivamente pelo administrador master no dashboard. | Alta |
| RF-SP-14 | Cada registro de estatistica publicado na home deve estar vinculado a um jogador previamente cadastrado e validado em seu respectivo time. | Alta |

### Modulo 2: Dashboard do Time

| ID | Requisito Funcional | Prioridade |
| --- | --- | --- |
| RF-DT-01 | O usuario de time deve autenticar-se para acessar o dashboard. | Alta |
| RF-DT-02 | O sistema deve exibir apenas dados do time vinculado ao usuario logado. | Alta |
| RF-DT-03 | O usuario de time deve cadastrar, editar e inativar jogadores do proprio elenco. | Alta |
| RF-DT-04 | O sistema deve exigir dados minimos no cadastro de jogador (nome, data de nascimento, numero da camisa e posicao). | Alta |
| RF-DT-05 | O usuario de time deve atualizar informacoes institucionais do time (nome publico, escudo, responsavel e contato). | Media |
| RF-DT-06 | O sistema deve exibir status dos jogadores (pendente, validado, rejeitado) conforme validacao do admin master. | Alta |
| RF-DT-07 | O usuario de time deve acompanhar historico de alteracoes realizadas no proprio time. | Media |
| RF-DT-08 | O sistema deve bloquear edicoes do elenco apos prazo de inscricao definido pela organizacao. | Alta |
| RF-DT-09 | O usuario de time deve visualizar calendario e resultados de seus jogos no dashboard. | Media |

### Modulo 3: Painel do Administrador Master

| ID | Requisito Funcional | Prioridade |
| --- | --- | --- |
| RF-AM-01 | O administrador master deve criar contas de acesso para os times. | Alta |
| RF-AM-02 | O administrador master deve ativar, bloquear e redefinir acesso de contas de time. | Alta |
| RF-AM-03 | O administrador master deve cadastrar e gerenciar temporadas (abrir, encerrar e arquivar). | Alta |
| RF-AM-04 | O administrador master deve cadastrar e editar times participantes por temporada. | Alta |
| RF-AM-05 | O administrador master deve validar ou rejeitar jogadores cadastrados pelos times. | Alta |
| RF-AM-06 | O administrador master deve cadastrar jogos com rodada, data, horario e local. | Alta |
| RF-AM-07 | O administrador master deve registrar resultados e eventos da partida (gols e cartoes). | Alta |
| RF-AM-08 | O sistema deve recalcular automaticamente classificacao e estatisticas ao salvar resultados. | Alta |
| RF-AM-09 | O administrador master deve publicar e versionar regulamento oficial por temporada. | Media |
| RF-AM-10 | O administrador master deve consultar logs de auditoria de acoes criticas (acessos, alteracoes e validacoes). | Media |
| RF-AM-11 | O administrador master deve definir janela de inscricao e bloqueio de edicoes dos times. | Alta |
| RF-AM-12 | O administrador master deve cadastrar/atualizar os rankings de estatisticas da home (Top 3 por categoria) vinculando cada linha a jogador existente. | Alta |

### Modulo 4: Autenticacao e Autorizacao

| ID | Requisito Funcional | Prioridade |
| --- | --- | --- |
| RF-AU-01 | O sistema deve ter tela de login por e-mail e senha. | Alta |
| RF-AU-02 | O sistema nao deve disponibilizar tela publica de cadastro de novos usuarios. | Alta |
| RF-AU-03 | O sistema deve permitir recuperacao de senha por fluxo seguro. | Media |
| RF-AU-04 | O sistema deve controlar acesso por perfil (`visitante`, `time`, `admin_master`). | Alta |
| RF-AU-05 | O sistema deve impedir que usuario `time` acesse recursos administrativos globais. | Alta |
| RF-AU-06 | O sistema deve encerrar sessao mediante logout e invalidar acesso protegido no frontend. | Alta |
| RF-AU-07 | O sistema deve registrar tentativas de login e eventos de seguranca relevantes para auditoria. | Media |

---

## Criterios de Aceite (visao inicial)

| ID | Criterio de Aceite |
| --- | --- |
| CA-01 | Um visitante deve conseguir consultar tabela, jogos e regulamento sem autenticacao. |
| CA-01A | Um visitante deve conseguir visualizar na home os times inscritos com escudo e nome da temporada ativa. |
| CA-01B | Um visitante deve conseguir visualizar na home a tabela de jogos com data, horario e identificacao visual dos dois times. |
| CA-01C | Um visitante deve conseguir visualizar na home o resumo MVP de estatisticas com Top 3 para artilheiro, assistente, defesas, cartoes e drible. |
| CA-02 | Um usuario de time autenticado deve visualizar e editar somente dados do proprio time. |
| CA-03 | Um jogador cadastrado por um time deve aparecer como pendente ate validacao do admin master. |
| CA-04 | Ao registrar resultado de uma partida, a classificacao deve ser atualizada automaticamente. |
| CA-05 | Nenhum fluxo do sistema deve permitir auto-cadastro publico de contas. |
| CA-06 | O admin master deve conseguir criar, bloquear e reativar contas de time pelo painel. |
| CA-07 | Ao encerrar uma temporada, os dados devem permanecer consultaveis em historico. |
| CA-08 | O sistema deve impedir publicacao de estatistica da home para jogador nao cadastrado/nao validado. |

---
