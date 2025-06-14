import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Divider,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Thermostat as TemperatureIcon,
  Opacity as HumidityIcon,
  WbSunny as LightIcon,
  Terrain as SoilIcon,
  Power as PowerIcon,
  ForestOutlined as EcoIcon,
  Speed as SpeedIcon,
  Air,
  Opacity,
  WbSunny,
} from '@mui/icons-material';
import { dashboardAPI } from '../services/api';
import { SENSOR_TYPES, ACTUATOR_TYPES } from '../config';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { sensorData, actuatorData, socket, lastMessage } = useSocket();
  
  // 调试信息 - 添加到DOM以便查看
  useEffect(() => {
    console.log('Socket连接状态:', socket ? 'Connected' : 'Disconnected');
    console.log('当前传感器数据:', sensorData);
    console.log('最后接收的消息:', lastMessage);
  }, [socket, sensorData, lastMessage]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await dashboardAPI.getSummary();
        console.log('从API获取的仪表板数据:', response);
        
        // 确保我们正确处理API返回格式
        if (response && response.success) {
          console.log('成功获取仪表盘数据:', response.data);
          
          // 确保添加一个初始化的statuses对象，即使API没有返回该字段
          if (response.data.actuators && !response.data.actuators.statuses) {
            response.data.actuators.statuses = {};
          }
          
          // 确保添加一个初始化的latest_readings对象，即使API没有返回该字段
          if (response.data.sensors && !response.data.sensors.latest_readings) {
            response.data.sensors.latest_readings = {};
          }
          
          setDashboardData(response.data);
        } else {
          console.error('API返回格式错误:', response);
          setError('Failed to load dashboard data: Invalid API response');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Refresh data every 30 seconds (可以考虑移除这个轮询，因为我们已经有实时Socket数据)
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // 当收到新的传感器数据时，更新仪表板数据
  useEffect(() => {
    if (!dashboardData || Object.keys(sensorData).length === 0) return;

    console.log('尝试用Socket数据更新仪表板:', sensorData);
    const updatedReadings = { ...dashboardData.sensors.latest_readings };
    
    // 更新仪表板数据中的传感器读数
    Object.values(sensorData).forEach(sensor => {
      if (!updatedReadings[sensor.type]) {
        updatedReadings[sensor.type] = {
          value: sensor.value,
          unit: sensor.unit,
          sensor_location: sensor.location,
          timestamp: sensor.timestamp * 1000 // 转换为毫秒
        };
        console.log(`添加新传感器数据: ${sensor.type} = ${sensor.value}${sensor.unit}`);
      } else {
        // 只有当新数据的时间戳更晚时才更新
        const currentTimestamp = updatedReadings[sensor.type].timestamp;
        const newTimestamp = typeof sensor.timestamp === 'number' ? sensor.timestamp * 1000 : new Date(sensor.timestamp).getTime();
        
        if (newTimestamp > currentTimestamp) {
          console.log(`更新传感器数据: ${sensor.type} 从 ${updatedReadings[sensor.type].value} 到 ${sensor.value}`);
          updatedReadings[sensor.type] = {
            value: sensor.value,
            unit: sensor.unit,
            sensor_location: sensor.location,
            timestamp: newTimestamp
          };
        }
      }
    });
    
    // 更新状态
    setDashboardData(prev => {
      console.log('更新仪表板状态:', updatedReadings);
      return {
        ...prev,
        sensors: {
          ...prev.sensors,
          latest_readings: updatedReadings
        }
      };
    });
  }, [sensorData, dashboardData]);
  
  // 当收到新的执行器数据时，更新仪表板数据
  useEffect(() => {
    if (!dashboardData || Object.keys(actuatorData).length === 0) return;
    
    // 制作执行器数据的深拷贝
    const updatedActuatorStatuses = JSON.parse(JSON.stringify(dashboardData.actuators.statuses));
    let actuatorStatusChanged = false;
    
    // 更新执行器状态
    Object.values(actuatorData).forEach(actuator => {
      const actuatorType = actuator.type;
      if (!updatedActuatorStatuses[actuatorType]) return;
      
      const currentState = actuator.state.toUpperCase();
      const prevOnCount = updatedActuatorStatuses[actuatorType].on;
      const prevOffCount = updatedActuatorStatuses[actuatorType].off;
      
      // 简化处理：如果收到执行器状态变更，我们只更新统计计数
      // 在实际应用中，你可能需要跟踪每个执行器的ID并更新其特定状态
      if (currentState === 'ON' && prevOffCount > 0) {
        updatedActuatorStatuses[actuatorType].on += 1;
        updatedActuatorStatuses[actuatorType].off -= 1;
        actuatorStatusChanged = true;
      } else if (currentState === 'OFF' && prevOnCount > 0) {
        updatedActuatorStatuses[actuatorType].off += 1;
        updatedActuatorStatuses[actuatorType].on -= 1;
        actuatorStatusChanged = true;
      }
    });
    
    // 只有当状态发生变化时才更新
    if (actuatorStatusChanged) {
      setDashboardData(prev => ({
        ...prev,
        actuators: {
          ...prev.actuators,
          statuses: updatedActuatorStatuses
        }
      }));
    }
  }, [actuatorData, dashboardData]);
  
  const getSensorIcon = (sensorType) => {
    switch (sensorType) {
      case 'temperature':
        return <TemperatureIcon color="error" fontSize="large" />;
      case 'humidity':
        return <HumidityIcon color="primary" fontSize="large" />;
      case 'light':
        return <LightIcon color="warning" fontSize="large" />;
      case 'soil_moisture':
        return <SoilIcon color="success" fontSize="large" />;
      default:
        return <SpeedIcon color="info" fontSize="large" />;
    }
  };
  
  const getActuatorIcon = (actuatorType) => {
    switch (actuatorType) {
      case 'irrigation':
        return <Opacity color="primary" fontSize="small" />;
      case 'ventilation':
        return <Air color="info" fontSize="small" />;
      case 'lighting':
        return <WbSunny color="warning" fontSize="small" />;
      default:
        return <PowerIcon color="secondary" fontSize="small" />;
    }
  };
  
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          p: 4,
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          p: 4,
        }}
      >
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Welcome to your Smart Farm monitoring and control system. Here's an overview of your farm's current status.
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Sensors Overview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Sensors Overview
            </Typography>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              {dashboardData?.sensors.active} active sensors out of {dashboardData?.sensors.total} total
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              {dashboardData?.sensors.latest_readings && 
                Object.keys(dashboardData.sensors.latest_readings).length > 0 ? (
                  Object.entries(dashboardData.sensors.latest_readings).map(([type, data]) => (
                    <Grid item xs={12} sm={6} key={type}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            {getSensorIcon(type)}
                            <Typography variant="subtitle1" sx={{ ml: 1 }}>
                              {SENSOR_TYPES.find(s => s.id === type)?.name || type}
                            </Typography>
                          </Box>
                          
                          <Typography variant="h4" component="div">
                            {data.value} {data.unit}
                          </Typography>
                          
                          <Typography variant="body2" color="textSecondary">
                            {data.sensor_location}
                          </Typography>
                          
                          <Typography variant="caption" color="textSecondary">
                            Last updated: {new Date(data.timestamp).toLocaleTimeString()}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button 
                            size="small" 
                            onClick={() => navigate('/sensors')}
                          >
                            View All Sensors
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Typography variant="body1" color="textSecondary" align="center">
                      No sensor data available
                    </Typography>
                  </Grid>
                )
              }
            </Grid>
          </Paper>
        </Grid>
        
        {/* Actuators Overview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Actuators Overview
            </Typography>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              {dashboardData?.actuators.active} active actuators out of {dashboardData?.actuators.total} total
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <List sx={{ width: '100%' }}>
              {dashboardData?.actuators.statuses && 
                Object.keys(dashboardData.actuators.statuses).length > 0 ? (
                  Object.entries(dashboardData.actuators.statuses).map(([type, data]) => (
                    <ListItem key={type}>
                      <ListItemIcon>
                        {getActuatorIcon(type)}
                      </ListItemIcon>
                      <ListItemText 
                        primary={ACTUATOR_TYPES.find(a => a.id === type)?.name || type}
                        secondary={`${data.on} ON, ${data.off} OFF, ${data.error || 0} ERROR`}
                      />
                      <Box>
                        <Chip 
                          label={`${data.on} ON`} 
                          size="small" 
                          color="success" 
                          variant="outlined"
                          sx={{ mr: 1 }}
                        />
                        <Chip 
                          label={`${data.off} OFF`} 
                          size="small" 
                          color="default" 
                          variant="outlined"
                        />
                      </Box>
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText 
                      primary="No actuator data available"
                    />
                  </ListItem>
                )
              }
            </List>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate('/actuators')}
              >
                Manage Actuators
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Recent Alerts */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Alerts
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <List sx={{ width: '100%' }}>
              <ListItem>
                <ListItemIcon>
                  <TemperatureIcon color="error" />
                </ListItemIcon>
                <ListItemText 
                  primary="Temperature Alert"
                  secondary="Greenhouse 1 temperature above threshold (30°C)"
                />
                <Chip 
                  label="10 min ago" 
                  size="small" 
                  color="error" 
                  variant="outlined"
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <SoilIcon color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="Soil Moisture Alert"
                  secondary="Field 2 soil moisture below threshold (15%)"
                />
                <Chip 
                  label="25 min ago" 
                  size="small" 
                  color="warning" 
                  variant="outlined"
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <EcoIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="System Notification"
                  secondary="Irrigation system in Zone 3 activated automatically"
                />
                <Chip 
                  label="45 min ago" 
                  size="small" 
                  color="info" 
                  variant="outlined"
                />
              </ListItem>
            </List>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => navigate('/alerts')}
              >
                View All Alerts
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 