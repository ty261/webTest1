"""
数据库用户验证工具 - 检查并验证数据库中的用户凭据
"""
import os
import pymysql
import bcrypt
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

def verify_users():
    """
    验证数据库中所有用户的密码格式，并尝试用password123登录
    """
    try:
        # 连接到数据库
        connection = pymysql.connect(**DB_CONFIG)
        print(f"成功连接到数据库: {DB_CONFIG['database']}")
        
        with connection.cursor() as cursor:
            # 获取所有用户
            cursor.execute("SELECT id, username, email, password_hash FROM users")
            users = cursor.fetchall()
            
            if not users:
                print("数据库中没有找到用户！")
                return
            
            print(f"共找到 {len(users)} 个用户记录")
            print("-" * 80)
            
            # 测试密码
            test_password = "password123"
            print(f"将测试所有用户是否可以使用密码: '{test_password}'")
            
            # 生成bcrypt密码哈希格式，用于参考
            salt = bcrypt.gensalt()
            hashed_password = bcrypt.hashpw(test_password.encode('utf-8'), salt).decode('utf-8')
            
            print(f"参考: 密码 '{test_password}' 的bcrypt哈希格式应该类似: {hashed_password}")
            print("-" * 80)
            
            for user in users:
                print(f"用户 #{user['id']}: {user['username']} ({user['email']})")
                print(f"密码哈希: {user['password_hash']}")
                
                # 检查密码哈希格式
                if user['password_hash'].startswith('$2a$') or user['password_hash'].startswith('$2b$'):
                    print("哈希格式: bcrypt (正确格式)")
                    
                    # 尝试验证密码
                    try:
                        if bcrypt.checkpw(test_password.encode('utf-8'), user['password_hash'].encode('utf-8')):
                            print(f"√ 密码 '{test_password}' 验证成功！该用户可以登录。")
                        else:
                            print(f"× 密码 '{test_password}' 验证失败。该用户无法使用此密码登录。")
                            
                            # 生成新的密码哈希
                            new_hash = bcrypt.hashpw(test_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                            print(f"  建议更新该用户的密码哈希为: {new_hash}")
                            
                            # 提示更新密码的SQL
                            sql = f"UPDATE users SET password_hash = '{new_hash}' WHERE id = {user['id']};"
                            print(f"  SQL更新命令: {sql}")
                    except Exception as e:
                        print(f"× 验证过程出错: {e}")
                        
                elif user['password_hash'].startswith('pbkdf2'):
                    print("哈希格式: PBKDF2 (不兼容格式，需要更新为bcrypt)")
                    
                    # 生成新的bcrypt密码哈希
                    new_hash = bcrypt.hashpw(test_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                    print(f"  建议更新该用户的密码哈希为: {new_hash}")
                    
                    # 提示更新密码的SQL
                    sql = f"UPDATE users SET password_hash = '{new_hash}' WHERE id = {user['id']};"
                    print(f"  SQL更新命令: {sql}")
                else:
                    print(f"哈希格式: 未知 (不兼容格式，需要更新为bcrypt)")
                    
                    # 生成新的bcrypt密码哈希
                    new_hash = bcrypt.hashpw(test_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                    print(f"  建议更新该用户的密码哈希为: {new_hash}")
                    
                    # 提示更新密码的SQL
                    sql = f"UPDATE users SET password_hash = '{new_hash}' WHERE id = {user['id']};"
                    print(f"  SQL更新命令: {sql}")
                
                print("-" * 80)
    
    except Exception as e:
        print(f"错误: {e}")
    finally:
        if 'connection' in locals() and connection:
            connection.close()
            print("数据库连接已关闭")

def update_all_passwords():
    """
    更新所有用户的密码为password123（使用bcrypt哈希）
    """
    try:
        # 连接到数据库
        connection = pymysql.connect(**DB_CONFIG)
        print(f"成功连接到数据库: {DB_CONFIG['database']}")
        
        # 生成新的bcrypt密码哈希
        test_password = "password123"
        new_hash = bcrypt.hashpw(test_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        with connection.cursor() as cursor:
            # 更新所有用户的密码
            update_sql = f"UPDATE users SET password_hash = '{new_hash}'"
            cursor.execute(update_sql)
            connection.commit()
            
            affected_rows = cursor.rowcount
            print(f"已更新 {affected_rows} 个用户的密码为 '{test_password}'")
            print(f"使用的密码哈希值: {new_hash}")
    
    except Exception as e:
        print(f"错误: {e}")
    finally:
        if 'connection' in locals() and connection:
            connection.close()
            print("数据库连接已关闭")

def generate_update_sql():
    """
    生成更新所有用户密码的SQL脚本
    """
    # 生成新的bcrypt密码哈希
    test_password = "password123"
    new_hash = bcrypt.hashpw(test_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    sql = f"""
-- 更新所有用户密码为 'password123'
UPDATE users SET password_hash = '{new_hash}', updated_at = NOW();

-- 查看更新后的结果
SELECT id, username, email, LEFT(password_hash, 20) AS password_hash_preview FROM users;
"""
    
    print("以下是更新所有用户密码的SQL脚本:")
    print("-" * 80)
    print(sql)
    print("-" * 80)
    print(f"此脚本将把所有用户的密码重置为: '{test_password}'")
    
    # 保存到文件
    with open('update_passwords.sql', 'w') as f:
        f.write(sql)
    
    print(f"SQL脚本已保存到文件: update_passwords.sql")

if __name__ == "__main__":
    print("======== 数据库用户验证工具 ========")
    print("1. 验证所有用户账户")
    print("2. 直接更新所有用户密码为password123")
    print("3. 生成更新密码的SQL脚本")
    print("=" * 32)
    
    choice = input("请输入选项 (1-3): ").strip()
    
    if choice == '1':
        verify_users()
    elif choice == '2':
        confirm = input("确定要重置所有用户密码? (yes/no): ").strip().lower()
        if confirm == 'yes':
            update_all_passwords()
        else:
            print("操作已取消")
    elif choice == '3':
        generate_update_sql()
    else:
        print("无效选项") 