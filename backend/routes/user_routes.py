from flask import Blueprint, request, jsonify, current_app
from models.db import db
from models.user import User, AlertSetting
from datetime import datetime
import logging
import jwt
from functools import wraps

user_bp = Blueprint('users', __name__)
logger = logging.getLogger(__name__)

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from headers
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                
        if not token:
            return jsonify({
                'success': False,
                'message': 'Token is missing'
            }), 401
            
        try:
            # Decode token
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.filter_by(id=data['user_id']).first()
            
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'Invalid token: User not found'
                }), 401
                
            if not current_user.is_active:
                return jsonify({
                    'success': False,
                    'message': 'User account is deactivated'
                }), 401
        except jwt.ExpiredSignatureError:
            return jsonify({
                'success': False,
                'message': 'Token has expired'
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                'success': False,
                'message': 'Invalid token'
            }), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

# Admin role check decorator
def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.role != 'admin':
            return jsonify({
                'success': False,
                'message': 'Admin privileges required'
            }), 403
        return f(current_user, *args, **kwargs)
    return decorated

@user_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400
                
        # Check if username already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({
                'success': False,
                'message': f'Username {data["username"]} is already taken'
            }), 409
            
        # Check if email already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({
                'success': False,
                'message': f'Email {data["email"]} is already registered'
            }), 409
            
        # Create new user
        new_user = User(
            username=data['username'],
            email=data['email'],
            role=data.get('role', 'user'),  # Default role is 'user'
            is_active=True
        )
        
        # Set password (hashes the password)
        new_user.set_password(data['password'])
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'data': new_user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error registering user: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to register user',
            'error': str(e)
        }), 500

@user_bp.route('/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['email', 'password']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400
                
        # Find user by email
        user = User.query.filter_by(email=data['email']).first()
        
        # Check if user exists and password is correct
        if not user or not user.check_password(data['password']):
            return jsonify({
                'success': False,
                'message': 'Invalid email or password'
            }), 401
            
        # Check if user is active
        if not user.is_active:
            return jsonify({
                'success': False,
                'message': 'User account is deactivated'
            }), 401
            
        # Update last login timestamp
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Generate JWT token
        token = jwt.encode(
            {
                'user_id': user.id,
                'exp': datetime.utcnow() + datetime.timedelta(hours=24)  # Token expires in 24 hours
            },
            current_app.config['SECRET_KEY'],
            algorithm='HS256'
        )
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'data': {
                'user': user.to_dict(),
                'token': token
            }
        }), 200
    except Exception as e:
        logger.error(f"Error logging in user: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to login',
            'error': str(e)
        }), 500

@user_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    """Get current user profile"""
    try:
        return jsonify({
            'success': True,
            'data': current_user.to_dict()
        }), 200
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to retrieve user profile',
            'error': str(e)
        }), 500

@user_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Update current user profile"""
    try:
        data = request.json
        
        # Update user attributes
        if 'username' in data:
            # Check if username is already taken by another user
            existing_user = User.query.filter_by(username=data['username']).first()
            if existing_user and existing_user.id != current_user.id:
                return jsonify({
                    'success': False,
                    'message': f'Username {data["username"]} is already taken'
                }), 409
            current_user.username = data['username']
            
        if 'email' in data:
            # Check if email is already registered by another user
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != current_user.id:
                return jsonify({
                    'success': False,
                    'message': f'Email {data["email"]} is already registered'
                }), 409
            current_user.email = data['email']
            
        if 'password' in data:
            current_user.set_password(data['password'])
            
        current_user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully',
            'data': current_user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating user profile: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to update user profile',
            'error': str(e)
        }), 500

@user_bp.route('/', methods=['GET'])
@token_required
@admin_required
def get_users(current_user):
    """Get all users (admin only)"""
    try:
        users = User.query.all()
        return jsonify({
            'success': True,
            'data': [user.to_dict() for user in users]
        }), 200
    except Exception as e:
        logger.error(f"Error getting users: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to retrieve users',
            'error': str(e)
        }), 500

@user_bp.route('/<int:user_id>', methods=['GET'])
@token_required
@admin_required
def get_user(current_user, user_id):
    """Get a specific user by ID (admin only)"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                'success': False,
                'message': f'User with ID {user_id} not found'
            }), 404
            
        return jsonify({
            'success': True,
            'data': user.to_dict()
        }), 200
    except Exception as e:
        logger.error(f"Error getting user {user_id}: {e}")
        return jsonify({
            'success': False,
            'message': f'Failed to retrieve user with ID {user_id}',
            'error': str(e)
        }), 500

@user_bp.route('/<int:user_id>', methods=['PUT'])
@token_required
@admin_required
def update_user(current_user, user_id):
    """Update a user (admin only)"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                'success': False,
                'message': f'User with ID {user_id} not found'
            }), 404
            
        data = request.json
        
        # Update user attributes
        if 'username' in data:
            # Check if username is already taken by another user
            existing_user = User.query.filter_by(username=data['username']).first()
            if existing_user and existing_user.id != user_id:
                return jsonify({
                    'success': False,
                    'message': f'Username {data["username"]} is already taken'
                }), 409
            user.username = data['username']
            
        if 'email' in data:
            # Check if email is already registered by another user
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user_id:
                return jsonify({
                    'success': False,
                    'message': f'Email {data["email"]} is already registered'
                }), 409
            user.email = data['email']
            
        if 'password' in data:
            user.set_password(data['password'])
            
        if 'role' in data:
            user.role = data['role']
            
        if 'is_active' in data:
            user.is_active = data['is_active']
            
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User updated successfully',
            'data': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating user {user_id}: {e}")
        return jsonify({
            'success': False,
            'message': f'Failed to update user with ID {user_id}',
            'error': str(e)
        }), 500

@user_bp.route('/<int:user_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_user(current_user, user_id):
    """Delete a user (admin only)"""
    try:
        # Prevent self-deletion
        if user_id == current_user.id:
            return jsonify({
                'success': False,
                'message': 'Cannot delete your own account'
            }), 400
            
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                'success': False,
                'message': f'User with ID {user_id} not found'
            }), 404
            
        # Delete the user
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'User with ID {user_id} deleted successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting user {user_id}: {e}")
        return jsonify({
            'success': False,
            'message': f'Failed to delete user with ID {user_id}',
            'error': str(e)
        }), 500

@user_bp.route('/alerts', methods=['GET'])
@token_required
def get_user_alerts(current_user):
    """Get alert settings for current user"""
    try:
        alerts = AlertSetting.query.filter_by(user_id=current_user.id).all()
        return jsonify({
            'success': True,
            'data': [alert.to_dict() for alert in alerts]
        }), 200
    except Exception as e:
        logger.error(f"Error getting alerts for user {current_user.id}: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to retrieve alert settings',
            'error': str(e)
        }), 500

@user_bp.route('/alerts', methods=['POST'])
@token_required
def create_alert(current_user):
    """Create a new alert setting for current user"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['sensor_type']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400
                
        # Create new alert setting
        new_alert = AlertSetting(
            user_id=current_user.id,
            sensor_type=data['sensor_type'],
            min_threshold=data.get('min_threshold'),
            max_threshold=data.get('max_threshold'),
            notify_email=data.get('notify_email', True),
            notify_sms=data.get('notify_sms', False),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(new_alert)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Alert setting created successfully',
            'data': new_alert.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating alert for user {current_user.id}: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to create alert setting',
            'error': str(e)
        }), 500

@user_bp.route('/alerts/<int:alert_id>', methods=['PUT'])
@token_required
def update_alert(current_user, alert_id):
    """Update an alert setting"""
    try:
        alert = AlertSetting.query.get(alert_id)
        if not alert:
            return jsonify({
                'success': False,
                'message': f'Alert setting with ID {alert_id} not found'
            }), 404
            
        # Ensure the alert belongs to the current user
        if alert.user_id != current_user.id:
            return jsonify({
                'success': False,
                'message': 'You do not have permission to update this alert setting'
            }), 403
            
        data = request.json
        
        # Update alert attributes
        if 'sensor_type' in data:
            alert.sensor_type = data['sensor_type']
        if 'min_threshold' in data:
            alert.min_threshold = data['min_threshold']
        if 'max_threshold' in data:
            alert.max_threshold = data['max_threshold']
        if 'notify_email' in data:
            alert.notify_email = data['notify_email']
        if 'notify_sms' in data:
            alert.notify_sms = data['notify_sms']
        if 'is_active' in data:
            alert.is_active = data['is_active']
            
        alert.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Alert setting updated successfully',
            'data': alert.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating alert {alert_id} for user {current_user.id}: {e}")
        return jsonify({
            'success': False,
            'message': f'Failed to update alert setting with ID {alert_id}',
            'error': str(e)
        }), 500

@user_bp.route('/alerts/<int:alert_id>', methods=['DELETE'])
@token_required
def delete_alert(current_user, alert_id):
    """Delete an alert setting"""
    try:
        alert = AlertSetting.query.get(alert_id)
        if not alert:
            return jsonify({
                'success': False,
                'message': f'Alert setting with ID {alert_id} not found'
            }), 404
            
        # Ensure the alert belongs to the current user
        if alert.user_id != current_user.id:
            return jsonify({
                'success': False,
                'message': 'You do not have permission to delete this alert setting'
            }), 403
            
        # Delete the alert
        db.session.delete(alert)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Alert setting with ID {alert_id} deleted successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting alert {alert_id} for user {current_user.id}: {e}")
        return jsonify({
            'success': False,
            'message': f'Failed to delete alert setting with ID {alert_id}',
            'error': str(e)
        }), 500 