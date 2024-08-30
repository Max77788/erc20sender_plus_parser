USE sql8728642;

-- Create the table in the selected database
CREATE TABLE IF NOT EXISTS recipients (
    id INT AUTO_INCREMENT PRIMARY KEY,          -- Auto-incrementing primary key
    address VARCHAR(255) NOT NULL UNIQUE,       -- Address field with a maximum length of 255 characters and unique constraint
    sent_tokens TINYINT(1) NOT NULL DEFAULT 0,  -- Boolean-like field, typically for flags (0 for false, 1 for true)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp for when the record was created
);

