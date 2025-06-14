from flask import Blueprint, request, jsonify
from models.db import db
from models.sensor import Sensor, SensorReading
from models.actuator import Actuator, ActuatorLog
from datetime import datetime, timedelta
import logging
from sqlalchemy import func, desc
import pandas as pd
import numpy as np

dashboard_bp = Blueprint('dashboard', __name__)
logger = logging.getLogger(__name__)

@dashboard_bp.route('/summary', methods=['GET'])
def get_dashboard_summary():
    """Get summary data for dashboard"""
    try:
        # Get counts
        sensor_count = Sensor.query.count()
        active_sensor_count = Sensor.query.filter_by(is_active=True).count()
        actuator_count = Actuator.query.count()
        active_actuator_count = Actuator.query.filter_by(is_active=True).count()
        
        # Get latest readings for each sensor type
        latest_readings = {}
        sensor_types = db.session.query(Sensor.type).distinct().all()
        
        for sensor_type in sensor_types:
            sensor_type = sensor_type[0]
            # Get the latest sensor of this type
            sensor = Sensor.query.filter_by(type=sensor_type).order_by(desc(Sensor.id)).first()
            if sensor:
                # Get the latest reading for this sensor
                reading = SensorReading.query.filter_by(sensor_id=sensor.id).order_by(desc(SensorReading.timestamp)).first()
                if reading:
                    latest_readings[sensor_type] = {
                        'value': reading.value,
                        'unit': reading.unit,
                        'timestamp': reading.timestamp.isoformat(),
                        'sensor_name': sensor.name,
                        'sensor_location': sensor.location
                    }
        
        # Get actuator statuses
        actuator_statuses = {}
        actuator_types = db.session.query(Actuator.type).distinct().all()
        
        for actuator_type in actuator_types:
            actuator_type = actuator_type[0]
            actuators = Actuator.query.filter_by(type=actuator_type).all()
            actuator_statuses[actuator_type] = {
                'total': len(actuators),
                'on': sum(1 for a in actuators if a.status == 'ON'),
                'off': sum(1 for a in actuators if a.status == 'OFF'),
                'error': sum(1 for a in actuators if a.status == 'ERROR')
            }
        
        return jsonify({
            'success': True,
            'data': {
                'sensors': {
                    'total': sensor_count,
                    'active': active_sensor_count,
                    'latest_readings': latest_readings
                },
                'actuators': {
                    'total': actuator_count,
                    'active': active_actuator_count,
                    'statuses': actuator_statuses
                },
                'timestamp': datetime.utcnow().isoformat()
            }
        }), 200
    except Exception as e:
        logger.error(f"Error getting dashboard summary: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to retrieve dashboard summary',
            'error': str(e)
        }), 500

@dashboard_bp.route('/sensors/stats', methods=['GET'])
def get_sensor_stats():
    """Get statistical data for sensors"""
    try:
        # Parse query parameters
        sensor_type = request.args.get('type')
        period = request.args.get('period', default='day')  # day, week, month
        
        # Set time range based on period
        end_time = datetime.utcnow()
        if period == 'day':
            start_time = end_time - timedelta(days=1)
            interval = 'hour'
        elif period == 'week':
            start_time = end_time - timedelta(days=7)
            interval = 'day'
        elif period == 'month':
            start_time = end_time - timedelta(days=30)
            interval = 'day'
        else:
            return jsonify({
                'success': False,
                'message': 'Invalid period parameter. Must be one of: day, week, month'
            }), 400
        
        # Build query filters
        filters = [
            SensorReading.timestamp >= start_time,
            SensorReading.timestamp <= end_time
        ]
        
        # Add sensor type filter if specified
        if sensor_type:
            sensors = Sensor.query.filter_by(type=sensor_type).all()
            sensor_ids = [sensor.id for sensor in sensors]
            if not sensor_ids:
                return jsonify({
                    'success': False,
                    'message': f'No sensors found with type: {sensor_type}'
                }), 404
            filters.append(SensorReading.sensor_id.in_(sensor_ids))
        
        # Query all relevant readings
        readings = SensorReading.query.join(Sensor).filter(*filters).all()
        
        if not readings:
            return jsonify({
                'success': False,
                'message': 'No sensor readings found for the specified period and type'
            }), 404
        
        # Convert to DataFrame for easier analysis
        df = pd.DataFrame([{
            'value': r.value,
            'timestamp': r.timestamp,
            'sensor_id': r.sensor_id,
            'sensor_type': r.sensor.type,
            'unit': r.unit
        } for r in readings])
        
        # Group by sensor type and get stats
        stats = {}
        for s_type, group in df.groupby('sensor_type'):
            stats[s_type] = {
                'min': float(group['value'].min()),
                'max': float(group['value'].max()),
                'avg': float(group['value'].mean()),
                'std': float(group['value'].std()),
                'unit': group['unit'].iloc[0],
                'count': len(group)
            }
        
        # Generate time series data for charts
        time_series = {}
        for s_type, group in df.groupby('sensor_type'):
            # Set timestamp as index
            group = group.set_index('timestamp')
            
            # Resample based on interval
            if interval == 'hour':
                resampled = group.resample('1H').mean()
            else:  # day
                resampled = group.resample('1D').mean()
            
            # Format for chart
            time_series[s_type] = {
                'timestamps': [ts.isoformat() for ts in resampled.index],
                'values': [float(v) if not np.isnan(v) else None for v in resampled['value']],
                'unit': group['unit'].iloc[0]
            }
        
        return jsonify({
            'success': True,
            'data': {
                'stats': stats,
                'time_series': time_series,
                'period': period,
                'start_time': start_time.isoformat(),
                'end_time': end_time.isoformat()
            }
        }), 200
    except Exception as e:
        logger.error(f"Error getting sensor stats: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to retrieve sensor statistics',
            'error': str(e)
        }), 500

@dashboard_bp.route('/actuators/stats', methods=['GET'])
def get_actuator_stats():
    """Get statistical data for actuators"""
    try:
        # Parse query parameters
        actuator_type = request.args.get('type')
        period = request.args.get('period', default='day')  # day, week, month
        
        # Set time range based on period
        end_time = datetime.utcnow()
        if period == 'day':
            start_time = end_time - timedelta(days=1)
        elif period == 'week':
            start_time = end_time - timedelta(days=7)
        elif period == 'month':
            start_time = end_time - timedelta(days=30)
        else:
            return jsonify({
                'success': False,
                'message': 'Invalid period parameter. Must be one of: day, week, month'
            }), 400
        
        # Build query filters
        filters = [
            ActuatorLog.timestamp >= start_time,
            ActuatorLog.timestamp <= end_time
        ]
        
        # Add actuator type filter if specified
        if actuator_type:
            actuators = Actuator.query.filter_by(type=actuator_type).all()
            actuator_ids = [actuator.id for actuator in actuators]
            if not actuator_ids:
                return jsonify({
                    'success': False,
                    'message': f'No actuators found with type: {actuator_type}'
                }), 404
            filters.append(ActuatorLog.actuator_id.in_(actuator_ids))
        
        # Query all relevant logs
        logs = ActuatorLog.query.join(Actuator).filter(*filters).all()
        
        if not logs:
            return jsonify({
                'success': False,
                'message': 'No actuator logs found for the specified period and type'
            }), 404
        
        # Convert to DataFrame for easier analysis
        df = pd.DataFrame([{
            'action': l.action,
            'status': l.status,
            'timestamp': l.timestamp,
            'actuator_id': l.actuator_id,
            'actuator_type': l.actuator.type
        } for l in logs])
        
        # Group by actuator type and get stats
        stats = {}
        for a_type, group in df.groupby('actuator_type'):
            success_count = len(group[group['status'] == 'SUCCESS'])
            failed_count = len(group[group['status'] == 'FAILED'])
            on_count = len(group[(group['action'] == 'ON') & (group['status'] == 'SUCCESS')])
            off_count = len(group[(group['action'] == 'OFF') & (group['status'] == 'SUCCESS')])
            
            stats[a_type] = {
                'total_actions': len(group),
                'success_count': success_count,
                'failed_count': failed_count,
                'success_rate': (success_count / len(group)) * 100 if len(group) > 0 else 0,
                'on_count': on_count,
                'off_count': off_count
            }
        
        # Get current status of all actuators by type
        current_status = {}
        actuator_types = db.session.query(Actuator.type).distinct().all()
        
        for a_type in actuator_types:
            a_type = a_type[0]
            actuators = Actuator.query.filter_by(type=a_type).all()
            current_status[a_type] = {
                'total': len(actuators),
                'on': sum(1 for a in actuators if a.status == 'ON'),
                'off': sum(1 for a in actuators if a.status == 'OFF'),
                'error': sum(1 for a in actuators if a.status == 'ERROR')
            }
        
        return jsonify({
            'success': True,
            'data': {
                'stats': stats,
                'current_status': current_status,
                'period': period,
                'start_time': start_time.isoformat(),
                'end_time': end_time.isoformat()
            }
        }), 200
    except Exception as e:
        logger.error(f"Error getting actuator stats: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to retrieve actuator statistics',
            'error': str(e)
        }), 500

@dashboard_bp.route('/alerts', methods=['GET'])
def get_alert_stats():
    """Get statistics about alerts (triggered thresholds)"""
    try:
        # Parse query parameters
        period = request.args.get('period', default='day')  # day, week, month
        
        # Set time range based on period
        end_time = datetime.utcnow()
        if period == 'day':
            start_time = end_time - timedelta(days=1)
        elif period == 'week':
            start_time = end_time - timedelta(days=7)
        elif period == 'month':
            start_time = end_time - timedelta(days=30)
        else:
            return jsonify({
                'success': False,
                'message': 'Invalid period parameter. Must be one of: day, week, month'
            }), 400
        
        # This is a more complex query that would check sensor readings against alert thresholds
        # For now, let's return a placeholder response
        
        # In a real implementation, you would:
        # 1. Get all alert settings
        # 2. For each alert setting, check if any sensor readings within the time period exceeded thresholds
        # 3. Count and categorize these alert events
        
        return jsonify({
            'success': True,
            'data': {
                'message': 'Alert statistics feature is under development',
                'period': period,
                'start_time': start_time.isoformat(),
                'end_time': end_time.isoformat()
            }
        }), 200
    except Exception as e:
        logger.error(f"Error getting alert stats: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to retrieve alert statistics',
            'error': str(e)
        }), 500 