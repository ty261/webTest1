#!/usr/bin/env python3
import requests
import json
import sys

# API基础URL (不带尾部斜杠)
API_BASE_URL = 'http://localhost:5000/api'

def test_actuators_endpoint_with_trailing_slash():
    """测试带尾部斜杠的执行器endpoint"""
    print("\n测试带尾部斜杠的执行器API...", end="")
    try:
        response = requests.get(f"{API_BASE_URL}/actuators/")
        print(f" 状态码: {response.status_code}")
        print(f" 响应头: {response.headers}")
        if response.status_code == 200:
            data = response.json()
            print(f" 成功! 找到 {len(data.get('data', []))} 个执行器")
            return True
        else:
            print(f" 失败! 响应内容: {response.text}")
            return False
    except Exception as e:
        print(f" 错误: {str(e)}")
        return False

def test_actuators_endpoint_without_trailing_slash():
    """测试不带尾部斜杠的执行器endpoint"""
    print("\n测试不带尾部斜杠的执行器API...", end="")
    try:
        response = requests.get(f"{API_BASE_URL}/actuators")
        print(f" 状态码: {response.status_code}")
        print(f" 响应头: {response.headers}")
        if response.status_code == 200:
            data = response.json()
            print(f" 成功! 找到 {len(data.get('data', []))} 个执行器")
            return True
        else:
            print(f" 失败! 响应内容: {response.text}")
            return False
    except Exception as e:
        print(f" 错误: {str(e)}")
        return False

def main():
    """主函数"""
    print("=== API重定向测试 ===")
    
    # 测试两种形式的API端点
    test_actuators_endpoint_with_trailing_slash()
    test_actuators_endpoint_without_trailing_slash()

if __name__ == "__main__":
    main() 