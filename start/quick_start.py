#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
智能农场系统快速启动脚本
假设所有依赖已安装，直接启动前后端服务
"""

import os
import sys
import subprocess
import time
import platform
import webbrowser

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

def run_backend():
    """运行后端服务"""
    print_color("正在启动后端服务...", Colors.BLUE)
    
    # 创建后端进程
    process = subprocess.Popen(
        [sys.executable, 'app.py'],
        cwd=BACKEND_DIR
    )
    
    # 等待服务启动
    time.sleep(2)
    print_color("后端服务已启动在 http://localhost:5000", Colors.GREEN)
    return process

def run_frontend():
    """运行前端服务"""
    print_color("正在启动前端服务...", Colors.BLUE)
    
    # 创建前端进程
    process = subprocess.Popen(
        'npm start',
        shell=True,
        cwd=FRONTEND_DIR
    )
    
    # 等待服务启动
    time.sleep(3)
    print_color("前端服务已启动在 http://localhost:3000", Colors.GREEN)
    return process

def open_browser():
    """打开浏览器"""
    print_color("正在打开浏览器...", Colors.BLUE)
    webbrowser.open('http://localhost:3000')

def main():
    """主函数"""
    print_color("=" * 50, Colors.HEADER)
    print_color("        智能农场系统快速启动", Colors.HEADER)
    print_color("=" * 50, Colors.HEADER)
    
    try:
        print_color("\n1. 启动后端服务", Colors.BOLD)
        backend_process = run_backend()
        
        print_color("\n2. 启动前端服务", Colors.BOLD)
        frontend_process = run_frontend()
        
        print_color("\n3. 打开浏览器", Colors.BOLD)
        open_browser()
        
        print_color("\n系统已成功启动！", Colors.GREEN)
        print_color("- 前端界面: http://localhost:3000", Colors.GREEN)
        print_color("- 后端API: http://localhost:5000", Colors.GREEN)
        print_color("- 默认登录: admin@smartfarm.com / password123", Colors.GREEN)
        print_color("\n按Ctrl+C停止服务", Colors.WARNING)
        
        # 等待前端进程结束
        frontend_process.wait()
            
    except KeyboardInterrupt:
        print_color("\n正在关闭服务...", Colors.BLUE)
    except Exception as e:
        print_color(f"\n发生错误: {str(e)}", Colors.FAIL)
    finally:
        print_color("程序已退出", Colors.BLUE)

if __name__ == "__main__":
    main() 