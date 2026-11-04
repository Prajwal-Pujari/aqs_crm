-- V21: Seed email templates, reminder config, and ShedLock table

-- ShedLock table for distributed locking
CREATE TABLE IF NOT EXISTS shedlock (
    name        VARCHAR(64)     NOT NULL,
    lock_until  TIMESTAMP       NOT NULL,
    locked_at   TIMESTAMP       NOT NULL,
    locked_by   VARCHAR(255)    NOT NULL,
    PRIMARY KEY (name)
);

-- Email templates table
CREATE TABLE email_templates (
    id              BIGSERIAL       PRIMARY KEY,
    template_key    VARCHAR(100)    NOT NULL UNIQUE,
    subject         VARCHAR(500)    NOT NULL,
    body_html       TEXT            NOT NULL,
    category        VARCHAR(30)     NOT NULL DEFAULT 'TRANSACTIONAL'
                    CHECK (category IN ('TRANSACTIONAL', 'PROMOTIONAL', 'GREETING')),
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Reminder config table
CREATE TABLE reminder_config (
    id              BIGSERIAL       PRIMARY KEY,
    trigger_code    VARCHAR(30)     NOT NULL UNIQUE,
    days_offset     INT             NOT NULL,
    template_id     BIGINT          NOT NULL REFERENCES email_templates(id),
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Seed renewal reminder email templates
INSERT INTO email_templates (template_key, subject, body_html, category) VALUES
(
    'renewal_reminder_60',
    'Renewal Reminder: Your {{product_name}} subscription expires in 60 days',
    '<html><body><p>Dear {{contact_name}},</p><p>This is a friendly reminder that your <strong>{{product_name}}</strong> subscription for <strong>{{company_name}}</strong> is due for renewal on <strong>{{end_date}}</strong>, which is 60 days from now.</p><p>Please contact us to discuss renewal options.</p><p>Best regards,<br/>AQS Team</p></body></html>',
    'TRANSACTIONAL'
),
(
    'renewal_reminder_30',
    'Renewal Reminder: Your {{product_name}} subscription expires in 30 days',
    '<html><body><p>Dear {{contact_name}},</p><p>Your <strong>{{product_name}}</strong> subscription for <strong>{{company_name}}</strong> will expire on <strong>{{end_date}}</strong>, which is 30 days away.</p><p>To ensure uninterrupted service, please initiate the renewal process at your earliest convenience.</p><p>Best regards,<br/>AQS Team</p></body></html>',
    'TRANSACTIONAL'
),
(
    'renewal_reminder_15',
    'Action Required: Your {{product_name}} subscription expires in 15 days',
    '<html><body><p>Dear {{contact_name}},</p><p>Your <strong>{{product_name}}</strong> subscription for <strong>{{company_name}}</strong> is expiring on <strong>{{end_date}}</strong> — only 15 days remaining.</p><p>Please take action to renew your subscription and avoid any service disruption.</p><p>Best regards,<br/>AQS Team</p></body></html>',
    'TRANSACTIONAL'
),
(
    'renewal_reminder_7',
    'Urgent: Your {{product_name}} subscription expires in 7 days',
    '<html><body><p>Dear {{contact_name}},</p><p><strong>Urgent:</strong> Your <strong>{{product_name}}</strong> subscription for <strong>{{company_name}}</strong> will expire on <strong>{{end_date}}</strong> — just 7 days away.</p><p>Please renew immediately to prevent service interruption.</p><p>Best regards,<br/>AQS Team</p></body></html>',
    'TRANSACTIONAL'
),
(
    'overdue_notice_3',
    'Overdue Notice: Your {{product_name}} subscription expired 3 days ago',
    '<html><body><p>Dear {{contact_name}},</p><p>Your <strong>{{product_name}}</strong> subscription for <strong>{{company_name}}</strong> expired on <strong>{{end_date}}</strong>, which was 3 days ago.</p><p>Your service may be affected. Please contact us immediately to renew.</p><p>Best regards,<br/>AQS Team</p></body></html>',
    'TRANSACTIONAL'
),
(
    'overdue_notice_10',
    'Final Notice: Your {{product_name}} subscription expired 10 days ago',
    '<html><body><p>Dear {{contact_name}},</p><p><strong>Final Notice:</strong> Your <strong>{{product_name}}</strong> subscription for <strong>{{company_name}}</strong> expired on <strong>{{end_date}}</strong>, which was 10 days ago.</p><p>Without renewal, your account may be marked as lapsed. Please contact us urgently.</p><p>Best regards,<br/>AQS Team</p></body></html>',
    'TRANSACTIONAL'
);

-- Seed reminder config (negative days_offset = before expiry, positive = after expiry)
INSERT INTO reminder_config (trigger_code, days_offset, template_id) VALUES
('BEFORE_60', -60, (SELECT id FROM email_templates WHERE template_key = 'renewal_reminder_60')),
('BEFORE_30', -30, (SELECT id FROM email_templates WHERE template_key = 'renewal_reminder_30')),
('BEFORE_15', -15, (SELECT id FROM email_templates WHERE template_key = 'renewal_reminder_15')),
('BEFORE_7',  -7,  (SELECT id FROM email_templates WHERE template_key = 'renewal_reminder_7')),
('AFTER_3',    3,  (SELECT id FROM email_templates WHERE template_key = 'overdue_notice_3')),
('AFTER_10',  10,  (SELECT id FROM email_templates WHERE template_key = 'overdue_notice_10'));
