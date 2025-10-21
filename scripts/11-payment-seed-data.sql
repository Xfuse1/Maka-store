-- Seed Data for Payment System
-- Insert initial payment methods and fraud rules

-- ============================================
-- 1. INSERT PAYMENT METHODS
-- ============================================

INSERT INTO payment_methods (name, code, is_active, display_order, config) VALUES
('الدفع عند الاستلام', 'cod', true, 1, '{
    "description_ar": "ادفعي عند استلام طلبك",
    "description_en": "Pay when you receive your order",
    "fee": 0,
    "min_amount": 0,
    "max_amount": 5000
}'::jsonb),

('كاشير - الدفع الإلكتروني', 'cashier', true, 2, '{
    "description_ar": "الدفع الآمن عبر بطاقة الائتمان",
    "description_en": "Secure payment via credit card",
    "api_endpoint": "https://api.cashier.com/v1",
    "supported_cards": ["visa", "mastercard", "mada"],
    "fee_percentage": 2.5,
    "min_amount": 10,
    "max_amount": 50000
}'::jsonb),

('تحويل بنكي', 'bank_transfer', true, 3, '{
    "description_ar": "تحويل مباشر إلى حسابنا البنكي",
    "description_en": "Direct transfer to our bank account",
    "bank_name": "البنك الأهلي",
    "account_number": "SA1234567890",
    "iban": "SA0380000000608010167519",
    "fee": 0,
    "processing_time": "1-3 أيام عمل"
}'::jsonb)

ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    config = EXCLUDED.config,
    updated_at = NOW();

-- ============================================
-- 2. INSERT FRAUD DETECTION RULES
-- ============================================

INSERT INTO fraud_rules (name, description, rule_type, conditions, action, severity, is_active, priority) VALUES

-- Velocity Rules
('تعدد محاولات الدفع', 'أكثر من 5 محاولات دفع في 10 دقائق', 'velocity', '{
    "max_attempts": 5,
    "time_window_minutes": 10,
    "scope": "ip_address"
}'::jsonb, 'block', 'high', true, 1),

('تعدد الطلبات من نفس العميل', 'أكثر من 3 طلبات في ساعة واحدة', 'velocity', '{
    "max_orders": 3,
    "time_window_minutes": 60,
    "scope": "customer_id"
}'::jsonb, 'review', 'medium', true, 2),

-- Amount Rules
('مبلغ مشبوه - مرتفع جداً', 'طلب بمبلغ أكثر من 10,000 درهم', 'amount', '{
    "threshold": 10000,
    "operator": "greater_than"
}'::jsonb, 'review', 'high', true, 3),

('مبلغ مشبوه - منخفض جداً', 'طلب بمبلغ أقل من 10 دراهم', 'amount', '{
    "threshold": 10,
    "operator": "less_than"
}'::jsonb, 'flag', 'low', true, 4),

-- Location Rules
('دولة عالية المخاطر', 'طلب من دولة مدرجة في القائمة السوداء', 'location', '{
    "blocked_countries": ["XX", "YY"],
    "check_type": "country_code"
}'::jsonb, 'block', 'critical', true, 5),

('تغيير مفاجئ في الموقع', 'طلبات من مواقع مختلفة في وقت قصير', 'location', '{
    "max_distance_km": 100,
    "time_window_minutes": 30
}'::jsonb, 'review', 'medium', true, 6),

-- Device Rules
('جهاز جديد', 'أول طلب من جهاز جديد بمبلغ كبير', 'device', '{
    "min_amount": 1000,
    "check_device_history": true
}'::jsonb, 'review', 'medium', true, 7),

-- Pattern Rules
('نمط مشبوه - نفس البطاقة', 'استخدام نفس البطاقة لعدة حسابات', 'pattern', '{
    "check_type": "card_reuse",
    "max_accounts": 3
}'::jsonb, 'flag', 'high', true, 8),

('نمط مشبوه - نفس العنوان', 'استخدام نفس عنوان الشحن لعدة حسابات', 'pattern', '{
    "check_type": "address_reuse",
    "max_accounts": 5
}'::jsonb, 'flag', 'medium', true, 9),

('فشل متكرر في الدفع', 'أكثر من 3 محاولات فاشلة متتالية', 'velocity', '{
    "max_failures": 3,
    "time_window_minutes": 30,
    "scope": "customer_id"
}'::jsonb, 'block', 'high', true, 10)

ON CONFLICT DO NOTHING;

-- ============================================
-- 3. INSERT SAMPLE SECURITY EVENT (for testing)
-- ============================================

-- This is just for demonstration - real events will be created by the system
INSERT INTO security_events (event_type, severity, description, details, status) VALUES
('system_initialized', 'low', 'نظام الأمان تم تفعيله بنجاح', '{
    "version": "1.0.0",
    "timestamp": "2025-01-01T00:00:00Z"
}'::jsonb, 'resolved')
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify payment methods
SELECT 
    name,
    code,
    is_active,
    display_order
FROM payment_methods
ORDER BY display_order;

-- Verify fraud rules
SELECT 
    name,
    rule_type,
    action,
    severity,
    is_active,
    priority
FROM fraud_rules
ORDER BY priority;

-- Show table counts
SELECT 
    'payment_methods' as table_name, 
    COUNT(*) as count 
FROM payment_methods
UNION ALL
SELECT 
    'fraud_rules' as table_name, 
    COUNT(*) as count 
FROM fraud_rules
UNION ALL
SELECT 
    'security_events' as table_name, 
    COUNT(*) as count 
FROM security_events;
