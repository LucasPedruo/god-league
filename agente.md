# Prompt Mestre - Agente do Projeto Gods League

Voce e um agente de desenvolvimento responsavel por evoluir o projeto **Gods League** da AdBangu.

## Missao
Entregar e manter uma plataforma web de campeonato com:
- area publica para divulgacao oficial;
- area administrativa para operacao do campeonato.

## Contexto
A operacao era descentralizada (WhatsApp, papel, comunicacao verbal). O sistema deve ser a fonte oficial de informacao.

## Stack
- Angular (frontend)
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase Hosting

## Perfis e Acesso
- `visitante`: apenas rotas publicas.
- `time`: acesso ao dashboard protegido (quando habilitado por regra de papel).
- `admin_master`: operacao administrativa completa.

## Rotas Publicas Atuais
- `/` Inicio
- `/classificacao`
- `/times`
- `/estatisticas`

## Dashboard Atual
- `/dashboard` protegido por auth/role guard
- layout proprio com sidebar (sem topbar publica)
- secoes implementadas:
  - visao geral
  - usuarios admin
  - temporadas
  - times
  - jogadores
  - tabela/jogos
  - resultados
  - MVP estatisticas

## Regras Obrigatorias
- Nao permitir auto-cadastro publico.
- Operacao de temporadas/times/jogos/resultados/MVP deve ser feita pelo dashboard master.
- Dados publicos devem ser lidos do Firestore (sem mock).
- Estatisticas e MVP devem referenciar jogadores existentes.
- Respeitar temporada ativa (`seasons.active = true`).

## Fontes de Permissao
Aceitar as duas fontes:
1. `users/{uid}`
2. `admin_users/{uid}` (compatibilidade)

Mapeamento em `admin_users`:
- `tipo = MASTER` => `admin_master`
- `tipo = ADMIN` => `admin_master`

## Contrato de Dados Principal
Colecoes utilizadas:
- `admin_users`
- `users`
- `seasons`
- `teams`
- `players`
- `matches`
- `mvp_summary`

## Categorias
MVP home:
- `artilheiro`, `assistente`, `defesas`, `cartoes`, `drible`

Estatistica avancada:
- `gols`, `chute_a_gol`, `defesas`, `goleiro`, `cartoes`, `mvp_jogo`, `mvp_rodada`

## Diretrizes de Execucao
- Sempre priorizar seguranca de acesso e consistencia de dados.
- Antes de codar, mapear impacto em regras e colecoes.
- Entregar em incrementos pequenos e testaveis.
- Atualizar documentacao sempre que alterar fluxo, modelo ou regras.
- Nao remover compatibilidades em uso sem validacao previa.

## Formato de Entrega por Tarefa
1. Objetivo.
2. Arquivos alterados.
3. Regras cobertas.
4. Validacoes executadas.
5. Pendencias/proximo passo.

## Fora do Escopo (ate aqui)
- Cadastro publico.
- App mobile nativo.
- Pagamentos.
- Integracoes de arbitragem por video.
