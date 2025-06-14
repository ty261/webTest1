-- Sample data for Smart Farm database
USE smart_farm;

-- Sample Users
-- Default password is 'password123' (hashed)
INSERT INTO users (username, email, password_hash, role, is_active) VALUES
('admin', 'admin@smartfarm.com', '$2b$10$3euPcmQFCiblsZeEu5s7p.9mSsTLovLyBSZZI0rysKwYMnBugCN3G', 'admin', TRUE),
('user1', 'user1@smartfarm.com', '$2b$10$3euPcmQFCiblsZeEu5s7p.9mSsTLovLyBSZZI0rysKwYMnBugCN3G', 'user', TRUE),
('technician', 'tech@smartfarm.com', '$2b$10$3euPcmQFCiblsZeEu5s7p.9mSsTLovLyBSZZI0rysKwYMnBugCN3G', 'technician', TRUE);

-- Sample Sensors
INSERT INTO sensors (name, type, location, mqtt_topic, is_active, status) VALUES
('Temp Sensor 1', 'temperature', 'Greenhouse 1', 'farm/sensors/temperature/gh1', TRUE, 'ONLINE'),
('Temp Sensor 2', 'temperature', 'Greenhouse 2', 'farm/sensors/temperature/gh2', TRUE, 'ONLINE'),
('Humidity Sensor 1', 'humidity', 'Greenhouse 1', 'farm/sensors/humidity/gh1', TRUE, 'ONLINE'),
('Humidity Sensor 2', 'humidity', 'Greenhouse 2', 'farm/sensors/humidity/gh2', TRUE, 'ONLINE'),
('Light Sensor 1', 'light', 'Greenhouse 1', 'farm/sensors/light/gh1', TRUE, 'ONLINE'),
('Soil Moisture 1', 'soil_moisture', 'Field 1', 'farm/sensors/soil/field1', TRUE, 'ONLINE'),
('Soil Moisture 2', 'soil_moisture', 'Field 2', 'farm/sensors/soil/field2', TRUE, 'ONLINE'),
('Rain Sensor', 'rainfall', 'Weather Station', 'farm/sensors/rain/ws1', TRUE, 'ONLINE'),
('CO2 Sensor', 'co2', 'Greenhouse 1', 'farm/sensors/co2/gh1', FALSE, 'MAINTENANCE');

-- Sample Sensor Readings
INSERT INTO sensor_readings (sensor_id, value, unit, timestamp) VALUES
-- Temperature readings for Greenhouse 1
(1, 25.5, '°C', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(1, 26.2, '°C', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(1, 27.0, '°C', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(1, 28.1, '°C', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(1, 27.8, '°C', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1, 27.3, '°C', NOW()),

-- Temperature readings for Greenhouse 2
(2, 24.8, '°C', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(2, 25.3, '°C', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(2, 25.7, '°C', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(2, 26.1, '°C', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(2, 26.4, '°C', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(2, 26.2, '°C', NOW()),

-- Humidity readings for Greenhouse 1
(3, 65.0, '%', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(3, 67.5, '%', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(3, 70.2, '%', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(3, 68.8, '%', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(3, 67.3, '%', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(3, 66.5, '%', NOW()),

-- Soil Moisture readings
(6, 35.0, '%', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(6, 33.5, '%', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(6, 30.2, '%', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(6, 28.8, '%', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(6, 25.3, '%', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(6, 22.5, '%', NOW()),

(7, 40.0, '%', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(7, 38.5, '%', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(7, 35.2, '%', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(7, 30.8, '%', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(7, 25.3, '%', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(7, 15.5, '%', NOW());

-- Sample Actuators
INSERT INTO actuators (name, type, location, mqtt_topic, is_active, status) VALUES
('Irrigation System 1', 'irrigation', 'Field 1', 'farm/actuators/irrigation/field1', TRUE, 'OFF'),
('Irrigation System 2', 'irrigation', 'Field 2', 'farm/actuators/irrigation/field2', TRUE, 'ON'),
('Ventilation 1', 'ventilation', 'Greenhouse 1', 'farm/actuators/ventilation/gh1', TRUE, 'ON'),
('Ventilation 2', 'ventilation', 'Greenhouse 2', 'farm/actuators/ventilation/gh2', TRUE, 'OFF'),
('Lighting System 1', 'lighting', 'Greenhouse 1', 'farm/actuators/lighting/gh1', TRUE, 'OFF'),
('Heating System 1', 'heating', 'Greenhouse 1', 'farm/actuators/heating/gh1', TRUE, 'OFF'),
('Cooling System 1', 'cooling', 'Storage Room', 'farm/actuators/cooling/storage', TRUE, 'ON'),
('Shade Control', 'shading', 'Greenhouse 2', 'farm/actuators/shading/gh2', FALSE, 'ERROR');

-- Sample Actuator Logs
INSERT INTO actuator_logs (actuator_id, action, status, message, timestamp) VALUES
(1, 'ON', 'SUCCESS', 'Irrigation started automatically due to low soil moisture', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 'OFF', 'SUCCESS', 'Irrigation completed', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 'ON', 'SUCCESS', 'Irrigation started manually by user', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(3, 'ON', 'SUCCESS', 'Ventilation started automatically due to high temperature', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(5, 'ON', 'SUCCESS', 'Lighting turned on by schedule', DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(5, 'OFF', 'SUCCESS', 'Lighting turned off by schedule', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(8, 'ON', 'FAILED', 'Communication error with the device', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Sample Alert Settings
INSERT INTO alert_settings (user_id, sensor_type, min_threshold, max_threshold, notify_email, notify_sms, is_active) VALUES
(1, 'temperature', 15.0, 30.0, TRUE, TRUE, TRUE),
(1, 'humidity', 40.0, 80.0, TRUE, FALSE, TRUE),
(1, 'soil_moisture', 20.0, 60.0, TRUE, TRUE, TRUE),
(2, 'temperature', 18.0, 28.0, TRUE, FALSE, TRUE),
(2, 'soil_moisture', 25.0, 55.0, TRUE, FALSE, TRUE),
(3, 'temperature', 16.0, 29.0, TRUE, FALSE, TRUE);

-- Sample Alerts
INSERT INTO alerts (sensor_id, actuator_id, alert_type, message, severity, is_read, created_at) VALUES
(1, NULL, 'threshold_exceeded', 'Temperature in Greenhouse 1 above threshold (30°C)', 'warning', FALSE, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
(7, NULL, 'threshold_exceeded', 'Soil moisture in Field 2 below threshold (20%)', 'warning', FALSE, DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
(NULL, 2, 'actuator_status', 'Irrigation system in Field 2 activated automatically', 'info', FALSE, DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(NULL, 8, 'actuator_status', 'Shade Control system reported an error', 'error', TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(6, NULL, 'threshold_exceeded', 'Soil moisture in Field 1 below threshold (25%)', 'warning', TRUE, DATE_SUB(NOW(), INTERVAL 2 DAY));

-- Sample System Settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('refresh_interval', '30', 'Dashboard refresh interval in seconds'),
('alert_retention_days', '30', 'Number of days to keep alert history'),
('data_retention_days', '90', 'Number of days to keep sensor readings'),
('system_maintenance_mode', 'false', 'Whether the system is in maintenance mode'),
('mqtt_enabled', 'true', 'Whether MQTT communication is enabled');

-- Insert new user data
INSERT INTO users (username, password, email, role, is_active)
VALUES 
('admin', '$2b$12$KAh2Gm9lXVhO0VDnrMKPK.NZzLVt8MLBFj.HW.M8iGiVIUxQ9Dgyi', 'admin@smartfarm.com', 'admin', true),
('manager', '$2b$12$Wo/HcJ4FWVXzVJP4UJQWxe6kvUonBCWXS0lQkWN7TV9SwVKZRpNK2', 'manager@smartfarm.com', 'manager', true),
('operator', '$2b$12$lJrQPZlYL1IcJJvEn4Imtu9/1/6ZuDYBkEuw/KI16BU5n5jCBsHzy', 'operator@smartfarm.com', 'operator', true),
('viewer', '$2b$12$xCyAH5n9/D4BPzw61QFp9.oQl4Qn68vRrGbq0LEzP24t/F3ZLqIw.', 'viewer@smartfarm.com', 'viewer', true);

-- Insert new sensor data
INSERT INTO sensors (name, type, location, mqtt_topic, is_active, last_reading, last_reading_time)
VALUES 
('温度传感器1', 'temperature', '温室1', 'sensors/greenhouse1/temperature', true, 25.6, NOW()),
('湿度传感器1', 'humidity', '温室1', 'sensors/greenhouse1/humidity', true, 68.4, NOW()),
('光照传感器1', 'light', '温室1', 'sensors/greenhouse1/light', true, 4250, NOW()),
('土壤湿度传感器1', 'soil_moisture', '温室1', 'sensors/greenhouse1/soil_moisture', true, 42.5, NOW()),
('二氧化碳传感器1', 'co2', '温室1', 'sensors/greenhouse1/co2', true, 850, NOW()),
('温度传感器2', 'temperature', '温室2', 'sensors/greenhouse2/temperature', true, 26.2, NOW()),
('湿度传感器2', 'humidity', '温室2', 'sensors/greenhouse2/humidity', true, 70.1, NOW()),
('光照传感器2', 'light', '温室2', 'sensors/greenhouse2/light', true, 4150, NOW()),
('土壤湿度传感器2', 'soil_moisture', '温室2', 'sensors/greenhouse2/soil_moisture', true, 45.0, NOW()),
('二氧化碳传感器2', 'co2', '温室2', 'sensors/greenhouse2/co2', true, 820, NOW());

-- Insert new sensor reading data
INSERT INTO sensor_readings (sensor_id, value, timestamp)
VALUES 
(1, 24.5, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(1, 25.0, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(1, 25.5, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(1, 25.6, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(2, 67.0, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(2, 67.5, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(2, 68.0, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(2, 68.4, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(3, 4100, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(3, 4150, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(3, 4200, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(3, 4250, DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- Insert new actuator data
INSERT INTO actuators (name, type, location, mqtt_topic, is_active, status, mode, parameters, auto_rules, last_control_time)
VALUES 
('风扇1', 'fan', '温室1', 'actuators/greenhouse1/fan', true, 'off', 'auto', '{"speed": 0, "direction": "forward", "max_speed": 5}', '{"temperature": {"gt": 28, "action": "on", "parameters": {"speed": 3}}}', NOW()),
('灯光1', 'light', '温室1', 'actuators/greenhouse1/light', true, 'on', 'manual', '{"brightness": 80, "color_temp": 4000}', '{"light": {"lt": 3000, "action": "on", "parameters": {"brightness": 90}}}', NOW()),
('加湿器1', 'humidifier', '温室1', 'actuators/greenhouse1/humidifier', true, 'off', 'auto', '{"intensity": 0, "max_intensity": 10}', '{"humidity": {"lt": 60, "action": "on", "parameters": {"intensity": 5}}}', NOW()),
('水泵1', 'pump', '温室1', 'actuators/greenhouse1/pump', true, 'off', 'auto', '{"flow_rate": 0, "max_flow_rate": 100}', '{"soil_moisture": {"lt": 35, "action": "on", "parameters": {"flow_rate": 50}}}', NOW()),
('风扇2', 'fan', '温室2', 'actuators/greenhouse2/fan', true, 'on', 'manual', '{"speed": 2, "direction": "forward", "max_speed": 5}', '{"temperature": {"gt": 27, "action": "on", "parameters": {"speed": 2}}}', NOW()),
('灯光2', 'light', '温室2', 'actuators/greenhouse2/light', true, 'off', 'auto', '{"brightness": 0, "color_temp": 4000}', '{"light": {"lt": 3200, "action": "on", "parameters": {"brightness": 85}}}', NOW()),
('加湿器2', 'humidifier', '温室2', 'actuators/greenhouse2/humidifier', true, 'on', 'manual', '{"intensity": 4, "max_intensity": 10}', '{"humidity": {"lt": 65, "action": "on", "parameters": {"intensity": 4}}}', NOW()),
('水泵2', 'pump', '温室2', 'actuators/greenhouse2/pump', true, 'off', 'auto', '{"flow_rate": 0, "max_flow_rate": 100}', '{"soil_moisture": {"lt": 40, "action": "on", "parameters": {"flow_rate": 60}}}', NOW());

-- Insert new actuator log data
INSERT INTO actuator_logs (actuator_id, action, status, previous_state, parameters, message, timestamp)
VALUES 
(1, 'auto_off', 'off', 'on', '{"speed": 0}', '温度低于阈值，自动关闭风扇', DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(1, 'auto_on', 'on', 'off', '{"speed": 3}', '温度高于阈值，自动开启风扇', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(2, 'manual_on', 'on', 'off', '{"brightness": 80}', '手动开启灯光', DATE_SUB(NOW(), INTERVAL 8 HOUR)),
(2, 'manual_adjust', 'on', 'on', '{"brightness": 60}', '手动调整灯光亮度', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(3, 'auto_on', 'on', 'off', '{"intensity": 5}', '湿度低于阈值，自动开启加湿器', DATE_SUB(NOW(), INTERVAL 7 HOUR)),
(3, 'auto_off', 'off', 'on', '{"intensity": 0}', '湿度达到目标值，自动关闭加湿器', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(4, 'auto_on', 'on', 'off', '{"flow_rate": 50}', '土壤湿度低于阈值，自动开启水泵', DATE_SUB(NOW(), INTERVAL 9 HOUR)),
(4, 'auto_off', 'off', 'on', '{"flow_rate": 0}', '土壤湿度达到目标值，自动关闭水泵', DATE_SUB(NOW(), INTERVAL 7 HOUR));

-- Insert new alert setting data
INSERT INTO alert_settings (sensor_id, name, condition_type, threshold, is_active, created_by)
VALUES 
(1, '温室1温度过高警报', 'gt', 30, true, 1),
(1, '温室1温度过低警报', 'lt', 18, true, 1),
(2, '温室1湿度过低警报', 'lt', 55, true, 1),
(6, '温室2温度过高警报', 'gt', 29, true, 1),
(7, '温室2湿度过低警报', 'lt', 60, true, 1);

-- Insert new alert data
INSERT INTO alerts (alert_setting_id, sensor_id, reading_value, is_acknowledged, acknowledged_by, acknowledged_at, message, created_at)
VALUES 
(1, 1, 31.2, true, 1, DATE_SUB(NOW(), INTERVAL 1 DAY), '温室1温度过高: 31.2°C', DATE_SUB(NOW(), INTERVAL 30 HOUR)),
(3, 2, 52.8, true, 2, DATE_SUB(NOW(), INTERVAL 10 HOUR), '温室1湿度过低: 52.8%', DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(4, 6, 29.5, false, null, null, '温室2温度过高: 29.5°C', DATE_SUB(NOW(), INTERVAL 4 HOUR));

-- Insert new system setting data
INSERT INTO system_settings (setting_key, setting_value, description, updated_by)
VALUES 
('default_temperature_range', '{"min": 20, "max": 28, "unit": "°C"}', '默认温度范围设置', 1),
('default_humidity_range', '{"min": 60, "max": 80, "unit": "%"}', '默认湿度范围设置', 1),
('default_light_range', '{"min": 3000, "max": 6000, "unit": "lux"}', '默认光照范围设置', 1),
('default_soil_moisture_range', '{"min": 40, "max": 70, "unit": "%"}', '默认土壤湿度范围设置', 1),
('notification_settings', '{"email": true, "sms": false, "push": true}', '通知设置', 1),
('system_maintenance', '{"last_backup": "2023-05-15 00:00:00", "next_scheduled": "2023-06-15 00:00:00"}', '系统维护设置', 1);

-- Insert new actuator group data
INSERT INTO actuator_groups (name, description, created_by, created_at)
VALUES 
('温室1所有执行器', '温室1的所有执行器集合', 1, NOW()),
('温室2所有执行器', '温室2的所有执行器集合', 1, NOW()),
('所有风扇', '所有温室的风扇', 1, NOW()),
('所有灯光', '所有温室的灯光', 1, NOW()),
('所有水泵', '所有温室的水泵', 1, NOW());

-- Insert new actuator group member data
INSERT INTO actuator_group_members (group_id, actuator_id)
VALUES 
(1, 1), (1, 2), (1, 3), (1, 4),
(2, 5), (2, 6), (2, 7), (2, 8),
(3, 1), (3, 5),
(4, 2), (4, 6),
(5, 4), (5, 8);

-- Insert new actuator control plan data
INSERT INTO actuator_schedules (actuator_id, group_id, name, schedule_type, action, parameters, start_time, end_time, days_of_week, days_of_month, start_date, end_date, is_active, created_by)
VALUES 
(2, NULL, '温室1灯光每日计划', 'daily', 'on', '{"brightness": 85}', '06:00:00', '18:00:00', NULL, NULL, CURDATE(), NULL, true, 1),
(6, NULL, '温室2灯光每日计划', 'daily', 'on', '{"brightness": 80}', '06:30:00', '18:30:00', NULL, NULL, CURDATE(), NULL, true, 1),
(NULL, 5, '所有水泵每周浇水', 'weekly', 'on', '{"flow_rate": 70, "duration": 30}', '08:00:00', '08:30:00', '1,3,5', NULL, CURDATE(), NULL, true, 1),
(3, NULL, '温室1加湿器每日计划', 'daily', 'on', '{"intensity": 6}', '10:00:00', '16:00:00', NULL, NULL, CURDATE(), NULL, true, 1),
(NULL, 3, '夏季高温风扇计划', 'daily', 'on', '{"speed": 4}', '12:00:00', '15:00:00', NULL, NULL, '2023-06-01', '2023-08-31', true, 1); 