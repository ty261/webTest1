-- Smart Farm Database Schema
-- This script creates the database and all required tables for the Smart Farm application

-- Create database if it doesn't exist
DROP DATABASE IF EXISTS smart_farm;
CREATE DATABASE smart_farm;
USE smart_farm;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role ENUM('admin', 'manager', 'operator', 'viewer') NOT NULL DEFAULT 'viewer',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create sensors table
CREATE TABLE IF NOT EXISTS sensors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    location VARCHAR(100) NOT NULL,
    mqtt_topic VARCHAR(200) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_reading DOUBLE,
    last_reading_time DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create sensor readings table
CREATE TABLE IF NOT EXISTS sensor_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sensor_id INT NOT NULL,
    value DOUBLE NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE
);

-- Create actuators table
CREATE TABLE IF NOT EXISTS actuators (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    location VARCHAR(100) NOT NULL,
    mqtt_topic VARCHAR(200) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(20) NOT NULL DEFAULT 'off',
    mode VARCHAR(20) NOT NULL DEFAULT 'manual',
    parameters TEXT DEFAULT '{}',
    auto_rules TEXT DEFAULT '{}',
    last_control_time DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create actuator logs table
CREATE TABLE IF NOT EXISTS actuator_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    actuator_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    previous_state VARCHAR(50),
    parameters TEXT,
    message VARCHAR(255),
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actuator_id) REFERENCES actuators(id) ON DELETE CASCADE
);

-- Create alert settings table
CREATE TABLE IF NOT EXISTS alert_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sensor_id INT,
    name VARCHAR(100) NOT NULL,
    condition_type ENUM('gt', 'lt', 'eq', 'gte', 'lte', 'change') NOT NULL,
    threshold DOUBLE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alert_setting_id INT NOT NULL,
    sensor_id INT NOT NULL,
    reading_value DOUBLE NOT NULL,
    is_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_by INT,
    acknowledged_at DATETIME,
    message VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alert_setting_id) REFERENCES alert_settings(id),
    FOREIGN KEY (sensor_id) REFERENCES sensors(id),
    FOREIGN KEY (acknowledged_by) REFERENCES users(id)
);

-- Create system settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description VARCHAR(255),
    updated_by INT,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Create actuator groups table
CREATE TABLE IF NOT EXISTS actuator_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    created_by INT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create actuator group members table
CREATE TABLE IF NOT EXISTS actuator_group_members (
    group_id INT NOT NULL,
    actuator_id INT NOT NULL,
    added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, actuator_id),
    FOREIGN KEY (group_id) REFERENCES actuator_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (actuator_id) REFERENCES actuators(id) ON DELETE CASCADE
);

-- Create actuator schedules table
CREATE TABLE IF NOT EXISTS actuator_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    actuator_id INT,
    group_id INT,
    name VARCHAR(100) NOT NULL,
    schedule_type ENUM('daily', 'weekly', 'monthly', 'one_time') NOT NULL,
    action VARCHAR(50) NOT NULL,
    parameters TEXT DEFAULT '{}',
    start_time TIME,
    end_time TIME,
    days_of_week VARCHAR(20),
    days_of_month VARCHAR(100),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (actuator_id) REFERENCES actuators(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES actuator_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
); 