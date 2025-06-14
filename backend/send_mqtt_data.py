#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
智能农场系统 - MQTT数据发送工具
可用于模拟传感器数据和执行器控制
"""

import paho.mqtt.client as mqtt
import json
import time
import random
import sys
import argparse
import threading
import signal
import datetime

# MQTT配置
DEFAULT_BROKER = "8.134.139.38"  # 修改为指定的服务器地址
DEFAULT_PORT = 1883
CLIENT_ID = f"farm_data_sender_{random.randint(1000, 9999)}"

# 传感器类型和执行器类型（扩展数据类型）
SENSOR_TYPES = ["temperature", "humidity", "light", "soil_moisture", "co2", "ph", "pressure", "wind_speed"] 
LOCATIONS = ["大棚1", "大棚2", "田地1", "育苗区", "仓库", "办公室"]
ACTUATOR_TYPES = ["irrigation", "ventilation", "lighting", "heating", "cooling", "curtain", "nutrient", "water_pump"]
ACTUATOR_STATES = ["on", "off"]

# 扩展执行器状态和额外参数
ACTUATOR_EXTENDED_STATES = {
    "irrigation": ["on", "off", "low", "medium", "high"],
    "ventilation": ["on", "off", "low", "medium", "high", "auto"],
    "lighting": ["on", "off", "dim", "bright", "auto"],
    "heating": ["on", "off", "low", "medium", "high", "auto"],
    "cooling": ["on", "off", "low", "medium", "high", "auto"],
    "curtain": ["open", "closed", "half", "auto"],
    "nutrient": ["on", "off", "low", "medium", "high", "auto"],
    "water_pump": ["on", "off", "low", "medium", "high"]
}

# 执行器参数范围
ACTUATOR_PARAMS = {
    "irrigation": {
        "duration": {"min": 5, "max": 60, "unit": "分钟"},
        "flow_rate": {"min": 5, "max": 30, "unit": "L/分钟"},
        "target_moisture": {"min": 50, "max": 80, "unit": "%"}
    },
    "ventilation": {
        "speed": {"min": 0, "max": 100, "unit": "%"},
        "duration": {"min": 10, "max": 120, "unit": "分钟"},
        "target_humidity": {"min": 50, "max": 70, "unit": "%"},
        "target_temperature": {"min": 18, "max": 28, "unit": "°C"}
    },
    "lighting": {
        "intensity": {"min": 10, "max": 100, "unit": "%"},
        "duration": {"min": 1, "max": 18, "unit": "小时"},
        "color_temp": {"min": 2700, "max": 6500, "unit": "K"}
    },
    "heating": {
        "target_temperature": {"min": 18, "max": 30, "unit": "°C"},
        "power": {"min": 10, "max": 100, "unit": "%"},
        "duration": {"min": 10, "max": 120, "unit": "分钟"}
    },
    "cooling": {
        "target_temperature": {"min": 15, "max": 25, "unit": "°C"},
        "power": {"min": 10, "max": 100, "unit": "%"},
        "duration": {"min": 10, "max": 120, "unit": "分钟"}
    },
    "curtain": {
        "position": {"min": 0, "max": 100, "unit": "%"},
        "threshold_light": {"min": 1000, "max": 8000, "unit": "lux"}
    },
    "nutrient": {
        "concentration": {"min": 0.5, "max": 5.0, "unit": "mS/cm"},
        "target_ph": {"min": 5.5, "max": 7.0, "unit": "pH"},
        "duration": {"min": 1, "max": 30, "unit": "分钟"}
    },
    "water_pump": {
        "flow_rate": {"min": 10, "max": 100, "unit": "L/分钟"},
        "pressure": {"min": 1.0, "max": 5.0, "unit": "bar"},
        "duration": {"min": 5, "max": 60, "unit": "分钟"}
    }
}

# 数据范围配置（更真实的数据范围）
DATA_RANGES = {
    "temperature": {"min": 15.0, "max": 35.0, "unit": "°C"},
    "humidity": {"min": 30.0, "max": 95.0, "unit": "%"},
    "light": {"min": 100, "max": 8000, "unit": "lux"},
    "soil_moisture": {"min": 15.0, "max": 85.0, "unit": "%"},
    "co2": {"min": 350, "max": 1500, "unit": "ppm"},
    "ph": {"min": 5.5, "max": 7.5, "unit": "pH"},
    "pressure": {"min": 980, "max": 1030, "unit": "hPa"},
    "wind_speed": {"min": 0.0, "max": 10.0, "unit": "m/s"}
}

# 全局变量
stop_continuous_publishing = False

def on_connect(client, userdata, flags, rc):
    """连接回调"""
    if rc == 0:
        print(f"已连接到MQTT服务器 {DEFAULT_BROKER}:{DEFAULT_PORT}")
    else:
        print(f"连接失败，返回码: {rc}")

def on_publish(client, userdata, mid):
    """发布回调"""
    pass

def get_timestamp():
    """获取当前时间戳"""
    return time.time()

def get_formatted_time():
    """获取格式化时间字符串"""
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def create_sensor_data(sensor_type, location):
    """创建传感器数据（扩展版本）"""
    # 获取数据范围
    data_range = DATA_RANGES.get(sensor_type, {"min": 0, "max": 100, "unit": "?"})
    min_val = data_range["min"]
    max_val = data_range["max"]
    unit = data_range["unit"]
    
    # 生成随机值
    if sensor_type == "ph":  # 特殊处理pH值
        value = round(random.uniform(min_val, max_val), 2)
    elif sensor_type in ["temperature", "humidity", "soil_moisture", "wind_speed"]:
        value = round(random.uniform(min_val, max_val), 1)
    else:
        value = round(random.uniform(min_val, max_val))
        
    return {
        "value": value,
        "unit": unit,
        "timestamp": get_timestamp(),
        "formatted_time": get_formatted_time(),
        "sensor_id": f"{sensor_type}_{location.replace(' ', '_')}",
        "sensor_type": sensor_type,
        "location": location
    }

def generate_actuator_params(actuator_type):
    """生成执行器的额外参数"""
    params = {}
    
    # 获取此类型执行器的参数定义
    if actuator_type in ACTUATOR_PARAMS:
        param_defs = ACTUATOR_PARAMS[actuator_type]
        
        # 为每个参数生成随机值
        for param_name, param_range in param_defs.items():
            min_val = param_range["min"]
            max_val = param_range["max"]
            unit = param_range["unit"]
            
            # 根据不同的参数类型设置不同的精度
            if param_name in ["concentration", "pressure", "target_ph"]:
                value = round(random.uniform(min_val, max_val), 2)
            elif param_name in ["position", "speed", "intensity", "power"]:
                value = round(random.uniform(min_val, max_val))
            else:
                value = round(random.uniform(min_val, max_val), 1)
                
            # 添加到参数字典
            params[param_name] = {
                "value": value,
                "unit": unit
            }
    
    return params

def create_actuator_data(actuator_type, location, state=None, params=None):
    """创建执行器数据（增强版本）"""
    # 获取可用的状态列表
    available_states = ACTUATOR_EXTENDED_STATES.get(actuator_type, ["on", "off"])
    
    # 如果未指定状态或状态不在可用列表中，随机选择
    if state is None or state not in available_states:
        state = random.choice(available_states)
    
    # 如果未指定参数，生成随机参数
    if params is None:
        params = generate_actuator_params(actuator_type)
    
    # 创建执行器数据结构
    data = {
        "state": state,
        "timestamp": get_timestamp(),
        "formatted_time": get_formatted_time(),
        "actuator_id": f"{actuator_type}_{location.replace(' ', '_')}",
        "actuator_type": actuator_type,
        "location": location,
        "last_change": get_formatted_time(),
        "mode": "manual" if state not in ["auto"] else "automatic",
        "params": params
    }
    
    # 如果是自动模式，添加自动控制规则
    if state == "auto":
        data["auto_rules"] = {
            "sensor_triggers": []
        }
        
        # 根据执行器类型添加相应的触发条件
        if actuator_type == "irrigation":
            data["auto_rules"]["sensor_triggers"].append({
                "sensor_type": "soil_moisture",
                "condition": "below",
                "threshold": params.get("target_moisture", {}).get("value", 50)
            })
        elif actuator_type == "ventilation":
            data["auto_rules"]["sensor_triggers"].append({
                "sensor_type": "humidity",
                "condition": "above",
                "threshold": params.get("target_humidity", {}).get("value", 70)
            })
            data["auto_rules"]["sensor_triggers"].append({
                "sensor_type": "temperature",
                "condition": "above",
                "threshold": params.get("target_temperature", {}).get("value", 28)
            })
        elif actuator_type == "heating":
            data["auto_rules"]["sensor_triggers"].append({
                "sensor_type": "temperature",
                "condition": "below",
                "threshold": params.get("target_temperature", {}).get("value", 18)
            })
        elif actuator_type == "cooling":
            data["auto_rules"]["sensor_triggers"].append({
                "sensor_type": "temperature",
                "condition": "above",
                "threshold": params.get("target_temperature", {}).get("value", 25)
            })
    
    return data

def send_sensor_data(client, sensor_type=None, location=None):
    """发送传感器数据"""
    # 如果未指定传感器类型或位置，随机选择
    if sensor_type is None:
        sensor_type = random.choice(SENSOR_TYPES)
    if location is None:
        location = random.choice(LOCATIONS)
        
    # 创建数据并发送
    data = create_sensor_data(sensor_type, location)
    topic = f"farm/sensors/{sensor_type}/{location.replace(' ', '_')}"
    
    result = client.publish(topic, json.dumps(data))
    if result.rc == mqtt.MQTT_ERR_SUCCESS:
        print(f"发送传感器数据: {topic} -> {data['value']}{data['unit']} ({get_formatted_time()})")
    else:
        print(f"发送失败: {result.rc}")
    
    return result.rc

def send_actuator_control(client, actuator_type=None, location=None, state=None, params=None):
    """发送执行器控制命令（增强版本）"""
    # 如果未指定执行器类型或位置，随机选择
    if actuator_type is None:
        actuator_type = random.choice(ACTUATOR_TYPES)
    if location is None:
        location = random.choice(LOCATIONS)
    
    # 获取可用的状态列表
    available_states = ACTUATOR_EXTENDED_STATES.get(actuator_type, ["on", "off"])
    
    # 如果未指定状态或状态不在可用列表中，随机选择
    if state is None or state not in available_states:
        state = random.choice(available_states)
        
    # 创建数据并发送
    data = create_actuator_data(actuator_type, location, state, params)
    topic = f"farm/actuators/{actuator_type}/{location.replace(' ', '_')}"
    
    # 构建日志信息
    log_msg = f"发送执行器控制: {topic} -> {state}"
    if params:
        param_str = ", ".join([f"{k}={v.get('value')}{v.get('unit')}" for k, v in params.items()])
        log_msg += f" [参数: {param_str}]"
    log_msg += f" ({get_formatted_time()})"
    
    result = client.publish(topic, json.dumps(data))
    if result.rc == mqtt.MQTT_ERR_SUCCESS:
        print(log_msg)
    else:
        print(f"发送失败: {result.rc}")
    
    return result.rc

def send_random_data(client, count=5, interval=2):
    """发送多条随机数据"""
    for i in range(count):
        # 80%概率发送传感器数据，20%概率发送执行器数据
        if random.random() < 0.8:
            send_sensor_data(client)
        else:
            send_actuator_control(client)
            
        if i < count - 1 and not stop_continuous_publishing:
            time.sleep(interval)
        elif stop_continuous_publishing:
            break

def send_all_actuator_types(client, location=None, interval=1):
    """发送所有类型的执行器数据到指定位置"""
    if location is None:
        location = random.choice(LOCATIONS)
    
    print(f"发送所有类型执行器数据到位置: {location}")
    
    for actuator_type in ACTUATOR_TYPES:
        if stop_continuous_publishing:
            break
        send_actuator_control(client, actuator_type, location)
        time.sleep(interval)

def send_one_actuator_to_all_locations(client, actuator_type=None, interval=1):
    """发送一种执行器数据到所有位置"""
    if actuator_type is None:
        actuator_type = random.choice(ACTUATOR_TYPES)
    
    print(f"发送{actuator_type}执行器数据到所有位置")
    
    for location in LOCATIONS:
        if stop_continuous_publishing:
            break
        send_actuator_control(client, actuator_type, location)
        time.sleep(interval)

def send_all_actuator_states(client, actuator_type=None, location=None, interval=1):
    """发送一种执行器的所有可能状态"""
    if actuator_type is None:
        actuator_type = random.choice(ACTUATOR_TYPES)
    if location is None:
        location = random.choice(LOCATIONS)
        
    # 获取可用的状态列表
    available_states = ACTUATOR_EXTENDED_STATES.get(actuator_type, ["on", "off"])
    
    print(f"发送{actuator_type}执行器在{location}的所有可能状态")
    
    for state in available_states:
        if stop_continuous_publishing:
            break
        send_actuator_control(client, actuator_type, location, state)
        time.sleep(interval)

def send_all_sensor_types(client, location=None, interval=1):
    """发送所有类型的传感器数据到指定位置"""
    if location is None:
        location = random.choice(LOCATIONS)
    
    print(f"发送所有类型传感器数据到位置: {location}")
    
    for sensor_type in SENSOR_TYPES:
        if stop_continuous_publishing:
            break
        send_sensor_data(client, sensor_type, location)
        time.sleep(interval)

def send_one_sensor_to_all_locations(client, sensor_type=None, interval=1):
    """发送一种传感器数据到所有位置"""
    if sensor_type is None:
        sensor_type = random.choice(SENSOR_TYPES)
    
    print(f"发送{sensor_type}传感器数据到所有位置")
    
    for location in LOCATIONS:
        if stop_continuous_publishing:
            break
        send_sensor_data(client, sensor_type, location)
        time.sleep(interval)

def continuous_data_sender(client, interval=10, mode="random"):
    """持续发送数据的线程函数"""
    global stop_continuous_publishing
    
    print(f"开始持续发送数据，模式: {mode}, 间隔: {interval}秒")
    print("按Ctrl+C停止发送")
    
    try:
        while not stop_continuous_publishing:
            if mode == "random":
                # 随机发送2-5条数据
                batch_size = random.randint(2, 5)
                send_random_data(client, batch_size, 1)
            elif mode == "all_sensors":
                # 轮流发送所有传感器数据到随机位置
                send_all_sensor_types(client)
            elif mode == "all_locations":
                # 轮流发送随机传感器数据到所有位置
                send_one_sensor_to_all_locations(client)
            elif mode == "all_actuators":
                # 轮流发送所有执行器数据到随机位置
                send_all_actuator_types(client)
            elif mode == "actuator_states":
                # 轮流发送随机执行器的所有状态
                actuator_type = random.choice(ACTUATOR_TYPES)
                location = random.choice(LOCATIONS)
                send_all_actuator_states(client, actuator_type, location)
            elif mode == "full_coverage":
                # 每种传感器在每个位置都发送一次
                for sensor_type in SENSOR_TYPES:
                    if stop_continuous_publishing:
                        break
                    for location in LOCATIONS:
                        if stop_continuous_publishing:
                            break
                        send_sensor_data(client, sensor_type, location)
                        time.sleep(1)
                        
                # 每种执行器在每个位置都发送一次
                for actuator_type in ACTUATOR_TYPES:
                    if stop_continuous_publishing:
                        break
                    for location in LOCATIONS:
                        if stop_continuous_publishing:
                            break
                        send_actuator_control(client, actuator_type, location)
                        time.sleep(1)
            
            # 大间隔，等待下一轮发送
            for _ in range(int(interval)):
                if stop_continuous_publishing:
                    break
                time.sleep(1)
                
    except Exception as e:
        print(f"持续发送数据时出错: {e}")

def signal_handler(sig, frame):
    """处理Ctrl+C信号"""
    global stop_continuous_publishing
    print("\n接收到中断信号，正在停止数据发送...")
    stop_continuous_publishing = True

def main():
    """主函数"""
    # 注册信号处理
    signal.signal(signal.SIGINT, signal_handler)
    
    parser = argparse.ArgumentParser(description="智能农场系统 - MQTT数据发送工具")
    
    # 添加参数
    parser.add_argument("--broker", default=DEFAULT_BROKER, help=f"MQTT服务器地址 (默认: {DEFAULT_BROKER})")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help=f"MQTT服务器端口 (默认: {DEFAULT_PORT})")
    parser.add_argument("--type", choices=["sensor", "actuator", "random", "continuous", 
                                          "all_sensors", "all_locations", "all_actuators", 
                                          "all_actuator_states", "full_coverage"], 
                        default="random", help="发送数据类型")
    parser.add_argument("--sensor-type", choices=SENSOR_TYPES, help="传感器类型")
    parser.add_argument("--actuator-type", choices=ACTUATOR_TYPES, help="执行器类型")
    parser.add_argument("--location", choices=LOCATIONS, help="位置")
    parser.add_argument("--state", help="执行器状态 (具体状态取决于执行器类型)")
    parser.add_argument("--count", type=int, default=5, help="发送数据条数 (默认: 5)")
    parser.add_argument("--interval", type=float, default=2, help="发送间隔秒数 (默认: 2)")
    parser.add_argument("--continuous-mode", choices=["random", "all_sensors", "all_locations", 
                                                     "all_actuators", "actuator_states", "full_coverage"], 
                       default="random", help="持续发送模式 (默认: random)")
    
    args = parser.parse_args()
    
    # 创建MQTT客户端
    client = mqtt.Client(CLIENT_ID)
    client.on_connect = on_connect
    client.on_publish = on_publish
    
    try:
        # 连接到MQTT服务器
        print(f"正在连接到MQTT服务器 {args.broker}:{args.port}...")
        client.connect(args.broker, args.port, 60)
        client.loop_start()
        
        time.sleep(1)  # 等待连接成功
        
        # 根据类型发送数据
        if args.type == "sensor":
            for i in range(args.count):
                send_sensor_data(client, args.sensor_type, args.location)
                if i < args.count - 1:
                    time.sleep(args.interval)
                    
        elif args.type == "actuator":
            for i in range(args.count):
                send_actuator_control(client, args.actuator_type, args.location, args.state)
                if i < args.count - 1:
                    time.sleep(args.interval)
                    
        elif args.type == "continuous":
            # 启动持续发送数据的线程
            sender_thread = threading.Thread(
                target=continuous_data_sender,
                args=(client, args.interval, args.continuous_mode)
            )
            sender_thread.daemon = True
            sender_thread.start()
            
            # 主线程等待，直到用户按Ctrl+C
            try:
                while sender_thread.is_alive():
                    sender_thread.join(1)
            except KeyboardInterrupt:
                global stop_continuous_publishing
                stop_continuous_publishing = True
                print("\n接收到中断信号，正在停止数据发送...")
                sender_thread.join()
                
        elif args.type == "all_sensors":
            send_all_sensor_types(client, args.location, args.interval)
            
        elif args.type == "all_locations":
            send_one_sensor_to_all_locations(client, args.sensor_type, args.interval)
            
        elif args.type == "all_actuators":
            send_all_actuator_types(client, args.location, args.interval)
            
        elif args.type == "all_actuator_states":
            send_all_actuator_states(client, args.actuator_type, args.location, args.interval)
            
        elif args.type == "full_coverage":
            print("全覆盖模式：为每个位置的每种传感器和执行器发送数据")
            
            # 发送传感器数据
            for sensor_type in SENSOR_TYPES:
                for location in LOCATIONS:
                    send_sensor_data(client, sensor_type, location)
                    time.sleep(args.interval)
                    
            # 发送执行器数据
            for actuator_type in ACTUATOR_TYPES:
                for location in LOCATIONS:
                    send_actuator_control(client, actuator_type, location)
                    time.sleep(args.interval)
            
        else:  # random
            send_random_data(client, args.count, args.interval)
            
    except KeyboardInterrupt:
        print("用户中断，正在退出...")
    except Exception as e:
        print(f"发生错误: {e}")
    finally:
        # 断开连接
        client.loop_stop()
        client.disconnect()
        print("已断开MQTT连接")

if __name__ == "__main__":
    main() 