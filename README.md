# Vacation Management System

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.10-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

Full-stack system for managing employee vacation requests with role-based permissions. Built as a technical assessment project.

## Quick Start

**Prerequisites:** Docker and Docker Compose installed.

```bash
git clone <repository-url>
cd vacation-management-system
docker-compose up --build
```

Access the app at http://localhost:3000

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@taskflow.com | admin123 |
| Manager | manager@taskflow.com | manager123 |
| Collaborator | user@taskflow.com | user123 |

## What It Does

**Admin** can create/delete users and manage all vacation requests.

**Manager** can approve/reject requests from their team members.

**Collaborator** can create and manage their own vacation requests.

The system prevents overlapping vacation dates and enforces manager assignment for collaborators.

## API Documentation

Interactive API docs available at http://localhost:8080/swagger-ui.html

You can test all endpoints directly from Swagger. Click "Authorize" and paste your JWT token (get it from the login response).

## Main Endpoints

**Auth:**
- `POST /api/auth/login`

**Users (Admin only):**
- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/{id}`
- `DELETE /api/users/{id}`

**Vacations:**
- `GET /api/vacations` (filtered by role)
- `POST /api/vacations`
- `PUT /api/vacations/{id}/approve`
- `PUT /api/vacations/{id}/reject`
- `DELETE /api/vacations/{id}`

## Project Structure

```
vacation-management-system/
├── backend/              # Spring Boot API
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── entity/
│   └── security/
├── frontend/             # Next.js app
│   ├── app/
│   ├── components/
│   └── contexts/
└── docker-compose.yml
```

## Key Features

- Dark mode UI with calendar view
- JWT authentication
- Overlap validation for vacation dates
- Automatic role-based filtering
- Delete protection (can't delete users with existing requests)
- Password visibility toggle in forms

## Database

PostgreSQL with two main tables:

**users:** id, email, password, name, role, manager_id

**vacation_requests:** id, user_id, start_date, end_date, status

## Local Development

**Backend:**
```bash
cd backend
./mvnw spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Troubleshooting

If Docker fails, try:
```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

The `-v` flag removes volumes (database), useful if you need a fresh start.

## Author

Gabriel Barban Rocha

Built with Spring Boot, Next.js, and PostgreSQL.