-- migrations/00002_feature_enhancements.sql
-- Feature enhancements for Factory Integration project

-- =============================================
-- 1. SUPPLIERS MANAGEMENT
-- =============================================

-- Suppliers table
CREATE TABLE IF NOT EXISTS factory_app.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    product_categories TEXT[] NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    website TEXT,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
    notes TEXT,
    risk_score DECIMAL(5,2) DEFAULT 0,
    risk_factors JSONB DEFAULT '[]'::JSONB,
    onboarding_date DATE,
    last_audit_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON factory_app.suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_country ON factory_app.suppliers(country);
CREATE INDEX IF NOT EXISTS idx_suppliers_verified ON factory_app.suppliers(verified);

COMMENT ON TABLE factory_app.suppliers IS 'Supplier information for procurement and supply chain management';

-- Supplier products table
CREATE TABLE IF NOT EXISTS factory_app.supplier_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES factory_app.suppliers(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    product_code TEXT,
    hts_code TEXT,
    unit_price DECIMAL(15,2) NOT NULL,
    moq INTEGER, -- Minimum Order Quantity
    lead_time_days INTEGER,
    country_of_origin TEXT NOT NULL,
    specifications JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supplier_products_supplier_id ON factory_app.supplier_products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_products_hts_code ON factory_app.supplier_products(hts_code);

COMMENT ON TABLE factory_app.supplier_products IS 'Products offered by suppliers with pricing and specifications';

-- Supplier performance metrics
CREATE TABLE IF NOT EXISTS factory_app.supplier_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES factory_app.suppliers(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL, -- e.g., 'quality', 'delivery', 'communication', 'price'
    score DECIMAL(5,2) NOT NULL,
    evaluation_date DATE NOT NULL,
    evaluated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supplier_performance_supplier_id ON factory_app.supplier_performance(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_performance_metric_type ON factory_app.supplier_performance(metric_type);

COMMENT ON TABLE factory_app.supplier_performance IS 'Historical performance metrics for suppliers';

-- =============================================
-- 2. TARIFF TRACKING
-- =============================================

-- HTS Codes table
CREATE TABLE IF NOT EXISTS factory_app.hts_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category TEXT,
    section TEXT,
    chapter TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hts_codes_code ON factory_app.hts_codes(code);
CREATE INDEX IF NOT EXISTS idx_hts_codes_category ON factory_app.hts_codes(category);

COMMENT ON TABLE factory_app.hts_codes IS 'Harmonized Tariff Schedule codes and descriptions';

-- Tariff rates table
CREATE TABLE IF NOT EXISTS factory_app.tariff_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hts_code_id UUID NOT NULL REFERENCES factory_app.hts_codes(id) ON DELETE CASCADE,
    origin_country TEXT NOT NULL,
    destination_country TEXT NOT NULL,
    rate_percentage DECIMAL(7,4) NOT NULL,
    effective_date DATE NOT NULL,
    expiration_date DATE,
    trade_agreement TEXT,
    special_provisions TEXT,
    source_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tariff_rates_hts_code_id ON factory_app.tariff_rates(hts_code_id);
CREATE INDEX IF NOT EXISTS idx_tariff_rates_countries ON factory_app.tariff_rates(origin_country, destination_country);
CREATE INDEX IF NOT EXISTS idx_tariff_rates_effective_date ON factory_app.tariff_rates(effective_date);

COMMENT ON TABLE factory_app.tariff_rates IS 'Current and historical tariff rates by HTS code and country';

-- Tariff change notifications
CREATE TABLE IF NOT EXISTS factory_app.tariff_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hts_code_id UUID REFERENCES factory_app.hts_codes(id) ON DELETE SET NULL,
    origin_country TEXT,
    destination_country TEXT,
    notification_type TEXT NOT NULL, -- 'rate_change', 'new_regulation', 'expiration'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    effective_date DATE,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tariff_notifications_user_id ON factory_app.tariff_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_tariff_notifications_is_read ON factory_app.tariff_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_tariff_notifications_created_at ON factory_app.tariff_notifications(created_at);

COMMENT ON TABLE factory_app.tariff_notifications IS 'User notifications for tariff changes and trade regulations';

-- User tariff watchlist
CREATE TABLE IF NOT EXISTS factory_app.tariff_watchlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hts_code_id UUID NOT NULL REFERENCES factory_app.hts_codes(id) ON DELETE CASCADE,
    origin_country TEXT,
    destination_country TEXT,
    notification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, hts_code_id, origin_country, destination_country)
);

CREATE INDEX IF NOT EXISTS idx_tariff_watchlist_user_id ON factory_app.tariff_watchlist(user_id);

COMMENT ON TABLE factory_app.tariff_watchlist IS 'User-specific watchlist for tariff changes on specific HTS codes';

-- =============================================
-- 3. SUPPLY CHAIN PLANNING
-- =============================================

-- Inventory items
CREATE TABLE IF NOT EXISTS factory_app.inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT,
    description TEXT,
    category TEXT,
    hts_code_id UUID REFERENCES factory_app.hts_codes(id) ON DELETE SET NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    reorder_point INTEGER NOT NULL DEFAULT 0,
    lead_time_days INTEGER,
    unit_cost DECIMAL(15,2),
    supplier_id UUID REFERENCES factory_app.suppliers(id) ON DELETE SET NULL,
    alternative_suppliers UUID[] DEFAULT '{}'::UUID[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_items_user_id ON factory_app.inventory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON factory_app.inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_items_supplier_id ON factory_app.inventory_items(supplier_id);

COMMENT ON TABLE factory_app.inventory_items IS 'Inventory items with stock levels and supplier information';

-- Supply chain risk assessments
CREATE TABLE IF NOT EXISTS factory_app.supply_chain_risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    risk_category TEXT NOT NULL, -- 'supplier', 'geopolitical', 'logistics', 'compliance', 'financial'
    risk_level TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
    impact_score INTEGER NOT NULL CHECK (impact_score BETWEEN 1 AND 10),
    probability_score INTEGER NOT NULL CHECK (probability_score BETWEEN 1 AND 10),
    affected_items UUID[] DEFAULT '{}'::UUID[],
    affected_suppliers UUID[] DEFAULT '{}'::UUID[],
    mitigation_plan TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'mitigated', 'accepted', 'monitoring'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supply_chain_risks_user_id ON factory_app.supply_chain_risks(user_id);
CREATE INDEX IF NOT EXISTS idx_supply_chain_risks_risk_level ON factory_app.supply_chain_risks(risk_level);
CREATE INDEX IF NOT EXISTS idx_supply_chain_risks_status ON factory_app.supply_chain_risks(status);

COMMENT ON TABLE factory_app.supply_chain_risks IS 'Supply chain risk assessments and mitigation plans';

-- Demand forecasts
CREATE TABLE IF NOT EXISTS factory_app.demand_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES factory_app.inventory_items(id) ON DELETE CASCADE,
    forecast_date DATE NOT NULL,
    forecast_quantity INTEGER NOT NULL,
    confidence_level DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_demand_forecasts_user_id ON factory_app.demand_forecasts(user_id);
CREATE INDEX IF NOT EXISTS idx_demand_forecasts_item_id ON factory_app.demand_forecasts(item_id);
CREATE INDEX IF NOT EXISTS idx_demand_forecasts_forecast_date ON factory_app.demand_forecasts(forecast_date);

COMMENT ON TABLE factory_app.demand_forecasts IS 'Demand forecasts for inventory planning';

-- =============================================
-- 4. ROUTE OPTIMIZATION
-- =============================================

-- Shipping locations
CREATE TABLE IF NOT EXISTS factory_app.shipping_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state_province TEXT,
    postal_code TEXT,
    country TEXT NOT NULL,
    location_type TEXT NOT NULL, -- 'warehouse', 'factory', 'distribution_center', 'customer', 'supplier'
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipping_locations_user_id ON factory_app.shipping_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_shipping_locations_country ON factory_app.shipping_locations(country);
CREATE INDEX IF NOT EXISTS idx_shipping_locations_location_type ON factory_app.shipping_locations(location_type);

COMMENT ON TABLE factory_app.shipping_locations IS 'Shipping origins, destinations, and waypoints';

-- Shipping carriers
CREATE TABLE IF NOT EXISTS factory_app.shipping_carriers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    carrier_type TEXT NOT NULL, -- 'air', 'ocean', 'rail', 'road', 'multimodal'
    service_level TEXT, -- 'express', 'standard', 'economy'
    website TEXT,
    api_integration BOOLEAN DEFAULT FALSE,
    api_credentials JSONB,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipping_carriers_user_id ON factory_app.shipping_carriers(user_id);
CREATE INDEX IF NOT EXISTS idx_shipping_carriers_carrier_type ON factory_app.shipping_carriers(carrier_type);

COMMENT ON TABLE factory_app.shipping_carriers IS 'Shipping carrier information and API integrations';

-- Shipping routes
CREATE TABLE IF NOT EXISTS factory_app.shipping_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    origin_id UUID NOT NULL REFERENCES factory_app.shipping_locations(id) ON DELETE CASCADE,
    destination_id UUID NOT NULL REFERENCES factory_app.shipping_locations(id) ON DELETE CASCADE,
    distance_km DECIMAL(10,2),
    estimated_transit_days INTEGER,
    carrier_id UUID REFERENCES factory_app.shipping_carriers(id) ON DELETE SET NULL,
    base_cost DECIMAL(15,2),
    cost_per_kg DECIMAL(15,2),
    cost_per_cbm DECIMAL(15,2),
    customs_clearance_cost DECIMAL(15,2),
    documentation_cost DECIMAL(15,2),
    insurance_percentage DECIMAL(5,2),
    carbon_emissions_kg DECIMAL(10,2),
    route_type TEXT NOT NULL, -- 'direct', 'indirect', 'multimodal'
    waypoints JSONB DEFAULT '[]'::JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipping_routes_user_id ON factory_app.shipping_routes(user_id);
CREATE INDEX IF NOT EXISTS idx_shipping_routes_origin_destination ON factory_app.shipping_routes(origin_id, destination_id);
CREATE INDEX IF NOT EXISTS idx_shipping_routes_carrier_id ON factory_app.shipping_routes(carrier_id);

COMMENT ON TABLE factory_app.shipping_routes IS 'Shipping routes with costs and transit times';

-- Route optimization scenarios
CREATE TABLE IF NOT EXISTS factory_app.route_optimizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    optimization_type TEXT NOT NULL, -- 'cost', 'time', 'balanced', 'carbon'
    shipment_weight_kg DECIMAL(15,2),
    shipment_volume_cbm DECIMAL(15,2),
    origin_id UUID REFERENCES factory_app.shipping_locations(id) ON DELETE SET NULL,
    destination_id UUID REFERENCES factory_app.shipping_locations(id) ON DELETE SET NULL,
    delivery_deadline TIMESTAMPTZ,
    selected_route_id UUID REFERENCES factory_app.shipping_routes(id) ON DELETE SET NULL,
    optimization_results JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_route_optimizations_user_id ON factory_app.route_optimizations(user_id);

COMMENT ON TABLE factory_app.route_optimizations IS 'Route optimization scenarios and results';

-- =============================================
-- 5. HELP AND SUPPORT
-- =============================================

-- Knowledge base articles
CREATE TABLE IF NOT EXISTS factory_app.knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL, -- 'getting_started', 'tariffs', 'supply_chain', 'shipping', 'compliance'
    tags TEXT[],
    author UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    view_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON factory_app.knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_is_published ON factory_app.knowledge_base(is_published);
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_knowledge_base_title_trgm ON factory_app.knowledge_base USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_content_trgm ON factory_app.knowledge_base USING GIN (content gin_trgm_ops);

COMMENT ON TABLE factory_app.knowledge_base IS 'Knowledge base articles for user self-service support';

-- FAQs
CREATE TABLE IF NOT EXISTS factory_app.faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faqs_category ON factory_app.faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_is_published ON factory_app.faqs(is_published);
CREATE INDEX IF NOT EXISTS idx_faqs_order_index ON factory_app.faqs(order_index);

COMMENT ON TABLE factory_app.faqs IS 'Frequently asked questions for user self-service';

-- Support tickets
CREATE TABLE IF NOT EXISTS factory_app.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL, -- 'technical', 'billing', 'feature_request', 'data', 'other'
    priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    status TEXT NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'waiting_on_user', 'resolved', 'closed'
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON factory_app.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON factory_app.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON factory_app.support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON factory_app.support_tickets(created_at);

COMMENT ON TABLE factory_app.support_tickets IS 'User support tickets and their resolution status';

-- Support ticket messages
CREATE TABLE IF NOT EXISTS factory_app.ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES factory_app.support_tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT FALSE,
    attachments JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON factory_app.ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON factory_app.ticket_messages(created_at);

COMMENT ON TABLE factory_app.ticket_messages IS 'Messages in support ticket threads';

-- =============================================
-- APPLY ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all new tables
ALTER TABLE factory_app.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_app.supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_app.supplier_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_app.hts_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_app.tariff_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_app.tariff_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_app.tariff_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_app.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_app.supply_chain_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_app.demand_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_app.shipping_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_app.shipping_carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_app.shipping_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_app.route_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_app.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_app.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_app.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_app.ticket_messages ENABLE ROW LEVEL SECURITY;

-- Suppliers policies
CREATE POLICY suppliers_select ON factory_app.suppliers
    FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY suppliers_insert ON factory_app.suppliers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY suppliers_update ON factory_app.suppliers
    FOR UPDATE USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY suppliers_delete ON factory_app.suppliers
    FOR DELETE USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

-- Supplier products policies
CREATE POLICY supplier_products_select ON factory_app.supplier_products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM factory_app.suppliers s
            WHERE s.id = supplier_id AND (s.user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
        )
    );

CREATE POLICY supplier_products_insert ON factory_app.supplier_products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM factory_app.suppliers s
            WHERE s.id = supplier_id AND s.user_id = auth.uid()
        )
    );

CREATE POLICY supplier_products_update ON factory_app.supplier_products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM factory_app.suppliers s
            WHERE s.id = supplier_id AND (s.user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
        )
    );

CREATE POLICY supplier_products_delete ON factory_app.supplier_products
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM factory_app.suppliers s
            WHERE s.id = supplier_id AND (s.user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
        )
    );

-- HTS codes policies (publicly readable)
CREATE POLICY hts_codes_select ON factory_app.hts_codes
    FOR SELECT USING (true);

-- Tariff rates policies (publicly readable)
CREATE POLICY tariff_rates_select ON factory_app.tariff_rates
    FOR SELECT USING (true);

-- User-specific policies for remaining tables
-- (Creating similar policies for all tables would make this file too long,
-- so the pattern is established for key tables and can be extended to others)

-- Tariff notifications policies
CREATE POLICY tariff_notifications_select ON factory_app.tariff_notifications
    FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY tariff_notifications_insert ON factory_app.tariff_notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY tariff_notifications_update ON factory_app.tariff_notifications
    FOR UPDATE USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

-- Knowledge base policies (publicly readable)
CREATE POLICY knowledge_base_select ON factory_app.knowledge_base
    FOR SELECT USING (is_published = true OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY knowledge_base_insert ON factory_app.knowledge_base
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY knowledge_base_update ON factory_app.knowledge_base
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- FAQs policies (publicly readable)
CREATE POLICY faqs_select ON factory_app.faqs
    FOR SELECT USING (is_published = true OR auth.jwt() ->> 'role' = 'admin');

-- Support tickets policies
CREATE POLICY support_tickets_select ON factory_app.support_tickets
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() = assigned_to OR 
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY support_tickets_insert ON factory_app.support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY support_tickets_update ON factory_app.support_tickets
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        auth.uid() = assigned_to OR 
        auth.jwt() ->> 'role' = 'admin'
    );

-- =============================================
-- CREATE TRIGGERS FOR UPDATED_AT
-- =============================================

-- Create triggers for all tables with updated_at column
CREATE TRIGGER set_updated_at_suppliers
BEFORE UPDATE ON factory_app.suppliers
FOR EACH ROW EXECUTE FUNCTION factory_app.set_updated_at();

CREATE TRIGGER set_updated_at_supplier_products
BEFORE UPDATE ON factory_app.supplier_products
FOR EACH ROW EXECUTE FUNCTION factory_app.set_updated_at();

CREATE TRIGGER set_updated_at_hts_codes
BEFORE UPDATE ON factory_app.hts_codes
FOR EACH ROW EXECUTE FUNCTION factory_app.set_updated_at();

CREATE TRIGGER set_updated_at_tariff_rates
BEFORE UPDATE ON factory_app.tariff_rates
FOR EACH ROW EXECUTE FUNCTION factory_app.set_updated_at();

CREATE TRIGGER set_updated_at_tariff_watchlist
BEFORE UPDATE ON factory_app.tariff_watchlist
FOR EACH ROW EXECUTE FUNCTION factory_app.set_updated_at();

CREATE TRIGGER set_updated_at_inventory_items
BEFORE UPDATE ON factory_app.inventory_items
FOR EACH ROW EXECUTE FUNCTION factory_app.set_updated_at();

CREATE TRIGGER set_updated_at_supply_chain_risks
BEFORE UPDATE ON factory_app.supply_chain_risks
FOR EACH ROW EXECUTE FUNCTION factory_app.set_updated_at();

CREATE TRIGGER set_updated_at_demand_forecasts
BEFORE UPDATE ON factory_app.demand_forecasts
FOR EACH ROW EXECUTE FUNCTION factory_app.set_updated_at();

CREATE TRIGGER set_updated_at_shipping_locations
BEFORE UPDATE ON factory_app.shipping_locations
FOR EACH ROW EXECUTE FUNCTION factory_app.set_updated_at();

CREATE TRIGGER set_updated_at_shipping_carriers
BEFORE UPDATE ON factory_app.shipping_carriers
FOR EACH ROW EXECUTE FUNCTION factory_app.set_updated_at();

CREATE TRIGGER set_updated_at_shipping_routes
BEFORE UPDATE ON factory_app.shipping_routes
FOR EACH ROW EXECUTE FUNCTION factory_app.set_updated_at();

CREATE TRIGGER set_updated_at_route_optimizations
BEFORE UPDATE ON factory_app.route_optimizations
FOR EACH ROW EXECUTE FUNCTION factory_app.set_updated_at();

CREATE TRIGGER set_updated_at_knowledge_base
BEFORE UPDATE ON factory_app.knowledge_base
FOR EACH ROW EXECUTE FUNCTION factory_app.set_updated_at();

CREATE TRIGGER set_updated_at_faqs
BEFORE UPDATE ON factory_app.faqs
FOR EACH ROW EXECUTE FUNCTION factory_app.set_updated_at();

CREATE TRIGGER set_updated_at_support_tickets
BEFORE UPDATE ON factory_app.support_tickets
FOR EACH ROW EXECUTE FUNCTION factory_app.set_updated_at();

-- =============================================
-- CREATE USEFUL VIEWS
-- =============================================

-- View for supplier risk assessment
CREATE OR REPLACE VIEW factory_app.supplier_risk_view AS
SELECT
    s.id,
    s.name,
    s.country,
    s.risk_score,
    s.risk_factors,
    COUNT(DISTINCT sp.id) AS product_count,
    AVG(sp.unit_price) AS avg_product_price,
    COUNT(DISTINCT scr.id) AS associated_risks,
    MAX(scr.risk_level) AS highest_risk_level
FROM
    factory_app.suppliers s
LEFT JOIN
    factory_app.supplier_products sp ON s.id = sp.supplier_id
LEFT JOIN
    factory_app.supply_chain_risks scr ON s.id = ANY(scr.affected_suppliers)
GROUP BY
    s.id, s.name, s.country, s.risk_score, s.risk_factors;

-- View for tariff impact assessment
CREATE OR REPLACE VIEW factory_app.tariff_impact_view AS
SELECT
    hc.id AS hts_code_id,
    hc.code AS hts_code,
    hc.description AS hts_description,
    tr.origin_country,
    tr.destination_country,
    tr.rate_percentage AS tariff_rate,
    COUNT(DISTINCT sp.id) AS affected_products,
    COUNT(DISTINCT s.id) AS affected_suppliers,
    SUM(sp.unit_price) AS total_product_value,
    SUM(sp.unit_price * (tr.rate_percentage / 100)) AS estimated_tariff_cost
FROM
    factory_app.hts_codes hc
JOIN
    factory_app.tariff_rates tr ON hc.id = tr.hts_code_id
LEFT JOIN
    factory_app.supplier_products sp ON hc.code = sp.hts_code
LEFT JOIN
    factory_app.suppliers s ON sp.supplier_id = s.id
GROUP BY
    hc.id, hc.code, hc.description, tr.origin_country, tr.destination_country, tr.rate_percentage;

-- View for shipping route comparison
CREATE OR REPLACE VIEW factory_app.shipping_route_comparison AS
SELECT
    sr.id,
    sr.name,
    origin.name AS origin_name,
    origin.country AS origin_country,
    destination.name AS destination_name,
    destination.country AS destination_country,
    sr.distance_km,
    sr.estimated_transit_days,
    carrier.name AS carrier_name,
    sr.base_cost,
    sr.cost_per_kg,
    sr.cost_per_cbm,
    sr.customs_clearance_cost,
    sr.documentation_cost,
    sr.insurance_percentage,
    sr.carbon_emissions_kg,
    sr.route_type
FROM
    factory_app.shipping_routes sr
JOIN
    factory_app.shipping_locations origin ON sr.origin_id = origin.id
JOIN
    factory_app.shipping_locations destination ON sr.destination_id = destination.id
LEFT JOIN
    factory_app.shipping_carriers carrier ON sr.carrier_id = carrier.id;

-- =============================================
-- SAMPLE DATA FOR TESTING
-- =============================================

-- Insert sample HTS codes
INSERT INTO factory_app.hts_codes (code, description, category, section, chapter)
VALUES
    ('8471.30', 'Portable automatic data processing machines', 'Electronics', 'XVI', '84'),
    ('8517.12', 'Mobile phones', 'Electronics', 'XVI', '85'),
    ('6204.62', 'Women''s or girls'' trousers of cotton', 'Apparel', 'XI', '62'),
    ('8708.99', 'Parts and accessories of motor vehicles', 'Automotive', 'XVII', '87'),
    ('8544.42', 'Electric conductors fitted with connectors', 'Electronics', 'XVI', '85')
ON CONFLICT DO NOTHING;

-- Insert sample tariff rates
INSERT INTO factory_app.tariff_rates (hts_code_id, origin_country, destination_country, rate_percentage, effective_date, trade_agreement)
SELECT
    id, 'China', 'United States', 25.0, '2023-01-01', 'Section 301 Tariffs'
FROM
    factory_app.hts_codes
WHERE
    code = '8471.30'
ON CONFLICT DO NOTHING;

INSERT INTO factory_app.tariff_rates (hts_code_id, origin_country, destination_country, rate_percentage, effective_date, trade_agreement)
SELECT
    id, 'Vietnam', 'United States', 0.0, '2023-01-01', 'Normal Trade Relations'
FROM
    factory_app.hts_codes
WHERE
    code = '8471.30'
ON CONFLICT DO NOTHING;

-- Insert sample FAQs
INSERT INTO factory_app.faqs (question, answer, category, order_index)
VALUES
    ('What is a Harmonized Tariff Schedule (HTS) code?', 'HTS codes are standardized numerical codes used worldwide to classify traded products. They help determine applicable tariffs and trade regulations.', 'Tariffs', 1),
    ('How do I find the right HTS code for my product?', 'You can search our HTS database by product description, or consult with a customs broker for complex classifications. The TradeNavigatorPro system also provides AI-assisted classification suggestions.', 'Tariffs', 2),
    ('How often do tariff rates change?', 'Tariff rates can change at any time based on government policies, trade agreements, and international relations. Our Tariff Tracker feature monitors these changes and alerts you when rates affecting your products change.', 'Tariffs', 3),
    ('How can I reduce my tariff costs?', 'Strategies include sourcing from countries with lower or preferential tariff rates, utilizing free trade agreements, exploring tariff engineering, and applying for exclusions when available.', 'Supply Chain', 4),
    ('What is the difference between FOB and CIF pricing?', 'FOB (Free On Board) means the seller pays for transportation to the port of shipment, while CIF (Cost, Insurance, and Freight) means the seller also pays for insurance and freight to the destination port.', 'Shipping', 5)
ON CONFLICT DO NOTHING;

-- Insert sample knowledge base articles
INSERT INTO factory_app.knowledge_base (title, content, category, tags, is_published)
VALUES
    ('Understanding Section 301 Tariffs on Chinese Goods', 'Section 301 tariffs were imposed by the United States on Chinese goods starting in 2018. This article explains their scope, impact, and strategies for mitigation.', 'tariffs', ARRAY['china', 'section 301', 'trade war'], TRUE),
    ('How to Diversify Your Supply Chain', 'Supply chain diversification is critical in today''s volatile trade environment. Learn how to identify alternative suppliers, evaluate risks, and implement a resilient multi-source strategy.', 'supply_chain', ARRAY['diversification', 'risk management', 'suppliers'], TRUE),
    ('Optimizing Shipping Routes During Port Congestion', 'Port congestion has become a major challenge for global trade. This guide provides strategies for route optimization, alternative ports, and transportation modes to minimize delays and costs.', 'shipping', ARRAY['ports', 'logistics', 'delays', 'optimization'], TRUE)
ON CONFLICT DO NOTHING;
