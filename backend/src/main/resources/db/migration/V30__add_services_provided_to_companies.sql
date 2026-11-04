-- V30: Add services_provided column to companies table and seed standard AQS software products

ALTER TABLE companies ADD COLUMN services_provided VARCHAR(500);

-- Seed existing companies with standard services
UPDATE companies SET services_provided = 'QMS, Automations' WHERE name LIKE 'Acme%';
UPDATE companies SET services_provided = 'GMS, NABL' WHERE name LIKE 'Apex%';
UPDATE companies SET services_provided = 'LCMS, Automations' WHERE name LIKE 'Zenith%';
UPDATE companies SET services_provided = 'Automations, QMS' WHERE name LIKE 'Titan%';
UPDATE companies SET services_provided = 'GMS, QMS, NABL' WHERE services_provided IS NULL;

-- Seed core AQS software products
INSERT INTO products (name, description, current_version, annual_price, is_active)
VALUES
('GMS (Gauge Management System)', 'Comprehensive gauge calibration, inspection history, repeatability & reproducibility (R&R) studies, and recall alerts', 'v3.2', 25000.00, TRUE),
('NABL Calibration Software', 'ISO/IEC 17025 compliant laboratory calibration management system with certificate generator', 'v4.0', 35000.00, TRUE),
('QMS (Quality Management System)', 'Enterprise CAPA, non-conformance tracking, internal audits, document control and quality workflows', 'v2.5', 40000.00, TRUE),
('LCMS (Lab Calibration & Chemical)', 'Laboratory chemical tracking, sample management, instrument telemetry, and chemical logbooks', 'v2.0', 30000.00, TRUE),
('Industrial Automations', 'SCADA telemetry integration, PLC sensor collectors, automated reports, and real-time machine dashboards', 'v1.8', 50000.00, TRUE)
ON CONFLICT (name) DO NOTHING;

