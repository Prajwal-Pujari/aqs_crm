-- V18: Create audit_log table
CREATE TABLE audit_log (
    id              BIGSERIAL       PRIMARY KEY,
    entity_type     VARCHAR(100)    NOT NULL,
    entity_id       BIGINT          NOT NULL,
    action          VARCHAR(20)     NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'STAGE_CHANGE', 'RENEWAL')),
    field_name      VARCHAR(100),
    old_value       TEXT,
    new_value       TEXT,
    changed_by      BIGINT          REFERENCES users(id),
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_entity ON audit_log (entity_type, entity_id);
CREATE INDEX idx_audit_log_created_at ON audit_log (created_at);
CREATE INDEX idx_audit_log_changed_by ON audit_log (changed_by);
