# AQS CRM — Industrial Enterprise Customer Relationship Management

A unified, high-performance industrial CRM built for enterprise B2B workflows, annual calibration/software contracts, purchase orders, MinIO S3 document management, and sales pipeline tracking.

---

## Architecture Overview

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Paper & Sage calm minimalist theme, served via **Nginx** reverse proxy on **Port 8099**.
- **Backend**: Spring Boot 3.4, Java 21, Spring Security (Stateless JWT), Flyway database migrations, Hibernate/JPA.
- **Database**: PostgreSQL 16 Alpine.
- **Cache & Queues**: Redis 7 Alpine.
- **Object Storage**: MinIO S3 for secure Purchase Order (PO) PDF/image storage and SHA-256 hashing.

---

## Linux Server Deployment (Port 8099)

### 1. Prerequisites
- Linux OS (Ubuntu 22.04+, Debian 12+, RHEL 9+, etc.)
- [Docker Engine](https://docs.docker.com/engine/install/) & Docker Compose plugin (`docker compose version` >= v2.20)

### 2. Setup Environment
```bash
git clone https://github.com/Prajwal-Pujari/aqs_crm.git
cd aqs_crm

# Copy environment template
cp .env.example .env
```

*(Edit `.env` if you wish to change PostgreSQL passwords, MinIO keys, or SMTP email credentials.)*

### 3. Start the Entire System
Run one command to build and start all containers:
```bash
docker compose -f docker-compose.linux.yml up -d --build
```

To view real-time logs:
```bash
docker compose -f docker-compose.linux.yml logs -f
```

To stop the system:
```bash
docker compose -f docker-compose.linux.yml down
```

To completely reset the database to a fresh clean state:
```bash
docker compose -f docker-compose.linux.yml down -v
docker compose -f docker-compose.linux.yml up -d --build
```

---

## Accessing the CRM

Open your web browser and navigate to:
```text
http://<YOUR_LINUX_SERVER_IP>:8099
```

### Default Sign-In Credentials
- **Username**: `admin`
- **Password**: `password`

### Pre-Seeded Catalog
The database starts clean with **zero dummy client accounts**, and has the core AQS software product catalog pre-configured:
- **GMS** — Gauge Management System
- **NABL** — NABL Calibration Software (ISO/IEC 17025)
- **QMS** — Quality Management System (CAPA, Audits)
- **LCMS** — Lab Calibration & Chemical Management
- **Industrial Automations** — SCADA & PLC telemetry

---

## Ports Mapping

| Service | Internal Container Port | Host Port | Purpose |
|---|---|---|---|
| Frontend (Nginx) | `80` | **`8099`** | Web Application & `/api` proxy |
| Backend (Spring Boot) | `8080` | Internal network | REST API |
| PostgreSQL | `5432` | Internal network | Relational Database |
| Redis | `6379` | Internal network | Caching & Rate Limiting |
| MinIO S3 | `9000` | Internal network | PO Document Vault |
