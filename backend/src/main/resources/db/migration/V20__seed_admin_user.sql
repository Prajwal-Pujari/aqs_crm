-- V20: Seed admin user
-- Password: admin123 (BCrypt encoded)
INSERT INTO users (username, email, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES (
    'admin',
    'admin@aqs.com',
    '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
    'System Administrator',
    'ADMIN',
    TRUE,
    NOW(),
    NOW()
);
