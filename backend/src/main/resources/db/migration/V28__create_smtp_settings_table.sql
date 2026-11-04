-- V28: Create smtp_settings table for dynamic database-backed email configuration
CREATE TABLE smtp_settings (
    id BIGSERIAL PRIMARY KEY,
    host VARCHAR(255) NOT NULL DEFAULT 'smtpout.secureserver.net',
    port INT NOT NULL DEFAULT 587,
    protocol VARCHAR(20) NOT NULL DEFAULT 'smtp',
    username VARCHAR(255),
    password VARCHAR(500),
    from_email VARCHAR(255),
    from_name VARCHAR(255) DEFAULT 'AQS Renewal CRM',
    starttls_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    ssl_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial default record (unconfigured credentials)
INSERT INTO smtp_settings (host, port, protocol, username, password, from_email, from_name, starttls_enabled, ssl_enabled, is_active)
VALUES ('smtpout.secureserver.net', 587, 'smtp', NULL, NULL, NULL, 'AQS Renewal CRM', TRUE, FALSE, TRUE);

