from flask import Blueprint, request, jsonify
from models.db import db
from models.actuator import Actuator, ActuatorLog
from utils.mqtt_client import mqtt_client
from datetime import datetime, timedelta
import json
import logging

actuator_bp = Blueprint('actuators', __name__)
logger = logging.getLogger(__name__)

@actuator_bp.route('/', methods=['GET'])
def get_actuators():
    """Get all actuators"""
    try:
        actuators = Actuator.query.all()
        return jsonify({
            'success': True,
            'data': [actuator.to_dict() for actuator in actuators]
        }), 200
    except Exception as e:
        logger.error(f"Error getting actuators: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to retrieve actuators',
            'error': str(e)
        }), 500

@actuator_bp.route('/<int:actuator_id>', methods=['GET'])
def get_actuator(actuator_id):
    """Get a specific actuator by ID"""
    try:
        actuator = Actuator.query.get(actuator_id)
        if not actuator:
            return jsonify({
                'success': False,
                'message': f'Actuator with ID {actuator_id} not found'
            }), 404
            
        return jsonify({
            'success': True,
            'data': actuator.to_dict()
        }), 200
    except Exception as e:
        logger.error(f"Error getting actuator {actuator_id}: {e}")
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve actuator with ID {actuator_id}',
            'error': str(e)
        }), 500

@actuator_bp.route('/', methods=['POST'])
def create_actuator():
    """Create a new actuator"""
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
                
        # Check if an actuator with the same MQTT topic already exists
        existing_actuator = Actuator.query.filter_by(mqtt_topic=data['mqtt_topic']).first()
        if existing_actuator:
            return jsonify({
                'success': False,
                'message': f'An actuator with MQTT topic {data["mqtt_topic"]} already exists'
            }), 409
            
        # Create new actuator
        new_actuator = Actuator(
            name=data['name'],
            type=data['type'],
            location=data['location'],
            mqtt_topic=data['mqtt_topic'],
            is_active=data.get('is_active', True),
            status=data.get('status', 'OFF')
        )
        
        db.session.add(new_actuator)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Actuator created successfully',
            'data': new_actuator.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating actuator: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to create actuator',
            'error': str(e)
        }), 500

@actuator_bp.route('/<int:actuator_id>', methods=['PUT'])
def update_actuator(actuator_id):
    """Update an actuator"""
    try:
        actuator = Actuator.query.get(actuator_id)
        if not actuator:
            return jsonify({
                'success': False,
                'message': f'Actuator with ID {actuator_id} not found'
            }), 404
            
        data = request.json
        
        # Update actuator attributes
        if 'name' in data:
            actuator.name = data['name']
        if 'type' in data:
            actuator.type = data['type']
        if 'location' in data:
            actuator.location = data['location']
        if 'mqtt_topic' in data:
            # Check if the new MQTT topic is already in use by another actuator
            existing_actuator = Actuator.query.filter_by(mqtt_topic=data['mqtt_topic']).first()
            if existing_actuator and existing_actuator.id != actuator_id:
                return jsonify({
                    'success': False,
                    'message': f'An actuator with MQTT topic {data["mqtt_topic"]} already exists'
                }), 409
            actuator.mqtt_topic = data['mqtt_topic']
        if 'is_active' in data:
            actuator.is_active = data['is_active']
            
        actuator.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Actuator updated successfully',
            'data': actuator.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating actuator {actuator_id}: {e}")
        return jsonify({
            'success': False,
            'message': f'Failed to update actuator with ID {actuator_id}',
            'error': str(e)
        }), 500

@actuator_bp.route('/<int:actuator_id>', methods=['DELETE'])
def delete_actuator(actuator_id):
    """Delete an actuator"""
    try:
        actuator = Actuator.query.get(actuator_id)
        if not actuator:
            return jsonify({
                'success': False,
                'message': f'Actuator with ID {actuator_id} not found'
            }), 404
            
        # Delete the actuator
        db.session.delete(actuator)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Actuator with ID {actuator_id} deleted successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting actuator {actuator_id}: {e}")
        return jsonify({
            'success': False,
            'message': f'Failed to delete actuator with ID {actuator_id}',
            'error': str(e)
        }), 500

@actuator_bp.route('/<int:actuator_id>/control', methods=['POST'])
def control_actuator(actuator_id):
    """Control an actuator (turn ON/OFF)"""
    try:
        actuator = Actuator.query.get(actuator_id)
        if not actuator:
            return jsonify({
                'success': False,
                'message': f'Actuator with ID {actuator_id} not found'
            }), 404
            
        data = request.json
        
        # Validate required fields
        if 'action' not in data:
            return jsonify({
                'success': False,
                'message': 'Missing required field: action'
            }), 400
            
        action = data['action'].upper()
        if action not in ['ON', 'OFF']:
            return jsonify({
                'success': False,
                'message': 'Invalid action: action must be ON or OFF'
            }), 400
            
        # Check if actuator is active
        if not actuator.is_active:
            return jsonify({
                'success': False,
                'message': f'Actuator with ID {actuator_id} is not active'
            }), 400
            
        # Prepare MQTT payload
        payload = {
            'action': action,
            'timestamp': datetime.utcnow().isoformat(),
            'device_id': actuator_id
        }
        
        # Add any additional parameters from the request
        for key, value in data.items():
            if key not in ['action']:
                payload[key] = value
                
        # Publish command to MQTT topic
        result = mqtt_client.publish(actuator.mqtt_topic, json.dumps(payload))
        
        # Record actuator action in the database
        log = ActuatorLog(
            actuator_id=actuator_id,
            action=action,
            status='SUCCESS' if result else 'FAILED',
            message=f'Command {"sent" if result else "failed to send"} to MQTT broker'
        )
        
        # Update actuator status if MQTT publish was successful
        if result:
            actuator.status = action
            actuator.updated_at = datetime.utcnow()
            
        db.session.add(log)
        db.session.commit()
        
        return jsonify({
            'success': result,
            'message': f'Command {action} {"sent" if result else "failed to send"} to actuator',
            'data': {
                'actuator': actuator.to_dict(),
                'log': log.to_dict()
            }
        }), 200 if result else 500
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error controlling actuator {actuator_id}: {e}")
        return jsonify({
            'success': False,
            'message': f'Failed to control actuator with ID {actuator_id}',
            'error': str(e)
        }), 500

@actuator_bp.route('/<int:actuator_id>/logs', methods=['GET'])
def get_actuator_logs(actuator_id):
    """Get logs for a specific actuator"""
    try:
        actuator = Actuator.query.get(actuator_id)
        if not actuator:
            return jsonify({
                'success': False,
                'message': f'Actuator with ID {actuator_id} not found'
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
            
        # Query actuator logs
        logs = ActuatorLog.query.filter(
            ActuatorLog.actuator_id == actuator_id,
            ActuatorLog.timestamp >= start_time,
            ActuatorLog.timestamp <= end_time
        ).order_by(ActuatorLog.timestamp.desc()).offset(offset).limit(limit).all()
        
        # Get the total count of logs
        total_count = ActuatorLog.query.filter(
            ActuatorLog.actuator_id == actuator_id,
            ActuatorLog.timestamp >= start_time,
            ActuatorLog.timestamp <= end_time
        ).count()
        
        return jsonify({
            'success': True,
            'data': {
                'actuator': actuator.to_dict(),
                'logs': [log.to_dict() for log in logs],
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
        logger.error(f"Error getting logs for actuator {actuator_id}: {e}")
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve logs for actuator with ID {actuator_id}',
            'error': str(e)
        }), 500 