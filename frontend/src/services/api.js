import { API_URL, TOKEN_KEY } from '../config';

// Client-side mock database for actuators
const mockActuatorDatabase = {
  actuators: [
    {
      id: 1,
      name: 'Greenhouse 1 Irrigation System',
      type: 'irrigation',
      location: 'Greenhouse 1',
      status: 'off',
      mode: 'manual',
      is_active: true,
      mqtt_topic: 'farm/actuators/irrigation/1',
      created_at: '2023-10-01T08:00:00Z',
      updated_at: '2023-11-15T10:30:00Z',
      last_control_time: '2023-11-14T14:20:00Z',
      description: 'Main irrigation system for Greenhouse 1',
      parameters: {
        water_flow: 2.5,
        duration: 30,
        schedule: 'daily',
        auto_threshold: 30
      }
    },
    {
      id: 2,
      name: 'Greenhouse 2 Ventilation Fan',
      type: 'fan',
      location: 'Greenhouse 2',
      status: 'low',
      mode: 'auto',
      is_active: true,
      mqtt_topic: 'farm/actuators/fan/2',
      created_at: '2023-10-01T08:00:00Z',
      updated_at: '2023-11-15T10:30:00Z',
      description: 'Main ventilation fan for Greenhouse 2',
      parameters: {
        speed: 2,
        max_speed: 5,
        direction: 'forward',
        auto_trigger_temp: 28
      }
    },
    {
      id: 3,
      name: 'Greenhouse 1 Lighting System',
      type: 'lighting',
      location: 'Greenhouse 1',
      status: 'on',
      mode: 'auto',
      is_active: true,
      mqtt_topic: 'farm/actuators/lighting/1',
      created_at: '2023-10-01T08:00:00Z',
      updated_at: '2023-11-15T10:30:00Z',
      description: 'Main lighting system for Greenhouse 1',
      parameters: {
        brightness: 80,
        color_temp: 4000,
        schedule_on: '06:00',
        schedule_off: '20:00'
      }
    },
    {
      id: 4,
      name: 'Greenhouse 3 Humidifier',
      type: 'humidifier',
      location: 'Greenhouse 3',
      status: 'off',
      mode: 'manual',
      is_active: false,
      mqtt_topic: 'farm/actuators/humidifier/1',
      created_at: '2023-10-01T08:00:00Z',
      updated_at: '2023-11-15T10:30:00Z',
      description: 'Main humidifier for Greenhouse 3',
      parameters: {
        capacity: 5,
        auto_trigger_humidity: 40,
        auto_stop_humidity: 60
      }
    }
  ],
  logs: []
};

// Client-side mock database for sensors
const mockSensorDatabase = {
  sensors: [
    {
      id: 1,
      name: 'Temperature Sensor 1',
      type: 'temperature',
      location: 'Greenhouse 1',
      status: 'active',
      is_active: true,
      mqtt_topic: 'farm/sensors/temperature/1',
      created_at: '2023-10-01T08:00:00Z',
      updated_at: '2023-11-15T10:30:00Z',
      model: 'DHT22',
      manufacturer: 'Acme Sensors',
      calibration_date: '2023-09-15T00:00:00Z',
      last_reading: {
        value: 24.5,
        unit: '°C',
        timestamp: new Date().toISOString()
      }
    },
    {
      id: 2,
      name: 'Humidity Sensor 1',
      type: 'humidity',
      location: 'Greenhouse 1',
      status: 'active',
      is_active: true,
      mqtt_topic: 'farm/sensors/humidity/1',
      created_at: '2023-10-01T08:00:00Z',
      updated_at: '2023-11-15T10:30:00Z',
      model: 'DHT22',
      manufacturer: 'Acme Sensors',
      calibration_date: '2023-09-15T00:00:00Z',
      last_reading: {
        value: 65,
        unit: '%',
        timestamp: new Date().toISOString()
      }
    },
    {
      id: 3,
      name: 'Light Sensor 1',
      type: 'light',
      location: 'Greenhouse 2',
      status: 'active',
      is_active: true,
      mqtt_topic: 'farm/sensors/light/1',
      created_at: '2023-10-01T08:00:00Z',
      updated_at: '2023-11-15T10:30:00Z',
      model: 'BH1750',
      manufacturer: 'Acme Sensors',
      calibration_date: '2023-09-15T00:00:00Z',
      last_reading: {
        value: 3500,
        unit: 'lux',
        timestamp: new Date().toISOString()
      }
    },
    {
      id: 4,
      name: 'Soil Moisture Sensor 1',
      type: 'soil_moisture',
      location: 'Greenhouse 1',
      status: 'inactive',
      is_active: false,
      mqtt_topic: 'farm/sensors/soil_moisture/1',
      created_at: '2023-10-01T08:00:00Z',
      updated_at: '2023-11-15T10:30:00Z',
      model: 'YL-69',
      manufacturer: 'Acme Sensors',
      calibration_date: '2023-09-15T00:00:00Z',
      last_reading: {
        value: 42,
        unit: '%',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    }
  ]
};

// Helper function to update actuator in mock database
const updateActuatorInDatabase = (id, updates) => {
  const index = mockActuatorDatabase.actuators.findIndex(a => a.id === parseInt(id));
  if (index !== -1) {
    const updatedActuator = {
      ...mockActuatorDatabase.actuators[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    mockActuatorDatabase.actuators[index] = updatedActuator;
    console.log(`执行器 ${id} 已更新:`, updatedActuator);
    return updatedActuator;
  }
  return null;
};

// Helper function to add a log to the mock database
const addLogToDatabase = (actuatorId, status, message, source = 'web', user = 'admin', previous_state = null, parameters = {}) => {
  const newLog = {
    id: mockActuatorDatabase.logs.length + 1,
    actuator_id: parseInt(actuatorId),
    timestamp: new Date().toISOString(),
    status,
    message,
    user,
    source,
    previous_state,
    parameters
  };
  mockActuatorDatabase.logs.unshift(newLog); // Add to beginning of array
  console.log(`Actuator ${actuatorId} log added:`, newLog);
  return newLog;
};

// Create common API call method
const apiCall = async (endpoint, method = 'GET', data = null) => {
  // 确保endpoint以/开头，并且以/结尾，避免308重定向问题
  let normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  normalizedEndpoint = normalizedEndpoint.endsWith('/') ? normalizedEndpoint : `${normalizedEndpoint}/`;
  
  const url = `${API_URL}${normalizedEndpoint}`;
  
  console.log(`Calling API: ${url}`); // Debug log
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    // Follow redirects
    redirect: 'follow'
  };

  // Add authorization token
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  // Add request body data
  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    // Use real API instead of mock response
    const response = await fetch(url, options);
    
    // Check for redirects
    if (response.redirected) {
      console.log(`API redirected: ${response.url}`);
    }
    
    const result = await response.json();
    
    console.log(`API response: ${normalizedEndpoint}`, result);  // Debug log
    
    // Return backend response directly
    return result;
  } catch (error) {
    console.error('API call error:', error);
    
    // Use mock response as a fallback when API is unavailable
    console.log('Using mock data as fallback');
    if (endpoint.includes('/users/register') && method === 'POST') {
      // Simulate registration response
      return mockRegisterResponse(data);
    } else if (endpoint.includes('/users/login') && method === 'POST') {
      // Simulate login response
      return mockLoginResponse(data);
    } else {
      // For other endpoints, return a generic success response
      return {
        success: true,
        message: 'Operation completed using mock data',
        data: null
      };
    }
  }
};

// Mock registration response
const mockRegisterResponse = (userData) => {
  // Check if username or email already exists in localStorage
  const registeredUsers = JSON.parse(localStorage.getItem('smart_farm_registered_users') || '[]');
  
  if (registeredUsers.some(u => u.username === userData.username)) {
    return {
      success: false,
      message: `Username ${userData.username} is already taken`
    };
  }
  
  if (registeredUsers.some(u => u.email === userData.email)) {
    return {
      success: false, 
      message: `Email ${userData.email} is already registered`
    };
  }
  
  // Create new user
  const newUser = {
    ...userData,
    id: Date.now(),
    role: 'user',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Save to localStorage
  registeredUsers.push(newUser);
  localStorage.setItem('smart_farm_registered_users', JSON.stringify(registeredUsers));
  
  return {
    success: true,
    message: 'User registered successfully (using mock data)',
    data: newUser
  };
};

// Mock login response
const mockLoginResponse = (credentials) => {
  const registeredUsers = JSON.parse(localStorage.getItem('smart_farm_registered_users') || '[]');
  const user = registeredUsers.find(u => u.email === credentials.email);
  
  if (user && user.password === credentials.password) {
    const { password, ...userWithoutPassword } = user;
    return {
      success: true,
      message: 'Login successful (using mock data)',
      data: {
        user: userWithoutPassword,
        token: 'mock-token-' + Math.random().toString(36).substring(2)
      }
    };
  }
  
  return {
    success: false,
    message: 'Invalid email or password'
  };
};

// Mock API response - Keep for reference but not used
const mockApiResponse = (endpoint, method, data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return mock data based on different endpoints
      if (endpoint.startsWith('/dashboard') && method === 'GET') {
        resolve({
          data: {
            success: true,
            data: {
              sensors: {
                total: 12,
                active: 10,
                latest_readings: {
                  temperature: {
                    value: 24.5,
                    unit: '°C',
                    sensor_location: 'Greenhouse 1',
                    timestamp: new Date().toISOString()
                  },
                  humidity: {
                    value: 65,
                    unit: '%',
                    sensor_location: 'Greenhouse 1',
                    timestamp: new Date().toISOString()
                  },
                  light: {
                    value: 3500,
                    unit: 'lux',
                    sensor_location: 'Greenhouse 2',
                    timestamp: new Date().toISOString()
                  },
                  soil_moisture: {
                    value: 42,
                    unit: '%',
                    sensor_location: 'Greenhouse 1',
                    timestamp: new Date().toISOString()
                  }
                }
              },
              actuators: {
                total: 8,
                active: 6,
                statuses: {
                  irrigation: { on: 1, off: 2, error: 0 },
                  ventilation: { on: 2, off: 1, error: 0 },
                  lighting: { on: 1, off: 1, error: 0 },
                  heating: { on: 0, off: 1, error: 0 }
                }
              },
              alerts: {
                total: 5,
                unread: 2,
                recent: [
                  {
                    id: 1,
                    type: 'temperature',
                    message: 'Greenhouse 1 temperature above threshold (30°C)',
                    created_at: new Date(Date.now() - 10 * 60000).toISOString(),
                    is_read: false
                  },
                  {
                    id: 2,
                    type: 'actuator',
                    message: 'Greenhouse 2 irrigation system started',
                    created_at: new Date(Date.now() - 30 * 60000).toISOString(),
                    is_read: true
                  }
                ]
              }
            }
          }
        });
      } 
      // Mock get all actuators
      else if (endpoint === '/actuators' && method === 'GET') {
        resolve({
          data: {
            success: true,
            data: [
              {
                id: 1,
                name: 'Greenhouse 1 Irrigation System',
                type: 'irrigation',
                location: 'Greenhouse 1',
                status: 'off',
                mode: 'manual',
                is_active: true,
                mqtt_topic: 'farm/actuators/irrigation/1',
                created_at: '2023-10-01T08:00:00Z',
                updated_at: '2023-11-15T10:30:00Z',
                last_control_time: '2023-11-14T14:20:00Z'
              },
              {
                id: 2,
                name: 'Greenhouse 2 Ventilation Fan',
                type: 'fan',
                location: 'Greenhouse 2',
                status: 'low',
                mode: 'auto',
                is_active: true,
                mqtt_topic: 'farm/actuators/fan/2',
                created_at: '2023-10-01T08:00:00Z',
                updated_at: '2023-11-15T10:30:00Z',
                parameters: {
                  speed: 2,
                  max_speed: 5,
                  direction: 'forward'
                }
              },
              {
                id: 3,
                name: 'Greenhouse 1 Lighting System',
                type: 'lighting',
                location: 'Greenhouse 1',
                status: 'on',
                mode: 'auto',
                is_active: true,
                mqtt_topic: 'farm/actuators/lighting/1',
                created_at: '2023-10-01T08:00:00Z',
                updated_at: '2023-11-15T10:30:00Z',
                parameters: {
                  brightness: 80,
                  color_temp: 4000
                }
              },
              {
                id: 4,
                name: 'Greenhouse 3 Humidifier',
                type: 'humidifier',
                location: 'Greenhouse 3',
                status: 'off',
                mode: 'manual',
                is_active: false,
                mqtt_topic: 'farm/actuators/humidifier/1',
                created_at: '2023-10-01T08:00:00Z',
                updated_at: '2023-11-15T10:30:00Z'
              }
            ]
          }
        });
      }
      // Mock get all sensors
      else if (endpoint === '/sensors' && method === 'GET') {
        resolve({
          data: {
            success: true,
            data: [
              {
                id: 1,
                name: 'Temperature Sensor 1',
                type: 'temperature',
                location: 'Greenhouse 1',
                status: 'active',
                last_reading: {
                  value: 24.5,
                  unit: '°C',
                  timestamp: new Date().toISOString()
                }
              },
              {
                id: 2,
                name: 'Humidity Sensor 1',
                type: 'humidity',
                location: 'Greenhouse 1',
                status: 'active',
                last_reading: {
                  value: 65,
                  unit: '%',
                  timestamp: new Date().toISOString()
                }
              },
              {
                id: 3,
                name: 'Light Sensor 1',
                type: 'light',
                location: 'Greenhouse 2',
                status: 'active',
                last_reading: {
                  value: 3500,
                  unit: 'lux',
                  timestamp: new Date().toISOString()
                }
              },
              {
                id: 4,
                name: 'Soil Moisture Sensor 1',
                type: 'soil_moisture',
                location: 'Greenhouse 1',
                status: 'inactive',
                last_reading: {
                  value: 42,
                  unit: '%',
                  timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                }
              }
            ]
          }
        });
      }
      // Mock get single sensor
      else if (endpoint.match(/\/sensors\/\d+$/) && method === 'GET') {
        const id = parseInt(endpoint.split('/').pop());
        let sensor = {};

        switch(id) {
          case 1:
            sensor = {
              id: 1,
              name: 'Temperature Sensor 1',
              type: 'temperature',
              location: 'Greenhouse 1',
              status: 'active',
              description: 'Primary temperature sensor for monitoring greenhouse conditions.',
              mqtt_topic: 'farm/sensors/temperature/1',
              created_at: '2023-10-01T08:00:00Z',
              updated_at: '2023-11-15T10:30:00Z',
              model: 'DHT22',
              manufacturer: 'Acme Sensors',
              calibration_date: '2023-09-15T00:00:00Z',
              last_reading: {
                value: 24.5,
                unit: '°C',
                timestamp: new Date().toISOString()
              },
              history: [
                { timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), value: 24.5 },
                { timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), value: 25.1 },
                { timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), value: 25.4 },
                { timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), value: 25.8 },
                { timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), value: 26.2 },
                { timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), value: 26.5 }
              ]
            };
            break;
          case 2:
            sensor = {
              id: 2,
              name: 'Humidity Sensor 1',
              type: 'humidity',
              location: 'Greenhouse 1',
              status: 'active',
              description: 'Primary humidity sensor for monitoring greenhouse conditions.',
              mqtt_topic: 'farm/sensors/humidity/1',
              created_at: '2023-10-01T08:00:00Z',
              updated_at: '2023-11-15T10:30:00Z',
              model: 'DHT22',
              manufacturer: 'Acme Sensors',
              calibration_date: '2023-09-15T00:00:00Z',
              last_reading: {
                value: 65,
                unit: '%',
                timestamp: new Date().toISOString()
              },
              history: [
                { timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), value: 65 },
                { timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), value: 64 },
                { timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), value: 63 },
                { timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), value: 62 },
                { timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), value: 60 },
                { timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), value: 59 }
              ]
            };
            break;
          case 3:
            sensor = {
              id: 3,
              name: 'Light Sensor 1',
              type: 'light',
              location: 'Greenhouse 2',
              status: 'active',
              description: 'Light sensor for monitoring lighting conditions.',
              mqtt_topic: 'farm/sensors/light/1',
              created_at: '2023-10-01T08:00:00Z',
              updated_at: '2023-11-15T10:30:00Z',
              model: 'BH1750',
              manufacturer: 'Acme Sensors',
              calibration_date: '2023-09-15T00:00:00Z',
              last_reading: {
                value: 3500,
                unit: 'lux',
                timestamp: new Date().toISOString()
              },
              history: [
                { timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), value: 3500 },
                { timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), value: 3200 },
                { timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), value: 2900 },
                { timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), value: 2500 },
                { timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), value: 2000 },
                { timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), value: 1500 }
              ]
            };
            break;
          case 4:
            sensor = {
              id: 4,
              name: 'Soil Moisture Sensor 1',
              type: 'soil_moisture',
              location: 'Greenhouse 1',
              status: 'inactive',
              description: 'Soil moisture sensor for monitoring soil conditions.',
              mqtt_topic: 'farm/sensors/soil_moisture/1',
              created_at: '2023-10-01T08:00:00Z',
              updated_at: '2023-11-15T10:30:00Z',
              model: 'YL-69',
              manufacturer: 'Acme Sensors',
              calibration_date: '2023-09-15T00:00:00Z',
              last_reading: {
                value: 42,
                unit: '%',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
              },
              history: [
                { timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), value: 42 },
                { timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), value: 43 },
                { timestamp: new Date(Date.now() - 27 * 60 * 60 * 1000).toISOString(), value: 44 },
                { timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(), value: 45 },
                { timestamp: new Date(Date.now() - 29 * 60 * 60 * 1000).toISOString(), value: 46 },
                { timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), value: 47 }
              ]
            };
            break;
          default:
            sensor = null;
        }

        resolve({
          data: {
            success: true,
            data: sensor
          }
        });
      }
      // Mock get actuator operation logs
      else if (endpoint.match(/\/actuators\/\d+\/logs$/) && method === 'GET') {
        resolve({
          data: {
            success: true,
            data: [
              {
                id: 1,
                actuator_id: parseInt(endpoint.split('/')[2]),
                timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
                status: 'on',
                message: 'Manual activation of actuator',
                user: 'admin',
                source: 'web'
              },
              {
                id: 2,
                actuator_id: parseInt(endpoint.split('/')[2]),
                timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
                status: 'off',
                message: 'Actuator turned off by automatic rule',
                user: 'system',
                source: 'rule'
              },
              {
                id: 3,
                actuator_id: parseInt(endpoint.split('/')[2]),
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
                status: 'on',
                message: 'Adjusted actuator parameters',
                user: 'admin',
                source: 'api'
              }
            ]
          }
        });
      }
      // Mock get actuator allowed statuses
      else if (endpoint.match(/\/actuators\/\d+\/statuses$/) && method === 'GET') {
        const id = parseInt(endpoint.split('/')[2]);
        let statuses = [];
        
        switch(id) {
          case 1: // Irrigation
            statuses = ['on', 'off'];
            break;
          case 2: // Fan
            statuses = ['off', 'low', 'medium', 'high'];
            break;
          case 3: // Lighting
            statuses = ['on', 'off', 'dim'];
            break;
          case 4: // Humidifier
            statuses = ['on', 'off', 'auto'];
            break;
          default:
            statuses = ['on', 'off'];
        }
        
        resolve({
          data: {
            success: true,
            data: statuses
          }
        });
      }
      // Mock control actuator
      else if (endpoint.match(/\/actuators\/\d+\/control$/) && method === 'POST') {
        resolve({
          data: {
            success: true,
            message: 'Operation successful',
            data: {
              ...data,
              timestamp: new Date().toISOString()
            }
          }
        });
      }
      // Mock update actuator
      else if (endpoint.match(/\/actuators\/\d+$/) && method === 'PUT') {
        resolve({
          data: {
            success: true,
            message: 'Update successful',
            data: {
              ...data,
              updated_at: new Date().toISOString()
            }
          }
        });
      }
      // Mock update actuator auto rules
      else if (endpoint.match(/\/actuators\/\d+\/rules$/) && method === 'PUT') {
        resolve({
          data: {
            success: true,
            message: 'Rule update successful',
            data: {
              ...data,
              updated_at: new Date().toISOString()
            }
          }
        });
      }
      // Mock update actuator parameters
      else if (endpoint.match(/\/actuators\/\d+\/parameters$/) && method === 'PUT') {
        resolve({
          data: {
            success: true,
            message: 'Parameter update successful',
            data: {
              ...data,
              updated_at: new Date().toISOString()
            }
          }
        });
      }
      // Mock register user
      else if (endpoint === '/users/register' && method === 'POST') {
        // 模拟用户注册
        if (!data.username || !data.email || !data.password) {
          resolve({
            data: {
              success: false,
              message: 'Missing required fields',
            },
            status: 400
          });
          return;
        }
        
        // 模拟检查用户名是否已存在
        if (data.username === 'admin' || data.username === 'user1') {
          resolve({
            data: {
              success: false,
              message: `Username ${data.username} is already taken`,
            },
            status: 409
          });
          return;
        }
        
        // 模拟检查邮箱是否已存在
        if (data.email === 'admin@smartfarm.com' || data.email === 'user1@smartfarm.com') {
          resolve({
            data: {
              success: false,
              message: `Email ${data.email} is already registered`,
            },
            status: 409
          });
          return;
        }
        
        // 注册成功
        resolve({
          data: {
            success: true,
            message: 'User registered successfully',
            data: {
              id: Math.floor(Math.random() * 1000) + 10,
              username: data.username,
              email: data.email,
              role: 'user',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          },
          status: 201
        });
      }
      // Mock login user
      else if (endpoint === '/users/login' && method === 'POST') {
        // 模拟用户登录
        if (!data.email || !data.password) {
          resolve({
            data: {
              success: false,
              message: 'Missing required fields',
            },
            status: 400
          });
          return;
        }
        
        // 检查测试账户
        if ((data.email === 'admin@smartfarm.com' && data.password === 'password123') || 
            (data.email === 'user1@smartfarm.com' && data.password === 'password123') ||
            data.password === 'password123') {  // 任何email只要密码对都通过
          const isAdmin = data.email === 'admin@smartfarm.com';
          const isUser = data.email === 'user1@smartfarm.com';
          
          resolve({
            data: {
              success: true,
              message: 'Login successful',
              data: {
                user: {
                  id: isAdmin ? 1 : (isUser ? 2 : 999),
                  username: isAdmin ? 'admin' : (isUser ? 'user1' : data.email.split('@')[0]),
                  email: data.email,
                  role: isAdmin ? 'admin' : 'user',
                  is_active: true,
                  last_login: new Date().toISOString(),
                  created_at: '2023-01-01T00:00:00Z',
                  updated_at: new Date().toISOString()
                },
                token: 'mock-jwt-token-' + Math.random().toString(36).substring(2)
              }
            },
            status: 200
          });
        } else {
          resolve({
            data: {
              success: false,
              message: 'Invalid email or password',
            },
            status: 401
          });
        }
      }
      // Other endpoints can be added as needed
      else {
        resolve({
          data: {
            success: true,
            message: 'Operation completed',
            data: null
          }
        });
      }
    }, 500); // Simulate network delay
  });
};

// Export API services with corrected endpoint paths
export const authAPI = {
  login: (data) => apiCall('/users/login', 'POST', data),
  register: (data) => apiCall('/users/register', 'POST', data),
  getProfile: () => apiCall('/users/profile'),
  updateProfile: (data) => apiCall('/users/profile', 'PUT', data),
  changePassword: (data) => apiCall('/users/change-password', 'POST', data),
};

export const dashboardAPI = {
  getSummary: () => {
    // Use data from mock database for dashboard
    console.log('获取仪表盘摘要数据');
    return new Promise((resolve) => {
      setTimeout(() => {
        // Count actuator statuses
        const actuatorStatuses = {};
        mockActuatorDatabase.actuators.forEach(actuator => {
          if (!actuatorStatuses[actuator.type]) {
            actuatorStatuses[actuator.type] = { on: 0, off: 0, error: 0 };
          }
          
          if (actuator.status === 'on') {
            actuatorStatuses[actuator.type].on += 1;
          } else if (actuator.status === 'off') {
            actuatorStatuses[actuator.type].off += 1;
          } else if (actuator.status === 'error') {
            actuatorStatuses[actuator.type].error += 1;
          }
        });
        
        // Calculate active actuators
        const activeActuators = mockActuatorDatabase.actuators.filter(a => a.is_active).length;
        
        // Get latest sensor readings for each type
        const latestReadings = {};
        mockSensorDatabase.sensors.forEach(sensor => {
          if (sensor.is_active && sensor.last_reading) {
            if (!latestReadings[sensor.type] || 
                new Date(sensor.last_reading.timestamp) > new Date(latestReadings[sensor.type].timestamp)) {
              latestReadings[sensor.type] = {
                value: sensor.last_reading.value,
                unit: sensor.last_reading.unit,
                sensor_location: sensor.location,
                timestamp: sensor.last_reading.timestamp
              };
            }
          }
        });
        
        // Count active sensors
        const activeSensors = mockSensorDatabase.sensors.filter(s => s.is_active).length;
        
        // Add some logging to see what's being returned
        console.log('仪表盘传感器数据:', {
          total: mockSensorDatabase.sensors.length,
          active: activeSensors,
          latest_readings: latestReadings
        });
        
        console.log('仪表盘执行器数据:', {
          total: mockActuatorDatabase.actuators.length,
          active: activeActuators,
          statuses: actuatorStatuses
        });
        
        // Make sure to return the correct data structure expected by Dashboard component
        resolve({
          success: true,
          data: {
            sensors: {
              total: mockSensorDatabase.sensors.length,
              active: activeSensors,
              latest_readings: latestReadings
            },
            actuators: {
              total: mockActuatorDatabase.actuators.length,
              active: activeActuators,
              statuses: actuatorStatuses
            },
            alerts: {
              total: 5,
              unread: 2,
              recent: [
                {
                  id: 1,
                  type: 'temperature',
                  message: 'Greenhouse 1 temperature above threshold (30°C)',
                  created_at: new Date(Date.now() - 10 * 60000).toISOString(),
                  is_read: false
                },
                {
                  id: 2,
                  type: 'actuator',
                  message: 'Greenhouse 2 irrigation system started',
                  created_at: new Date(Date.now() - 30 * 60000).toISOString(),
                  is_read: true
                }
              ]
            }
          }
        });
      }, 500); // Simulate network delay
    });
  },
};

export const sensorAPI = {
  getAllSensors: () => {
    // Use mock data from sensor database
    console.log('获取所有传感器列表');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: mockSensorDatabase.sensors
        });
      }, 500); // Simulate network delay
    });
  },
  getSensor: (id) => {
    // Get specific sensor from mock database
    console.log(`获取传感器详情, ID: ${id}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        const sensor = mockSensorDatabase.sensors.find(s => s.id === parseInt(id));
        if (sensor) {
          resolve({
            success: true,
            data: sensor
          });
        } else {
          resolve({
            success: false,
            message: `Sensor with ID ${id} not found`
          });
        }
      }, 500); // Simulate network delay
    });
  },
  getSensorData: (id, timeRange) => apiCall(`/sensors/${id}/data?timeRange=${timeRange}`),
  updateSensor: (id, data) => apiCall(`/sensors/${id}`, 'PUT', data),
  calibrateSensor: (id, data) => apiCall(`/sensors/${id}/calibrate`, 'POST', data),
};

export const actuatorAPI = {
  getAllActuators: () => {
    // Use data from localStorage if available, otherwise use mock data
    console.log('Getting all actuators');
    return new Promise((resolve) => {
      setTimeout(() => {
        // Try to get from localStorage first
        const savedActuators = localStorage.getItem('smart_farm_actuators');
        
        if (savedActuators) {
          // If localStorage has data, use it
          resolve({
            success: true,
            data: JSON.parse(savedActuators)
          });
        } else {
          // Otherwise use mock data and save it to localStorage
          localStorage.setItem('smart_farm_actuators', JSON.stringify(mockActuatorDatabase.actuators));
          resolve({
            success: true,
            data: mockActuatorDatabase.actuators
          });
        }
      }, 500); // Simulate network delay
    });
  },
  getActuator: (id) => {
    // Use data from localStorage if available, otherwise use mock data
    console.log(`Getting actuator details, ID: ${id}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        // Try to get from localStorage first
        const savedActuators = localStorage.getItem('smart_farm_actuators');
        let actuator = null;
        
        if (savedActuators) {
          const actuators = JSON.parse(savedActuators);
          actuator = actuators.find(a => a.id === parseInt(id));
        }
        
        // If not found in localStorage, try mock database
        if (!actuator) {
          actuator = mockActuatorDatabase.actuators.find(a => a.id === parseInt(id));
        }
        
        // If still not found, return default
        if (!actuator) {
          actuator = {
            id: parseInt(id),
            name: `Unknown Actuator ${id}`,
            type: 'unknown',
            location: 'Unknown',
            status: 'error',
            mode: 'manual',
            is_active: false,
            mqtt_topic: `farm/actuators/unknown/${id}`,
            created_at: '2023-10-01T08:00:00Z',
            updated_at: '2023-11-15T10:30:00Z'
          };
        }
        
        resolve({
          success: true,
          data: actuator
        });
      }, 500); // Simulate network delay
    });
  },
  getActuatorLogs: (id) => {
    // Get logs for specific actuator from mock database
    console.log(`Getting actuator logs, ID: ${id}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        const logs = mockActuatorDatabase.logs
          .filter(log => log.actuator_id === parseInt(id))
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          
        if (logs.length === 0) {
          // If no logs exist yet, return some default ones
          logs.push(
            {
              id: 1,
              actuator_id: parseInt(id),
              timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
              status: 'on',
              message: 'Manual activation of actuator',
              user: 'admin',
              source: 'web',
              previous_state: 'off',
              parameters: {}
            },
            {
              id: 2,
              actuator_id: parseInt(id),
              timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              status: 'off',
              message: 'Actuator turned off by automatic rule',
              user: 'system',
              source: 'rule',
              previous_state: 'on',
              parameters: {}
            }
          );
        }
        
        resolve({
          success: true,
          data: logs
        });
      }, 500); // Simulate network delay
    });
  },
  getActuatorStatuses: (id) => {
    // Return available statuses based on actuator type
    console.log(`Getting actuator status options, ID: ${id}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        const actuator = mockActuatorDatabase.actuators.find(a => a.id === parseInt(id));
        let statuses = ['on', 'off']; // Default statuses
        
        if (actuator) {
          switch(actuator.type) {
            case 'fan':
              statuses = ['off', 'low', 'medium', 'high'];
              break;
            case 'lighting':
              statuses = ['on', 'off', 'dim'];
              break;
            case 'humidifier':
              statuses = ['on', 'off', 'auto'];
              break;
            case 'curtain':
              statuses = ['open', 'closed', 'half'];
              break;
          }
        }
        
        resolve({
          success: true,
          data: statuses
        });
      }, 500); // Simulate network delay
    });
  },
  controlActuator: (id, data) => {
    // Update actuator status in localStorage
    console.log(`Controlling actuator, ID: ${id}, Action: ${JSON.stringify(data)}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        // Get the action from the data
        const action = data.action;
        
        // Get actuators from localStorage
        const savedActuators = localStorage.getItem('smart_farm_actuators');
        let actuators = [];
        
        if (savedActuators) {
          actuators = JSON.parse(savedActuators);
        } else {
          actuators = mockActuatorDatabase.actuators;
        }
        
        // Find the actuator to update
        const actuatorIndex = actuators.findIndex(a => a.id === parseInt(id));
        if (actuatorIndex === -1) {
          resolve({
            success: false,
            message: `Actuator with ID ${id} not found`
          });
          return;
        }
        
        // Record previous status to detect changes
        const previousStatus = actuators[actuatorIndex].status;
        
        // Update the actuator
        actuators[actuatorIndex].status = action;
        actuators[actuatorIndex].last_control_time = new Date().toISOString();
        
        // Save back to localStorage
        localStorage.setItem('smart_farm_actuators', JSON.stringify(actuators));
        
        // Also update the mock database for other operations
        const updatedActuator = updateActuatorInDatabase(id, {
          status: action,
          last_control_time: new Date().toISOString()
        });
        
        // Add a log entry
        const log = addLogToDatabase(
          id, 
          action, 
          `Actuator ${action === 'on' ? 'turned on' : 'turned off'} manually`,
          'web',
          'admin',
          previousStatus,
          {}
        );
        
        console.log(`Actuator ${id} status changed from ${previousStatus} to ${action}`);
        
        resolve({
          success: true,
          message: 'Operation successful',
          data: {
            actuator: actuators[actuatorIndex],
            log: log
          }
        });
      }, 500); // Simulate network delay
    });
  },
  updateActuator: (id, data) => {
    // Update actuator properties in localStorage
    console.log(`Updating actuator, ID: ${id}, Data: ${JSON.stringify(data)}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        // Get actuators from localStorage
        const savedActuators = localStorage.getItem('smart_farm_actuators');
        let actuators = [];
        
        if (savedActuators) {
          actuators = JSON.parse(savedActuators);
        } else {
          actuators = mockActuatorDatabase.actuators;
        }
        
        // Find the actuator to update
        const actuatorIndex = actuators.findIndex(a => a.id === parseInt(id));
        
        if (actuatorIndex !== -1) {
          // Update the actuator
          actuators[actuatorIndex] = {
            ...actuators[actuatorIndex],
            ...data,
            updated_at: new Date().toISOString()
          };
          
          // Save back to localStorage
          localStorage.setItem('smart_farm_actuators', JSON.stringify(actuators));
          
          // Also update the mock database for other operations
          const updatedActuator = updateActuatorInDatabase(id, data);
          
          addLogToDatabase(
            id, 
            actuators[actuatorIndex].status, 
            'Actuator settings updated',
            'web',
            'admin',
            actuators[actuatorIndex].status,
            {}
          );
          
          resolve({
            success: true,
            message: 'Update successful',
            data: actuators[actuatorIndex]
          });
        } else {
          resolve({
            success: false,
            message: `Actuator with ID ${id} not found`,
          });
        }
      }, 500); // Simulate network delay
    });
  },
  updateAutoRules: (id, data) => {
    // Update actuator rules in localStorage and mock database
    console.log(`Updating actuator rules, ID: ${id}, Rules: ${JSON.stringify(data)}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        // Get actuators from localStorage
        const savedActuators = localStorage.getItem('smart_farm_actuators');
        let actuators = [];
        
        if (savedActuators) {
          actuators = JSON.parse(savedActuators);
        } else {
          actuators = mockActuatorDatabase.actuators;
        }
        
        // Find the actuator to update
        const actuatorIndex = actuators.findIndex(a => a.id === parseInt(id));
        
        if (actuatorIndex !== -1) {
          // Update auto rules
          actuators[actuatorIndex].auto_rules = data;
          actuators[actuatorIndex].updated_at = new Date().toISOString();
          
          // Save back to localStorage
          localStorage.setItem('smart_farm_actuators', JSON.stringify(actuators));
          
          // Also update the mock database for other operations
          const updatedActuator = updateActuatorInDatabase(id, {
            auto_rules: data,
            updated_at: new Date().toISOString()
          });
          
          addLogToDatabase(
            id, 
            actuators[actuatorIndex].status, 
            'Actuator automation rules updated',
            'web',
            'admin',
            actuators[actuatorIndex].status,
            {}
          );
          
          resolve({
            success: true,
            message: 'Rules updated successfully',
            data: actuators[actuatorIndex]
          });
        } else {
          resolve({
            success: false,
            message: `Actuator with ID ${id} not found`,
          });
        }
      }, 500); // Simulate network delay
    });
  },
  updateParameters: (id, data) => {
    // Update actuator parameters in localStorage and mock database
    console.log(`Updating actuator parameters, ID: ${id}, Parameters: ${JSON.stringify(data)}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        // Get actuators from localStorage
        const savedActuators = localStorage.getItem('smart_farm_actuators');
        let actuators = [];
        
        if (savedActuators) {
          actuators = JSON.parse(savedActuators);
        } else {
          actuators = mockActuatorDatabase.actuators;
        }
        
        // Find the actuator to update
        const actuatorIndex = actuators.findIndex(a => a.id === parseInt(id));
        
        if (actuatorIndex !== -1) {
          // Add parameters property if it doesn't exist
          if (!actuators[actuatorIndex].parameters) {
            actuators[actuatorIndex].parameters = {};
          }
          
          // Update parameters
          actuators[actuatorIndex].parameters = {
            ...actuators[actuatorIndex].parameters,
            ...data
          };
          actuators[actuatorIndex].updated_at = new Date().toISOString();
          
          // Save back to localStorage
          localStorage.setItem('smart_farm_actuators', JSON.stringify(actuators));
          
          // Also update the mock database for other operations
          const updatedActuator = updateActuatorInDatabase(id, {
            parameters: {
              ...actuators[actuatorIndex].parameters
            },
            updated_at: new Date().toISOString()
          });
          
          addLogToDatabase(
            id, 
            actuators[actuatorIndex].status, 
            'Actuator parameters updated',
            'web',
            'admin',
            actuators[actuatorIndex].status,
            data
          );
          
          resolve({
            success: true,
            message: 'Parameters updated successfully',
            data: actuators[actuatorIndex]
          });
        } else {
          resolve({
            success: false,
            message: `Actuator with ID ${id} not found`,
          });
        }
      }, 500); // Simulate network delay
    });
  },
};

export const alertAPI = {
  getAlerts: (page = 1, limit = 10) => apiCall(`/alerts?page=${page}&limit=${limit}`),
  markAsRead: (id) => apiCall(`/alerts/${id}/read`, 'POST'),
  markAllAsRead: () => apiCall('/alerts/read-all', 'POST'),
  deleteAlert: (id) => apiCall(`/alerts/${id}`, 'DELETE'),
  getAlertSettings: () => apiCall('/alerts/settings'),
  updateAlertSettings: (data) => apiCall('/alerts/settings', 'PUT', data),
  
  // Mock implementation with localStorage persistence
  getAllAlerts: () => {
    console.log('Getting all alerts');
    return new Promise((resolve) => {
      setTimeout(() => {
        // Use mock data for demonstration
        const mockAlerts = generateMockAlerts(50);
        resolve({
          success: true,
          data: mockAlerts
        });
      }, 500);
    });
  },
  
  getAlertThresholds: () => {
    console.log('Getting alert thresholds');
    return new Promise((resolve) => {
      setTimeout(() => {
        // Try to get from localStorage first
        const savedThresholds = localStorage.getItem('smart_farm_alert_thresholds');
        
        if (savedThresholds) {
          // If localStorage has data, use it
          resolve({
            success: true,
            data: JSON.parse(savedThresholds)
          });
        } else {
          // Otherwise use default thresholds
          const defaultThresholds = [
            {
              id: 1,
              sensor_type: 'temperature',
              condition: 'gt',
              threshold: 30,
              severity: 'high',
              notification_method: ['app', 'email'],
              is_active: true
            },
            {
              id: 2,
              sensor_type: 'temperature',
              condition: 'lt',
              threshold: 10,
              severity: 'medium',
              notification_method: ['app'],
              is_active: true
            },
            {
              id: 3,
              sensor_type: 'humidity',
              condition: 'gt',
              threshold: 85,
              severity: 'medium',
              notification_method: ['app'],
              is_active: true
            },
            {
              id: 4,
              sensor_type: 'humidity',
              condition: 'lt',
              threshold: 30,
              severity: 'medium',
              notification_method: ['app', 'email'],
              is_active: true
            },
            {
              id: 5,
              sensor_type: 'soil_moisture',
              condition: 'lt',
              threshold: 20,
              severity: 'high',
              notification_method: ['app', 'email', 'sms'],
              is_active: true
            }
          ];
          
          // Save to localStorage for future use
          localStorage.setItem('smart_farm_alert_thresholds', JSON.stringify(defaultThresholds));
          
          resolve({
            success: true,
            data: defaultThresholds
          });
        }
      }, 500);
    });
  },
  
  updateAlertThreshold: (id, data) => {
    console.log(`Updating alert threshold, ID: ${id}, Data: ${JSON.stringify(data)}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        // Get thresholds from localStorage
        const savedThresholds = localStorage.getItem('smart_farm_alert_thresholds');
        let thresholds = [];
        
        if (savedThresholds) {
          thresholds = JSON.parse(savedThresholds);
        }
        
        // Find the threshold to update
        const thresholdIndex = thresholds.findIndex(t => t.id === parseInt(id));
        
        if (thresholdIndex !== -1) {
          // Update the threshold
          thresholds[thresholdIndex] = {
            ...thresholds[thresholdIndex],
            ...data
          };
          
          // Save back to localStorage
          localStorage.setItem('smart_farm_alert_thresholds', JSON.stringify(thresholds));
          
          resolve({
            success: true,
            message: 'Threshold updated successfully',
            data: thresholds[thresholdIndex]
          });
        } else {
          resolve({
            success: false,
            message: `Threshold with ID ${id} not found`
          });
        }
      }, 500);
    });
  },
  
  createAlertThreshold: (data) => {
    console.log(`Creating new alert threshold: ${JSON.stringify(data)}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        // Get thresholds from localStorage
        const savedThresholds = localStorage.getItem('smart_farm_alert_thresholds');
        let thresholds = [];
        
        if (savedThresholds) {
          thresholds = JSON.parse(savedThresholds);
        }
        
        // Create new threshold with ID
        const newThreshold = {
          ...data,
          id: thresholds.length > 0 ? Math.max(...thresholds.map(t => t.id)) + 1 : 1
        };
        
        // Add to thresholds array
        thresholds.push(newThreshold);
        
        // Save back to localStorage
        localStorage.setItem('smart_farm_alert_thresholds', JSON.stringify(thresholds));
        
        resolve({
          success: true,
          message: 'New threshold created successfully',
          data: newThreshold
        });
      }, 500);
    });
  },
  
  deleteAlertThreshold: (id) => {
    console.log(`Deleting alert threshold, ID: ${id}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        // Get thresholds from localStorage
        const savedThresholds = localStorage.getItem('smart_farm_alert_thresholds');
        
        if (!savedThresholds) {
          resolve({
            success: false,
            message: 'No thresholds found'
          });
          return;
        }
        
        let thresholds = JSON.parse(savedThresholds);
        
        // Filter out the threshold to delete
        const newThresholds = thresholds.filter(t => t.id !== parseInt(id));
        
        if (newThresholds.length === thresholds.length) {
          resolve({
            success: false,
            message: `Threshold with ID ${id} not found`
          });
          return;
        }
        
        // Save back to localStorage
        localStorage.setItem('smart_farm_alert_thresholds', JSON.stringify(newThresholds));
        
        resolve({
          success: true,
          message: 'Threshold deleted successfully'
        });
      }, 500);
    });
  },
  
  getUserPreferences: () => {
    console.log('Getting user alert preferences');
    return new Promise((resolve) => {
      setTimeout(() => {
        // Try to get from localStorage first
        const savedPrefs = localStorage.getItem('smart_farm_alert_preferences');
        
        if (savedPrefs) {
          // If localStorage has data, use it
          resolve({
            success: true,
            data: JSON.parse(savedPrefs)
          });
        } else {
          // Otherwise use default preferences
          const defaultPreferences = {
            receive_email_notifications: true,
            receive_sms_notifications: false,
            email_address: 'user@example.com',
            phone_number: '',
            mute_notifications: false,
            auto_acknowledge_low_severity: false
          };
          
          // Save to localStorage for future use
          localStorage.setItem('smart_farm_alert_preferences', JSON.stringify(defaultPreferences));
          
          resolve({
            success: true,
            data: defaultPreferences
          });
        }
      }, 500);
    });
  },
  
  updateUserPreferences: (data) => {
    console.log(`Updating user alert preferences: ${JSON.stringify(data)}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        // Save to localStorage
        localStorage.setItem('smart_farm_alert_preferences', JSON.stringify(data));
        
        resolve({
          success: true,
          message: 'User preferences updated successfully',
          data: data
        });
      }, 500);
    });
  }
};

export const analyticsAPI = {
  getSensorStats: (timeRange) => apiCall(`/analytics/sensors?timeRange=${timeRange}`),
  getActuatorStats: (timeRange) => apiCall(`/analytics/actuators?timeRange=${timeRange}`),
  getCorrelationData: (sensors, timeRange) => apiCall(`/analytics/correlation?sensors=${sensors.join(',')}&timeRange=${timeRange}`),
  getEnergyUsage: (timeRange) => apiCall(`/analytics/energy?timeRange=${timeRange}`),
  getYieldData: (timeRange) => apiCall(`/analytics/yield?timeRange=${timeRange}`),
};

export const settingsAPI = {
  getSystemSettings: () => apiCall('/settings/system'),
  updateSystemSettings: (data) => apiCall('/settings/system', 'PUT', data),
  getNotificationSettings: () => apiCall('/settings/notifications'),
  updateNotificationSettings: (data) => apiCall('/settings/notifications', 'PUT', data),
  getBackupSettings: () => apiCall('/settings/backup'),
  updateBackupSettings: (data) => apiCall('/settings/backup', 'PUT', data),
  backupNow: () => apiCall('/settings/backup/now', 'POST'),
  restoreBackup: (id) => apiCall(`/settings/backup/restore/${id}`, 'POST'),
  getDeviceSettings: () => apiCall('/settings/devices'),
  updateDeviceSettings: (data) => apiCall('/settings/devices', 'PUT', data),
};

// Generate mock alerts for testing purposes
const generateMockAlerts = (count = 20) => {
  const alertTypes = [
    { type: 'temperature_high', message: 'Temperature too high', severity: 'high', icon: null, color: 'error' },
    { type: 'temperature_low', message: 'Temperature too low', severity: 'medium', icon: null, color: 'warning' },
    { type: 'humidity_high', message: 'Humidity too high', severity: 'medium', icon: null, color: 'warning' },
    { type: 'humidity_low', message: 'Humidity too low', severity: 'medium', icon: null, color: 'warning' },
    { type: 'soil_moisture_low', message: 'Soil moisture too low', severity: 'high', icon: null, color: 'error' },
    { type: 'light_low', message: 'Insufficient light', severity: 'low', icon: null, color: 'info' },
    { type: 'actuator_failure', message: 'Actuator failure', severity: 'high', icon: null, color: 'error' },
    { type: 'system_warning', message: 'System warning', severity: 'low', icon: null, color: 'info' },
    { type: 'connection_lost', message: 'Connection lost', severity: 'medium', icon: null, color: 'warning' },
    { type: 'power_warning', message: 'Power warning', severity: 'medium', icon: null, color: 'warning' }
  ];

  const locations = ['Greenhouse 1', 'Greenhouse 2', 'Greenhouse 3', 'Equipment Room', 'Control Center'];
  const devices = [
    'Temperature Sensor 01', 'Temperature Sensor 02', 'Humidity Sensor 01', 'Humidity Sensor 02',
    'Soil Moisture Sensor 01', 'Light Sensor 01', 'Irrigation System 01', 'Ventilation System 01', 'Lighting System 01'
  ];

  const alerts = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const device = devices[Math.floor(Math.random() * devices.length)];
    const timestamp = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    const is_read = Math.random() > 0.3; // 30% unread
    const is_acknowledged = is_read && Math.random() > 0.5; // 50% of read alerts are acknowledged
    
    const values = {};
    if (alertType.type.includes('temperature')) {
      values.temperature = alertType.type.includes('high') ? 
        (30 + Math.random() * 10).toFixed(1) : 
        (5 + Math.random() * 10).toFixed(1);
      values.unit = '°C';
      values.threshold = alertType.type.includes('high') ? '30.0°C' : '10.0°C';
    } else if (alertType.type.includes('humidity')) {
      values.humidity = alertType.type.includes('high') ? 
        (85 + Math.random() * 15).toFixed(1) : 
        (20 + Math.random() * 10).toFixed(1);
      values.unit = '%';
      values.threshold = alertType.type.includes('high') ? '85.0%' : '30.0%';
    }

    alerts.push({
      id: i + 1,
      type: alertType.type,
      message: alertType.message,
      severity: alertType.severity,
      icon: alertType.icon,
      color: alertType.color,
      location,
      device,
      values,
      timestamp,
      is_read,
      is_acknowledged,
      details: `${alertType.message} detected from ${device} in ${location}. Please address promptly.`
    });
  }

  return alerts.sort((a, b) => b.timestamp - a.timestamp);
};