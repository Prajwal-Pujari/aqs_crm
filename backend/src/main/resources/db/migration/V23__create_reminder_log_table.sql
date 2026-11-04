-- V23: Create reminder_log table for idempotency and tracking

CREATE TABLE reminder_log (
    id              BIGSERIAL       PRIMARY KEY,
    cycle_id        BIGINT          NOT NULL REFERENCES contract_cycles(id) ON DELETE CASCADE,
    reminder_type   VARCHAR(30)     NOT NULL,
    contact_id      BIGINT          REFERENCES contacts(id) ON DELETE SET NULL,
    email_queue_id  BIGINT          REFERENCES email_queue(id) ON DELETE SET NULL,
    is_cancelled    BOOLEAN         NOT NULL DEFAULT FALSE,
    sent_at         TIMESTAMP       NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cycle_reminder_contact UNIQUE (cycle_id, reminder_type, contact_id)
);

CREATE INDEX idx_rl_cycle ON reminder_log(cycle_id);
CREATE INDEX idx_rl_cancelled ON reminder_log(is_cancelled);
CREATE INDEX idx_rl_type ON reminder_log(reminder_type);

