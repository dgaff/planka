# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

This is **Doug's fork of PLANKA**, an open-source kanban board. The fork adds board-level
preference toggles that customize card-creation behavior (each defaults to standard PLANKA
behavior when off). See [README.md](README.md) for the user-facing description.

The fork-specific board settings live on the `Board` model on both ends:
- Server: [server/api/models/Board.js](server/api/models/Board.js) (`addCardToTop`,
  `keepOpenAfterCardCreate`, `displayLabelPlaceholder`, `autoCloseLabelSelectorAfterSelection`,
  `showAddCardButtonAtTop`, plus upstream `limitCardTypesToDefaultOne`, `alwaysDisplayCardCreator`).
- Client: [client/src/models/Board.js](client/src/models/Board.js) (same fields as redux-orm attrs).

Each new board setting is added via a knex migration in [server/db/migrations/](server/db/migrations/)
(see the recent `..._add_board_setting_to_*.js` files for the established pattern), wired into both
Board models, and consumed in the relevant client component. Custom label/list colors live in
[client/src/constants/LabelColors.js](client/src/constants/LabelColors.js) and `ListColors.js`.

### Board background gradients

The background behind a board is a *project*-level gradient. Adding one means touching four places,
which must stay in sync or the API rejects the value:

- [client/src/constants/BackgroundGradients.js](client/src/constants/BackgroundGradients.js) — the
  name, which sets picker order
- [client/src/styles.module.scss](client/src/styles.module.scss) — a `.background<PascalCase>` rule
  in the `:global(#app)` block (the class name is derived at runtime via
  `` globalStyles[`background${upperFirst(camelCase(name))}`] ``)
- [server/api/models/Project.js](server/api/models/Project.js) — the `BACKGROUND_GRADIENTS` `isIn`
  allowlist, plus the `@swagger` enum above it
- [server/api/controllers/projects/update.js](server/api/controllers/projects/update.js) — its
  `@swagger` enum

The fork adds three grayscale gradients (`graphite`, `slate-ink`, `carbon`) because the stock set is
all saturated color.

**Why there is no light/VS Code-style background yet.** The board header has no background of its
own — it is a `rgba(0, 0, 0, 0.24)` scrim laid over the project background with **white** text
([Header.module.scss](client/src/components/common/Header/Header.module.scss)). So the header's
effective background is the gradient darkened by 24%, and any gradient lighter than roughly `#909090`
drops the white header text below 4.5:1 contrast. The three added gradients all sit above that floor,
so they are pure additions. Three lighter candidates were designed but deferred — `editor-paper`
(`#f3f3f3 → #e6e6e6`), `quiet-slate` (`#dcdfe3 → #c3c8ce`), `warm-concrete` (`#dedbd6 → #c6c2ba`).
Shipping any of them requires the header to switch to dark text when a light background is active:
the sketched approach is a `lightBackground` class set on the app root by
[ProjectBackground.jsx](client/src/components/projects/ProjectBackground/ProjectBackground.jsx) for
those gradient names, with `Header.module.scss` overriding its text color under it. Note that at
`editor-paper`'s lightness the lists (`#dfe3e6`) nearly dissolve into the background.

## Repo layout

Monorepo with two independent npm packages plus a root orchestrator:
- `client/` — React 18 SPA (Vite), `planka-client`
- `server/` — Sails.js (Node ≥20) + PostgreSQL API, `planka-server`
- root `package.json` — delegates to the two via `--prefix` and runs them together

## Commands

Run from the repo root unless noted. Root scripts proxy into the sub-packages.

```bash
npm start                 # run server + client concurrently (dev)
npm run lint              # lint server then client (CI gate; both must pass)
npm test                  # server tests then client tests

npm run client:start      # vite dev server (proxies /api to localhost:1337)
npm run client:build      # vite build
npm run client:lint
npm run client:test       # jest

npm run server:start      # nodemon (auto-restart on api/config/db/utils changes)
npm run server:start:prod # NODE_ENV=production
npm run server:lint       # eslint, --max-warnings=0
npm run server:test       # mocha (see below)
```

Database (server):
```bash
npm run server:db:init               # initialize schema
npm run server:db:migrate            # knex migrate:latest (cwd=db)
npm run server:db:seed               # knex seed:run
npm run server:db:create-admin-user
npm run server:db:upgrade
npm run server:swagger:generate      # regenerate OpenAPI from JSDoc in controllers
```

Single tests:
```bash
# server (mocha) — pass a file path
npm test --prefix server -- test/integration/cards/create.test.js
# client (jest) — filter by name or path
npm test --prefix client -- -t "card name"
```

`server:test` runs `test/lifecycle.test.js` first (it lifts/lowers the Sails app), then
`test/integration/**` and `test/utils/**`. The lifecycle file is the shared setup — integration
tests assume a lifted app and a real Postgres datastore.

The client also has Cucumber/Playwright acceptance tests:
`npm run test:acceptance --prefix client`.

Husky + lint-staged run the relevant linter on staged `client/src/**/*.{js,jsx}` and
`server/**/*.js` at commit time.

### Local dev with Docker

`docker-compose-dev.yml` brings up Postgres, the Sails server (port 1337, runs
`db:init` then `npm start`), and the Vite client (`vite --host`) with the source bind-mounted.
`DATABASE_URL` points at the `postgres` service.

## Server architecture (Sails.js)

Standard Sails conventions with a few project-specific patterns. Read 2–3 controllers/helpers
before adding new ones — the structure is highly consistent.

- **Controllers** ([server/api/controllers/](server/api/controllers/)): one directory per resource,
  one file per action (`create.js`, `update.js`, `show.js`, `index.js`, `delete.js`). Each action
  is a Sails action object: `{ inputs, exits, async fn(inputs) }`. Routes are explicitly mapped in
  [server/config/routes.js](server/config/routes.js) (`'POST /api/lists/:listId/cards': 'cards/create'`)
  — there are no blueprint/shadow routes for the API. The big JSDoc `@swagger` blocks above each
  action are the source of truth for the generated OpenAPI spec.
- **Business logic lives in helpers** ([server/api/helpers/](server/api/helpers/)), not controllers.
  Controllers validate input + check authorization, then call `sails.helpers.<resource>.<action>()`.
  Helpers own DB writes and **realtime broadcasting**.
- **Realtime**: mutations broadcast over socket.io from inside helpers via
  `sails.sockets.broadcast('board:<id>', 'cardUpdate', {...}, req)`. Rooms are namespaced like
  `board:<id>`, `user:<id>`, `@accessToken:<token>`. The client subscribes to these rooms and
  applies the events to its redux-orm store.
- **Models** ([server/api/models/](server/api/models/)) use Waterline with snake_case `columnName`
  mappings to Postgres. Schema changes go through knex migrations in `server/db/migrations/`
  (knex is separate from Waterline — migrations define the DB, Waterline reads it).
- **Query methods (`Model.qm`)**: a custom hook ([server/api/hooks/query-methods/](server/api/hooks/query-methods/))
  attaches a `qm` object to every model from [server/api/hooks/query-methods/models/](server/api/hooks/query-methods/models/).
  Data access goes through `Card.qm.getByListId(...)` etc. rather than raw Waterline calls.
- **Custom hooks** ([server/api/hooks/](server/api/hooks/)): `current-user`, `oidc`, `s3`,
  `file-manager`, `query-methods`, `watcher` (periodically logs out sockets whose JWT expired),
  `terms`.
- **Authorization** is declared in [server/config/policies.js](server/config/policies.js)
  (`is-authenticated`, `is-admin`, `is-external`, `is-session`, `is-admin-or-project-owner`, …).
  Per-record permission checks (project manager / board membership) happen inside the action `fn`.

## Client architecture (React + Redux)

The state layer is the part that needs explaining; components are conventional React.

- **redux-orm** ([client/src/models/](client/src/models/), `orm.js`) is the normalized store.
  Models (`Card`, `Board`, `List`, …) extend `BaseModel`. Server payloads and socket events are
  reduced into these tables; components read via **reselect** selectors in
  [client/src/selectors/](client/src/selectors/).
- **redux-saga** ([client/src/sagas/](client/src/sagas/)) handles all side effects. Flow:
  component dispatches an **entry action** ([client/src/entry-actions/](client/src/entry-actions/),
  keyed by `EntryActionTypes`) → a saga watcher in `sagas/core/watchers` picks it up → calls a
  request in `sagas/core/requests` → which calls the **API client** ([client/src/api/](client/src/api/),
  one file per resource) → success/failure dispatches a plain **action**
  ([client/src/actions/](client/src/actions/), keyed by `ActionTypes`) → reducers update redux-orm.
  So `ActionTypes` = store mutations, `EntryActionTypes` = user/socket intents. Adding a feature
  usually means touching all of: api → request → watcher → entry-action → action → reducer/model.
- **Socket events** from the server are funneled into the same saga/action pipeline so realtime
  updates and local mutations converge on one code path (`sails.io.js` / `socket.io-client`).
- UI uses `semantic-ui-react`; markdown editing uses `@gravity-ui/markdown-editor`; DnD uses
  `react-beautiful-dnd`. i18n via `react-i18next` with locales in `client/src/locales/`.
- Dev server proxies `/api` to `http://localhost:1337` (override with `PROXY_TARGET`).

## Conventions

- Lint = Prettier-enforced (printWidth 100, single quotes, trailing commas). Server extends
  `airbnb-base`, client extends `airbnb` + `airbnb/hooks`. `npm run lint` must pass clean
  (`--max-warnings=0` on server). Match surrounding style; the codebase is very uniform.
- Both packages use `patch-package` (`patches/` dirs, applied on `postinstall`) — don't hand-edit
  files under `node_modules`; create a patch.
- `npm run gv` regenerates `version.js` on both sides from the root version template. Fork version
  is suffixed `.doug` (e.g. `2.1.1.doug`).
