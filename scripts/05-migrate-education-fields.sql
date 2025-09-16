-- Migration: Add education_ol and education_al, remove education_qualification
ALTER TABLE students
  ADD COLUMN education_ol BOOLEAN DEFAULT false,
  ADD COLUMN education_al BOOLEAN DEFAULT false;

ALTER TABLE students
  DROP COLUMN education_qualification; 