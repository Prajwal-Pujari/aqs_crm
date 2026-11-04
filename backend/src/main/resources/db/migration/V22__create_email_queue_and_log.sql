-- V22: Create email_queue and email_log tables

CREATE TABLE email_queue (
    id              BIGSERIAL       PRIMARY KEY,
    to_email        VARCHAR(255)    NOT NULL,
    to_name         VARCHAR(100),
    subject         VARCHAR(255)    NOT NULL,
    body_html       TEXT            NOT NULL,
    category        VARCHAR(20)     NOT NULL DEFAULT 'TRANSACTIONAL'
                    CHECK (category IN ('TRANSACTIONAL', 'PROMOTIONAL', 'GREETING', 'MARKETING')),
    status          VARCHAR(15)     NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'CANCELLED')),
    retry_count     INTEGER         NOT NULL DEFAULT 0,
    max_retries     INTEGER         NOT NULL DEFAULT 3,
    error_message   TEXT,
    scheduled_at    TIMESTAMP       NOT NULL DEFAULT NOW(),
    processed_at    TIMESTAMP,
    company_id      BIGINT          REFERENCES companies(id) ON DELETE SET NULL,
    contact_id      BIGINT          REFERENCES contacts(id) ON DELETE SET NULL,
    cycle_id        BIGINT          REFERENCES contract_cycles(id) ON DELETE SET NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_eq_status ON email_queue(status, scheduled_at);
CREATE INDEX idx_eq_company ON email_queue(company_id);
CREATE INDEX idx_eq_cycle ON email_queue(cycle_id);

CREATE TABLE email_log (
    id              BIGSERIAL       PRIMARY KEY,
    queue_id        BIGINT          REFERENCES email_queue(id) ON DELETE SET NULL,
    to_email        VARCHAR(255)    NOT NULL,
    to_name         VARCHAR(100),
    subject         VARCHAR(255)    NOT NULL,
    category        VARCHAR(20)     NOT NULL,
    status          VARCHAR(10)     NOT NULL CHECK (status IN ('SENT', 'FAILED')),
    error_message   TEXT,
    company_id      BIGINT          REFERENCES companies(id) ON DELETE SET NULL,
    contact_id      BIGINT          REFERENCES contacts(id) ON DELETE SET NULL,
    cycle_id        BIGINT          REFERENCES contract_cycles(id) ON DELETE SET NULL,
    sent_at         TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_el_company ON email_log(company_id);
CREATE INDEX idx_el_cycle ON email_log(cycle_id);
CREATE INDEX idx_el_status ON email_log(status);
CREATE INDEX idx_el_sent_at ON email_log(sent_at);

