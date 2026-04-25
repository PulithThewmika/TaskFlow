# API Reference

Base URL (local): `http://localhost:8081/api`

## Authentication

JWT bearer token is required for protected routes.

Header:
`Authorization: Bearer <token>`

---

## Health

### GET `/health`

Returns service availability status.

Example response:
```json
{
  "status": "UP",
  "service": "taskflow-backend",
  "timestamp": "2026-04-25T17:15:22.016Z"
}
```

---

## Auth

### POST `/auth/register`

Create a user account.

Request body:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "strongPass123"
}
```

Validation:
- `name`: required
- `email`: required, valid email format
- `password`: required, minimum 6 characters

Response `201`:
```json
{
  "token": "<jwt-token>",
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

### POST `/auth/login`

Authenticate a user.

Request body:
```json
{
  "email": "jane@example.com",
  "password": "strongPass123"
}
```

Response `200`:
```json
{
  "token": "<jwt-token>",
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

---

## Projects

### GET `/projects`

List all projects.

Response `200`:
```json
[
  {
    "id": "680a9aa18b719f3d2f495e0f",
    "name": "TaskFlow Launch",
    "description": "Initial release scope",
    "colorTag": "#3B82F6",
    "taskCount": 8,
    "memberCount": 4,
    "createdAt": "2026-04-25T10:06:09.123"
  }
]
```

### POST `/projects`

Create a project.

Request body:
```json
{
  "name": "Website Redesign",
  "description": "Q2 redesign project",
  "colorTag": "#10B981"
}
```

Validation:
- `name`: required

Response `201`: `ProjectResponse`

### GET `/projects/{id}`

Get a project by ID.

Path params:
- `id` (string)

Response `200`: `ProjectResponse`

### DELETE `/projects/{id}`

Delete a project by ID.

Path params:
- `id` (string)

Response `204` with empty body.

---

## Tasks

### GET `/projects/{projectId}/tasks`

List tasks for a project.

Path params:
- `projectId` (string)

Response `200`:
```json
[
  {
    "id": "680a9be88b719f3d2f495e23",
    "title": "Implement auth screen",
    "description": "Login and register UI",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "deadline": "2026-05-10",
    "projectId": "680a9aa18b719f3d2f495e0f",
    "assigneeId": "680a9a2e8b719f3d2f495df8",
    "assigneeName": "Jane Doe",
    "createdAt": "2026-04-25T10:11:36.456",
    "updatedAt": "2026-04-25T10:15:02.901"
  }
]
```

### POST `/projects/{projectId}/tasks`

Create a task in a project.

Path params:
- `projectId` (string)

Request body:
```json
{
  "title": "Create dashboard widgets",
  "description": "Total tasks, overdue, in progress",
  "priority": "MEDIUM",
  "deadline": "2026-05-12",
  "assigneeId": "680a9a2e8b719f3d2f495df8"
}
```

Validation:
- `title`: required

Response `201`: `TaskResponse`

### PATCH `/tasks/{taskId}/status`

Update task status.

Path params:
- `taskId` (string)

Request body:
```json
{
  "status": "IN_REVIEW"
}
```

Validation:
- `status`: required

Response `200`: `TaskResponse`

### DELETE `/tasks/{taskId}`

Delete task by ID.

Path params:
- `taskId` (string)

Response `204` with empty body.

---

## Members

### GET `/projects/{projectId}/members`

List project members.

Path params:
- `projectId` (string)

Response `200`: array of `ProjectMember`

### POST `/projects/{projectId}/members`

Add member by email.

Path params:
- `projectId` (string)

Request body:
```json
{
  "email": "member@example.com"
}
```

Response `201`: `ProjectMember`

### DELETE `/projects/{projectId}/members/{userId}`

Remove member from project.

Path params:
- `projectId` (string)
- `userId` (string)

Response `204` with empty body.

---

## Dashboard

### GET `/dashboard/stats`

Return aggregate counters.

Response `200`:
```json
{
  "totalTasks": 20,
  "todoCount": 6,
  "inProgressCount": 5,
  "inReviewCount": 3,
  "doneCount": 6,
  "overdueCount": 2
}
```

---

## Error Handling

Most validation failures return HTTP `400` with an error payload.
Authentication failures return `401`.
Entity lookup failures return `404` where applicable.
