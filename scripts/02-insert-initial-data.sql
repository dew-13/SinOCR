-- Insert initial data with properly hashed passwords
-- Password for all users: admin123
-- Hash: $2b$12$LQv3c1yqBWVHxkd0LQ4YCOuLd6RdGWQcC/KmxdCCUOvJ/KUEYjKim

-- Insert system owner (ID will be 1)
INSERT INTO users (email, password_hash, full_name, role) VALUES 
('owner@system.com', '$2b$10$kn6Bj1OQW0Ke.HiwbnFLvuCOeKGeEaYIZHXiUDBKyQUUXtAGY39p2', 'System Owner', 'owner');

-- Insert admin user (created by owner)
INSERT INTO users (email, password_hash, full_name, role, created_by) VALUES 
('admin@system.com', '$$2b$10$kn6Bj1OQW0Ke.HiwbnFLvuCOeKGeEaYIZHXiUDBKyQUUXtAGY39p2', 'System Admin', 'admin', 1);

-- Insert teacher user (created by owner)
INSERT INTO users (email, password_hash, full_name, role, created_by) VALUES 
('teacher@system.com', '$$2b$10$kn6Bj1OQW0Ke.HiwbnFLvuCOeKGeEaYIZHXiUDBKyQUUXtAGY39p2', 'System Teacher', 'teacher', 1);

-- Insert sample companies
INSERT INTO companies (company_name, country, industry, contact_person, contact_email, contact_phone, address, created_by) VALUES 
('Tech Solutions UAE', 'United Arab Emirates', 'Information Technology', 'Ahmed Hassan', 'ahmed@techsolutions.ae', '+971501234567', 'Dubai Internet City, Dubai, UAE', 1),
('Global Manufacturing Qatar', 'Qatar', 'Manufacturing', 'Sarah Al-Rashid', 'sarah@globalmanuf.qa', '+97444123456', 'Industrial Area, Doha, Qatar', 1),
('Healthcare International KSA', 'Saudi Arabia', 'Healthcare', 'Dr. Mohammed Ali', 'mohammed@healthcare.sa', '+966501234567', 'King Fahd Medical City, Riyadh, KSA', 1),
('Construction Plus Kuwait', 'Kuwait', 'Construction', 'Omar Al-Sabah', 'omar@constructionplus.kw', '+96599123456', 'Shuwaikh Industrial Area, Kuwait City', 1),
('Hospitality Group Bahrain', 'Bahrain', 'Hospitality', 'Fatima Al-Khalifa', 'fatima@hospitalitygroup.bh', '+97336123456', 'Manama City Center, Bahrain', 1);

-- Insert sample students with diverse profiles
INSERT INTO students (
    full_name, permanent_address, district, province, date_of_birth, 
    national_id, passport_id, passport_expired_date, sex, marital_status, spouse_name,
    number_of_children, mobile_phone, whatsapp_number, has_driving_license, vehicle_type,
    email_address, education_qualification, other_qualifications, work_experience, 
    work_experience_abroad, created_by
) VALUES 
-- Western Province Students
('Kasun Perera', '123 Galle Road, Colombo 03', 'Colombo', 'Western', '1995-05-15', 
 'NIC950151234V', 'N1234567', '2025-12-31', 'male', 'single', NULL, 0, 
 '+94771234567', '+94771234567', true, 'light_vehicle', 'kasun.perera@email.com',
 'Bachelor of Science in Computer Science', 'CCNA Certification, Java Programming',
 '2 years as Software Developer at Local IT Company', NULL, 1),

('Nimali Silva', '456 Kandy Road, Gampaha', 'Gampaha', 'Western', '1993-08-22', 
 'NIC930822345V', 'N2345678', '2026-06-30', 'female', 'married', 'Sunil Silva', 1,
 '+94779876543', '+94779876543', false, NULL, 'nimali.silva@email.com',
 'Diploma in Business Management', 'English Proficiency Certificate, MS Office',
 '3 years as Administrative Assistant', NULL, 1),

('Chaminda Jayawardena', '789 High Level Road, Nugegoda', 'Colombo', 'Western', '1996-12-10', 
 'NIC961210456V', 'N3456789', '2025-09-15', 'male', 'single', NULL, 0,
 '+94775555555', '+94775555555', true, 'motorcycle', 'chaminda.j@email.com',
 'Advanced Level - Commerce Stream', 'Accounting Certificate, Computer Literacy',
 '1 year as Accounts Assistant', NULL, 1),

-- Central Province Students  
('Sanduni Rathnayake', '321 Temple Road, Kandy', 'Kandy', 'Central', '1994-03-18', 
 'NIC940318567V', 'N4567890', '2026-01-20', 'female', 'single', NULL, 0,
 '+94712345678', '+94712345678', false, NULL, 'sanduni.r@email.com',
 'Bachelor of Arts in English', 'TEFL Certification, French Language Basic',
 '2 years as English Teacher at Private Institute', NULL, 1),

('Ruwan Kumara', '654 Matale Road, Dambulla', 'Matale', 'Central', '1992-11-05', 
 'NIC921105678V', 'N5678901', '2025-08-10', 'male', 'married', 'Priyanka Kumara', 2,
 '+94723456789', '+94723456789', true, 'light_vehicle', 'ruwan.kumara@email.com',
 'Diploma in Mechanical Engineering', 'Welding Certificate, Heavy Vehicle License',
 '4 years as Mechanic at Toyota Lanka', '6 months in Dubai as Technician', 1),

-- Southern Province Students
('Ishara Fernando', '987 Matara Road, Galle', 'Galle', 'Southern', '1997-07-25', 
 'NIC970725789V', 'N6789012', '2026-03-15', 'male', 'single', NULL, 0,
 '+94734567890', '+94734567890', true, 'motorcycle', 'ishara.fernando@email.com',
 'Higher National Diploma in Hospitality Management', 'Food Safety Certificate, Bartending Course',
 '1.5 years as Waiter at Hilton Hotel', NULL, 1),

('Malini Wickramasinghe', '147 Hambantota Road, Tissamaharama', 'Hambantota', 'Southern', '1995-09-12', 
 'NIC950912890V', 'N7890123', '2025-11-30', 'female', 'divorced', NULL, 1,
 '+94745678901', '+94745678901', false, NULL, 'malini.w@email.com',
 'Diploma in Nursing', 'First Aid Certificate, Patient Care Specialist',
 '3 years as Staff Nurse at General Hospital', NULL, 1),

-- Northern Province Students
('Karthik Selvam', '258 Hospital Road, Jaffna', 'Jaffna', 'Northern', '1993-04-08', 
 'NIC930408901V', 'N8901234', '2026-07-20', 'male', 'married', 'Priya Selvam', 0,
 '+94756789012', '+94756789012', true, 'light_vehicle', 'karthik.selvam@email.com',
 'Bachelor of Commerce', 'Accounting Professional Certificate, Tamil-English Translation',
 '2.5 years as Accountant at Private Firm', NULL, 1),

-- Eastern Province Students
('Mohamed Rishan', '369 Main Street, Batticaloa', 'Batticaloa', 'Eastern', '1996-01-30', 
 'NIC960130012V', 'N9012345', '2025-10-05', 'male', 'single', NULL, 0,
 '+94767890123', '+94767890123', true, 'motorcycle', 'mohamed.rishan@email.com',
 'Advanced Level - Science Stream', 'Computer Hardware Certificate, Arabic Language',
 '1 year as Computer Technician', NULL, 1),

-- North Western Province Students
('Prasad Gunasekara', '741 Negombo Road, Chilaw', 'Puttalam', 'North Western', '1994-06-14', 
 'NIC940614123V', 'N0123456', '2026-02-28', 'male', 'married', 'Sewwandi Gunasekara', 1,
 '+94778901234', '+94778901234', true, 'heavy_vehicle', 'prasad.g@email.com',
 'Certificate in Heavy Vehicle Operation', 'Crane Operation License, Safety Training',
 '3 years as Heavy Vehicle Driver', '1 year in Qatar as Construction Vehicle Operator', 1);

-- Insert some employment records (students who got jobs)
INSERT INTO employees (student_id, company_id, position, salary, employment_date, contract_duration_months, created_by) VALUES
(5, 1, 'Mechanical Technician', 1200.00, '2024-01-15', 24, 1),
(6, 2, 'Hotel Service Staff', 800.00, '2024-02-01', 36, 1),
(10, 4, 'Heavy Vehicle Operator', 1000.00, '2024-03-10', 24, 1);

-- Update student status for employed students
UPDATE students SET status = 'employed' WHERE id IN (5, 6, 10);

-- Verify data insertion
SELECT 'Initial data inserted successfully' as status;

-- Show summary of inserted data
SELECT 
    'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 
    'Students' as table_name, COUNT(*) as count FROM students  
UNION ALL
SELECT 
    'Companies' as table_name, COUNT(*) as count FROM companies
UNION ALL
SELECT 
    'Employees' as table_name, COUNT(*) as count FROM employees;
