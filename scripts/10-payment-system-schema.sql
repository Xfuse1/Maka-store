-- Payment System Database Schema with Security Features
-- This script creates all tables needed for secure payment processing

-- ============================================
-- 1. PAYMENT METHODS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL, -- 'cashier', 'cod', 'bank_transfer'
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    config JSONB DEFAULT '{}', -- Store API keys, endpoints, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. PAYMENT TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_method_id UUID NOT NULL REFERENCES payment_methods(id),
    
    -- Transaction Details
    transaction_id TEXT UNIQUE, -- External payment gateway transaction ID
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'MAD',
    status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed, refunded
    
    -- Payment Gateway Response
    gateway_response JSONB DEFAULT '{}',
    gateway_reference TEXT,
    
    -- Security & Encryption
    encrypted_data TEXT, -- Encrypted sensitive payment data
    signature TEXT, -- Digital signature for verification
    ip_address INET,
    user_agent TEXT,
    
    -- Risk Assessment
    risk_score INTEGER DEFAULT 0, -- 0-100
    risk_level TEXT DEFAULT 'low', -- low, medium, high, critical
    fraud_flags JSONB DEFAULT '[]',
    
    -- Timestamps
    initiated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
    CONSTRAINT valid_risk_level CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT positive_amount CHECK (amount > 0)
);

-- ============================================
-- 3. PAYMENT LOGS TABLE (Audit Trail)
-- ============================================
CREATE TABLE IF NOT EXISTS payment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES payment_transactions(id) ON DELETE CASCADE,
    
    -- Log Details
    event_type TEXT NOT NULL, -- 'initiated', 'processing', 'completed', 'failed', 'refund_requested', etc.
    message TEXT,
    details JSONB DEFAULT '{}',
    
    -- Security Context
    ip_address INET,
    user_agent TEXT,
    user_id UUID REFERENCES customers(id),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. FRAUD DETECTION RULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS fraud_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    rule_type TEXT NOT NULL, -- 'velocity', 'amount', 'location', 'device', 'pattern'
    
    -- Rule Configuration
    conditions JSONB NOT NULL, -- Rule conditions in JSON format
    action TEXT NOT NULL, -- 'flag', 'block', 'review', 'alert'
    severity TEXT DEFAULT 'medium', -- low, medium, high, critical
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_action CHECK (action IN ('flag', 'block', 'review', 'alert')),
    CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

-- ============================================
-- 5. SECURITY EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL, -- 'suspicious_activity', 'fraud_attempt', 'multiple_failures', etc.
    severity TEXT NOT NULL DEFAULT 'low',
    
    -- Event Details
    description TEXT,
    details JSONB DEFAULT '{}',
    
    -- Related Entities
    transaction_id UUID REFERENCES payment_transactions(id),
    customer_id UUID REFERENCES customers(id),
    order_id UUID REFERENCES orders(id),
    
    -- Security Context
    ip_address INET,
    user_agent TEXT,
    location JSONB, -- Country, city, etc.
    
    -- Status
    status TEXT DEFAULT 'open', -- open, investigating, resolved, false_positive
    resolved_at TIMESTAMPTZ,
    resolved_by UUID,
    resolution_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT valid_status CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive'))
);

-- ============================================
-- 6. PAYMENT REFUNDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment_refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES payment_transactions(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id),
    
    -- Refund Details
    refund_amount NUMERIC(10, 2) NOT NULL,
    refund_reason TEXT,
    refund_type TEXT DEFAULT 'full', -- full, partial
    
    -- Status
    status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
    
    -- Gateway Response
    gateway_refund_id TEXT,
    gateway_response JSONB DEFAULT '{}',
    
    -- Timestamps
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_refund_status CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    CONSTRAINT valid_refund_type CHECK (refund_type IN ('full', 'partial')),
    CONSTRAINT positive_refund_amount CHECK (refund_amount > 0)
);

-- ============================================
-- 7. PAYMENT WEBHOOKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Webhook Details
    source TEXT NOT NULL, -- 'cashier', 'stripe', etc.
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    
    -- Processing Status
    status TEXT DEFAULT 'pending', -- pending, processing, processed, failed
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Security
    signature TEXT,
    signature_verified BOOLEAN DEFAULT false,
    ip_address INET,
    
    -- Timestamps
    received_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_webhook_status CHECK (status IN ('pending', 'processing', 'processed', 'failed'))
);

-- ============================================
-- 8. PAYMENT RATE LIMITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identifier (IP, Customer ID, etc.)
    identifier_type TEXT NOT NULL, -- 'ip', 'customer', 'card'
    identifier_value TEXT NOT NULL,
    
    -- Rate Limit Tracking
    attempt_count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    window_end TIMESTAMPTZ,
    
    -- Status
    is_blocked BOOLEAN DEFAULT false,
    blocked_until TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(identifier_type, identifier_value)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Payment Transactions Indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_risk_level ON payment_transactions(risk_level);

-- Payment Logs Indexes
CREATE INDEX IF NOT EXISTS idx_payment_logs_transaction_id ON payment_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_event_type ON payment_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON payment_logs(created_at DESC);

-- Security Events Indexes
CREATE INDEX IF NOT EXISTS idx_security_events_status ON security_events(status);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_customer_id ON security_events(customer_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);

-- Payment Webhooks Indexes
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_status ON payment_webhooks(status);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_source ON payment_webhooks(source);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_created_at ON payment_webhooks(created_at DESC);

-- Rate Limits Indexes
CREATE INDEX IF NOT EXISTS idx_payment_rate_limits_identifier ON payment_rate_limits(identifier_type, identifier_value);
CREATE INDEX IF NOT EXISTS idx_payment_rate_limits_blocked ON payment_rate_limits(is_blocked);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fraud_rules_updated_at BEFORE UPDATE ON fraud_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_events_updated_at BEFORE UPDATE ON security_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_refunds_updated_at BEFORE UPDATE ON payment_refunds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_rate_limits_updated_at BEFORE UPDATE ON payment_rate_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all payment tables
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_rate_limits ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies (service role can bypass RLS)
-- These tables should only be accessed via server-side code with service role

-- Payment Methods: Read-only for authenticated users, full access for service role
CREATE POLICY "Allow read payment methods" ON payment_methods
    FOR SELECT USING (is_active = true);

-- Payment Transactions: No direct access, only via API
CREATE POLICY "No direct access to transactions" ON payment_transactions
    FOR ALL USING (false);

-- Payment Logs: No direct access
CREATE POLICY "No direct access to logs" ON payment_logs
    FOR ALL USING (false);

-- Fraud Rules: No direct access
CREATE POLICY "No direct access to fraud rules" ON fraud_rules
    FOR ALL USING (false);

-- Security Events: No direct access
CREATE POLICY "No direct access to security events" ON security_events
    FOR ALL USING (false);

-- Payment Refunds: No direct access
CREATE POLICY "No direct access to refunds" ON payment_refunds
    FOR ALL USING (false);

-- Payment Webhooks: No direct access
CREATE POLICY "No direct access to webhooks" ON payment_webhooks
    FOR ALL USING (false);

-- Rate Limits: No direct access
CREATE POLICY "No direct access to rate limits" ON payment_rate_limits
    FOR ALL USING (false);

COMMENT ON TABLE payment_methods IS 'Available payment methods (Cashier, COD, etc.)';
COMMENT ON TABLE payment_transactions IS 'All payment transactions with encryption and fraud detection';
COMMENT ON TABLE payment_logs IS 'Audit trail for all payment activities';
COMMENT ON TABLE fraud_rules IS 'Configurable fraud detection rules';
COMMENT ON TABLE security_events IS 'Security incidents and suspicious activities';
COMMENT ON TABLE payment_refunds IS 'Payment refund requests and processing';
COMMENT ON TABLE payment_webhooks IS 'Incoming webhooks from payment gateways';
COMMENT ON TABLE payment_rate_limits IS 'Rate limiting for payment attempts';
