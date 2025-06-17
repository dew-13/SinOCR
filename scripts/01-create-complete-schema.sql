-- Complete database schema for Student Management System
-- Run this after dropping existing tables

-- Create updated_at trigger function first
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Users table for authentication and role management
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('owner', 'admin', 'teacher')) NOT NULL,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Add foreign key constraint after table creation
ALTER TABLE users ADD CONSTRAINT fk_users_created_by 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Students table with comprehensive profile information
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    permanent_address TEXT NOT NULL,
    district VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    national_id VARCHAR(50) UNIQUE,
    passport_id VARCHAR(50),
    passport_expired_date DATE,
    sex VARCHAR(10) CHECK (sex IN ('male', 'female', 'other')) NOT NULL,
    marital_status VARCHAR(20) CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')) NOT NULL,
    spouse_name VARCHAR(255),
    number_of_children INTEGER DEFAULT 0,
    mobile_phone VARCHAR(20) NOT NULL,
    whatsapp_number VARCHAR(20),
    has_driving_license BOOLEAN DEFAULT false,
    vehicle_type VARCHAR(50) CHECK (vehicle_type IN ('motorcycle', 'light_vehicle', 'heavy_vehicle')),
    email_address VARCHAR(255),
    education_qualification TEXT NOT NULL,
    other_qualifications TEXT,
    work_experience TEXT,
    work_experience_abroad TEXT,
    cv_photo_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'employed', 'inactive')),
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Companies table for affiliated companies
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    industry VARCHAR(100),
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Employees table for students who got employed
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
    position VARCHAR(255) NOT NULL,
    salary DECIMAL(10,2),
    employment_date DATE NOT NULL,
    contract_duration_months INTEGER,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

CREATE INDEX idx_students_district ON students(district);
CREATE INDEX idx_students_province ON students(province);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_created_at ON students(created_at);
CREATE INDEX idx_students_national_id ON students(national_id);

CREATE INDEX idx_companies_country ON companies(country);
CREATE INDEX idx_companies_active ON companies(is_active);

CREATE INDEX idx_employees_student_id ON employees(student_id);
CREATE INDEX idx_employees_company_id ON employees(company_id);
CREATE INDEX idx_employees_employment_date ON employees(employment_date);

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at 
    BEFORE UPDATE ON students 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at 
    BEFORE UPDATE ON companies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at 
    BEFORE UPDATE ON employees 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify schema creation
SELECT 'Schema created successfully' as status;
