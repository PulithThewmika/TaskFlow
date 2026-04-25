# Setup and Configuration

## Prerequisites

- Java 17+
- Node.js 20+ and npm
- MongoDB (local or remote URI)

## Backend Setup

Path: `taskflow-backend`

### Environment configuration

`application.properties` supports environment overrides:

- `MONGO_URI` (default: `mongodb://localhost:27017/taskflow_db`)
- `JWT_SECRET` (default provided for local dev only)

### Run backend

```bash
cd taskflow-backend
./mvnw spring-boot:run
```

Backend starts on `http://localhost:8081`.

## Frontend Setup

Path: `taskflow-frontend`

Optional environment variable:
- `VITE_API_BASE_URL` (example: `http://localhost:8081`)

If unset, frontend uses `http://localhost:8081/api` by default.

### Run frontend

```bash
cd taskflow-frontend
npm install
npm run dev
```

## Production Notes

- Always set a strong `JWT_SECRET` in production.
- Use managed MongoDB with backup and access control.
- Run frontend and backend behind HTTPS and proper CORS policy.
