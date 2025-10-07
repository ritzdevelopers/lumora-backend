-- Quick setup script for Lumora database
-- Run this script to set up the database and stored procedures

-- Create lumora schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS lumora;
USE lumora;

-- Create inquiry table with improved structure
CREATE TABLE IF NOT EXISTS inquiry (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  mail VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_mail (mail),
  INDEX idx_created_at (created_at)
);

-- Create the main stored procedure used by the API
DROP PROCEDURE IF EXISTS insert_inquiry;

DELIMITER //

CREATE PROCEDURE insert_inquiry(
    IN p_name VARCHAR(100),
    IN p_mail VARCHAR(100), 
    IN p_phone VARCHAR(20),
    IN p_message TEXT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Insert the inquiry
    INSERT INTO inquiry (name, mail, phone, message) 
    VALUES (TRIM(p_name), TRIM(p_mail), TRIM(p_phone), TRIM(p_message));
    
    -- Return success message
    SELECT 'Inquiry submitted successfully' as message, LAST_INSERT_ID() as inquiry_id;
    
    COMMIT;
END //

DELIMITER ;

-- Test the procedure (optional)
-- CALL insert_inquiry('Test User', 'test@example.com', '1234567890', 'This is a test message');

-- Verify table structure
DESCRIBE inquiry;

-- Show created procedures
SHOW PROCEDURE STATUS WHERE Db = 'lumora';
