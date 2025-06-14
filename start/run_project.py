#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
智能农场系统启动脚本
自动启动前端和后端服务
"""

import os
import sys
import subprocess
import time
import platform
import webbrowser
from threading import Thread

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

def check_python_version():
    """检查Python版本"""
    print_color("正在检查Python版本...", Colors.BLUE)
    major, minor = sys.version_info[:2]
    if major < 3 or (major == 3 and minor < 6):
        print_color("错误: 需要Python 3.6+", Colors.FAIL)
        sys.exit(1)
    print_color(f"Python版本 {major}.{minor} 符合要求", Colors.GREEN)

def install_backend_deps():
    """安装后端依赖"""
    print_color("正在安装后端依赖...", Colors.BLUE)
    
    # 确保安装正确版本的Flask和Werkzeug
    subprocess.check_call([
        sys.executable, '-m', 'pip', 'install', 
        'flask==2.0.1', 'werkzeug==2.0.1', 'pyjwt',
        '-i', 'https://mirrors.aliyun.com/pypi/simple/'
    ])
    
    # 安装其他依赖
    subprocess.check_call([
        sys.executable, '-m', 'pip', 'install', '-r', 
        os.path.join(BACKEND_DIR, 'requirements.txt'),
        '-i', 'https://mirrors.aliyun.com/pypi/simple/'
    ])
    print_color("后端依赖安装完成", Colors.GREEN)

def check_node():
    """检查Node.js是否安装"""
    print_color("正在检查Node.js...", Colors.BLUE)
    try:
        output = subprocess.check_output(['node', '--version'], stderr=subprocess.STDOUT)
        version = output.decode().strip()
        print_color(f"找到Node.js {version}", Colors.GREEN)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print_color("错误: 未找到Node.js，请先安装Node.js", Colors.FAIL)
        return False

def install_frontend_deps():
    """安装前端依赖"""
    if not check_node():
        return False
        
    print_color("正在安装前端依赖...", Colors.BLUE)
    # 切换到前端目录安装依赖
    subprocess.check_call(
        'npm install', 
        shell=True, 
        cwd=FRONTEND_DIR
    )
    print_color("前端依赖安装完成", Colors.GREEN)
    return True

def run_backend():
    """运行后端服务"""
    print_color("正在启动后端服务...", Colors.BLUE)
    
    # Windows下使用不同的命令
    if platform.system() == "Windows":
        process = subprocess.Popen(
            [sys.executable, 'app.py'],
            cwd=BACKEND_DIR
        )
    else:
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
    
    # Windows下使用不同的命令
    if platform.system() == "Windows":
        process = subprocess.Popen(
            'npm start',
            shell=True,
            cwd=FRONTEND_DIR
        )
    else:
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

def main():
    """主函数"""
    print_color("=" * 50, Colors.HEADER)
    print_color("        智能农场系统启动程序", Colors.HEADER)
    print_color("=" * 50, Colors.HEADER)
    
    try:
        # 检查环境
        check_python_version()
        
        # 安装依赖
        print_color("\n第1步: 安装依赖", Colors.BOLD)
        install_backend_deps()
        frontend_ready = install_frontend_deps()
        
        if not frontend_ready:
            print_color("前端依赖安装失败，仅启动后端服务", Colors.WARNING)
        
        # 启动服务
        print_color("\n第2步: 启动服务", Colors.BOLD)
        backend_process = run_backend()
        
        if frontend_ready:
            frontend_process = run_frontend()
            
            # 打开浏览器
            print_color("\n第3步: 打开应用", Colors.BOLD)
            time.sleep(2)
            open_browser()
            
            print_color("\n系统已成功启动", Colors.GREEN)
            print_color("前端界面: http://localhost:3000", Colors.GREEN)
            print_color("后端API: http://localhost:5000", Colors.GREEN)
            print_color("\n按Ctrl+C退出", Colors.WARNING)
            
            # 等待前端进程结束
            frontend_process.wait()
        else:
            print_color("\n后端服务已启动", Colors.GREEN)
            print_color("API地址: http://localhost:5000", Colors.GREEN)
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