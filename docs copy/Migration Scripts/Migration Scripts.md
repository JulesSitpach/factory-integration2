Migration Scripts
Provide initial schema and example migration scripts for updates ([Simple Talk]).

Example:

sql
-- Add a column for user language preference
ALTER TABLE users ADD COLUMN preferred_language TEXT DEFAULT 'en';
