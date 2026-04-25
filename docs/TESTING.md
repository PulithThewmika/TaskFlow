# Testing Guide

## Backend Tests

Path: `taskflow-backend`

Run all backend tests:
```bash
cd taskflow-backend
./mvnw test
```

Backend testing stack:
- JUnit 5
- Mockito
- Spring Boot test utilities

## Frontend Lint and Build

Path: `taskflow-frontend`

```bash
cd taskflow-frontend
npm run lint
npm run build
```

## Frontend E2E Tests

Install browser dependency once:
```bash
cd taskflow-frontend
npx playwright install chromium
```

Run all E2E tests:
```bash
npx playwright test --headed
```

Run a specific spec:
```bash
npx playwright test task-board-flow.spec.ts --headed
```

## Recommended CI Quality Gates

- Backend: `./mvnw test`
- Frontend lint: `npm run lint`
- Frontend build: `npm run build`
- E2E smoke: selected Playwright spec(s) on PRs
