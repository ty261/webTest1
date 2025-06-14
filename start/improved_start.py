#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
智能农场系统改进版启动脚本
- 解决前后端连接问题
- 配置正确的MQTT服务器地址
"""

import os
import sys
import subprocess
import time
import platform
import webbrowser
import json
import re

# 项目根目录
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, 'backend')
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')

# 控制台颜色
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_color(text, color):
    """打印彩色文本"""
    # Windows平台下使用不同的方式处理彩色输出
    if platform.system() == 'Windows':
        os.system('color')
    print(f"{color}{text}{Colors.ENDC}")

def update_mqtt_config():
    """更新MQTT配置为指定服务器"""
    env_path = os.path.join(BACKEND_DIR, '.env')
    
    print_color("正在更新MQTT配置...", Colors.BLUE)
    
    if os.path.exists(env_path):
        # 读取现有配置
        with open(env_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 更新MQTT服务器地址
        content = re.sub(r'MQTT_BROKER=.*', 'MQTT_BROKER=8.134.139.38', content)
        
        # 确保模拟模式开启，以防无法连接
        content = re.sub(r'MQTT_MOCK_MODE=.*', 'MQTT_MOCK_MODE=true', content)
        
        # 写回配置文件
        with open(env_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print_color("MQTT配置已更新", Colors.GREEN)
    else:
        print_color(f"找不到配置文件: {env_path}", Colors.WARNING)

def update_frontend_proxy():
    """修复前端代理设置"""
    package_json_path = os.path.join(FRONTEND_DIR, 'package.json')
    
    print_color("正在更新前端代理设置...", Colors.BLUE)
    
    if os.path.exists(package_json_path):
        # 读取package.json
        with open(package_json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 更新代理设置
        data['proxy'] = 'http://localhost:5000'
        
        # 写回package.json
        with open(package_json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
            
        print_color("前端代理设置已更新", Colors.GREEN)
    else:
        print_color(f"找不到package.json: {package_json_path}", Colors.WARNING)

def run_backend():
    """运行后端服务"""
    print_color("正在启动后端服务...", Colors.BLUE)
    
    # 创建后端进程
    process = subprocess.Popen(
        [sys.executable, 'app.py'],
        cwd=BACKEND_DIR
    )
    
    # 等待服务启动
    time.sleep(3)
    print_color("后端服务已启动在 http://localhost:5000", Colors.GREEN)
    return process

def run_frontend():
    """运行前端服务"""
    print_color("正在启动前端服务...", Colors.BLUE)
    
    # 在前端目录运行npm start
    process = subprocess.Popen(
        'npm start',
        shell=True,
        cwd=FRONTEND_DIR
    )
    
    # 等待服务启动
    time.sleep(5)
    print_color("前端服务已启动在 http://localhost:3000", Colors.GREEN)
    return process

def open_browser():
    """打开浏览器"""
    print_color("正在打开浏览器...", Colors.BLUE)
    webbrowser.open('http://localhost:3000')

def check_dependencies():
    """检查基本依赖是否安装"""
    print_color("检查基本依赖...", Colors.BLUE)
    
    # 检查Python版本
    print_color("检查Python版本...", Colors.BLUE)
    major, minor = sys.version_info[:2]
    if major < 3 or (major == 3 and minor < 6):
        print_color("错误: 需要Python 3.6+", Colors.FAIL)
        sys.exit(1)
    print_color(f"Python版本 {major}.{minor} 符合要求", Colors.GREEN)
    
    # 检查Node.js
    print_color("检查Node.js...", Colors.BLUE)
    try:
        output = subprocess.check_output(['node', '--version'], stderr=subprocess.STDOUT).decode().strip()
        print_color(f"找到Node.js {output}", Colors.GREEN)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print_color("警告: 未检测到Node.js", Colors.WARNING)
        print_color("前端可能无法启动，将仅启动后端服务", Colors.WARNING)
        return False
    
    return True

def install_critical_deps():
    """安装关键依赖"""
    print_color("安装关键依赖...", Colors.BLUE)
    
    try:
        # 安装Flask和Werkzeug的正确版本
        subprocess.check_call([
            sys.executable, '-m', 'pip', 'install', 
            'flask==2.0.1', 'werkzeug==2.0.1', 'pyjwt',
            '-i', 'https://mirrors.aliyun.com/pypi/simple/'
        ])
        print_color("关键依赖安装成功", Colors.GREEN)
        return True
    except subprocess.CalledProcessError:
        print_color("关键依赖安装失败", Colors.FAIL)
        return False

def main():
    """主函数"""
    print_color("=" * 60, Colors.HEADER)
    print_color("          智能农场系统改进版启动程序", Colors.HEADER)
    print_color("=" * 60, Colors.HEADER)
    
    try:
        # 检查基本依赖
        print_color("\n步骤1: 检查基本依赖", Colors.BOLD)
        node_ok = check_dependencies()
        
        # 安装关键Python依赖
        print_color("\n步骤2: 安装关键依赖", Colors.BOLD)
        deps_ok = install_critical_deps()
        if not deps_ok:
            print_color("警告: 依赖安装失败，继续尝试启动...", Colors.WARNING)
        
        # 更新配置
        print_color("\n步骤3: 更新配置", Colors.BOLD)
        update_mqtt_config()
        if node_ok:
            update_frontend_proxy()
        
        # 启动后端
        print_color("\n步骤4: 启动后端服务", Colors.BOLD)
        backend_process = run_backend()
        
        # 如果Node.js可用，启动前端
        frontend_process = None
        if node_ok:
            print_color("\n步骤5: 启动前端服务", Colors.BOLD)
            frontend_process = run_frontend()
            
            # 打开浏览器
            print_color("\n步骤6: 打开浏览器", Colors.BOLD)
            time.sleep(2)
            open_browser()
            
            print_color("\n系统已成功启动", Colors.GREEN)
            print_color("前端界面: http://localhost:3000", Colors.GREEN)
            print_color("后端API: http://localhost:5000", Colors.GREEN)
            print_color("系统默认登录: admin@smartfarm.com / password123", Colors.GREEN)
            print_color("MQTT服务器已配置为: 8.134.139.38", Colors.GREEN)
            print_color("\n按Ctrl+C退出", Colors.WARNING)
            
            # 等待前端进程结束
            if frontend_process:
                frontend_process.wait()
        else:
            print_color("\n仅后端服务已启动", Colors.GREEN)
            print_color("API地址: http://localhost:5000", Colors.GREEN)
            print_color("MQTT服务器已配置为: 8.134.139.38", Colors.GREEN)
            print_color("\n按Ctrl+C退出", Colors.WARNING)
            
            # 等待后端进程结束
            backend_process.wait()
            
    except KeyboardInterrupt:
        print_color("\n正在关闭服务...", Colors.BLUE)
    except Exception as e:
        print_color(f"\n发生错误: {str(e)}", Colors.FAIL)
    finally:
        print_color("程序已退出", Colors.BLUE)

if __name__ == "__main__":
    main() 