-- Fix User table structure to match User.java entity and UserMapper.xml

USE heycalendar;

-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN accountNm VARCHAR(100) NULL AFTER user_nm,
ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE' AFTER password,
ADD COLUMN userKey VARCHAR(100) NULL AFTER password;

-- Update existing data to have proper status values
UPDATE users SET status = 'ACTIVE' WHERE is_active = TRUE;
UPDATE users SET status = 'INACTIVE' WHERE is_active = FALSE;

-- Create view or rename table to match mapper expectations
-- Since MyBatis is case-sensitive, create an alias
CREATE VIEW User AS
SELECT 
    user_nm as userNm,
    accountNm,
    user_id as userId,
    password,
    userKey,
    user_name as userName,
    status,
    grade,
    gpa,
    created_at as createdAt,
    updated_at as updatedAt,
    role,
    department_id as deptNm,
    college_id as collegeNm,
    university_id as univNm
FROM users;

COMMIT;