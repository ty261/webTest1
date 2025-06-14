import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Tooltip,
  Divider,
  Snackbar,
  Alert,
  CardActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Refresh as RefreshIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { SENSOR_TYPES } from '../config';
import TemperatureIcon from '@mui/icons-material/Thermostat';
import HumidityIcon from '@mui/icons-material/Opacity';
import LightIcon from '@mui/icons-material/WbSunny';
import SoilIcon from '@mui/icons-material/Terrain';
import { sensorAPI } from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import AddSensorDialog from '../components/AddSensorDialog';

// Example API call, should be replaced with real API in actual project
const fetchSensors = async () => {
  try {
    // const response = await sensorAPI.getAllSensors();
    // return response.data;
    
    // 从localStorage获取保存的传感器数据
    const savedSensors = localStorage.getItem('smart_farm_sensors');
    
    // 如果有保存的数据，则使用它
    if (savedSensors) {
      return JSON.parse(savedSensors);
    }
    
    // 否则使用默认的mock数据
    const defaultSensors = [
      { id: 1, name: 'Temperature Sensor 1', type: 'temperature', location: 'Greenhouse 1', status: 'active', current_value: 24.5 },
      { id: 2, name: 'Humidity Sensor 1', type: 'humidity', location: 'Greenhouse 1', status: 'active', current_value: 65 },
      { id: 3, name: 'Light Sensor 1', type: 'light', location: 'Greenhouse 2', status: 'active', current_value: 2500 },
      { id: 4, name: 'Soil Moisture Sensor 1', type: 'soil_moisture', location: 'Greenhouse 1', status: 'inactive', current_value: 35 },
    ];
    
    // 将默认数据保存到localStorage
    localStorage.setItem('smart_farm_sensors', JSON.stringify(defaultSensors));
    
    return defaultSensors;
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    throw new Error('Failed to get sensor data');
  }
};

const Sensors = () => {
  const navigate = useNavigate();
  const [sensors, setSensors] = useState([]);
  const [filteredSensors, setFilteredSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const { sensorData } = useSocket();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const getStatusText = (status) => {
    switch(status) {
      case 'active': return 'Running';
      case 'inactive': return 'Offline';
      case 'maintenance': return 'Maintenance';
      default: return 'Unknown';
    }
  };
  
  const getTypeInfo = (type) => {
    return SENSOR_TYPES.find(sensor => sensor.id === type) || { name: 'Unknown', unit: '' };
  };
  
  const getSensorIcon = (type) => {
    switch(type) {
      case 'temperature': return <TemperatureIcon color="error" />;
      case 'humidity': return <HumidityIcon color="primary" />;
      case 'light': return <LightIcon color="warning" />;
      case 'soil_moisture': return <SoilIcon color="success" />;
      default: return null;
    }
  };
  
  useEffect(() => {
    const loadSensors = async () => {
      try {
        const data = await fetchSensors();
        setSensors(data);
        setFilteredSensors(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    loadSensors();
  }, []);
  
  // 使用SocketContext中的传感器数据更新当前传感器值
  useEffect(() => {
    if (Object.keys(sensorData).length === 0 || sensors.length === 0) return;
    
    // 创建传感器数据的新副本
    const updatedSensors = [...sensors];
    let hasUpdates = false;
    
    // 遍历所有的Socket传感器数据
    Object.values(sensorData).forEach(socketSensor => {
      // 寻找与Socket数据匹配的传感器
      const matchingSensors = updatedSensors.filter(
        sensor => sensor.type === socketSensor.type && 
                  sensor.location.toLowerCase() === socketSensor.location.toLowerCase()
      );
      
      // 更新匹配的传感器值
      if (matchingSensors.length > 0) {
        matchingSensors.forEach(sensor => {
          sensor.current_value = socketSensor.value;
          sensor.status = 'active'; // 收到数据意味着传感器处于活动状态
          hasUpdates = true;
        });
      }
    });
    
    // 只有当有更新时才设置状态
    if (hasUpdates) {
      setSensors(updatedSensors);
      
      // 保存更新后的数据到localStorage
      localStorage.setItem('smart_farm_sensors', JSON.stringify(updatedSensors));
      
      // 如果有搜索过滤，也要更新过滤的传感器列表
      if (searchText.trim()) {
        handleSearch({ target: { value: searchText } });
      } else {
        setFilteredSensors(updatedSensors);
      }
    }
  }, [sensorData, sensors, searchText]);
  
  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchText(searchValue);
    
    if (!searchValue.trim()) {
      setFilteredSensors(sensors);
      return;
    }
    
    const filtered = sensors.filter(sensor => 
      sensor.name.toLowerCase().includes(searchValue) || 
      sensor.location.toLowerCase().includes(searchValue) ||
      getTypeInfo(sensor.type).name.toLowerCase().includes(searchValue)
    );
    
    setFilteredSensors(filtered);
  };
  
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await fetchSensors();
      setSensors(data);
      setFilteredSensors(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddSensor = (newSensor) => {
    // Add the new sensor to the sensors list
    const updatedSensors = [...sensors, newSensor];
    setSensors(updatedSensors);
    
    // 保存更新后的传感器列表到localStorage
    localStorage.setItem('smart_farm_sensors', JSON.stringify(updatedSensors));
    
    // Also update the filtered list if no search filter is applied
    if (!searchText.trim()) {
      setFilteredSensors(updatedSensors);
    } else {
      // Apply the current search filter to the updated sensors list
      handleSearch({ target: { value: searchText } });
    }
    
    // Show success notification
    setSnackbar({
      open: true,
      message: `Sensor "${newSensor.name}" has been successfully added`,
      severity: 'success'
    });
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };
  
  const handleDeleteSensor = (id) => {
    // Confirm deletion
    if (window.confirm('Are you sure you want to delete this sensor?')) {
      // Filter out the sensor to be deleted
      const updatedSensors = sensors.filter(sensor => sensor.id !== id);
      setSensors(updatedSensors);
      
      // Save updated sensor list to localStorage
      localStorage.setItem('smart_farm_sensors', JSON.stringify(updatedSensors));
      
      // Update filtered sensors list
      if (searchText.trim()) {
        const filtered = updatedSensors.filter(sensor => 
          sensor.name.toLowerCase().includes(searchText.toLowerCase()) || 
          sensor.location.toLowerCase().includes(searchText.toLowerCase()) ||
          getTypeInfo(sensor.type).name.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredSensors(filtered);
      } else {
        setFilteredSensors(updatedSensors);
      }
      
      // Show success notification
      setSnackbar({
        open: true,
        message: 'Sensor successfully deleted',
        severity: 'success'
      });
    }
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
        <Typography color="error" gutterBottom>{error}</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleRefresh}
        >
          Retry
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Sensor Management
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => setAddDialogOpen(true)}
        >
          Add Sensor
        </Button>
      </Box>
      
      <Paper sx={{ mb: 4, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextField 
            value={searchText}
            onChange={handleSearch}
            placeholder="Search sensors..."
            variant="outlined"
            size="small"
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
      
      <Grid container spacing={3}>
        {filteredSensors.length > 0 ? (
          filteredSensors.map(sensor => {
            const typeInfo = getTypeInfo(sensor.type);
            return (
              <Grid item xs={12} sm={6} md={4} key={sensor.id}>
                <Card>
                  <CardActionArea onClick={() => navigate(`/sensors/${sensor.id}`)}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getSensorIcon(sensor.type)}
                          <Typography variant="h6" sx={{ ml: 1 }}>
                            {sensor.name}
                          </Typography>
                        </Box>
                        <Chip 
                          label={getStatusText(sensor.status)} 
                          color={sensor.status === 'active' ? 'success' : sensor.status === 'inactive' ? 'error' : 'warning'}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Type: {typeInfo.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Location: {sensor.location}
                      </Typography>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5">
                          {sensor.current_value} {typeInfo.unit}
                        </Typography>
                        <Button 
                          size="small" 
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation(); // 防止触发卡片的点击事件
                            navigate(`/sensors/${sensor.id}`);
                          }}
                        >
                          Details
                        </Button>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Tooltip title="Delete Sensor">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSensor(sensor.id);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            );
          })
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography>No matching sensors found</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
      
      {/* Add Sensor Dialog */}
      <AddSensorDialog 
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSensorAdded={handleAddSensor}
      />
      
      {/* Success Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Sensors; 