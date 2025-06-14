#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
智能农场系统后端启动脚本
"""

import os
import sys
import subprocess
import platform
import time

# 项目根目录
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, 'backend')

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
    time.sleep(2)
    print_color("后端服务已启动在 http://localhost:5000", Colors.GREEN)
    return process

def main():
    """主函数"""
    print_color("=" * 50, Colors.HEADER)
    print_color("        智能农场系统后端启动程序", Colors.HEADER)
    print_color("=" * 50, Colors.HEADER)
    
    try:
        # 安装依赖
        # install_backend_deps()  # 如果已经安装过依赖，可以注释掉这一行
        
        # 启动服务
        print_color("\n启动后端服务", Colors.BOLD)
        backend_process = run_backend()
        
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