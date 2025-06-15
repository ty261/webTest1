Individual contribution to Prototype
Xu Han
 
I am Xu Han. When driving project progress, I took charge of organizing weekly team sync - ups. I drafted agendas upfront, clearly listing topics like database structure design discussions and task handoffs. During meetings, I actively took notes, capturing decisions on MySQL table constraints and action items for Flask - related assists. Post - meeting, I shared concise summaries, ensuring everyone stayed aligned on database - focused priorities and next steps.
Additionally, I led the compilation of in - depth project reports. I synthesized meeting records, development milestones, and emerging challenges into comprehensive documents, providing with clear overviews of database - related project advancements and areas needing attention.
Furthermore, I was responsible for weekly communication with the teacher in class regarding the project's improvement directions. Before each class, I would gather insights from team members, identify key areas for improvement, and organize relevant data and issues. During the class, I actively engaged in discussions with the teacher, presenting our current progress, bottlenecks, and proposed solutions. I listened carefully to the teacher's feedback and suggestions, and recorded them in detail. After the class, I promptly shared the teacher's guidance and the results of the discussion with the team, ensuring that everyone understood the new improvement directions and could adjust their work accordingly.

 
Xirui Wang
 
I am Xirui Wang. To boost team collaboration, I organized frontend - focused workshops. I planned agendas covering React.js architecture reviews and data visualization tool (Recharts/Chartjs) brainstorming. In these sessions, I documented key insights—like improving responsive design flows and visual interface enhancements. I then distributed these notes, helping the team sync on frontend development goals and task allocations for the agricultural monitoring platform.
Moreover, I took the lead in collating and finalizing weekly presentation slides. I aggregated information from various sources, including workshop outcomes, task progress updates, and upcoming plans, into visually appealing and informative PowerPoint presentations. These slides were used to effectively communicate frontend project status and achievements during weekly reviews.
I was also tasked with writing weekly feedback for other groups. I reviewed their work and presentations, analyzing strengths like innovative UI design or efficient coding, and identifying weaknesses such as poor communication or subpar data handling. I compiled constructive feedback, highlighting improvements while commending successes. After sharing feedback, I summarized insights on best practices and pitfalls, then shared these with our team to integrate others' strengths and avoid their weaknesses, enhancing our project quality.

 
Jiawei Gu
 
I am Jiawei Gu. For project coordination, I spearheaded security - themed team check - ins. I structured agendas around user authentication workflows and API security audits. During meetings, I meticulously recorded decisions on login verification processes and API key validation steps. Afterward, I circulated detailed notes, ensuring the team stayed on track with security - critical tasks and Flask framework - related frontend - backend collaborations.
 
Hanwen Liu
 
I am Hanwen Liu. To streamline communication, I organized API - routing team huddles. I crafted agendas focusing on React Router 6+ implementation and HTTP request handling strategies. In these meetings, I documented key choices—like route structure designs and Axios usage optimizations. I shared these notes promptly, keeping the team aligned on API - related development priorities and frontend - backend interaction plans.
 
Huabin Liu
 
I am Huabin Liu. For cross - module coordination, I led Material UI 5+ design syncs. I planned agendas covering component library integrations and real - time data communication (Socket.IO) alignments. During sessions, I captured decisions on UI component usage and front - end - server data flow tweaks. Post - meeting, I distributed notes, ensuring the team stayed coordinated on UI - focused tasks and real - time communication implementations.
 
Yu Tian
 
I am Yu Tian. To support project organization, I managed MQTT - related team collaborations. I structured agendas around sensor data simulation plans and IoT platform communication tests. In these meetings, I documented key steps—like Paho - MQTT script construction and auxiliary script writing tasks. I shared these notes, helping the team stay on track with MQTT - focused deliverables and overall project dependency management.

INDIVIDUAL CONTRIBUTION TO code
Xu Han's Contribution
 
I'm Xu Han. I took the lead in building the database for the Smart Farm System. Using the relational database MySQL, I structured data storage by defining table structures for modules like users, sensors, actuators, data logging, and alerts. I applied external check constraints to safeguard data integrity and consistency, and ensured the rationality of key data. Additionally, I assisted in leveraging Flask - SQLAlchemy for ORM database operations and supported the implementation of the real - time data push module with Flask - SocketIO at the backend.I also integrated the DeepSeek API for Q&A: studied docs, built request - response logic, verified answer accuracy, and delivered structured responses to the team, aiding in resolving doubts efficiently.

 
Xirui Wang's Contribution
 
I'm Xirui Wang. I adopted the JavaScript stack (React.js) to build a responsive web front - end architecture. Leading the development of the visual interface for the intelligent agricultural monitoring platform, I constructed a dynamic data visualization system using Recharts/Chartjs/ApexCharts. This system achieves real - time monitoring of environmental parameters such as temperature, humidity, and light, along with historical trend analysis. I also assisted in using Socket.IO Client to complete the real - time data communication module.
 
Jiawei Gu's Contribution
 
I'm Jiawei Gu. I built a lightweight Python web framework with Flask and assisted in related front - end design work. Primarily handling user authentication and permission management, I deployed and executed security - related functions like user login verification and API key validation, and inspected API keys to ensure project security. I also completed the writing of startup service code and global configuration initialization.
 
Hanwen Liu's Contribution
 
I'm Hanwen Liu. I was responsible for defining API routes. Using React Router 6+, I managed client - side routing by creating the routes folder and defining functions to handle situations when the front - end or other devices access the back - end service via HTTP requests. I also used Axios to solve HTTP request - related processing issues and employed Python - dotenv to manage environment variables, protecting the monitoring of this project's environment variables.
 
Huabin Liu's Contribution
 
I'm Huabin Liu. I built the application using the modern UI component library Material UI 5+. Based on front - end design, I used Socket.IO Client to achieve real - time, low - latency two - way data communication between the web browser and the server. I assisted in building the database section, collected relevant literature to organize datasets, checked the rationality of important database data, and created sensor data that accepts parameters like sensor type and location.
 
Yu Tian's Contribution
 
I'm Yu Tian. I used Paho - MQTT to simulate sensor data and communicate with the IoT platform. I completed script construction and took charge of the key part of MQTT client communication. I also wrote various auxiliary scripts, including database migration scripts and scheduled task scripts, organized functional codes, and documented project requirements, as well as summarized all the libraries the project relies on.




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