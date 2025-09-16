-- Verify the complete database setup

-- Check all tables exist
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check user accounts
SELECT 
    id,
    email,
    full_name,
    role,
    is_active,
    created_at
FROM users 
ORDER BY id;

-- Check students by province
SELECT 
    province,
    COUNT(*) as student_count,
    COUNT(CASE WHEN status = 'employed' THEN 1 END) as employed_count
FROM students 
GROUP BY province 
ORDER BY student_count DESC;

-- Check companies
SELECT 
    id,
    company_name,
    country,
    industry,
    is_active
FROM companies 
ORDER BY id;

-- Check employment records
SELECT 
    e.id,
    s.full_name as student_name,
    c.company_name,
    e.position,
    e.salary,
    e.employment_date
FROM employees e
JOIN students s ON e.student_id = s.id
JOIN companies c ON e.company_id = c.id
ORDER BY e.employment_date DESC;

-- Final verification message
SELECT 'Database setup completed successfully! Ready to use.' as final_status;
