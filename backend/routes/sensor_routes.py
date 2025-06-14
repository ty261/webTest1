from flask import Blueprint, request, jsonify
from models.db import db
from models.sensor import Sensor, SensorReading
from datetime import datetime, timedelta
import logging

sensor_bp = Blueprint('sensors', __name__)
logger = logging.getLogger(__name__)

@sensor_bp.route('/', methods=['GET'])
def get_sensors():
    """Get all sensors"""
    try:
        sensors = Sensor.query.all()
        return jsonify({
            'success': True,
            'data': [sensor.to_dict() for sensor in sensors]
        }), 200
    except Exception as e:
        logger.error(f"Error getting sensors: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to retrieve sensors',
            'error': str(e)
        }), 500

@sensor_bp.route('/<int:sensor_id>', methods=['GET'])
def get_sensor(sensor_id):
    """Get a specific sensor by ID"""
    try:
        sensor = Sensor.query.get(sensor_id)
        if not sensor:
            return jsonify({
                'success': False,
                'message': f'Sensor with ID {sensor_id} not found'
            }), 404
            
        return jsonify({
            'success': True,
            'data': sensor.to_dict()
        }), 200
    except Exception as e:
        logger.error(f"Error getting sensor {sensor_id}: {e}")
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve sensor with ID {sensor_id}',
            'error': str(e)
        }), 500

@sensor_bp.route('/', methods=['POST'])
def create_sensor():
    """Create a new sensor"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['name', 'type', 'location', 'mqtt_topic']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400
                
        # Check if a sensor with the same MQTT topic already exists
        existing_sensor = Sensor.query.filter_by(mqtt_topic=data['mqtt_topic']).first()
        if existing_sensor:
            return jsonify({
                'success': False,
                'message': f'A sensor with MQTT topic {data["mqtt_topic"]} already exists'
            }), 409
            
        # Create new sensor
        new_sensor = Sensor(
            name=data['name'],
            type=data['type'],
            location=data['location'],
            mqtt_topic=data['mqtt_topic'],
            is_active=data.get('is_active', True)
        )
        
        db.session.add(new_sensor)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Sensor created successfully',
            'data': new_sensor.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating sensor: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to create sensor',
            'error': str(e)
        }), 500

@sensor_bp.route('/<int:sensor_id>', methods=['PUT'])
def update_sensor(sensor_id):
    """Update a sensor"""
    try:
        sensor = Sensor.query.get(sensor_id)
        if not sensor:
            return jsonify({
                'success': False,
                'message': f'Sensor with ID {sensor_id} not found'
            }), 404
            
        data = request.json
        
        # Update sensor attributes
        if 'name' in data:
            sensor.name = data['name']
        if 'type' in data:
            sensor.type = data['type']
        if 'location' in data:
            sensor.location = data['location']
        if 'mqtt_topic' in data:
            # Check if the new MQTT topic is already in use by another sensor
            existing_sensor = Sensor.query.filter_by(mqtt_topic=data['mqtt_topic']).first()
            if existing_sensor and existing_sensor.id != sensor_id:
                return jsonify({
                    'success': False,
                    'message': f'A sensor with MQTT topic {data["mqtt_topic"]} already exists'
                }), 409
            sensor.mqtt_topic = data['mqtt_topic']
        if 'is_active' in data:
            sensor.is_active = data['is_active']
            
        sensor.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Sensor updated successfully',
            'data': sensor.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating sensor {sensor_id}: {e}")
        return jsonify({
            'success': False,
            'message': f'Failed to update sensor with ID {sensor_id}',
            'error': str(e)
        }), 500

@sensor_bp.route('/<int:sensor_id>', methods=['DELETE'])
def delete_sensor(sensor_id):
    """Delete a sensor"""
    try:
        sensor = Sensor.query.get(sensor_id)
        if not sensor:
            return jsonify({
                'success': False,
                'message': f'Sensor with ID {sensor_id} not found'
            }), 404
            
        # Delete the sensor
        db.session.delete(sensor)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Sensor with ID {sensor_id} deleted successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting sensor {sensor_id}: {e}")
        return jsonify({
            'success': False,
            'message': f'Failed to delete sensor with ID {sensor_id}',
            'error': str(e)
        }), 500

@sensor_bp.route('/<int:sensor_id>/readings', methods=['GET'])
def get_sensor_readings(sensor_id):
    """Get readings for a specific sensor"""
    try:
        sensor = Sensor.query.get(sensor_id)
        if not sensor:
            return jsonify({
                'success': False,
                'message': f'Sensor with ID {sensor_id} not found'
            }), 404
            
        # Parse query parameters
        limit = request.args.get('limit', default=100, type=int)
        offset = request.args.get('offset', default=0, type=int)
        
        # Get time range from query parameters (default to last 24 hours)
        end_time = datetime.utcnow()
        start_time_str = request.args.get('start_time')
        end_time_str = request.args.get('end_time')
        
        if start_time_str:
            start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
        else:
            start_time = end_time - timedelta(hours=24)
            
        if end_time_str:
            end_time = datetime.fromisoformat(end_time_str.replace('Z', '+00:00'))
            
        # Query sensor readings
        readings = SensorReading.query.filter(
            SensorReading.sensor_id == sensor_id,
            SensorReading.timestamp >= start_time,
            SensorReading.timestamp <= end_time
        ).order_by(SensorReading.timestamp.desc()).offset(offset).limit(limit).all()
        
        # Get the total count of readings
        total_count = SensorReading.query.filter(
            SensorReading.sensor_id == sensor_id,
            SensorReading.timestamp >= start_time,
            SensorReading.timestamp <= end_time
        ).count()
        
        return jsonify({
            'success': True,
            'data': {
                'sensor': sensor.to_dict(),
                'readings': [reading.to_dict() for reading in readings],
                'pagination': {
                    'total': total_count,
                    'offset': offset,
                    'limit': limit
                },
                'time_range': {
                    'start_time': start_time.isoformat(),
                    'end_time': end_time.isoformat()
                }
            }
        }), 200
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': 'Invalid datetime format',
            'error': str(e)
        }), 400
    except Exception as e:
        logger.error(f"Error getting readings for sensor {sensor_id}: {e}")
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve readings for sensor with ID {sensor_id}',
            'error': str(e)
        }), 500

@sensor_bp.route('/<int:sensor_id>/readings', methods=['POST'])
def create_sensor_reading(sensor_id):
    """Create a new reading for a sensor"""
    try:
        sensor = Sensor.query.get(sensor_id)
        if not sensor:
            return jsonify({
                'success': False,
                'message': f'Sensor with ID {sensor_id} not found'
            }), 404
            
        data = request.json
        
        # Validate required fields
        required_fields = ['value', 'unit']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400
                
        # Create new sensor reading
        new_reading = SensorReading(
            sensor_id=sensor_id,
            value=data['value'],
            unit=data['unit'],
            timestamp=datetime.fromisoformat(data.get('timestamp', datetime.utcnow().isoformat()).replace('Z', '+00:00'))
        )
        
        db.session.add(new_reading)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Sensor reading created successfully',
            'data': new_reading.to_dict()
        }), 201
    except ValueError as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Invalid data format',
            'error': str(e)
        }), 400
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating reading for sensor {sensor_id}: {e}")
        return jsonify({
            'success': False,
            'message': f'Failed to create reading for sensor with ID {sensor_id}',
            'error': str(e)
        }), 500 