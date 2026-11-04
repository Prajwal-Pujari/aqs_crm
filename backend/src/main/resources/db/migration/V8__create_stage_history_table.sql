-- V8: Create stage_history table
CREATE TABLE stage_history (
    id              BIGSERIAL       PRIMARY KEY,
    company_id      BIGINT          NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    from_stage      VARCHAR(30),
    to_stage        VARCHAR(30)     NOT NULL,
    changed_by      BIGINT          REFERENCES users(id),
    notes           TEXT,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stage_history_company_id ON stage_history (company_id);
CREATE INDEX idx_stage_history_created_at ON stage_history (created_at);
