-- migrations/00001_initial_schema.sql
-- Initial schema setup for Factory Integration project

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set up custom types
CREATE TYPE user_role AS ENUM ('admin', 'engineer', 'operator', 'viewer');
CREATE TYPE integration_type AS ENUM ('erp', 'mes', 'scada', 'iot', 'database', 'api', 'file', 'custom');
CREATE TYPE integration_status AS ENUM ('active', 'inactive', 'error', 'configuring');
CREATE TYPE job_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');

-- Create schema for application tables
CREATE SCHEMA IF NOT EXISTS factory_app;

-- User profiles (extends Supabase auth.users)
CREATE TABLE factory_app.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role user_role NOT NULL DEFAULT 'viewer',
    department TEXT,
    employee_id TEXT UNIQUE,
    preferences JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE factory_app.user_profiles IS 'Extended profile information for users';

-- Cost calculations history
CREATE TABLE factory_app.cost_calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    materials DECIMAL(15, 2) NOT NULL CHECK (materials >= 0),
    labor DECIMAL(15, 2) NOT NULL CHECK (labor >= 0),
    overhead DECIMAL(15, 2) NOT NULL CHECK (overhead >= 0),
    total_cost DECIMAL(15, 2) NOT NULL,
    name TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cost_calculations_user_id ON factory_app.cost_calculations(user_id);
CREATE INDEX idx_cost_calculations_created_at ON factory_app.cost_calculations(created_at);

COMMENT ON TABLE factory_app.cost_calculations IS 'History of manufacturing cost calculations';

-- System integration configurations
CREATE TABLE factory_app.integration_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    integration_type integration_type NOT NULL,
    config JSONB NOT NULL,
    credentials JSONB DEFAULT '{}'::JSONB,
    status integration_status NOT NULL DEFAULT 'inactive',
    last_connected_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_integration_configs_type ON factory_app.integration_configs(integration_type);
CREATE INDEX idx_integration_configs_status ON factory_app.integration_configs(status);

COMMENT ON TABLE factory_app.integration_configs IS 'Configuration for external system integrations';

-- Integration data mappings
CREATE TABLE factory_app.data_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id UUID NOT NULL REFERENCES factory_app.integration_configs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    source_path TEXT NOT NULL,
    target_path TEXT NOT NULL,
    transformation_logic JSONB DEFAULT '{}'::JSONB,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_data_mappings_integration_id ON factory_app.data_mappings(integration_id);

COMMENT ON TABLE factory_app.data_mappings IS 'Field mappings between source and target systems';

-- Integration jobs
CREATE TABLE factory_app.integration_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id UUID NOT NULL REFERENCES factory_app.integration_configs(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL,
    status job_status NOT NULL DEFAULT 'pending',
    payload JSONB,
    result JSONB,
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_integration_jobs_integration_id ON factory_app.integration_jobs(integration_id);
CREATE INDEX idx_integration_jobs_status ON factory_app.integration_jobs(status);
CREATE INDEX idx_integration_jobs_created_at ON factory_app.integration_jobs(created_at);

COMMENT ON TABLE factory_app.integration_jobs IS 'History of integration job executions';

-- Audit log
CREATE TABLE factory_app.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user_id ON factory_app.audit_log(user_id);
CREATE INDEX idx_audit_log_entity ON factory_app.audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created_at ON factory_app.audit_log(created_at);

COMMENT ON TABLE factory_app.audit_log IS 'Audit trail of system actions';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION factory_app.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_user_profiles
BEFORE UPDATE ON factory_app.user_profiles
FOR EACH ROW EXECUTE FUNCTION factory_app.set_updated_at();

CREATE TRIGGER set_updated_at_integration_configs
BEFORE UPDATE ON factory_app.integration_configs
FOR EACH ROW EXECUTE FUNCTION factory_app.set_updated_at();

CREATE TRIGGER set_updated_at_data_mappings
BEFORE UPDATE ON factory_app.data_mappings
FOR EACH ROW EXECUTE FUNCTION factory_app.set_updated_at();

-- RLS Policies

-- Enable RLS on all tables
ALTER TABLE factory_app.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_app.cost_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_app.integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_app.data_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_app.integration_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_app.audit_log ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY user_profiles_select ON factory_app.user_profiles 
    FOR SELECT USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY user_profiles_update ON factory_app.user_profiles 
    FOR UPDATE USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');

-- Cost calculations policies
CREATE POLICY cost_calculations_insert ON factory_app.cost_calculations 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY cost_calculations_select ON factory_app.cost_calculations 
    FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

-- Integration configs policies
CREATE POLICY integration_configs_select ON factory_app.integration_configs 
    FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'engineer'));

CREATE POLICY integration_configs_insert ON factory_app.integration_configs 
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY integration_configs_update ON factory_app.integration_configs 
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY integration_configs_delete ON factory_app.integration_configs 
    FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Data mappings policies
CREATE POLICY data_mappings_select ON factory_app.data_mappings 
    FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'engineer'));

CREATE POLICY data_mappings_insert ON factory_app.data_mappings 
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'engineer'));

CREATE POLICY data_mappings_update ON factory_app.data_mappings 
    FOR UPDATE USING (auth.jwt() ->> 'role' IN ('admin', 'engineer'));

-- Integration jobs policies
CREATE POLICY integration_jobs_select ON factory_app.integration_jobs 
    FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'engineer', 'operator'));

-- Audit log policies
CREATE POLICY audit_log_select ON factory_app.audit_log 
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Function to record audit logs
CREATE OR REPLACE FUNCTION factory_app.create_audit_log(
    p_user_id UUID,
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id UUID,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_audit_id UUID;
BEGIN
    INSERT INTO factory_app.audit_log (
        user_id,
        action,
        entity_type,
        entity_id,
        old_values,
        new_values,
        ip_address,
        user_agent
    ) VALUES (
        p_user_id,
        p_action,
        p_entity_type,
        p_entity_id,
        p_old_values,
        p_new_values,
        current_setting('request.headers', true)::json->>'x-forwarded-for',
        current_setting('request.headers', true)::json->>'user-agent'
    )
    RETURNING id INTO v_audit_id;
    
    RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate total cost
CREATE OR REPLACE FUNCTION factory_app.calculate_total_cost(
    p_materials DECIMAL,
    p_labor DECIMAL,
    p_overhead DECIMAL
)
RETURNS DECIMAL AS $$
BEGIN
    RETURN p_materials + p_labor + p_overhead;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a view for active integrations
CREATE VIEW factory_app.active_integrations AS
SELECT 
    id,
    name,
    description,
    integration_type,
    status,
    last_connected_at,
    created_at,
    updated_at
FROM 
    factory_app.integration_configs
WHERE 
    status = 'active';

COMMENT ON VIEW factory_app.active_integrations IS 'View of currently active system integrations';

-- Note: Admin user will be created when first user signs up
-- Use this script after first signup to make them admin:
-- UPDATE factory_app.user_profiles SET role = 'admin' WHERE id = auth.uid();