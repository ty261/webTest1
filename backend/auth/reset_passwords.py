"""
密码重置工具 - 将所有用户密码重置为: password123
"""
import os
import pymysql
from dotenv import load_dotenv

# 加载环境变量
load_dotenv('backend/.env')

# 数据库连接信息
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'smart_farm'),
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor
}

def reset_passwords():
    """重置所有用户密码"""
    print("正在连接数据库...")
    
    try:
        # 连接到数据库
        connection = pymysql.connect(**DB_CONFIG)
        
        # 创建游标
        with connection.cursor() as cursor:
            # 读取SQL文件
            with open('database/update_user_passwords.sql', 'r', encoding='utf-8') as sql_file:
                sql_commands = sql_file.read()
            
            # 执行SQL命令
            print("正在执行密码重置SQL...")
            for command in sql_commands.split(';'):
                if command.strip():
                    cursor.execute(command)
                    
                    # 如果是SELECT命令，打印结果
                    if command.strip().upper().startswith('SELECT'):
                        result = cursor.fetchall()
                        if result:
                            for row in result:
                                for key, value in row.items():
                                    print(f"{key}: {value}")
            
            # 提交事务
            connection.commit()
            print("所有用户密码已重置为: password123")
            
    except Exception as e:
        print(f"错误: {e}")
    finally:
        # 关闭连接
        if 'connection' in locals() and connection:
            connection.close()
            print("数据库连接已关闭")

if __name__ == "__main__":
    print("======================================")
    print("       智能农场系统 密码重置工具      ")
    print("======================================")
    print("警告: 此工具将重置所有用户的密码!")
    confirm = input("输入 'yes' 确认继续: ")
    
    if confirm.lower() == 'yes':
        reset_passwords()
    else:
        print("操作已取消") 