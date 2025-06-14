#!/usr/bin/env python3
import requests
import json
import sys

# API基础URL
API_BASE_URL = 'http://localhost:5000/api'

def test_dashboard_summary():
    """测试仪表板摘要API端点"""
    print("\n正在测试仪表板摘要接口...")
    try:
        response = requests.get(f"{API_BASE_URL}/dashboard/summary")
        
        if response.status_code == 200:
            data = response.json()
            print("接口调用成功!")
            print(f"传感器总数: {data['data']['sensors']['total']}")
            print(f"执行器总数: {data['data']['actuators']['total']}")
            print(f"响应时间戳: {data['data']['timestamp']}")
            return True
        else:
            print(f"错误: 接口返回状态码 {response.status_code}")
            print(f"错误信息: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("错误: 无法连接到API服务器，请确保后端服务正在运行")
        return False
    except Exception as e:
        print(f"测试时发生错误: {str(e)}")
        return False

def main():
    """主函数"""
    print("=== 智能农场API测试 ===")
    
    # 测试仪表板摘要
    if not test_dashboard_summary():
        print("\n仪表板摘要接口测试失败")
        sys.exit(1)
        
    print("\n所有测试均已通过!")

if __name__ == "__main__":
    main() 