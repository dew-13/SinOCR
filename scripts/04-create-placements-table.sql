-- Create placements table
CREATE TABLE IF NOT EXISTS placements (
    placement_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    visa_type VARCHAR(100) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_address TEXT NOT NULL,
    industry VARCHAR(100) NOT NULL,
    resident_address TEXT NOT NULL,
    emergency_contact VARCHAR(255) NOT NULL,
    language_proficiency VARCHAR(100) NOT NULL,
    photo BYTEA,

    CONSTRAINT fk_student
        FOREIGN KEY (student_id)
        REFERENCES students (id)
        ON DELETE CASCADE
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_placements_student_id ON placements(student_id);
CREATE INDEX IF NOT EXISTS idx_placements_start_date ON placements(start_date); 