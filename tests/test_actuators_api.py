#!/usr/bin/env python3
import requests
import json
import sys

# API基础URL
API_BASE_URL = 'http://localhost:5000/api'

def test_get_all_actuators():
    """测试获取所有执行器的API端点"""
    print("\n正在测试获取执行器列表接口...")
    try:
        response = requests.get(f"{API_BASE_URL}/actuators")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                actuators = data.get('data', [])
                print(f"接口调用成功! 找到 {len(actuators)} 个执行器")
                
                if actuators:
                    print("\n执行器列表:")
                    for idx, actuator in enumerate(actuators, 1):
                        print(f"{idx}. {actuator.get('name')} - 类型: {actuator.get('type')}, 状态: {actuator.get('status')}")
                return True
            else:
                print(f"错误: API返回失败状态")
                print(f"错误信息: {data.get('message', '未知错误')}")
                return False
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

def test_get_actuator_by_id(actuator_id=1):
    """测试获取单个执行器的API端点"""
    print(f"\n正在测试获取执行器详情接口 (ID: {actuator_id})...")
    try:
        response = requests.get(f"{API_BASE_URL}/actuators/{actuator_id}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                actuator = data.get('data', {})
                print("接口调用成功!")
                print(f"执行器名称: {actuator.get('name')}")
                print(f"类型: {actuator.get('type')}")
                print(f"位置: {actuator.get('location')}")
                print(f"状态: {actuator.get('status')}")
                print(f"模式: {actuator.get('mode')}")
                return True
            else:
                print(f"错误: API返回失败状态")
                print(f"错误信息: {data.get('message', '未知错误')}")
                return False
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
    print("=== 智能农场执行器API测试 ===")
    
    # 测试获取所有执行器
    if not test_get_all_actuators():
        print("\n获取执行器列表接口测试失败")
        sys.exit(1)

    # 测试获取单个执行器
    if not test_get_actuator_by_id(1):
        print("\n获取执行器详情接口测试失败")
        sys.exit(1)
        
    print("\n所有测试均已通过!")

if __name__ == "__main__":
    main() 