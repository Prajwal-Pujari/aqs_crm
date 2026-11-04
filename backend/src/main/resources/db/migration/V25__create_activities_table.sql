-- V25: Create activities table for client communication tracking
CREATE TABLE activities (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    contact_id BIGINT REFERENCES contacts(id) ON DELETE SET NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('CALL', 'TEXT', 'EMAIL', 'MEETING', 'NOTE')),
    subject VARCHAR(255) NOT NULL,
    details TEXT,
    outcome VARCHAR(100),
    next_follow_up DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activities_company_id ON activities(company_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);

