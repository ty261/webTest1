#!/usr/bin/env python3
import pymysql
import sys
import logging
import os

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 数据库连接参数 - 根据需要调整
DB_HOST = 'localhost'
DB_USER = 'root'
DB_PASSWORD = '9f81cc9ba8f6458d' # 数据库密码
DB_NAME = 'smart_farm'

def connect_to_database():
    """连接到MySQL数据库"""
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
    """为actuator_logs表添加缺失的列"""
    cursor = conn.cursor()
    
    try:
        # 检查列是否已存在
        cursor.execute("SHOW COLUMNS FROM actuator_logs LIKE 'previous_state'")
        previous_state_exists = cursor.fetchone() is not None
        
        cursor.execute("SHOW COLUMNS FROM actuator_logs LIKE 'parameters'")
        parameters_exists = cursor.fetchone() is not None
        
        # 添加缺失的列
        if not previous_state_exists:
            logger.info("正在添加 'previous_state' 列到 actuator_logs 表")
            cursor.execute("ALTER TABLE actuator_logs ADD COLUMN `previous_state` varchar(50)")
        
        if not parameters_exists:
            logger.info("正在添加 'parameters' 列到 actuator_logs 表")
            cursor.execute("ALTER TABLE actuator_logs ADD COLUMN `parameters` text")
        
        conn.commit()
        logger.info("actuator_logs 表更新成功完成")
        
    except pymysql.Error as e:
        conn.rollback()
        logger.error(f"更新数据库时出错: {e}")
        sys.exit(1)
    finally:
        cursor.close()

def main():
    """主函数用于更新数据库"""
    conn = connect_to_database()
    try:
        update_database(conn)
    finally:
        conn.close()
        logger.info("数据库连接已关闭")

if __name__ == "__main__":
    main() 