import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  Tabs, 
  Tab, 
  CircularProgress, 
  Alert, 
  Card, 
  CardContent, 
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  Thermostat as TemperatureIcon,
  Opacity as HumidityIcon,
  WbSunny as LightIcon,
  Terrain as SoilIcon,
  Power as PowerIcon,
  Speed as SpeedIcon,
  DateRange as DateRangeIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  TableChart as TableChartIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { dashboardAPI } from '../services/api';

// Sensor types and icons
const SENSOR_TYPES = [
  { id: 'temperature', name: 'Temperature', icon: <TemperatureIcon />, color: '#f44336' },
  { id: 'humidity', name: 'Humidity', icon: <HumidityIcon />, color: '#2196f3' },
  { id: 'light', name: 'Light', icon: <LightIcon />, color: '#ff9800' },
  { id: 'soil_moisture', name: 'Soil Moisture', icon: <SoilIcon />, color: '#4caf50' },
  { id: 'co2', name: 'CO2', icon: <SpeedIcon />, color: '#9c27b0' },
  { id: 'ph', name: 'pH Value', icon: <SpeedIcon />, color: '#795548' },
  { id: 'water_level', name: 'Water Level', icon: <HumidityIcon />, color: '#00bcd4' }
];

// Actuator types
const ACTUATOR_TYPES = [
  { id: 'irrigation', name: 'Irrigation System', color: '#2196f3' },
  { id: 'fan', name: 'Fan', color: '#00bcd4' },
  { id: 'ventilation', name: 'Ventilation System', color: '#80deea' },
  { id: 'lighting', name: 'Lighting System', color: '#ff9800' },
  { id: 'heating', name: 'Heating System', color: '#f44336' },
  { id: 'cooling', name: 'Cooling System', color: '#64b5f6' },
  { id: 'curtain', name: 'Curtain System', color: '#ffb74d' },
  { id: 'humidifier', name: 'Humidifier', color: '#4db6ac' },
  { id: 'pump', name: 'Water Pump', color: '#4fc3f7' }
];

// Tab panel component
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// Chart panel component
const ChartPanel = ({ children, title, sx = {} }) => {
  return (
    <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', ...sx }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {children}
    </Paper>
  );
};

// Mock sensor data generation
const generateSensorData = (sensorType, timeRange) => {
  const data = [];
  const now = new Date();
  let startDate, endDate, dataPoints, interval;

  // Set parameters based on time period
  if (timeRange === '24h') {
    startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    endDate = new Date();
    dataPoints = 24;
    interval = 60 * 60 * 1000; // 1 hour
  } else if (timeRange === '7d') {
    startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    endDate = new Date();
    dataPoints = 7;
    interval = 24 * 60 * 60 * 1000; // 1 day
  } else if (timeRange === '30d') {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    endDate = new Date();
    dataPoints = 30;
    interval = 24 * 60 * 60 * 1000; // 1 day
  } else {
    // Default to 24h
    startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    endDate = new Date();
    dataPoints = 24;
    interval = 60 * 60 * 1000;
  }

  // Set generation rules based on sensor type
  let min, max, unit;
  switch(sensorType) {
    case 'temperature':
      min = 18;
      max = 32;
      unit = '°C';
      break;
    case 'humidity':
      min = 40;
      max = 90;
      unit = '%';
      break;
    case 'light':
      min = 0;
      max = 65000;
      unit = 'lux';
      break;
    case 'soil_moisture':
      min = 20;
      max = 80;
      unit = '%';
      break;
    case 'co2':
      min = 350;
      max = 1500;
      unit = 'ppm';
      break;
    case 'ph':
      min = 5.5;
      max = 7.5;
      unit = 'pH';
      break;
    case 'water_level':
      min = 20;
      max = 100;
      unit = '%';
      break;
    default:
      min = 0;
      max = 100;
      unit = '';
  }

  // Generate data points
  for (let i = 0; i < dataPoints; i++) {
    const timestamp = new Date(startDate.getTime() + i * interval);
    const value = parseFloat((Math.random() * (max - min) + min).toFixed(1));
    data.push({
      timestamp: timestamp.toISOString(),
      value,
      unit
    });
  }

  // Generate statistics
  const values = data.map(d => d.value);
  const stats = {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)),
    unit
  };

  return { data, stats };
};

// Mock actuator data generation
const generateActuatorData = (actuatorType, timeRange) => {
  const data = [];
  const now = new Date();
  let startDate, endDate, dataPoints, interval;

  // Set parameters based on time period
  if (timeRange === '24h') {
    startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    endDate = new Date();
    dataPoints = 24;
    interval = 60 * 60 * 1000; // 1 hour
  } else if (timeRange === '7d') {
    startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    endDate = new Date();
    dataPoints = 7;
    interval = 24 * 60 * 60 * 1000; // 1 day
  } else if (timeRange === '30d') {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    endDate = new Date();
    dataPoints = 30;
    interval = 24 * 60 * 60 * 1000; // 1 day
  } else {
    // Default to 24h
    startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    endDate = new Date();
    dataPoints = 24;
    interval = 60 * 60 * 1000;
  }

  // Possible actuator statuses
  const statuses = ['on', 'off'];
  
  // Generate runtime data
  let totalOnTime = 0;
  let totalOffTime = 0;
  
  // Generate data points
  for (let i = 0; i < dataPoints; i++) {
    const status = Math.random() > 0.7 ? 'off' : 'on'; // Simulate 70% on-time
    if (status === 'on') {
      totalOnTime += interval / (60 * 60 * 1000); // Convert to hours
    } else {
      totalOffTime += interval / (60 * 60 * 1000); // Convert to hours
    }
    
    const timestamp = new Date(startDate.getTime() + i * interval);
    
    data.push({
      timestamp: timestamp.toISOString(),
      status,
      runtime: status === 'on' ? (interval / (60 * 60 * 1000)) : 0 // Runtime in hours
    });
  }
  
  // Generate statistics
  const stats = {
    totalOn: totalOnTime.toFixed(1),
    totalOff: totalOffTime.toFixed(1),
    pieData: [
      { name: 'On', value: totalOnTime, color: '#4caf50' },
      { name: 'Off', value: totalOffTime, color: '#f44336' }
    ]
  };
  
  return {
    data: data.reverse(),
    stats
  };
};

const Analytics = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataType, setDataType] = useState('sensor'); // 'sensor' or 'actuator'
  const [sensorType, setSensorType] = useState('temperature');
  const [actuatorType, setActuatorType] = useState('irrigation');
  const [timeRange, setTimeRange] = useState('24h');
  const [chartData, setChartData] = useState({});
  const [tabValue, setTabValue] = useState(0);

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      let data;
      if (dataType === 'sensor') {
        // Simulate API fetch for sensor data
        // In a real project, use an actual API call:
        // const response = await analyticsAPI.getSensorData(sensorType, timeRange);
        
        // Use mock data
        data = generateSensorData(sensorType, timeRange);
      } else {
        // Simulate API fetch for actuator data
        // In a real project, use an actual API call:
        // const response = await analyticsAPI.getActuatorData(actuatorType, timeRange);
        
        // Use mock data
        data = generateActuatorData(actuatorType, timeRange);
      }
      
      // Ensure chartData has expected structure to prevent null/undefined errors
      setChartData({
        data: data.data || [],
        stats: {
          ...(data.stats || {}),
          pieData: data.stats?.pieData || []
        }
      });
    } catch (err) {
      console.error('Failed to get analytics data:', err);
      setError('Failed to get data, please try again later');
      
      // Set empty data on error to prevent rendering issues
      setChartData({ data: [], stats: { pieData: [] } });
    } finally {
      setLoading(false);
    }
  };
  
  // Load initial data
  useEffect(() => {
    loadData();
  }, []);
  
  // Reload data when filters change
  useEffect(() => {
    loadData();
  }, [dataType, sensorType, actuatorType, timeRange]);
  
  // Handle chart type tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Format date display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  // Render sensor data chart
  const renderSensorChart = () => {
    if (!chartData.data || chartData.data.length === 0) return null;
    
    const sensorInfo = SENSOR_TYPES.find(s => s.id === sensorType) || {};
    const data = chartData.data;
    const stats = chartData.stats;
    
    return (
      <>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="Chart type">
            <Tab icon={<TimelineIcon />} label="Line Chart" />
            <Tab icon={<TableChartIcon />} label="Data Table" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <ChartPanel 
            title={
              <Typography variant="h6">
                {sensorInfo.name || sensorType} Trend ({stats.unit})
              </Typography>
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(tick) => format(new Date(tick), 'HH:mm MM/dd')}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} ${stats.unit}`, 'Value']}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={sensorInfo.color || '#8884d8'} 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartPanel>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="sensor data table">
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell align="right">Value ({stats.unit})</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell component="th" scope="row">
                      {formatDate(row.timestamp)}
                    </TableCell>
                    <TableCell align="right">{row.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </>
    );
  };
  
  // Render actuator data chart
  const renderActuatorChart = () => {
    if (!chartData.data || chartData.data.length === 0) return null;
    
    const actuatorInfo = ACTUATOR_TYPES.find(a => a.id === actuatorType) || {};
    const data = chartData.data;
    const stats = chartData.stats;
    
    return (
      <>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="Chart type">
            <Tab icon={<TimelineIcon />} label="Runtime" />
            <Tab icon={<PieChartIcon />} label="Runtime Ratio" />
            <Tab icon={<TableChartIcon />} label="Data Table" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <ChartPanel 
            title={
              <Typography variant="h6">
                {actuatorInfo.name || actuatorType} Runtime (hours)
              </Typography>
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tickFormatter={(tick) => format(new Date(tick), 'HH:mm MM/dd')} />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} hours`, 'Runtime']}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="runtime" 
                  name="Runtime"
                  stroke={actuatorInfo.color || '#8884d8'} 
                  fill={actuatorInfo.color || '#8884d8'} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartPanel>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <ChartPanel 
            title={
              <Typography variant="h6">
                {actuatorInfo.name || actuatorType} Runtime Ratio
              </Typography>
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.pieData || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.pieData && stats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value.toFixed(1)} hours`, 'Time']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartPanel>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="actuator data table">
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell align="right">Status</TableCell>
                  <TableCell align="right">Runtime (hours)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell component="th" scope="row">
                      {formatDate(row.timestamp)}
                    </TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={row.status === 'on' ? 'On' : (row.status === 'off' ? 'Off' : 'Error')} 
                        color={row.status === 'on' ? 'success' : (row.status === 'off' ? 'default' : 'error')}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">{row.runtime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </>
    );
  };
  
  // Render stat cards
  const renderStatCards = () => {
    if (!chartData.stats) return null;
    
    const stats = chartData.stats;
    
    if (dataType === 'sensor') {
      return (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Minimum Value
                </Typography>
                <Typography variant="h4" component="div">
                  {stats.min} {stats.unit}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Maximum Value
                </Typography>
                <Typography variant="h4" component="div">
                  {stats.max} {stats.unit}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Average Value
                </Typography>
                <Typography variant="h4" component="div">
                  {stats.avg} {stats.unit}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    } else {
      const runStats = chartData.stats;
      
      return (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Runtime
                </Typography>
                <Typography variant="h4" component="div">
                  {runStats.totalOn} hours
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Runtime Ratio
                </Typography>
                <Typography variant="h4" component="div">
                  {(runStats.totalOn / (parseFloat(runStats.totalOn) + parseFloat(runStats.totalOff)) * 100).toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Data Analysis
        </Typography>
        <Typography variant="body2" color="textSecondary">
          View historical data and trend analysis for sensors and actuators
        </Typography>
      </Box>

      {/* Filter conditions */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Data Type</InputLabel>
              <Select
                value={dataType}
                label="Data Type"
                onChange={(e) => setDataType(e.target.value)}
              >
                <MenuItem value="sensor">Sensor Data</MenuItem>
                <MenuItem value="actuator">Actuator Data</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {dataType === 'sensor' ? (
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sensor Type</InputLabel>
                <Select
                  value={sensorType}
                  label="Sensor Type"
                  onChange={(e) => setSensorType(e.target.value)}
                >
                  {SENSOR_TYPES.map(type => (
                    <MenuItem key={type.id} value={type.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ mr: 1, color: type.color }}>{type.icon}</Box>
                        {type.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          ) : (
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Actuator Type</InputLabel>
                <Select
                  value={actuatorType}
                  label="Actuator Type"
                  onChange={(e) => setActuatorType(e.target.value)}
                >
                  {ACTUATOR_TYPES.map(type => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="24h">Last 24 hours</MenuItem>
                <MenuItem value="7d">Last 7 days</MenuItem>
                <MenuItem value="30d">Last 30 days</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Button 
              variant="contained" 
              fullWidth
              onClick={loadData}
              startIcon={<DateRangeIcon />}
            >
              Apply Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading message */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Stat cards */}
      {!loading && !error && (
        <Box sx={{ mb: 4 }}>
          {renderStatCards()}
        </Box>
      )}

      {/* Chart content */}
      {!loading && !error && (
        <Paper sx={{ p: 3 }}>
          {dataType === 'sensor' ? renderSensorChart() : renderActuatorChart()}
        </Paper>
      )}
    </Container>
  );
};

export default Analytics; 