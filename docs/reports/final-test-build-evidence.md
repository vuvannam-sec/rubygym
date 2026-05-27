# RubyGYM Final Test and Build Evidence

Date: 2026-05-27.

## Environment

- Node: `v24.15.0`
- npm: `11.12.1`
- Docker: `Docker version 29.4.3, build 055a478`
- PlantUML CLI: not installed locally; Dockerized `plantuml/plantuml` was used for PNG rendering.

## Backend verification

Working directory: `backend`.

| Command | Result |
|---|---|
| `npm install` | Passed after rebuilding a stale `node_modules` tree. Generated `backend/package-lock.json`. |
| `npm test -- --runInBand` | Passed. 6 test suites, 25 tests. |
| `node -c backend/src/routes/goals.js && node -c backend/src/routes/evaluations.js && node -c backend/src/routes/subscriptions.js && node -c backend/src/routes/members.js && node -c backend/src/routes/auth.js` | Passed. No syntax errors. |

Backend test result:

```text
Test Suites: 6 passed, 6 total
Tests:       25 passed, 25 total
Snapshots:   0 total
```

Note: Jest initially stayed open because imported MySQL pool handles remained alive. `backend/package.json` now uses `jest --runInBand --forceExit` so the command exits cleanly after all tests pass.

## Frontend verification

Working directory: `frontend`.

| Command | Result |
|---|---|
| `npm install react-router-dom@6.30.2` | Passed. This pins React Router to the CRA-compatible v6 package shape. |
| `npm install yaml@2.9.0 --save-dev` | Passed. This syncs the lockfile for Docker `npm ci` with npm 10 peer resolution. |
| `CI=true npm test -- --watchAll=false` | Passed. 1 test suite, 1 test. React Router v7 future warnings are non-fatal. |
| `npm run build` | Passed. Production build compiled successfully. |

Frontend test result:

```text
PASS src/App.test.js
Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
```

Frontend build result:

```text
Compiled successfully.
File sizes after gzip:
106.36 kB  build/static/js/main.18549a48.js
4.39 kB    build/static/css/main.6815d6a9.css
1.77 kB    build/static/js/453.825386d9.chunk.js
```

## Docker verification

Working directory: repository root.

| Command | Result |
|---|---|
| `docker compose config` | Passed. Compose resolved `db`, `backend`, and `frontend` services. |
| `docker compose build` | Passed after refreshing frontend lockfile and adding `frontend/.dockerignore`. Backend and frontend images built. |
| `docker compose up -d` | Passed. MySQL, backend, and frontend containers started. |
| `curl -fsS http://localhost:3000/api/health` | Passed. Returned `{"status":"ok","service":"rubygym-api"}`. |
| `curl -fsSI http://localhost:8080` | Passed. Returned `HTTP/1.1 200 OK` from nginx. |
| `docker exec rubygym-db mysql -uroot -prubygym123 -D rubygym -e "SHOW TABLES; SELECT COUNT(*) AS training_goals FROM training_goals;"` | Passed. `training_goals` table exists with 6 seeded rows. |
| `POST /api/auth/login` for `admin@rubygym.com/admin123` | Passed. Returned role `ADMIN` and JWT token. |
| `POST /api/auth/login` for `trainer.linh@rubygym.com/trainer123` | Passed. Returned role `TRAINER`, `trainer_id = 1`, and JWT token. |
| `POST /api/auth/login` for `member.an@rubygym.com/member123` | Passed. Returned role `MEMBER`, `member_id = 1`, and JWT token. |

Running container status:

```text
rubygym-db         Up (healthy)   0.0.0.0:3306->3306/tcp
rubygym-backend    Up             0.0.0.0:3000->3000/tcp
rubygym-frontend   Up             0.0.0.0:8080->80/tcp
```

## Diagram rendering

| Command | Result |
|---|---|
| `docker run --rm -v "$PWD/docs/diagrams:/work" plantuml/plantuml -tpng /work/usecase-full-simplified.puml /work/usecase-selected.puml /work/relational-schema.puml /work/relational-schema-simplified.puml` | Passed. PNG files were regenerated from final PlantUML sources. |

Rendered PNG files:

```text
docs/diagrams/usecase-full-simplified.png      1242 x 2136
docs/diagrams/usecase-selected.png              826 x 512
docs/diagrams/relational-schema.png            1915 x 773
docs/diagrams/relational-schema-simplified.png  946 x 792
```

## Known warnings

- npm/Node prints `url.parse()` deprecation warnings from tooling. They do not fail tests or builds.
- Frontend dependency audit reports vulnerabilities inherited from CRA-era packages. This is documented as a maintenance limitation, not a failing functional gate.
