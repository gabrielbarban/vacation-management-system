# Vacation Management System

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.10-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A full-stack employee vacation management system with role-based access control, built for TaskFlow Ltda.

## 📋 Table of Contents

- [Vacation Management System](#vacation-management-system)
  - [📋 Table of Contents](#-table-of-contents)
  - [✨ Features](#-features)
  - [🛠 Tech Stack](#-tech-stack)
    - [Backend](#backend)
    - [Frontend](#frontend)
    - [DevOps](#devops)
  - [📦 Prerequisites](#-prerequisites)
  - [🚀 Quick Start](#-quick-start)
  - [👤 Test Accounts](#-test-accounts)
  - [🔌 API Endpoints](#-api-endpoints)
    - [Authentication](#authentication)
    - [Future Endpoints (Coming Soon)](#future-endpoints-coming-soon)
  - [📁 Project Structure](#-project-structure)
  - [💻 Development](#-development)
    - [Running Locally (Without Docker)](#running-locally-without-docker)
    - [Environment Variables](#environment-variables)
  - [📐 Business Rules](#-business-rules)
  - [🗄 Database Schema](#-database-schema)
    - [Users Table](#users-table)
    - [Vacation Requests Table](#vacation-requests-table)
  - [🔒 Security](#-security)
  - [🔧 Troubleshooting](#-troubleshooting)
  - [📚 References](#-references)
    - [Documentation](#documentation)
    - [Libraries \& Tools](#libraries--tools)
    - [Articles \& Tutorials](#articles--tutorials)
  - [📄 License](#-license)
  - [👨‍💻 Author](#-author)

## ✨ Features

- **Authentication & Authorization** with JWT tokens
- **Role-based access control** (Admin, Manager, Collaborator)
- **Vacation request management** with approval workflow
- **Overlap validation** to prevent scheduling conflicts
- **Responsive UI** built with Next.js and Tailwind CSS
- **Dockerized deployment** for easy setup

## 🛠 Tech Stack

### Backend
- [Java 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
- [Spring Boot 3.4.10](https://spring.io/projects/spring-boot)
- [Spring Security](https://spring.io/projects/spring-security) with JWT
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [PostgreSQL](https://www.postgresql.org/)
- [Lombok](https://projectlombok.org/)
- [jjwt](https://github.com/jwtk/jjwt) - JWT implementation

### Frontend
- [Next.js 15](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Context API](https://react.dev/reference/react/createContext)

### DevOps
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Maven](https://maven.apache.org/)

## 📦 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) 20.10+
- [Docker Compose](https://docs.docker.com/compose/install/) 2.0+

## 🚀 Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd vacation-management-system
```

2. **Start the application**
```bash
docker-compose up --build
```

3. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

## 👤 Test Accounts

The system comes with pre-configured test accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@taskflow.com | admin123 |
| Manager | manager@taskflow.com | manager123 |
| Collaborator | user@taskflow.com | user123 |

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Future Endpoints (Coming Soon)
- `GET /api/users` - List all users (Admin only)
- `POST /api/users` - Create user (Admin only)
- `GET /api/vacations` - List vacation requests
- `POST /api/vacations` - Create vacation request
- `PUT /api/vacations/{id}/approve` - Approve request (Manager/Admin)
- `PUT /api/vacations/{id}/reject` - Reject request (Manager/Admin)

## 📁 Project Structure

```
vacation-management-system/
├── backend/
│   ├── src/main/java/com/taskflow/vacation/
│   │   ├── config/          # Security & app configuration
│   │   ├── controller/      # REST controllers
│   │   ├── dto/             # Data transfer objects
│   │   ├── entity/          # JPA entities
│   │   ├── repository/      # Data access layer
│   │   ├── security/        # JWT & authentication
│   │   └── service/         # Business logic
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── app/                 # Next.js pages
│   ├── components/          # React components
│   ├── contexts/            # React contexts
│   ├── lib/                 # Utilities
│   ├── types/               # TypeScript types
│   └── Dockerfile
└── docker-compose.yml
```

## 💻 Development

### Running Locally (Without Docker)

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

### Environment Variables

**Backend (.env or docker-compose.yml):**
- `SPRING_DATASOURCE_URL` - PostgreSQL connection URL
- `SPRING_DATASOURCE_USERNAME` - Database username
- `SPRING_DATASOURCE_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRATION` - Token expiration time (ms)

**Frontend (.env.local):**
- `NEXT_PUBLIC_API_URL` - Backend API URL

## 📐 Business Rules

1. **User Management**
   - Only Admins can create, edit, and delete users
   - Each Collaborator must be assigned to a Manager

2. **Vacation Requests**
   - Collaborators can only create and view their own requests
   - Managers can approve/reject requests from their team
   - Admins have full access to all requests
   - Overlapping vacation dates are prevented system-wide
   - Date ranges are inclusive (e.g., Aug 1-5 includes all 5 days)

3. **Request Status**
   - `PENDING` - Awaiting approval
   - `APPROVED` - Approved by Manager/Admin
   - `REJECTED` - Rejected by Manager/Admin

## 🗄 Database Schema

### Users Table
- id (PK)
- email (unique)
- password (encrypted)
- name
- role (ADMIN, MANAGER, COLLABORATOR)
- manager_id (FK, nullable)
- created_at

### Vacation Requests Table
- id (PK)
- user_id (FK)
- start_date
- end_date
- status (PENDING, APPROVED, REJECTED)
- created_at

## 🔒 Security

- Passwords encrypted using [BCrypt](https://en.wikipedia.org/wiki/Bcrypt)
- [JWT tokens](https://jwt.io/) for stateless authentication
- CORS configured for frontend access
- Role-based endpoint protection with [Spring Security](https://spring.io/projects/spring-security)

## 🔧 Troubleshooting

**Docker build fails:**
```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

**Backend won't start:**
- Check PostgreSQL is running: `docker ps`
- Verify database credentials in docker-compose.yml

**Frontend can't connect to backend:**
- Ensure backend is running on port 8080
- Check CORS settings in SecurityConfig.java

## 📚 References

### Documentation
- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/)
- [Spring Security Reference](https://docs.spring.io/spring-security/reference/index.html)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Libraries & Tools
- [jjwt - Java JWT Library](https://github.com/jwtk/jjwt)
- [Lombok](https://projectlombok.org/)
- [Hibernate ORM](https://hibernate.org/orm/)
- [Maven](https://maven.apache.org/)
- [TypeScript](https://www.typescriptlang.org/docs/)

### Articles & Tutorials
- [JWT Authentication in Spring Boot](https://www.baeldung.com/spring-security-oauth-jwt)
- [Next.js Authentication Patterns](https://nextjs.org/docs/pages/building-your-application/authentication)
- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [RESTful API Best Practices](https://restfulapi.net/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Gabriel Barban Rocha**

---