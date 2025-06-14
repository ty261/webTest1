# Smart Farm System

![Smart Farm System](https://img.shields.io/badge/Smart%20Farm-IOT%20Platform-brightgreen)

The Smart Farm System is an IoT-based agricultural monitoring and control platform designed for real-time monitoring and management of agricultural environmental parameters, improving production efficiency and automation levels.

## Features

- Real-time monitoring of temperature, humidity, soil moisture, and other environmental parameters
- Automatic control of irrigation, ventilation, lighting, and other systems
- Intelligent alarm system for timely notification of abnormal conditions
- Data analysis and visualization, supporting historical data queries and trend analysis
- User permission management with multi-role access

## System Architecture

- **Frontend**: Responsive web application built with React.js
- **Backend**: Flask API service
- **Database**: MySQL
- **Device Communication**: MQTT protocol

### Technology Stack Details

#### Frontend Technologies
- **React.js 18+**: JavaScript library for building user interfaces
- **Material UI 5+**: Modern UI component library
- **Recharts/Chart.js/ApexCharts**: Data visualization chart libraries
- **Socket.IO Client**: Real-time data communication
- **React Router 6+**: Client-side routing management
- **Axios**: HTTP request handling
- **JWT**: User authentication management

#### Backend Technologies
- **Flask 2.0+**: Lightweight Python web framework
- **Flask-SocketIO**: Real-time data push
- **Flask-SQLAlchemy**: ORM database operations
- **PyJWT**: User authentication
- **Paho-MQTT**: MQTT client communication
- **Python-dotenv**: Environment variable management

#### Database Design
- Uses MySQL relational database to store structured data
- Includes tables for users, sensors, actuators, data records, alerts, and more
- Uses foreign key constraints to ensure data integrity and consistency

## Requirements

- Python 3.6+
- Node.js 12+ and npm
- MySQL 5.7+
- Optional: MQTT broker (e.g., Mosquitto)

## Quick Start

### Method 1: Using Automated Scripts

We provide several automated scripts to simplify the startup process:

```bash
# Recommended: Improved start script
python improved_start.py

# Or: Complete project start script
python run_project.py

# Or: Quick start script
python quick_start.py
```

### Method 2: Manual Start

#### 1. Database Setup

1. Log in to MySQL:
   ```bash
   mysql -u root -p
   ```
   Enter your database password.

2. Manually execute database initialization:
   ```sql
   # Execute in MySQL command line:
   SOURCE /path/to/database/schema.sql;
   SOURCE /path/to/database/sample_data.sql;
   ```

   Or, merge these two files and execute.

3. Verify database creation success:
   ```sql
   SHOW DATABASES;
   USE smart_farm;
   SHOW TABLES;
   ```

#### 2. Backend Service Start

1. Enter the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

   Note: If installation times out, try the following methods:
   ```bash
   # Use China mirror source
   pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/

   # Or increase timeout
   pip install -r requirements.txt --timeout 100

   # Or install one by one
   pip install flask==2.0.1
   pip install flask-socketio==5.1.1
   pip install flask-cors==3.0.10
   pip install flask-sqlalchemy==2.5.1
   pip install paho-mqtt==1.6.1
   pip install python-dotenv==0.19.0
   pip install pymysql
   ```

3. Check and edit the `.env` file to ensure correct configuration:
   ```
   # Database configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password_here  # Please modify this to your actual MySQL password
   DB_NAME=smart_farm

   # MQTT configuration
   MQTT_BROKER=8.134.139.38
   MQTT_PORT=1883
   MQTT_CLIENT_ID=smart_farm_backend123
   MQTT_USERNAME=
   MQTT_PASSWORD=
   MQTT_MOCK_MODE=true

   # Application configuration
   FLASK_APP=app.py
   FLASK_ENV=development
   SECRET_KEY=smart_farm_secret_key
   ```

4. Start the backend service:
   ```bash
   python app.py
   ```

#### 3. Frontend Application Start

1. Open a new command line terminal and enter the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

   If installation times out, try the following method:
   ```bash
   # Use China mirror
   npm config set registry https://registry.npmmirror.com
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

4. The browser should automatically open http://localhost:3000, if not, please visit this address manually.

### 4. System Login

Use the following credentials to log in to the system:
- Admin: `admin@smartfarm.com` / `password123`
- General User: `user1@smartfarm.com` / `password123`
- Technician: `tech@smartfarm.com` / `password123`

## Detailed User Guide

### Dashboard

---

This README provides a comprehensive overview of the Smart Farm System, its features, architecture, and setup instructions. 