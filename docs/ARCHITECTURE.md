# Architecture

## High-Level Overview

TaskFlow uses a standard client-server architecture:

- Frontend: React + TypeScript SPA (`taskflow-frontend`)
- Backend: Spring Boot REST API (`taskflow-backend`)
- Database: MongoDB
- Auth: JWT bearer tokens

## Request Flow

1. User authenticates via `/api/auth/login` or `/api/auth/register`
2. Backend returns JWT token
3. Frontend stores token in `localStorage`
4. Axios interceptor attaches `Authorization: Bearer <token>` to API requests
5. Backend validates token and authorizes route access

## Backend Layers

- **Controller layer**: exposes REST endpoints
- **Service layer**: business logic (project/task workflows, dashboard aggregation)
- **Repository/data layer**: MongoDB persistence
- **Security layer**: JWT token handling and route protection

## Frontend Layers

- **Rebuild Architecture (App Shell)** in `src/rebuild/` (provides global CSS, layout components, and core styles for the new application dashboard)
- **API clients** in `src/api/`
- **Stateful hooks** in `src/hooks/`
- **Page-level routes** in `src/pages/`
- **Reusable UI components** in `src/components/`
- **Auth context** in `src/context/AuthContext.tsx`

## Core Domain Areas

- Auth and user session management
- Project lifecycle management
- Task lifecycle and status transitions
- Member assignment to projects
- Dashboard metric aggregation

## Reliability and Test Strategy

- Backend unit/service tests (JUnit 5, Mockito)
- Frontend E2E flows (Playwright)
- TypeScript type checking and ESLint for frontend quality gates
