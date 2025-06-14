// API URL - Make sure there's no trailing slash
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Socket.io URL
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// Token storage key
export const TOKEN_KEY = 'smart_farm_token';

// User storage key
export const USER_KEY = 'smart_farm_user';

// Chart colors
export const CHART_COLORS = {
  temperature: '#f44336',
  humidity: '#2196f3',
  light: '#ff9800',
  soil_moisture: '#4caf50',
  rainfall: '#673ab7',
  co2: '#607d8b',
  wind: '#795548',
  pressure: '#03a9f4'
};

// Sensor types
export const SENSOR_TYPES = [
  { id: 'temperature', name: 'Temperature', unit: '°C', icon: 'thermostat' },
  { id: 'humidity', name: 'Humidity', unit: '%', icon: 'water_drop' },
  { id: 'light', name: 'Light', unit: 'lux', icon: 'light_mode' },
  { id: 'soil_moisture', name: 'Soil Moisture', unit: '%', icon: 'terrain' },
  { id: 'rainfall', name: 'Rainfall', unit: 'mm', icon: 'rainy' },
  { id: 'co2', name: 'CO2', unit: 'ppm', icon: 'air' },
  { id: 'wind', name: 'Wind Speed', unit: 'km/h', icon: 'air' },
  { id: 'pressure', name: 'Pressure', unit: 'hPa', icon: 'compress' }
];

// Actuator types
export const ACTUATOR_TYPES = [
  { id: 'irrigation', name: 'Irrigation', icon: 'shower' },
  { id: 'ventilation', name: 'Ventilation', icon: 'air' },
  { id: 'lighting', name: 'Lighting', icon: 'light_mode' },
  { id: 'heating', name: 'Heating', icon: 'local_fire_department' },
  { id: 'cooling', name: 'Cooling', icon: 'ac_unit' },
  { id: 'shading', name: 'Shading', icon: 'blinds' }
]; 