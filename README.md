# TaskFlow — Team Task Management System

## Team Members & Contributions
| Student | ID | Role | Testing Feature |
|---|---|---|---|
| [Name] | IT23XXXXXX | Backend + Testing | JUnit 5 Parameterized Tests |
| [Name] | IT23XXXXXX | Backend + Testing | JUnit 5 Mockito Tests |
| [Name] | IT23XXXXXX | Frontend + Testing | Playwright E2E Flow |
| [Name] | IT23XXXXXX | Frontend + Testing | Playwright Validation Tests |

## Tech Stack
- Backend: Spring Boot 3.x, MySQL, JWT
- Frontend: React 18, TypeScript, Tailwind CSS
- Testing: JUnit 5 + Mockito, Playwright

## How to Run

### Backend
```bash
cd taskflow-backend
./mvnw spring-boot:run
```

### Run JUnit Tests
```bash
cd taskflow-backend
./mvnw test
```

### Frontend
```bash
cd taskflow-frontend
npm install
npm run dev
```

### Install Playwright Browsers (one time)
```bash
npx playwright install chromium
```

### Run Playwright Tests (headed — for demo)
```bash
npx playwright test --headed
```

### Run Specific Test File
```bash
npx playwright test task-board-flow.spec.ts --headed
```

## Test Categories
- Unit/Component Testing: JUnit 5
- E2E/UI Testing: Playwright
