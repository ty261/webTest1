"""
用户数据修复脚本 - 解决密码哈希格式问题
"""

import os
import sys
import bcrypt
from datetime import datetime

# 添加项目根目录到路径，以便导入项目模块
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# 设置Flask应用环境
from flask import Flask
from models.db import db
from models.user import User
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 创建临时Flask应用来访问数据库
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# 定义固定的默认密码（用于所有用户）
DEFAULT_PASSWORD = "password123"

def fix_user_passwords():
    """重置所有用户的密码为默认密码并确保使用bcrypt格式"""
    with app.app_context():
        # 获取所有用户
        users = User.query.all()
        print(f"找到 {len(users)} 个用户，开始修复密码...")
        
        for user in users:
            try:
                # 生成bcrypt格式的密码哈希
                password_bytes = DEFAULT_PASSWORD.encode('utf-8')
                salt = bcrypt.gensalt(rounds=10)
                hash_bytes = bcrypt.hashpw(password_bytes, salt)
                password_hash = hash_bytes.decode('utf-8')
                
                # 更新用户密码
                user.password_hash = password_hash
                user.updated_at = datetime.utcnow()
                
                print(f"已重置用户 {user.username} 的密码为默认密码")
            except Exception as e:
                print(f"重置用户 {user.username} 的密码时出错: {e}")
        
        # 提交更改
        db.session.commit()
        print("所有用户密码修复完成！")
        print(f"默认密码已设置为: {DEFAULT_PASSWORD}")

def add_test_user():
    """添加一个测试用户"""
    with app.app_context():
        # 检查测试用户是否已存在
        test_user = User.query.filter_by(username='testuser').first()
        if test_user:
            print("测试用户已存在，跳过添加")
            return
            
        # 创建测试用户
        new_user = User(
            username='testuser',
            email='test@example.com',
            role='user',
            is_active=True
        )
        
        # 设置密码
        new_user.set_password('testpassword')
        
        # 保存用户
        db.session.add(new_user)
        db.session.commit()
        print("测试用户已添加: testuser/testpassword")

if __name__ == "__main__":
    print("========== 用户数据修复工具 ==========")
    choice = input("选择操作: [1] 修复所有用户密码 [2] 添加测试用户 [3] 同时执行两者: ")
    
    if choice == '1':
        fix_user_passwords()
    elif choice == '2':
        add_test_user()
    elif choice == '3':
        fix_user_passwords()
        add_test_user()
    else:
        print("无效选择!") 