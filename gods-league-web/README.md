# Gods League Web

Aplicacao Angular do projeto Gods League (AdBangu).

## Visao geral

O app possui duas areas:
- area publica de consulta do campeonato;
- area administrativa em `/dashboard` para operacao do `admin_master`.

## Rotas publicas

- `/` Inicio
- `/classificacao`
- `/times`
- `/estatisticas`
- `/login`

## Area administrativa

- `/dashboard` (protegida por autenticacao + perfil)
- Layout proprio com barra lateral (sem topbar publica)
- Modulos:
  - usuarios admin
  - temporadas
  - times
  - jogadores
  - tabela/jogos
  - resultados
  - MVP estatisticas

## Autenticacao e perfis

- Firebase Authentication (Email/Password)
- Sem auto-cadastro publico
- Perfil carregado de:
  1. `users/{uid}`
  2. fallback `admin_users/{uid}`

Mapeamento de `admin_users.tipo`:
- `MASTER` -> `admin_master`
- `ADMIN` -> `admin_master`

## Fonte de dados (Firestore)

Colecoes principais:
- `seasons`
- `teams`
- `players`
- `matches`
- `mvp_summary`
- `admin_users`
- `users`

## Setup local

1. Instalar dependencias:
```bash
npm install
```

2. Configurar Firebase em:
- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

3. Executar em desenvolvimento:
```bash
npm start
```

## Build e testes

Build:
```bash
npm run build
```

Testes:
```bash
npm run test -- --watch=false
```

## Documentacao do repositorio

- Especificacao funcional: `../especificacao-do-projeto.md`
- Prompt operacional do agente: `../agente.md`
- Guia Firebase para operacao: `../firebase-setup.md`
