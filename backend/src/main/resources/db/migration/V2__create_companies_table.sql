-- V2: Create companies table
CREATE TABLE companies (
    id              BIGSERIAL       PRIMARY KEY,
    name            VARCHAR(255)    NOT NULL,
    industry        VARCHAR(100),
    website         VARCHAR(255),
    address         TEXT,
    city            VARCHAR(100),
    state           VARCHAR(100),
    country         VARCHAR(100),
    phone           VARCHAR(50),
    notes           TEXT,
    pipeline_stage  VARCHAR(30)     NOT NULL DEFAULT 'LEAD'
                    CHECK (pipeline_stage IN (
                        'LEAD', 'IN_TALKS', 'DEMO', 'QUOTATION_SENT',
                        'PO_RECEIVED', 'INSTALLATION', 'LIVE',
                        'RENEWAL_DUE', 'RENEWED', 'LAPSED'
                    )),
    assigned_to     BIGINT          REFERENCES users(id),
    created_by      BIGINT          REFERENCES users(id),
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_companies_pipeline_stage ON companies (pipeline_stage);
CREATE INDEX idx_companies_assigned_to ON companies (assigned_to);
CREATE INDEX idx_companies_name ON companies (name);
