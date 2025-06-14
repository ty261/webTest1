from datetime import datetime
from models.db import db
import json

# 定义执行器类型和允许的状态
ACTUATOR_TYPES = ["irrigation", "ventilation", "lighting", "heating", "cooling", "curtain", "nutrient", "water_pump"]

# 执行器扩展状态
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

class Actuator(db.Model):
    __tablename__ = 'actuators'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # irrigation, ventilation, lighting, etc.
    location = db.Column(db.String(100), nullable=False)
    mqtt_topic = db.Column(db.String(200), nullable=False, unique=True)
    is_active = db.Column(db.Boolean, default=True)
    status = db.Column(db.String(20), default='off')  # 改为小写: on, off, low, medium, high, auto等
    mode = db.Column(db.String(20), default='manual')  # manual, automatic
    parameters = db.Column(db.Text, default='{}')  # 存储JSON格式的参数
    auto_rules = db.Column(db.Text, default='{}')  # 存储JSON格式的自动控制规则
    last_control_time = db.Column(db.DateTime)  # 上次控制时间
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship with actuator logs
    logs = db.relationship('ActuatorLog', backref='actuator', lazy=True)
    
    def get_parameters(self):
        """获取参数字典"""
        if not self.parameters:
            return {}
        try:
            return json.loads(self.parameters)
        except:
            return {}
            
    def set_parameters(self, params):
        """设置参数字典"""
        if isinstance(params, dict):
            self.parameters = json.dumps(params)
            
    def get_auto_rules(self):
        """获取自动控制规则"""
        if not self.auto_rules:
            return {}
        try:
            return json.loads(self.auto_rules)
        except:
            return {}
            
    def set_auto_rules(self, rules):
        """设置自动控制规则"""
        if isinstance(rules, dict):
            self.auto_rules = json.dumps(rules)
    
    def to_dict(self):
        result = {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'location': self.location,
            'mqtt_topic': self.mqtt_topic,
            'is_active': self.is_active,
            'status': self.status,
            'mode': self.mode,
            'parameters': self.get_parameters(),
            'auto_rules': self.get_auto_rules(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if self.last_control_time:
            result['last_control_time'] = self.last_control_time.isoformat()
            
        return result
    
    @staticmethod
    def get_allowed_states(actuator_type):
        """获取执行器类型允许的状态列表"""
        return ACTUATOR_EXTENDED_STATES.get(actuator_type, ["on", "off"])

class ActuatorLog(db.Model):
    __tablename__ = 'actuator_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    actuator_id = db.Column(db.Integer, db.ForeignKey('actuators.id'), nullable=False)
    action = db.Column(db.String(50), nullable=False)  # 动作：on, off, low, medium, high等
    status = db.Column(db.String(20), nullable=False)  # SUCCESS, FAILED
    previous_state = db.Column(db.String(50))  # 操作前的状态
    parameters = db.Column(db.Text)  # 存储JSON格式的操作参数
    message = db.Column(db.String(255))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def get_parameters(self):
        """获取参数字典"""
        if not self.parameters:
            return {}
        try:
            return json.loads(self.parameters)
        except:
            return {}
    
    def to_dict(self):
        return {
            'id': self.id,
            'actuator_id': self.actuator_id,
            'action': self.action,
            'status': self.status,
            'previous_state': self.previous_state,
            'parameters': self.get_parameters(),
            'message': self.message,
            'timestamp': self.timestamp.isoformat()
        } 