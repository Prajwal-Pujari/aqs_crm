# AQS CRM

A full-featured Customer Relationship Management application built for AQS. Manages companies, contacts, subscriptions, contract renewals, pipeline tracking, and automated email reminders.

## Tech Stack

| Layer        | Technology                                      |
|--------------|------------------------------------------------ |
| Backend      | Java 21, Spring Boot 3.4.1, Spring Security (JWT) |
| Database     | PostgreSQL 16, Flyway migrations                |
| Cache        | Redis 7                                         |
| File Storage | MinIO (S3-compatible)                           |
| Scheduling   | Spring Scheduler + ShedLock                     |
| API Docs     | SpringDoc OpenAPI (Swagger UI)                  |
| Testing      | JUnit 5, Testcontainers                         |
| Build        | Maven, Docker, Docker Compose                   |

## Quick Start

### Run with Docker Compose (recommended)

```bash
# Copy environment file and customize
cp .env.example .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app
```

The app will be available at **http://localhost:8080**.

### Run Backend Locally (development)

Prerequisites: Java 21, Maven, PostgreSQL, Redis, MinIO running locally.

```bash
# Start infrastructure services only
docker-compose up -d postgres redis minio

# Run the backend
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

## Default Credentials

| User    | Password   | Role  |
|---------|------------|-------|
| admin   | admin123   | ADMIN |

> **⚠️ Change the admin password immediately after first login.**

## Environment Variables

See [`.env.example`](.env.example) for all available configuration variables:

| Variable                    | Description                        | Default                        |
|-----------------------------|------------------------------------|--------------------------------|
| `POSTGRES_DB`              | PostgreSQL database name           | `aqs_crm`                     |
| `POSTGRES_USER`            | PostgreSQL username                | `aqs_user`                    |
| `POSTGRES_PASSWORD`        | PostgreSQL password                | `changeme`                    |
| `SPRING_DATASOURCE_URL`   | JDBC connection URL                | `jdbc:postgresql://postgres:5432/aqs_crm` |
| `SPRING_REDIS_HOST`       | Redis host                         | `redis`                       |
| `SPRING_REDIS_PORT`       | Redis port                         | `6379`                        |
| `MINIO_ENDPOINT`          | MinIO server URL                   | `http://minio:9000`           |
| `MINIO_ACCESS_KEY`        | MinIO access key                   | `minioadmin`                  |
| `MINIO_SECRET_KEY`        | MinIO secret key                   | `minioadmin`                  |
| `MINIO_BUCKET`            | MinIO bucket for PO documents      | `aqs-po-documents`            |
| `JWT_SECRET`              | JWT signing secret (256-bit)       | _change in production_        |
| `JWT_EXPIRATION_MS`       | JWT token expiration (ms)          | `86400000` (24h)              |
| `SPRING_MAIL_HOST`        | SMTP host                          | `smtpout.secureserver.net`    |
| `SPRING_MAIL_PORT`        | SMTP port                          | `465`                         |
| `SPRING_MAIL_USERNAME`    | SMTP username                      | `noreply@yourdomain.com`      |
| `SPRING_MAIL_PASSWORD`    | SMTP password                      | `changeme`                    |
| `APP_BASE_URL`            | Application base URL               | `http://localhost:8080`       |
| `APP_TIMEZONE`            | Application timezone               | `Asia/Kolkata`                |

## API Documentation

Once the application is running, visit:

- **Swagger UI**: http://localhost:8080/swagger-ui
- **OpenAPI JSON**: http://localhost:8080/api-docs

## Code Conventions

- **Layered architecture**: Controller → Service → Repository
- **DTOs**: Use Java records, separate from entities
- **Base entity**: All entities extend `BaseEntity` (provides `id`, `createdAt`, `updatedAt`)
- **Validation**: Use `@Valid` and Jakarta validation annotations on request DTOs
- **API responses**: Controllers return `ResponseEntity<ApiResponse<T>>` or `ResponseEntity<PagedResponse<T>>`
- **Injection**: Constructor injection only (no `@Autowired` on fields)
- **Transactions**: `@Transactional` on service methods that modify data
- **Logging**: `@Slf4j` from Lombok
- **Auditing**: `@EntityListeners(AuditingEntityListener.class)` with `@CreatedDate` / `@LastModifiedDate`
- **Lombok**: `@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder`
- **Package structure**: Each domain feature as `entity`, `repository`, `service`, `controller`, `dto`

## Build Phases

| Phase | Scope                                                              |
|-------|--------------------------------------------------------------------|
| 1     | Auth, Users, Companies, Contacts, Products                        |
| 2     | Subscriptions, Contract Cycles, PO Documents, Pipeline, Renewals  |
| 3     | Email automation, Reminders, Audit log, Checklist                 |
| 4     | Dashboard, Reports, Frontend                                      |

## Database Migrations

Migrations are managed by **Flyway** and located in:

```
backend/src/main/resources/db/migration/
```

Naming convention: `V{number}__{description}.sql`

Migrations run automatically on application startup. To add a new migration, create a new SQL file with the next version number.

## Testing

Tests use **Testcontainers** for integration testing with a real PostgreSQL instance.

```bash
cd backend
mvn test
```

Test classes are located in `backend/src/test/java/com/aqs/crm/`.

## Project Structure

```
aqs_crm/
├── backend/
│   ├── src/main/java/com/aqs/crm/
│   │   ├── AqsCrmApplication.java
│   │   ├── common/              # Shared utilities, base classes, responses
│   │   ├── config/              # Security, Redis, MinIO, OpenAPI config
│   │   ├── auth/                # Authentication (JWT login, registration)
│   │   ├── user/                # User management
│   │   ├── company/             # Company / Pipeline management
│   │   ├── contact/             # Contact management
│   │   ├── product/             # Product catalog
│   │   ├── subscription/        # Subscriptions
│   │   ├── contract/            # Contract cycles, renewals
│   │   ├── document/            # PO document upload/download
│   │   ├── email/               # Email templates and sending
│   │   ├── reminder/            # Automated renewal reminders
│   │   ├── audit/               # Audit logging
│   │   └── checklist/           # Company onboarding checklists
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── application-dev.yml
│   │   └── db/migration/        # Flyway SQL migrations
│   ├── src/test/
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                    # React/Next.js frontend (Phase 4)
├── docker-compose.yml
├── .env.example
├── .gitignore
└── CLAUDE.md
```
