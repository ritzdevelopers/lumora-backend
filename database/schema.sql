-- Lumora Database Schema and Stored Procedures

USE lumora;

-- Create inquiry table
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

-- Drop procedure if exists to avoid conflicts
DROP PROCEDURE IF EXISTS insert_inquiry;

-- Create stored procedure for inserting inquiry
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
    
    -- Validate input parameters
    IF p_name IS NULL OR TRIM(p_name) = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Name cannot be empty';
    END IF;
    
    IF p_mail IS NULL OR TRIM(p_mail) = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Email cannot be empty';
    END IF;
    
    IF p_phone IS NULL OR TRIM(p_phone) = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Phone cannot be empty';
    END IF;
    
    IF p_message IS NULL OR TRIM(p_message) = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Message cannot be empty';
    END IF;
    
    -- Insert the inquiry
    INSERT INTO inquiry (name, mail, phone, message) 
    VALUES (TRIM(p_name), TRIM(p_mail), TRIM(p_phone), TRIM(p_message));
    
    -- Return the inserted record ID
    SELECT LAST_INSERT_ID() as inquiry_id, 'Inquiry submitted successfully' as message;
    
    COMMIT;
END //

DELIMITER ;

-- Optional: Create a procedure to get all inquiries (for admin purposes)
DROP PROCEDURE IF EXISTS get_all_inquiries;

DELIMITER //

CREATE PROCEDURE get_all_inquiries(
    IN p_limit INT DEFAULT 50,
    IN p_offset INT DEFAULT 0
)
BEGIN
    SELECT 
        id,
        name,
        mail,
        phone,
        message,
        created_at,
        updated_at
    FROM inquiry 
    ORDER BY created_at DESC 
    LIMIT p_limit OFFSET p_offset;
    
    -- Also return total count
    SELECT COUNT(*) as total_count FROM inquiry;
END //

DELIMITER ;

-- Optional: Create a procedure to get inquiry by ID
DROP PROCEDURE IF EXISTS get_inquiry_by_id;

DELIMITER //

CREATE PROCEDURE get_inquiry_by_id(
    IN p_id INT
)
BEGIN
    SELECT 
        id,
        name,
        mail,
        phone,
        message,
        created_at,
        updated_at
    FROM inquiry 
    WHERE id = p_id;
END //

DELIMITER ;

-- Optional: Create a procedure to search inquiries by email
DROP PROCEDURE IF EXISTS search_inquiries_by_email;

DELIMITER //

CREATE PROCEDURE search_inquiries_by_email(
    IN p_mail VARCHAR(100)
)
BEGIN
    SELECT 
        id,
        name,
        mail,
        phone,
        message,
        created_at,
        updated_at
    FROM inquiry 
    WHERE mail = p_mail
    ORDER BY created_at DESC;
END //

DELIMITER ;
