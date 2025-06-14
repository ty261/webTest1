/*
 Navicat Premium Dump SQL

 Source Server         : 本地数据库
 Source Server Type    : MySQL
 Source Server Version : 50729 (5.7.29-log)
 Source Host           : localhost:3306
 Source Schema         : smart_farm

 Target Server Type    : MySQL
 Target Server Version : 50729 (5.7.29-log)
 File Encoding         : 65001

 Date: 26/04/2025 22:16:57
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for actuator_logs
-- ----------------------------
DROP TABLE IF EXISTS `actuator_logs`;
CREATE TABLE `actuator_logs`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `actuator_id` int(11) NOT NULL,
  `action` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `message` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `timestamp` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `previous_state` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `parameters` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `actuator_id`(`actuator_id`) USING BTREE,
  CONSTRAINT `actuator_logs_ibfk_1` FOREIGN KEY (`actuator_id`) REFERENCES `actuators` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of actuator_logs
-- ----------------------------
INSERT INTO `actuator_logs` VALUES (1, 1, 'ON', 'SUCCESS', 'Irrigation started automatically due to low soil moisture', '2025-04-15 20:28:51', NULL, NULL);
INSERT INTO `actuator_logs` VALUES (2, 1, 'OFF', 'SUCCESS', 'Irrigation completed', '2025-04-15 20:28:51', NULL, NULL);
INSERT INTO `actuator_logs` VALUES (3, 2, 'ON', 'SUCCESS', 'Irrigation started manually by user', '2025-04-17 19:28:51', NULL, NULL);
INSERT INTO `actuator_logs` VALUES (4, 3, 'ON', 'SUCCESS', 'Ventilation started automatically due to high temperature', '2025-04-17 16:28:51', NULL, NULL);
INSERT INTO `actuator_logs` VALUES (5, 5, 'ON', 'SUCCESS', 'Lighting turned on by schedule', '2025-04-17 08:28:51', NULL, NULL);
INSERT INTO `actuator_logs` VALUES (6, 5, 'OFF', 'SUCCESS', 'Lighting turned off by schedule', '2025-04-17 16:28:51', NULL, NULL);
INSERT INTO `actuator_logs` VALUES (7, 8, 'ON', 'FAILED', 'Communication error with the device', '2025-04-16 20:28:51', NULL, NULL);

-- ----------------------------
-- Table structure for actuators
-- ----------------------------
DROP TABLE IF EXISTS `actuators`;
CREATE TABLE `actuators`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `location` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `mqtt_topic` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'OFF',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `mode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'manual',
  `parameters` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `auto_rules` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `last_control_time` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `mqtt_topic`(`mqtt_topic`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of actuators
-- ----------------------------
INSERT INTO `actuators` VALUES (1, 'Irrigation System 1', 'irrigation', 'Field 1', 'farm/actuators/irrigation/field1', 1, 'off', '2025-04-17 20:28:51', '2025-04-26 21:30:05', 'manual', '{}', '{}', NULL);
INSERT INTO `actuators` VALUES (2, 'Irrigation System 2', 'irrigation', 'Field 2', 'farm/actuators/irrigation/field2', 1, 'on', '2025-04-17 20:28:51', '2025-04-26 21:30:05', 'manual', '{}', '{}', NULL);
INSERT INTO `actuators` VALUES (3, 'Ventilation 1', 'ventilation', 'Greenhouse 1', 'farm/actuators/ventilation/gh1', 1, 'on', '2025-04-17 20:28:51', '2025-04-26 21:30:05', 'manual', '{}', '{}', NULL);
INSERT INTO `actuators` VALUES (4, 'Ventilation 2', 'ventilation', 'Greenhouse 2', 'farm/actuators/ventilation/gh2', 1, 'off', '2025-04-17 20:28:51', '2025-04-26 21:30:05', 'manual', '{}', '{}', NULL);
INSERT INTO `actuators` VALUES (5, 'Lighting System 1', 'lighting', 'Greenhouse 1', 'farm/actuators/lighting/gh1', 1, 'off', '2025-04-17 20:28:51', '2025-04-26 21:30:05', 'manual', '{}', '{}', NULL);
INSERT INTO `actuators` VALUES (6, 'Heating System 1', 'heating', 'Greenhouse 1', 'farm/actuators/heating/gh1', 1, 'off', '2025-04-17 20:28:51', '2025-04-26 21:30:05', 'manual', '{}', '{}', NULL);
INSERT INTO `actuators` VALUES (7, 'Cooling System 1', 'cooling', 'Storage Room', 'farm/actuators/cooling/storage', 1, 'on', '2025-04-17 20:28:51', '2025-04-26 21:30:05', 'manual', '{}', '{}', NULL);
INSERT INTO `actuators` VALUES (8, 'Shade Control', 'shading', 'Greenhouse 2', 'farm/actuators/shading/gh2', 0, 'error', '2025-04-17 20:28:51', '2025-04-26 21:30:05', 'manual', '{}', '{}', NULL);

-- ----------------------------
-- Table structure for alert_settings
-- ----------------------------
DROP TABLE IF EXISTS `alert_settings`;
CREATE TABLE `alert_settings`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `sensor_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `min_threshold` float NULL DEFAULT NULL,
  `max_threshold` float NULL DEFAULT NULL,
  `notify_email` tinyint(1) NULL DEFAULT 1,
  `notify_sms` tinyint(1) NULL DEFAULT 0,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id`) USING BTREE,
  CONSTRAINT `alert_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of alert_settings
-- ----------------------------

-- ----------------------------
-- Table structure for alerts
-- ----------------------------
DROP TABLE IF EXISTS `alerts`;
CREATE TABLE `alerts`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sensor_id` int(11) NULL DEFAULT NULL,
  `actuator_id` int(11) NULL DEFAULT NULL,
  `alert_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `message` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `severity` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'info',
  `is_read` tinyint(1) NULL DEFAULT 0,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `sensor_id`(`sensor_id`) USING BTREE,
  INDEX `actuator_id`(`actuator_id`) USING BTREE,
  CONSTRAINT `alerts_ibfk_1` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `alerts_ibfk_2` FOREIGN KEY (`actuator_id`) REFERENCES `actuators` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of alerts
-- ----------------------------
INSERT INTO `alerts` VALUES (1, 1, NULL, 'threshold_exceeded', 'Temperature in Greenhouse 1 above threshold (30°C)', 'warning', 0, '2025-04-17 20:18:51');
INSERT INTO `alerts` VALUES (2, 7, NULL, 'threshold_exceeded', 'Soil moisture in Field 2 below threshold (20%)', 'warning', 0, '2025-04-17 20:03:51');
INSERT INTO `alerts` VALUES (3, NULL, 2, 'actuator_status', 'Irrigation system in Field 2 activated automatically', 'info', 0, '2025-04-17 19:43:51');
INSERT INTO `alerts` VALUES (4, NULL, 8, 'actuator_status', 'Shade Control system reported an error', 'error', 1, '2025-04-16 20:28:51');
INSERT INTO `alerts` VALUES (5, 6, NULL, 'threshold_exceeded', 'Soil moisture in Field 1 below threshold (25%)', 'warning', 1, '2025-04-15 20:28:51');

-- ----------------------------
-- Table structure for sensor_readings
-- ----------------------------
DROP TABLE IF EXISTS `sensor_readings`;
CREATE TABLE `sensor_readings`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sensor_id` int(11) NOT NULL,
  `value` float NOT NULL,
  `unit` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `timestamp` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `sensor_id`(`sensor_id`) USING BTREE,
  CONSTRAINT `sensor_readings_ibfk_1` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 31 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sensor_readings
-- ----------------------------
INSERT INTO `sensor_readings` VALUES (1, 1, 25.5, '°C', '2025-04-17 15:28:51');
INSERT INTO `sensor_readings` VALUES (2, 1, 26.2, '°C', '2025-04-17 16:28:51');
INSERT INTO `sensor_readings` VALUES (3, 1, 27, '°C', '2025-04-17 17:28:51');
INSERT INTO `sensor_readings` VALUES (4, 1, 28.1, '°C', '2025-04-17 18:28:51');
INSERT INTO `sensor_readings` VALUES (5, 1, 27.8, '°C', '2025-04-17 19:28:51');
INSERT INTO `sensor_readings` VALUES (6, 1, 27.3, '°C', '2025-04-17 20:28:51');
INSERT INTO `sensor_readings` VALUES (7, 2, 24.8, '°C', '2025-04-17 15:28:51');
INSERT INTO `sensor_readings` VALUES (8, 2, 25.3, '°C', '2025-04-17 16:28:51');
INSERT INTO `sensor_readings` VALUES (9, 2, 25.7, '°C', '2025-04-17 17:28:51');
INSERT INTO `sensor_readings` VALUES (10, 2, 26.1, '°C', '2025-04-17 18:28:51');
INSERT INTO `sensor_readings` VALUES (11, 2, 26.4, '°C', '2025-04-17 19:28:51');
INSERT INTO `sensor_readings` VALUES (12, 2, 26.2, '°C', '2025-04-17 20:28:51');
INSERT INTO `sensor_readings` VALUES (13, 3, 65, '%', '2025-04-17 15:28:51');
INSERT INTO `sensor_readings` VALUES (14, 3, 67.5, '%', '2025-04-17 16:28:51');
INSERT INTO `sensor_readings` VALUES (15, 3, 70.2, '%', '2025-04-17 17:28:51');
INSERT INTO `sensor_readings` VALUES (16, 3, 68.8, '%', '2025-04-17 18:28:51');
INSERT INTO `sensor_readings` VALUES (17, 3, 67.3, '%', '2025-04-17 19:28:51');
INSERT INTO `sensor_readings` VALUES (18, 3, 66.5, '%', '2025-04-17 20:28:51');
INSERT INTO `sensor_readings` VALUES (19, 6, 35, '%', '2025-04-17 15:28:51');
INSERT INTO `sensor_readings` VALUES (20, 6, 33.5, '%', '2025-04-17 16:28:51');
INSERT INTO `sensor_readings` VALUES (21, 6, 30.2, '%', '2025-04-17 17:28:51');
INSERT INTO `sensor_readings` VALUES (22, 6, 28.8, '%', '2025-04-17 18:28:51');
INSERT INTO `sensor_readings` VALUES (23, 6, 25.3, '%', '2025-04-17 19:28:51');
INSERT INTO `sensor_readings` VALUES (24, 6, 22.5, '%', '2025-04-17 20:28:51');
INSERT INTO `sensor_readings` VALUES (25, 7, 40, '%', '2025-04-17 15:28:51');
INSERT INTO `sensor_readings` VALUES (26, 7, 38.5, '%', '2025-04-17 16:28:51');
INSERT INTO `sensor_readings` VALUES (27, 7, 35.2, '%', '2025-04-17 17:28:51');
INSERT INTO `sensor_readings` VALUES (28, 7, 30.8, '%', '2025-04-17 18:28:51');
INSERT INTO `sensor_readings` VALUES (29, 7, 25.3, '%', '2025-04-17 19:28:51');
INSERT INTO `sensor_readings` VALUES (30, 7, 15.5, '%', '2025-04-17 20:28:51');

-- ----------------------------
-- Table structure for sensors
-- ----------------------------
DROP TABLE IF EXISTS `sensors`;
CREATE TABLE `sensors`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `location` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `mqtt_topic` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'ONLINE',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `mqtt_topic`(`mqtt_topic`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sensors
-- ----------------------------
INSERT INTO `sensors` VALUES (1, 'Temp Sensor 1', 'temperature', 'Greenhouse 1', 'farm/sensors/temperature/gh1', 1, 'ONLINE', '2025-04-17 20:28:51', '2025-04-17 20:28:51');
INSERT INTO `sensors` VALUES (2, 'Temp Sensor 2', 'temperature', 'Greenhouse 2', 'farm/sensors/temperature/gh2', 1, 'ONLINE', '2025-04-17 20:28:51', '2025-04-17 20:28:51');
INSERT INTO `sensors` VALUES (3, 'Humidity Sensor 1', 'humidity', 'Greenhouse 1', 'farm/sensors/humidity/gh1', 1, 'ONLINE', '2025-04-17 20:28:51', '2025-04-17 20:28:51');
INSERT INTO `sensors` VALUES (4, 'Humidity Sensor 2', 'humidity', 'Greenhouse 2', 'farm/sensors/humidity/gh2', 1, 'ONLINE', '2025-04-17 20:28:51', '2025-04-17 20:28:51');
INSERT INTO `sensors` VALUES (5, 'Light Sensor 1', 'light', 'Greenhouse 1', 'farm/sensors/light/gh1', 1, 'ONLINE', '2025-04-17 20:28:51', '2025-04-17 20:28:51');
INSERT INTO `sensors` VALUES (6, 'Soil Moisture 1', 'soil_moisture', 'Field 1', 'farm/sensors/soil/field1', 1, 'ONLINE', '2025-04-17 20:28:51', '2025-04-17 20:28:51');
INSERT INTO `sensors` VALUES (7, 'Soil Moisture 2', 'soil_moisture', 'Field 2', 'farm/sensors/soil/field2', 1, 'ONLINE', '2025-04-17 20:28:51', '2025-04-17 20:28:51');
INSERT INTO `sensors` VALUES (8, 'Rain Sensor', 'rainfall', 'Weather Station', 'farm/sensors/rain/ws1', 1, 'ONLINE', '2025-04-17 20:28:51', '2025-04-17 20:28:51');
INSERT INTO `sensors` VALUES (9, 'CO2 Sensor', 'co2', 'Greenhouse 1', 'farm/sensors/co2/gh1', 0, 'MAINTENANCE', '2025-04-17 20:28:51', '2025-04-17 20:28:51');

-- ----------------------------
-- Table structure for system_settings
-- ----------------------------
DROP TABLE IF EXISTS `system_settings`;
CREATE TABLE `system_settings`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `setting_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `setting_key`(`setting_key`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of system_settings
-- ----------------------------
INSERT INTO `system_settings` VALUES (1, 'refresh_interval', '30', 'Dashboard refresh interval in seconds', '2025-04-17 20:28:51');
INSERT INTO `system_settings` VALUES (2, 'alert_retention_days', '30', 'Number of days to keep alert history', '2025-04-17 20:28:51');
INSERT INTO `system_settings` VALUES (3, 'data_retention_days', '90', 'Number of days to keep sensor readings', '2025-04-17 20:28:51');
INSERT INTO `system_settings` VALUES (4, 'system_maintenance_mode', 'false', 'Whether the system is in maintenance mode', '2025-04-17 20:28:51');
INSERT INTO `system_settings` VALUES (5, 'mqtt_enabled', 'true', 'Whether MQTT communication is enabled', '2025-04-17 20:28:51');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `role` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'user',
  `is_active` tinyint(1) NULL DEFAULT 1,
  `last_login` datetime NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username`) USING BTREE,
  UNIQUE INDEX `email`(`email`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (5, 'admin12', '2725277025@qq.com', '$2a$10$CwTycUXWue0Thq9StjUM0uQxTmIRzIYHt5K.hyKA3RDYJx9iXgLNy', 'user', 1, '2025-04-26 13:33:16', '2025-04-26 09:34:04', '2025-04-26 13:33:16');
INSERT INTO `users` VALUES (6, 'admin', 'admin@smartfarm.com', '$2a$10$CwTycUXWue0Thq9StjUM0uQxTmIRzIYHt5K.hyKA3RDYJx9iXgLNy', 'user', 1, NULL, '2025-04-26 13:35:29', '2025-04-26 13:35:29');

-- ----------------------------
-- Table structure for users_backup
-- ----------------------------
DROP TABLE IF EXISTS `users_backup`;
CREATE TABLE `users_backup`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `role` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'user',
  `is_active` tinyint(1) NULL DEFAULT 1,
  `last_login` datetime NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username`) USING BTREE,
  UNIQUE INDEX `email`(`email`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users_backup
-- ----------------------------
INSERT INTO `users_backup` VALUES (1, 'admin', 'admin@smartfarm.com', '$2b$10$3euPcmQFCiblsZeEu5s7p.9mSsTLovLyBSZZI0rysKwYMnBugCN3G', 'admin', 1, NULL, '2025-04-17 20:28:51', '2025-04-17 20:28:51');
INSERT INTO `users_backup` VALUES (2, 'user1', 'user1@smartfarm.com', '$2b$10$3euPcmQFCiblsZeEu5s7p.9mSsTLovLyBSZZI0rysKwYMnBugCN3G', 'user', 1, NULL, '2025-04-17 20:28:51', '2025-04-17 20:28:51');
INSERT INTO `users_backup` VALUES (3, 'technician', 'tech@smartfarm.com', '$2b$10$3euPcmQFCiblsZeEu5s7p.9mSsTLovLyBSZZI0rysKwYMnBugCN3G', 'technician', 1, NULL, '2025-04-17 20:28:51', '2025-04-17 20:28:51');
INSERT INTO `users_backup` VALUES (4, 'admin123', '1656506172@qq.com', 'pbkdf2:sha256:260000$FYFyT4rxZsGtZyfC$50d150c1c2b02c58e4e7cd485ceff8b23aa50800efc19015443d00e33eddb4f4', 'user', 1, '2025-04-26 09:01:23', '2025-04-26 08:56:04', '2025-04-26 09:01:23');

SET FOREIGN_KEY_CHECKS = 1;
