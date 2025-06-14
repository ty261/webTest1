import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  DateRange as DateRangeIcon,
  ErrorOutline as ErrorOutlineIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { SENSOR_TYPES } from '../config';
import TemperatureIcon from '@mui/icons-material/Thermostat';
import HumidityIcon from '@mui/icons-material/Opacity';
import LightIcon from '@mui/icons-material/WbSunny';
import SoilIcon from '@mui/icons-material/Terrain';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { useSocket } from '../contexts/SocketContext';

// Mock API function to get sensor details
const fetchSensorDetails = async (id) => {
  try {
    // 从localStorage获取传感器数据
    const savedSensors = localStorage.getItem('smart_farm_sensors');
    let sensors = [];
    
    if (savedSensors) {
      sensors = JSON.parse(savedSensors);
    } else {
      // 如果没有数据，使用默认数据
      sensors = [
        { id: 1, name: 'Temperature Sensor 1', type: 'temperature', location: 'Greenhouse 1', status: 'active', current_value: 24.5 },
        { id: 2, name: 'Humidity Sensor 1', type: 'humidity', location: 'Greenhouse 1', status: 'active', current_value: 65 },
        { id: 3, name: 'Light Sensor 1', type: 'light', location: 'Greenhouse 2', status: 'active', current_value: 2500 },
        { id: 4, name: 'Soil Moisture Sensor 1', type: 'soil_moisture', location: 'Greenhouse 1', status: 'inactive', current_value: 35 },
      ];
    }
    
    // 查找匹配的传感器
    const sensor = sensors.find(s => s.id === parseInt(id));
    
    if (!sensor) {
      throw new Error('Sensor not found');
    }
    
    // 添加详细信息
    return {
      ...sensor,
      model: sensor.model || "Generic Sensor",
      manufacturer: sensor.manufacturer || "Unknown",
      mqtt_topic: sensor.mqtt_topic || `farm/sensors/${sensor.type}/${sensor.location.toLowerCase().replace(/\s+/g, '_')}`,
      calibration_date: sensor.calibration_date || "2023-09-15T00:00:00Z",
      installation_date: sensor.installation_date || "2023-08-01T00:00:00Z",
      firmware_version: sensor.firmware_version || "1.0.2",
      battery_level: sensor.battery_level || (sensor.status === 'active' ? 85 : 20),
      signal_strength: sensor.signal_strength || (sensor.status === 'active' ? -65 : -90),
      accuracy: sensor.accuracy || 0.5,
      history: generateMockHistory(sensor.type, 30) // 生成30天的历史数据
    };
  } catch (error) {
    console.error(`Error fetching sensor details: ${error.message}`);
    throw error;
  }
};

// 生成模拟历史数据
const generateMockHistory = (sensorType, days) => {
  const history = [];
  const now = new Date();
  const typeInfo = SENSOR_TYPES.find(t => t.id === sensorType) || SENSOR_TYPES[0];
  
  // 根据传感器类型设置基准值和波动范围
  let baseValue, fluctuation;
  switch(sensorType) {
    case 'temperature':
      baseValue = 25;
      fluctuation = 8;
      break;
    case 'humidity':
      baseValue = 60;
      fluctuation = 20;
      break;
    case 'light':
      baseValue = 2000;
      fluctuation = 1500;
      break;
    case 'soil_moisture':
      baseValue = 40;
      fluctuation = 30;
      break;
    default:
      baseValue = 50;
      fluctuation = 20;
  }
  
  // 生成过去几天的数据
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // 为每天生成几个不同时间的数据点
    for (let hour of [8, 12, 16, 20]) {
      const dataPoint = new Date(date);
      dataPoint.setHours(hour, 0, 0);
      
      // 生成略有波动的值
      const dailySin = Math.sin(i / 5) * (fluctuation / 4);
      const hourlySin = Math.sin(hour / 4) * (fluctuation / 3);
      const randomVariation = (Math.random() - 0.5) * (fluctuation / 5);
      
      let value = baseValue + dailySin + hourlySin + randomVariation;
      
      // 确保值不超出合理范围
      if (sensorType === 'humidity' || sensorType === 'soil_moisture') {
        value = Math.max(0, Math.min(100, value));
      } else if (sensorType === 'light') {
        value = Math.max(0, value);
      }
      
      history.push({
        timestamp: dataPoint.toISOString(),
        value: parseFloat(value.toFixed(1)),
        unit: typeInfo.unit
      });
    }
  }
  
  return history;
};

// 获取传感器图标
const getSensorIcon = (type) => {
  switch(type) {
    case 'temperature': return <TemperatureIcon color="error" fontSize="large" />;
    case 'humidity': return <HumidityIcon color="primary" fontSize="large" />;
    case 'light': return <LightIcon color="warning" fontSize="large" />;
    case 'soil_moisture': return <SoilIcon color="success" fontSize="large" />;
    default: return null;
  }
};

// 获取状态文本
const getStatusText = (status) => {
  switch(status) {
    case 'active': return 'Running';
    case 'inactive': return 'Offline';
    case 'maintenance': return 'Maintenance';
    default: return 'Unknown';
  }
};

const SensorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sensor, setSensor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);
  const { sensorData } = useSocket();
  
  // 加载传感器详情
  useEffect(() => {
    const loadSensorDetails = async () => {
      try {
        const data = await fetchSensorDetails(id);
        setSensor(data);
        
        // 准备图表数据
        prepareChartData(data.history);
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    loadSensorDetails();
  }, [id]);
  
  // 从Socket更新传感器值
  useEffect(() => {
    if (!sensor || Object.keys(sensorData).length === 0) return;
    
    // 查找匹配的传感器数据
    Object.values(sensorData).forEach(socketSensor => {
      if (socketSensor.type === sensor.type && 
          socketSensor.location.toLowerCase() === sensor.location.toLowerCase()) {
        
        setSensor(prev => ({
          ...prev,
          current_value: socketSensor.value,
          status: 'active'
        }));
      }
    });
  }, [sensorData, sensor]);
  
  // 准备图表数据
  const prepareChartData = (history) => {
    if (!history || history.length === 0) return;
    
    // 获取最近7天的数据
    const recentHistory = history.slice(-28);
    
    // 转换为Recharts期望的格式
    const formattedData = recentHistory.map(item => ({
      timestamp: new Date(item.timestamp),
      date: new Date(item.timestamp).toLocaleDateString(),
      time: new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      value: item.value,
      unit: item.unit
    }));
    
    setChartData(formattedData);
  };
  
  // 获取传感器颜色
  const getSensorColor = (type) => {
    switch(type) {
      case 'temperature': return '#f44336';
      case 'humidity': return '#2196f3';
      case 'light': return '#ff9800';
      case 'soil_moisture': return '#4caf50';
      default: return '#9e9e9e';
    }
  };
  
  // 获取传感器类型信息
  const getTypeInfo = (type) => {
    return SENSOR_TYPES.find(sensor => sensor.id === type) || { name: 'Unknown', unit: '' };
  };
  
  // 格式化日期
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography color="error" gutterBottom>
          {error === 'Sensor not found' ? 'Sensor not found' : `Error loading sensor details: ${error}`}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/sensors')}
          startIcon={<ArrowBackIcon />}
        >
          Return to Sensor List
        </Button>
      </Box>
    );
  }
  
  if (!sensor) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography color="error" gutterBottom>Sensor not found</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/sensors')}
          startIcon={<ArrowBackIcon />}
        >
          Return to Sensor List
        </Button>
      </Box>
    );
  }
  
  const typeInfo = getTypeInfo(sensor.type);
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          variant="outlined" 
          sx={{ mr: 2 }}
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/sensors')}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          Sensor Details
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Sensor basic information card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {getSensorIcon(sensor.type)}
                <Box sx={{ ml: 2 }}>
                  <Typography variant="h5" component="h2">
                    {sensor.name}
                  </Typography>
                  <Chip 
                    label={getStatusText(sensor.status)} 
                    color={sensor.status === 'active' ? 'success' : sensor.status === 'inactive' ? 'error' : 'warning'}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Type</Typography>
                  <Typography variant="body1">{typeInfo.name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Location</Typography>
                  <Typography variant="body1">{sensor.location}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Model</Typography>
                  <Typography variant="body1">{sensor.model}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Manufacturer</Typography>
                  <Typography variant="body1">{sensor.manufacturer}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">MQTT Topic</Typography>
                  <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>{sensor.mqtt_topic}</Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>Current Reading</Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <Typography variant="h3" component="p">
                  {sensor.current_value}
                </Typography>
                <Typography variant="h5" component="span" sx={{ ml: 1 }}>
                  {typeInfo.unit}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Sensor technical information card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Technical Information
              </Typography>
              
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Firmware Version" 
                    secondary={sensor.firmware_version} 
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Installation Date" 
                    secondary={formatDate(sensor.installation_date)} 
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Last Calibration" 
                    secondary={formatDate(sensor.calibration_date)} 
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Accuracy" 
                    secondary={`±${sensor.accuracy} ${typeInfo.unit}`} 
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Battery Level" 
                    secondary={`${sensor.battery_level}%`} 
                  />
                  <Chip 
                    label={sensor.battery_level > 20 ? "Normal" : "Low"}
                    color={sensor.battery_level > 20 ? "success" : "error"}
                    size="small"
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Signal Strength" 
                    secondary={`${sensor.signal_strength} dBm`} 
                  />
                  <Chip 
                    label={sensor.signal_strength > -80 ? "Good" : "Weak"}
                    color={sensor.signal_strength > -80 ? "success" : "warning"}
                    size="small"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Historical data chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Historical Data
                </Typography>
                <Box>
                  <Tooltip title="View Full History">
                    <IconButton>
                      <HistoryIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Adjust Date Range">
                    <IconButton>
                      <DateRangeIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              {chartData.length > 0 ? (
                <Box sx={{ height: 350, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp" 
                        scale="time"
                        type="number"
                        domain={['auto', 'auto']}
                        tickFormatter={(timestamp) => {
                          const date = new Date(timestamp);
                          return `${date.getMonth()+1}/${date.getDate()}`;
                        }}
                      />
                      <YAxis />
                      <RechartsTooltip 
                        formatter={(value, name) => [`${value} ${sensor ? getTypeInfo(sensor.type).unit : ''}`, 'Value']}
                        labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke={getSensorColor(sensor.type)} 
                        activeDot={{ r: 8 }} 
                        name="Value"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="textSecondary">No historical data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent readings table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Readings
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell align="right">Value</TableCell>
                      <TableCell align="right">Unit</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sensor.history.slice(-10).reverse().map((record, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          {new Date(record.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell align="right">{record.value}</TableCell>
                        <TableCell align="right">{record.unit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<SettingsIcon />}
        >
          Set Thresholds
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<ErrorOutlineIcon />}
        >
          Troubleshoot
        </Button>
        <Button 
          variant="contained" 
          startIcon={<EditIcon />}
        >
          Edit Sensor
        </Button>
      </Box>
    </Box>
  );
};

export default SensorDetail; 