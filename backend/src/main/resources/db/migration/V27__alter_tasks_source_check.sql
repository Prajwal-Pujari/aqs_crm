-- V27: Allow ACTIVITY_FOLLOWUP in tasks_source_check
ALTER TABLE tasks DROP CONSTRAINT tasks_source_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_source_check
    CHECK (source IN ('MANUAL', 'INSTALLATION_CHECKLIST', 'REMINDER', 'SYSTEM', 'ACTIVITY_FOLLOWUP'));

