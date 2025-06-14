from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from dotenv import load_dotenv
import os

# Import database
from models.db import db, init_db

# Import routes
from routes.sensor_routes import sensor_bp
from routes.actuator_routes import actuator_bp
from routes.user_routes import user_bp
from routes.dashboard_routes import dashboard_bp

# Import MQTT client
from utils.mqtt_client import mqtt_client

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
init_db(app)

# Initialize CORS
CORS(app)

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="*")

# Set socketio instance for MQTT client
mqtt_client.set_socketio(socketio)

# Register blueprints
app.register_blueprint(sensor_bp, url_prefix='/api/sensors')
app.register_blueprint(actuator_bp, url_prefix='/api/actuators')
app.register_blueprint(user_bp, url_prefix='/api/users')
app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')

# Default route
@app.route('/')
def index():
    return jsonify({"message": "Welcome to Smart Farm API"})

# 替换 @app.before_first_request 
# 该装饰器在 Flask 2.2.0+ 已被弃用
def start_mqtt_client():
    mqtt_client.connect()

# 在应用启动时连接MQTT
with app.app_context():
    start_mqtt_client()

# Disconnect from MQTT broker when app stops
@app.teardown_appcontext
def shutdown_mqtt_client(exception=None):
    mqtt_client.disconnect()

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True) 