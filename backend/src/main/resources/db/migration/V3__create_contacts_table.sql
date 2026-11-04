-- V3: Create contacts table
CREATE TABLE contacts (
    id                  BIGSERIAL       PRIMARY KEY,
    company_id          BIGINT          NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    first_name          VARCHAR(100)    NOT NULL,
    last_name           VARCHAR(100),
    email               VARCHAR(255),
    phone               VARCHAR(50),
    role                VARCHAR(100),
    is_billing          BOOLEAN         NOT NULL DEFAULT FALSE,
    opted_in_greetings  BOOLEAN         NOT NULL DEFAULT TRUE,
    opted_in_promos     BOOLEAN         NOT NULL DEFAULT TRUE,
    unsubscribe_token   VARCHAR(64)     UNIQUE,
    notes               TEXT,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contacts_company_id ON contacts (company_id);
CREATE INDEX idx_contacts_billing ON contacts (company_id) WHERE is_billing = TRUE;
CREATE INDEX idx_contacts_unsubscribe_token ON contacts (unsubscribe_token) WHERE unsubscribe_token IS NOT NULL;
