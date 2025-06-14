#!/usr/bin/env python3
import pymysql
import sys
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Database connection parameters - adjust as needed
DB_HOST = 'localhost'
DB_USER = 'root'
DB_PASSWORD = '9f81cc9ba8f6458d' # 数据库密码
DB_NAME = 'smart_farm'

def connect_to_database():
    """Connect to the MySQL database"""
    try:
        conn = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        logger.info(f"成功连接到数据库 {DB_NAME}")
        return conn
    except pymysql.Error as e:
        logger.error(f"连接数据库时出错: {e}")
        sys.exit(1)

def update_database(conn):
    """Add missing columns to the actuators table"""
    cursor = conn.cursor()
    
    try:
        # Check if columns already exist
        cursor.execute("SHOW COLUMNS FROM actuators LIKE 'mode'")
        mode_exists = cursor.fetchone() is not None
        
        cursor.execute("SHOW COLUMNS FROM actuators LIKE 'parameters'")
        parameters_exists = cursor.fetchone() is not None
        
        cursor.execute("SHOW COLUMNS FROM actuators LIKE 'auto_rules'")
        auto_rules_exists = cursor.fetchone() is not None
        
        cursor.execute("SHOW COLUMNS FROM actuators LIKE 'last_control_time'")
        last_control_time_exists = cursor.fetchone() is not None
        
        # Add missing columns
        if not mode_exists:
            logger.info("正在添加 'mode' 列到 actuators 表")
            cursor.execute("ALTER TABLE actuators ADD COLUMN `mode` varchar(20) DEFAULT 'manual'")
        
        if not parameters_exists:
            logger.info("正在添加 'parameters' 列到 actuators 表")
            cursor.execute("ALTER TABLE actuators ADD COLUMN `parameters` text")
            # 由于TEXT列不能有默认值，我们需要更新现有行
            cursor.execute("UPDATE actuators SET `parameters` = '{}'")
        
        if not auto_rules_exists:
            logger.info("正在添加 'auto_rules' 列到 actuators 表")
            cursor.execute("ALTER TABLE actuators ADD COLUMN `auto_rules` text")
            # 由于TEXT列不能有默认值，我们需要更新现有行
            cursor.execute("UPDATE actuators SET `auto_rules` = '{}'")
        
        if not last_control_time_exists:
            logger.info("正在添加 'last_control_time' 列到 actuators 表")
            cursor.execute("ALTER TABLE actuators ADD COLUMN `last_control_time` datetime DEFAULT NULL")
        
        conn.commit()
        logger.info("数据库更新成功完成")
        
    except pymysql.Error as e:
        conn.rollback()
        logger.error(f"更新数据库时出错: {e}")
        sys.exit(1)
    finally:
        cursor.close()

def main():
    """Main function to update the database"""
    conn = connect_to_database()
    try:
        update_database(conn)
    finally:
        conn.close()
        logger.info("数据库连接已关闭")

if __name__ == "__main__":
    main() 