-- V7: Create po_documents table
CREATE TABLE po_documents (
    id              BIGSERIAL       PRIMARY KEY,
    cycle_id        BIGINT          NOT NULL REFERENCES contract_cycles(id) ON DELETE CASCADE,
    file_name       VARCHAR(255)    NOT NULL,
    content_type    VARCHAR(50)     NOT NULL CHECK (content_type IN ('image/jpeg', 'image/png', 'application/pdf')),
    file_size       BIGINT          NOT NULL,
    minio_bucket    VARCHAR(100)    NOT NULL,
    minio_key       VARCHAR(500)    NOT NULL,
    file_hash       VARCHAR(64),
    uploaded_by     BIGINT          REFERENCES users(id),
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_po_documents_cycle_id ON po_documents (cycle_id);
