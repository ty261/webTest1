-- 用户密码重置脚本
-- 将重置所有用户的密码为固定值: password123
-- 新的密码哈希使用bcrypt格式

-- 禁用外键检查
SET FOREIGN_KEY_CHECKS = 0;

-- 备份原用户表（以防需要恢复）
CREATE TABLE IF NOT EXISTS `users_backup` LIKE `users`;
INSERT INTO `users_backup` SELECT * FROM `users`;

-- 更新所有用户的密码
-- 使用bcrypt格式的哈希，这是password123的bcrypt哈希值
UPDATE `users` SET 
  `password_hash` = '$2a$10$CwTycUXWue0Thq9StjUM0uQxTmIRzIYHt5K.hyKA3RDYJx9iXgLNy',
  `updated_at` = NOW();

-- 启用外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- 输出确认信息
SELECT 'All user passwords have been reset to: password123' AS Message;
SELECT id, username, email, role, SUBSTRING(password_hash, 1, 20) AS password_hash_start FROM users; 