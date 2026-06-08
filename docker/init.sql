CREATE DATABASE IF NOT EXISTS rubygym
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
USE rubygym;
SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role ENUM('ADMIN', 'TRAINER', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trainers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    specialization VARCHAR(255),
    max_daily_hours INT DEFAULT 8,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    trainer_id INT,
    join_date DATE NOT NULL,
    current_weight DECIMAL(5,2),
    height_cm DECIMAL(5,2),
    is_loyal BOOLEAN DEFAULT FALSE,
    pending_bonus_months INT DEFAULT 0,
    referred_by INT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (trainer_id) REFERENCES trainers(id),
    FOREIGN KEY (referred_by) REFERENCES members(id)
);

CREATE TABLE training_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL UNIQUE,
    goal_type VARCHAR(100) NOT NULL DEFAULT 'General fitness',
    target_weight DECIMAL(5,2),
    target_bmi DECIMAL(4,2),
    target_date DATE,
    notes TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id)
);

CREATE TABLE subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    plan_type ENUM('QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_free_extension BOOLEAN DEFAULT FALSE,
    status ENUM('ACTIVE', 'EXPIRED', 'CANCELLED') DEFAULT 'ACTIVE',
    FOREIGN KEY (member_id) REFERENCES members(id)
);

CREATE TABLE training_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trainer_id INT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    session_type VARCHAR(100) DEFAULT 'Cá nhân',
    FOREIGN KEY (trainer_id) REFERENCES trainers(id)
);

CREATE TABLE session_members (
    session_id INT NOT NULL,
    member_id INT NOT NULL,
    PRIMARY KEY (session_id, member_id),
    FOREIGN KEY (session_id) REFERENCES training_sessions(id),
    FOREIGN KEY (member_id) REFERENCES members(id)
);

CREATE TABLE monthly_evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    trainer_id INT NOT NULL,
    month_year DATE NOT NULL,
    target_weight DECIMAL(5,2),
    actual_weight DECIMAL(5,2),
    target_bmi DECIMAL(4,2),
    actual_bmi DECIMAL(4,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_member_month (member_id, month_year),
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (trainer_id) REFERENCES trainers(id)
);

CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date TIMESTAMP,
    image_url VARCHAR(500),
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
