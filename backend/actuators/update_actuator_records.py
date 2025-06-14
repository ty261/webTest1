#!/usr/bin/env python3
import pymysql
import sys
import logging
import os
import json

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 数据库连接参数
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

def update_actuator_records(conn):
    """更新执行器记录的默认值"""
    cursor = conn.cursor()
    
    try:
        # 获取所有执行器记录
        cursor.execute("SELECT id, name, type FROM actuators")
        actuators = cursor.fetchall()
        
        if not actuators:
            logger.info("没有找到执行器记录")
            return
            
        logger.info(f"找到 {len(actuators)} 个执行器记录")
        
        # 为每个执行器设置默认值
        for actuator in actuators:
            actuator_id, name, actuator_type = actuator
            
            # 设置 mode 为 'manual'
            cursor.execute("UPDATE actuators SET mode = 'manual' WHERE id = %s AND (mode IS NULL OR mode = '')", (actuator_id,))
            
            # 设置 parameters 为空JSON对象
            empty_params = json.dumps({})
            cursor.execute("UPDATE actuators SET parameters = %s WHERE id = %s AND (parameters IS NULL OR parameters = '')", 
                          (empty_params, actuator_id))
            
            # 设置 auto_rules 为空JSON对象
            cursor.execute("UPDATE actuators SET auto_rules = %s WHERE id = %s AND (auto_rules IS NULL OR auto_rules = '')", 
                          (empty_params, actuator_id))
            
            # 将状态转换为小写（模型使用小写状态）
            cursor.execute("UPDATE actuators SET status = LOWER(status) WHERE id = %s", (actuator_id,))
            
            logger.info(f"已更新执行器 ID: {actuator_id}, 名称: {name}, 类型: {actuator_type}")
        
        # 提交事务
        conn.commit()
        logger.info("所有执行器记录已成功更新")
        
    except pymysql.Error as e:
        conn.rollback()
        logger.error(f"更新执行器记录时出错: {e}")
        sys.exit(1)
    finally:
        cursor.close()

def main():
    """主函数"""
    conn = connect_to_database()
    try:
        update_actuator_records(conn)
    finally:
        conn.close()
        logger.info("数据库连接已关闭")

if __name__ == "__main__":
    main() 