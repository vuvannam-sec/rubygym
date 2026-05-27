-- Seed data for RubyGYM demo environment
-- Password placeholder hashes are kept in bcrypt format for demo accounts.

USE rubygym;
SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci;

SET @admin_hash = '$2b$10$.og1SQ6yMEYAW3/OYJ0ReOaiz5gKgeTVP7x2tRG/MLdiKhKM26Dsy';
SET @trainer_hash = '$2b$10$Dz7v8rz1O.mmOqLc1/url.FZG02D6Or97BDHZjjDghHU3U2sNvnU.';
SET @member_hash = '$2b$10$hNghjyJmkjE3qu4NWjG71ucgDglLoYkWu05waFBKWYm/TTWh6arsi';

INSERT INTO users (id, email, password_hash, full_name, phone, role) VALUES
(1, 'admin@rubygym.com', @admin_hash, 'Nguyen Van Admin', '0901000001', 'ADMIN'),
(2, 'trainer.linh@rubygym.com', @trainer_hash, 'Tran Thu Linh', '0901000002', 'TRAINER'),
(3, 'trainer.khanh@rubygym.com', @trainer_hash, 'Pham Minh Khanh', '0901000003', 'TRAINER'),
(4, 'trainer.huy@rubygym.com', @trainer_hash, 'Le Quang Huy', '0901000004', 'TRAINER'),
(5, 'member.an@rubygym.com', @member_hash, 'Nguyen Hoang An', '0901000011', 'MEMBER'),
(6, 'member.binh@rubygym.com', @member_hash, 'Tran Ngoc Binh', '0901000012', 'MEMBER'),
(7, 'member.chau@rubygym.com', @member_hash, 'Le Minh Chau', '0901000013', 'MEMBER'),
(8, 'member.duong@rubygym.com', @member_hash, 'Pham Thu Duong', '0901000014', 'MEMBER'),
(9, 'member.giang@rubygym.com', @member_hash, 'Do Ha Giang', '0901000015', 'MEMBER'),
(10, 'member.ha@rubygym.com', @member_hash, 'Vu Bao Ha', '0901000016', 'MEMBER'),
(11, 'member.khoi@rubygym.com', @member_hash, 'Bui Dang Khoi', '0901000017', 'MEMBER'),
(12, 'member.lan@rubygym.com', @member_hash, 'Dang Thu Lan', '0901000018', 'MEMBER'),
(13, 'member.minh@rubygym.com', @member_hash, 'Nguyen Quoc Minh', '0901000019', 'MEMBER'),
(14, 'member.phuong@rubygym.com', @member_hash, 'Hoang Minh Phuong', '0901000020', 'MEMBER');

INSERT INTO trainers (id, user_id, specialization, max_daily_hours) VALUES
(1, 2, 'Strength Training', 8),
(2, 3, 'Weight Loss Coaching', 8),
(3, 4, 'Yoga and Mobility', 8);

INSERT INTO members (id, user_id, trainer_id, join_date, is_loyal, pending_bonus_months, referred_by) VALUES
(1, 5, 1, '2024-01-10', 1, 0, NULL),
(2, 6, 1, '2024-06-02', 0, 0, 1),
(3, 7, 1, '2025-01-20', 0, 0, NULL),
(4, 8, 2, '2023-03-15', 1, 0, NULL),
(5, 9, 2, '2024-07-05', 0, 1, 4),
(6, 10, 2, '2025-02-11', 0, 0, NULL),
(7, 11, 3, '2024-04-01', 1, 0, NULL),
(8, 12, 3, '2024-09-12', 0, 0, 7),
(9, 13, 3, '2025-01-08', 0, 0, NULL),
(10, 14, 1, '2025-03-10', 0, 0, 2);

INSERT INTO training_goals (id, member_id, goal_type, target_weight, target_bmi, target_date, notes) VALUES
(1, 1, 'Strength maintenance', 68.00, 22.50, '2026-06-30', 'Duy tri suc manh than duoi va 2 buoi cardio moi tuan.'),
(2, 2, 'Fat loss', 62.00, 21.80, '2026-07-31', 'Giam mo cham, giu lich tap sang deu dan.'),
(3, 3, 'Muscle gain', 73.00, 23.20, '2026-08-31', 'Tang khoi co nac va cai thien ky thuat squat.'),
(4, 4, 'Weight control', 56.00, 20.80, '2026-06-30', 'Kiem soat can nang va giu nhat ky tap luyen.'),
(5, 5, 'Fat loss', 58.00, 21.00, '2026-07-15', 'Tang cuong dinh duong va duy tri 3 buoi moi tuan.'),
(6, 8, 'Mobility', 50.00, 19.50, '2026-06-15', 'Cai thien do deo dai va thang bang.');

INSERT INTO subscriptions (id, member_id, plan_type, start_date, end_date, is_free_extension, status) VALUES
(1, 1, 'ANNUAL', '2025-01-10', '2026-04-10', 1, 'ACTIVE'),
(2, 4, 'ANNUAL', '2024-03-15', '2025-06-15', 1, 'EXPIRED'),
(3, 5, 'QUARTERLY', '2026-02-01', '2026-05-01', 0, 'ACTIVE'),
(4, 7, 'SEMI_ANNUAL', '2025-11-01', '2026-05-01', 0, 'ACTIVE'),
(5, 8, 'QUARTERLY', '2026-01-12', '2026-04-12', 1, 'ACTIVE');

INSERT INTO training_sessions (id, trainer_id, session_date, start_time, end_time) VALUES
(1, 1, '2026-04-13', '05:30:00', '06:30:00'),
(2, 1, '2026-04-13', '07:00:00', '08:00:00'),
(3, 1, '2026-04-14', '06:00:00', '07:00:00'),
(4, 1, '2026-04-14', '18:00:00', '19:00:00'),
(5, 1, '2026-04-15', '05:30:00', '06:30:00'),
(6, 1, '2026-04-15', '17:30:00', '18:30:00'),
(7, 1, '2026-04-16', '08:00:00', '09:00:00'),
(8, 1, '2026-04-17', '18:00:00', '19:30:00'),
(9, 2, '2026-04-13', '06:00:00', '07:30:00'),
(10, 2, '2026-04-13', '14:00:00', '15:00:00'),
(11, 2, '2026-04-14', '05:30:00', '06:30:00'),
(12, 2, '2026-04-14', '17:00:00', '18:00:00'),
(13, 2, '2026-04-15', '06:30:00', '07:30:00'),
(14, 2, '2026-04-16', '18:00:00', '19:00:00'),
(15, 2, '2026-04-17', '14:00:00', '15:30:00'),
(16, 3, '2026-04-13', '05:00:00', '06:00:00'),
(17, 3, '2026-04-13', '18:30:00', '19:30:00'),
(18, 3, '2026-04-14', '07:00:00', '08:00:00'),
(19, 3, '2026-04-15', '14:00:00', '15:00:00'),
(20, 3, '2026-04-16', '17:00:00', '18:00:00'),
(21, 3, '2026-04-17', '09:00:00', '10:00:00'),
(22, 1, '2026-04-18', '14:00:00', '15:00:00');

INSERT INTO session_members (session_id, member_id) VALUES
(1, 1), (1, 2), (1, 10),
(2, 3), (2, 1),
(3, 2), (3, 10),
(4, 1), (4, 3),
(5, 2), (5, 10),
(6, 1), (6, 3),
(7, 1), (7, 2),
(8, 3), (8, 10),
(9, 4), (9, 5), (9, 6),
(10, 5), (10, 4),
(11, 4), (11, 6),
(12, 5), (12, 6),
(13, 4), (13, 5),
(14, 6), (14, 4),
(15, 5), (15, 6),
(16, 7), (16, 8), (16, 9),
(17, 7), (17, 8),
(18, 8), (18, 9),
(19, 7), (19, 9),
(20, 7), (20, 8),
(21, 8), (21, 9),
(22, 1), (22, 2), (22, 3);

INSERT INTO monthly_evaluations (id, member_id, trainer_id, month_year, target_weight, actual_weight, target_bmi, actual_bmi, notes) VALUES
(1, 1, 1, '2026-03-01', 68.00, 68.50, 22.50, 22.80, 'Tang suc manh phan than duoi, duy tri cardio 2 buoi/tuan.'),
(2, 5, 2, '2026-03-01', 58.00, 59.20, 21.00, 21.40, 'Can tang cuong dinh duong va giu lich tap on dinh.'),
(3, 8, 3, '2026-03-01', 50.00, 50.10, 19.50, 19.60, 'Tien bo tot ve do deo dai va kha nang giu thang bang.');

INSERT INTO events (id, title, description, event_date, created_by) VALUES
(1, 'Workshop Giam Mo Ben Vung', 'Buoi chia se cach xay dung thoi quen tap luyen va theo doi chi so co the.', '2026-04-20 09:00:00', 1),
(2, 'Yoga Morning Challenge', 'Su kien tap yoga nhom ngoai troi danh cho hoi vien va nguoi moi.', '2026-04-27 06:00:00', 1);
