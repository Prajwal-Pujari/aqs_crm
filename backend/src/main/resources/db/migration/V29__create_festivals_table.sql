-- V29: Create festivals and festival_greetings_log tables, and seed greeting template

-- Insert default festive email template
INSERT INTO email_templates (template_key, subject, body_html, category, is_active)
VALUES (
    'festival_greeting_default',
    'Warm Festive Greetings from AQS on {{festival_name}}!',
    '<html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><p>Dear {{contact_name}},</p><p>On the joyous occasion of <strong>{{festival_name}}</strong>, the entire team at <strong>Aarush Quality Services</strong> conveys our heartfelt greetings and best wishes to you, your family, and everyone at <strong>{{company_name}}</strong>.</p><p>{{custom_message}}</p><p>We value our partnership and look forward to your continued success.</p><p>Warm regards,<br/><strong>Team Aarush Quality Services (AQS)</strong></p><br/><hr style="border:none; border-top: 1px solid #ddd;"/><p style="font-size: 11px; color: #888;">You are receiving this greeting because {{company_name}} is a valued partner of AQS. If you wish to unsubscribe from greeting notes, you can <a href="{{unsubscribe_url}}" style="color: #446254;">update your communication preferences here</a>.</p></body></html>',
    'GREETING',
    TRUE
)
ON CONFLICT (template_key) DO NOTHING;

-- Create festivals table
CREATE TABLE festivals (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    festival_date       DATE NOT NULL,
    template_key        VARCHAR(100) NOT NULL DEFAULT 'festival_greeting_default',
    custom_message      TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_festivals_date ON festivals(festival_date);
CREATE INDEX idx_festivals_active ON festivals(is_active);

-- Create festival greetings log table for idempotency
CREATE TABLE festival_greetings_log (
    id                  BIGSERIAL PRIMARY KEY,
    festival_id         BIGINT NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
    contact_id          BIGINT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    greeting_year       INT NOT NULL,
    sent_at             TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_festival_contact_year UNIQUE (festival_id, contact_id, greeting_year)
);

CREATE INDEX idx_fgl_festival ON festival_greetings_log(festival_id);
CREATE INDEX idx_fgl_contact ON festival_greetings_log(contact_id);

-- Seed prominent festivals
INSERT INTO festivals (name, festival_date, template_key, custom_message, is_active) VALUES
('New Year', '2026-01-01', 'festival_greeting_default', 'May the new year bring immense prosperity, innovation, and success to your operations.', TRUE),
('Republic Day', '2026-01-26', 'festival_greeting_default', 'Proudly celebrating India’s progress, excellence, and shared achievements with our industry partners.', TRUE),
('Holi', '2026-03-04', 'festival_greeting_default', 'Wishing you and your team a colorful, vibrant, and prosperous Holi season.', TRUE),
('Independence Day', '2026-08-15', 'festival_greeting_default', 'Celebrating our nation’s growth, engineering strength, and bright future together.', TRUE),
('Ganesh Chaturthi', '2026-09-14', 'festival_greeting_default', 'May Lord Ganesha remove all obstacles and bestow success, wisdom, and good health upon your endeavors.', TRUE),
('Dussehra', '2026-10-20', 'festival_greeting_default', 'Wishing you a joyful Vijayadashami filled with the triumph of virtue, hard work, and continuous growth.', TRUE),
('Diwali', '2026-11-08', 'festival_greeting_default', 'May the divine light of Diwali illuminate your journey with boundless joy, peace, and industrial prosperity.', TRUE);

