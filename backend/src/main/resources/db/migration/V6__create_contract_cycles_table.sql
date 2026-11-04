-- V6: Create contract_cycles table
CREATE TABLE contract_cycles (
    id                  BIGSERIAL       PRIMARY KEY,
    subscription_id     BIGINT          NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    cycle_no            INT             NOT NULL,
    start_date          DATE            NOT NULL,
    end_date            DATE            NOT NULL,
    amount              NUMERIC(12,2),
    po_number           VARCHAR(100),
    po_date             DATE,
    status              VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE'
                        CHECK (status IN ('ACTIVE', 'RENEWAL_DUE', 'OVERDUE', 'RENEWED', 'LAPSED')),
    renewed_from_id     BIGINT          REFERENCES contract_cycles(id),
    notes               TEXT,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    UNIQUE (subscription_id, cycle_no)
);

CREATE INDEX idx_contract_cycles_subscription_id ON contract_cycles (subscription_id);
CREATE INDEX idx_contract_cycles_status ON contract_cycles (status);
CREATE INDEX idx_contract_cycles_end_date ON contract_cycles (end_date);
CREATE INDEX idx_contract_cycles_renewed_from ON contract_cycles (renewed_from_id);
