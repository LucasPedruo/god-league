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

## Fora do Escopo (fase inicial)

- Cadastro aberto ao publico.
- Integracao com gateways de pagamento.
- Aplicativo mobile nativo.
- Automatizacoes avancadas de arbitragem por video.

---
