import paho.mqtt.client as mqtt
import json
import os
from dotenv import load_dotenv
import logging
from flask_socketio import emit
import time
import threading
import random

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MQTTClient:
    def __init__(self):
        self.client = mqtt.Client(client_id=os.getenv('MQTT_CLIENT_ID'))
        self.broker = os.getenv('MQTT_BROKER', 'localhost')
        self.port = int(os.getenv('MQTT_PORT', '1883'))
        self.username = os.getenv('MQTT_USERNAME')
        self.password = os.getenv('MQTT_PASSWORD')
        self.connected = False
        self.socketio = None
        
        # 完全禁用模拟模式
        self.mock_mode = False  # 强制禁用模拟模式
        self.mock_thread = None
        self.mock_running = False
        
        # Set callbacks
        self.client.on_connect = self.on_connect
        self.client.on_disconnect = self.on_disconnect
        self.client.on_message = self.on_message
        
    def set_socketio(self, socketio):
        """Set the SocketIO instance to enable real-time data push to frontend"""
        self.socketio = socketio
        logger.info("SocketIO instance set for MQTT client")
        
    def connect(self):
        """Connect to the MQTT broker or start mock mode"""
        # 永远不使用模拟模式
        logger.info("Starting in REAL MQTT mode (mock mode disabled)")
            
        if self.username and self.password:
            self.client.username_pw_set(self.username, self.password)
            
        try:
            self.client.connect(self.broker, self.port, 60)
            self.client.loop_start()
            logger.info(f"Connecting to MQTT broker at {self.broker}:{self.port}")
        except Exception as e:
            logger.error(f"Failed to connect to MQTT broker: {e}")
            logger.info("Will retry connection automatically")
            
    def disconnect(self):
        """Disconnect from the MQTT broker or stop mock mode"""
        # 确保停止所有可能运行的模拟线程
        self.stop_mock_data()
            
        self.client.loop_stop()
        self.client.disconnect()
        logger.info("Disconnected from MQTT broker")
        
    def on_connect(self, client, userdata, flags, rc):
        """Callback when connected to the broker"""
        if rc == 0:
            self.connected = True
            logger.info("Connected to MQTT broker successfully")
            
            # Subscribe to default topics
            self.subscribe_to_topics([
                'farm/sensors/#',
                'farm/actuators/#'
            ])
        else:
            logger.error(f"Failed to connect to MQTT broker with code: {rc}")
            
    def on_disconnect(self, client, userdata, rc):
        """Callback when disconnected from the broker"""
        self.connected = False
        if rc != 0:
            logger.warning(f"Unexpected disconnection from MQTT broker: {rc}")
            # 不再自动切换到模拟模式，而是尝试重新连接
            logger.info("Attempting to reconnect to MQTT broker")
            try:
                self.client.reconnect()
            except Exception as e:
                logger.error(f"Failed to reconnect: {e}")
        else:
            logger.info("Disconnected from MQTT broker")
            
    def on_message(self, client, userdata, msg):
        """Callback when a message is received"""
        try:
            topic = msg.topic
            payload = json.loads(msg.payload.decode())
            logger.info(f"Received message on topic {topic}: {payload}")
            
            # Process message based on topic
            if topic.startswith('farm/sensors/'):
                self.process_sensor_data(topic, payload)
            elif topic.startswith('farm/actuators/'):
                self.process_actuator_data(topic, payload)
                
            # Push data to frontend through SocketIO
            if self.socketio:
                logger.info(f"Emitting real MQTT message to frontend: {topic}")
                self.socketio.emit('mqtt_message', {'topic': topic, 'payload': payload})
            else:
                logger.warning("No SocketIO instance available to emit message")
                
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON payload on topic {msg.topic}")
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            
    def subscribe_to_topics(self, topics):
        """Subscribe to a list of topics"""
        if not self.connected:
            logger.warning("Not connected to MQTT broker. Cannot subscribe.")
            return
            
        for topic in topics:
            self.client.subscribe(topic)
            logger.info(f"Subscribed to topic: {topic}")
            
    def publish(self, topic, payload):
        """Publish a message to a topic"""
        if not self.connected:
            logger.warning("Not connected to MQTT broker. Cannot publish.")
            return False
            
        try:
            # Convert payload to JSON string if it's a dict
            if isinstance(payload, dict):
                payload = json.dumps(payload)
                
            result = self.client.publish(topic, payload)
            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                logger.info(f"Published message to topic {topic}")
                return True
            else:
                logger.error(f"Failed to publish message to topic {topic}: {result.rc}")
                return False
        except Exception as e:
            logger.error(f"Error publishing message: {e}")
            return False
            
    def process_sensor_data(self, topic, payload):
        """Process sensor data and save to database"""
        # This function will be implemented with database operations
        # It will save sensor readings to the database
        pass
        
    def process_actuator_data(self, topic, payload):
        """Process actuator data and save to database"""
        # This function will be implemented with database operations
        # It will save actuator status changes to the database
        pass
        
    # 以下是模拟数据相关的方法
    
    def start_mock_data(self):
        """Start sending mock data in a background thread"""
        # 禁用模拟数据功能
        logger.info("Mock mode is disabled. Not starting mock data generation.")
        return
            
    def stop_mock_data(self):
        """Stop the mock data thread"""
        self.mock_running = False
        if self.mock_thread and self.mock_thread.is_alive():
            logger.info("Stopping mock data generation if running")
            self.mock_thread.join(timeout=1.0)
        
    def _generate_mock_data(self):
        """Generate mock sensor and actuator data"""
        # 该方法不会被调用，但为了安全起见，仍然保留但返回
        logger.info("Mock data generation disabled")
        return

# Create an instance of the MQTT client
mqtt_client = MQTTClient() 