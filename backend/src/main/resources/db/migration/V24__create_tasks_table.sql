-- V24: Create tasks table

CREATE TABLE tasks (
    id              BIGSERIAL       PRIMARY KEY,
    company_id      BIGINT          NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    cycle_id        BIGINT          REFERENCES contract_cycles(id) ON DELETE SET NULL,
    title           VARCHAR(255)    NOT NULL,
    description     TEXT,
    due_date        DATE,
    is_completed    BOOLEAN         NOT NULL DEFAULT FALSE,
    completed_at    TIMESTAMP,
    assigned_to     BIGINT          REFERENCES users(id) ON DELETE SET NULL,
    created_by      BIGINT          REFERENCES users(id) ON DELETE SET NULL,
    priority        VARCHAR(20)     NOT NULL DEFAULT 'MEDIUM'
                    CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    source          VARCHAR(30)     DEFAULT 'MANUAL'
                    CHECK (source IN ('MANUAL', 'INSTALLATION_CHECKLIST', 'REMINDER', 'SYSTEM')),
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_company ON tasks(company_id);
CREATE INDEX idx_tasks_cycle ON tasks(cycle_id);
CREATE INDEX idx_tasks_due ON tasks(due_date) WHERE is_completed = FALSE;
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);

