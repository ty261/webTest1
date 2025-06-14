import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Paper, 
  Divider, 
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tab,
  Tabs,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  Slider,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  PowerSettingsNew as PowerIcon,
  History as HistoryIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  SettingsBackupRestore as ResetIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  ErrorOutline as ErrorOutlineIcon,
  DateRange as DateRangeIcon,
  Opacity as HumidityIcon,
  Thermostat as TemperatureIcon,
  Air as FanIcon,
  WbSunny as LightIcon,
  WaterDrop as WaterIcon
} from '@mui/icons-material';
import { actuatorAPI } from '../services/api';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { useSocket } from '../contexts/SocketContext';

// Actuator type mapping
const ACTUATOR_TYPE_NAMES = {
  'irrigation': 'Irrigation System',
  'ventilation': 'Ventilation System',
  'lighting': 'Lighting System',
  'heating': 'Heating System',
  'cooling': 'Cooling System', 
  'curtain': 'Curtain System',
  'nutrient': 'Nutrient System',
  'water_pump': 'Water Pump',
  'fan': 'Fan',
  'humidifier': 'Humidifier',
  'pump': 'Pump'
};

// Actuator status styles and labels
const STATUS_STYLES = {
  'on': { color: 'primary', label: 'On' },
  'off': { color: 'default', label: 'Off' },
  'low': { color: 'info', label: 'Low' },
  'medium': { color: 'primary', label: 'Medium' },
  'high': { color: 'warning', label: 'High' },
  'auto': { color: 'secondary', label: 'Auto' },
  'dim': { color: 'info', label: 'Dim' },
  'bright': { color: 'warning', label: 'Bright' },
  'open': { color: 'primary', label: 'Open' },
  'closed': { color: 'default', label: 'Closed' },
  'half': { color: 'info', label: 'Half open' },
  'error': { color: 'error', label: 'Error' }
};

// Sensor type mapping
const SENSOR_TYPE_NAMES = {
  'temperature': 'Temperature',
  'humidity': 'Humidity',
  'light': 'Light',
  'soil_moisture': 'Soil Moisture',
  'co2': 'CO2',
  'ph': 'pH Value',
  'water_level': 'Water Level'
};

// Condition type mapping
const CONDITION_TYPE_NAMES = {
  'gt': 'Greater than',
  'lt': 'Less than',
  'eq': 'Equal to',
  'gte': 'Greater than or equal to',
  'lte': 'Less than or equal to',
  'change': 'Change'
};

// Tab definition
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`actuator-tabpanel-${index}`}
      aria-labelledby={`actuator-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// Get actuator icon based on type
const getActuatorIcon = (type) => {
  switch(type) {
    case 'fan': return <FanIcon color="info" fontSize="large" />;
    case 'lighting': return <LightIcon color="warning" fontSize="large" />;
    case 'humidifier': return <HumidityIcon color="primary" fontSize="large" />;
    case 'irrigation':
    case 'water_pump':
    case 'pump': return <WaterIcon color="primary" fontSize="large" />;
    case 'heating': return <TemperatureIcon color="error" fontSize="large" />;
    default: return <SettingsIcon color="action" fontSize="large" />;
  }
};

// Format date string
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Generate mock historical data for demo purposes
const generateMockHistory = (actuatorType, days) => {
  const history = [];
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate history points throughout the day
    for (let hour of [8, 12, 16, 20]) {
      const dataPoint = new Date(date);
      dataPoint.setHours(hour, 0, 0);
      
      // Each day has a 80% chance of being turned on at some point
      const isOn = Math.random() < 0.8;
      
      // For fans, generate speed data
      let parameters = {};
      if (actuatorType === 'fan') {
        parameters.speed = Math.floor(Math.random() * 5) + 1;
      } else if (actuatorType === 'lighting') {
        parameters.brightness = Math.floor(Math.random() * 100);
      } else if (actuatorType === 'irrigation' || actuatorType === 'pump' || actuatorType === 'water_pump') {
        parameters.flow_rate = Math.floor(Math.random() * 90) + 10;
      }
      
      history.push({
        timestamp: dataPoint.toISOString(),
        status: isOn ? 'on' : 'off',
        parameters: parameters
      });
    }
  }
  
  return history;
};

const ActuatorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [actuator, setActuator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [logs, setLogs] = useState([]);
  const [allowedStates, setAllowedStates] = useState(['on', 'off']);
  const [autoRuleDialogOpen, setAutoRuleDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    sensor_type: '',
    condition: 'gt',
    value: 0,
    action: 'on',
    parameters: {}
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [parameterEdit, setParameterEdit] = useState({});
  const [chartData, setChartData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [statistics, setStatistics] = useState({
    onTime: 0,
    offTime: 0,
    activationsToday: 0,
    averageActivationDuration: 0,
    lastActivation: null
  });
  const { actuatorData } = useSocket() || { actuatorData: {} };

  // Get actuator details
  const fetchActuatorDetail = async () => {
    setLoading(true);
    try {
      const response = await actuatorAPI.getActuator(id);
      
      // Check if response is valid
      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to fetch actuator data');
      }
      
      const data = response.data;
      
      // Verify data is not null or undefined
      if (!data) {
        throw new Error('Actuator data is empty');
      }
      
      console.log('Actuator data loaded:', data);
      
      setActuator(data);
      setEditData({
        name: data.name || '',
        location: data.location || '',
        is_active: data.is_active || false,
        mode: data.mode || 'manual',
        mqtt_topic: data.mqtt_topic || ''
      });
      
      try {
        // Get allowed states
        const allowedStatesResponse = await actuatorAPI.getActuatorStatuses(id);
        if (allowedStatesResponse && allowedStatesResponse.success) {
          setAllowedStates(allowedStatesResponse.data || ['on', 'off']);
        }
      } catch (statesErr) {
        console.error('Failed to get actuator status options:', statesErr);
        // Don't fail - just use defaults
        setAllowedStates(['on', 'off']);
      }
      
      try {
        // Get actuator logs
        const logsResponse = await actuatorAPI.getActuatorLogs(id);
        if (logsResponse && logsResponse.success) {
          setLogs(logsResponse.data || []);
        }
      } catch (logsErr) {
        console.error('Failed to get actuator logs:', logsErr);
        // Don't fail - just use empty logs
        setLogs([]);
      }
      
      // Generate historical data for chart visualization
      const mockHistory = data.history || generateMockHistory(data.type, 30);
      setHistoryData(mockHistory);
      
      // Prepare chart data
      prepareChartData(mockHistory);
      
      // Calculate statistics
      calculateStatistics(mockHistory, data.status);
      
      setError(null);
    } catch (err) {
      console.error('Failed to get actuator details:', err);
      setError(err.message || 'Failed to get actuator details, please try again later');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActuatorDetail();
  }, [id]);

  // Update from Socket data if available
  useEffect(() => {
    if (!actuator || Object.keys(actuatorData).length === 0) return;
    
    // Find matching actuator data
    Object.values(actuatorData).forEach(socketActuator => {
      if (socketActuator.type === actuator.type && 
          socketActuator.location.toLowerCase() === actuator.location.toLowerCase()) {
        
        setActuator(prev => ({
          ...prev,
          status: socketActuator.status,
          last_control_time: new Date().toISOString()
        }));
      }
    });
  }, [actuatorData, actuator]);

  // Prepare chart data for visualization
  const prepareChartData = (history) => {
    if (!history || history.length === 0) return;
    
    // Get the most recent 7 days of data
    const recentHistory = history.slice(-28);
    
    // Transform to chart format
    const formattedData = recentHistory.map(item => ({
      timestamp: new Date(item.timestamp),
      date: new Date(item.timestamp).toLocaleDateString(),
      time: new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      status: item.status === 'on' ? 1 : 0,
      ...(item.parameters || {})
    }));
    
    setChartData(formattedData);
  };

  // Calculate usage statistics
  const calculateStatistics = (history, currentStatus) => {
    if (!history || history.length === 0) return;
    
    // Today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter logs from today
    const todayLogs = history.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= today;
    });
    
    // Count activations today (on to off transitions)
    let activationsToday = 0;
    let lastStatus = null;
    todayLogs.forEach(log => {
      if (lastStatus === 'off' && log.status === 'on') {
        activationsToday++;
      }
      lastStatus = log.status;
    });
    
    // Calculate percentage of time on vs off over the last 7 days
    const last7days = new Date();
    last7days.setDate(last7days.getDate() - 7);
    
    const last7daysLogs = history.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= last7days;
    });
    
    let totalOnMilliseconds = 0;
    let totalTimeMilliseconds = 0;
    
    if (last7daysLogs.length > 0) {
      // Sort by timestamp
      const sortedLogs = [...last7daysLogs].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );
      
      let prevLog = null;
      
      sortedLogs.forEach(log => {
        if (prevLog) {
          const currentTime = new Date(log.timestamp).getTime();
          const prevTime = new Date(prevLog.timestamp).getTime();
          const timeDiff = currentTime - prevTime;
          
          totalTimeMilliseconds += timeDiff;
          if (prevLog.status === 'on') {
            totalOnMilliseconds += timeDiff;
          }
        }
        prevLog = log;
      });
    }
    
    // Calculate on/off percentages
    const onPercentage = totalTimeMilliseconds > 0 
      ? Math.round((totalOnMilliseconds / totalTimeMilliseconds) * 100) 
      : 0;
    
    const offPercentage = 100 - onPercentage;
    
    // Find the last activation time
    const lastActivation = history
      .filter(log => log.status === 'on')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    
    setStatistics({
      onTime: onPercentage,
      offTime: offPercentage,
      activationsToday,
      averageActivationDuration: totalOnMilliseconds > 0 && activationsToday > 0 
        ? Math.round((totalOnMilliseconds / activationsToday) / (1000 * 60)) 
        : 0,
      lastActivation: lastActivation?.timestamp || null
    });
  };

  // Control actuator
  const handleControlActuator = async (action) => {
    try {
      const response = await actuatorAPI.controlActuator(id, { action });
      
      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to control actuator');
      }
      
      // Update status
      setActuator(prev => ({
        ...prev, 
        status: action,
        last_control_time: new Date().toISOString()
      }));
      
      // Show success message briefly
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // Refresh logs
      try {
        const logsResponse = await actuatorAPI.getActuatorLogs(id);
        if (logsResponse && logsResponse.success) {
          setLogs(logsResponse.data || []);
        }
      } catch (logsErr) {
        console.error('Failed to refresh logs:', logsErr);
        // Don't fail for logs refresh
      }
    } catch (err) {
      console.error('Failed to control actuator:', err);
      setError(err.message || 'Operation failed, please try again later');
    }
  };

  const handleSaveChanges = async () => {
    setSaveLoading(true);
    try {
      const response = await actuatorAPI.updateActuator(id, editData);
      
      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to update actuator');
      }
      
      // Update status
      setActuator(prev => ({
        ...prev,
        ...editData
      }));
      setEditMode(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update actuator:', err);
      setError(err.message || 'Update failed, please try again later');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAddAutoRule = async () => {
    if (!newRule.sensor_type || !newRule.condition) {
      setError('Please complete the automatic control rule information');
      return;
    }

    try {
      const autoRules = { ...(actuator.auto_rules || {}) };
      autoRules[newRule.sensor_type] = {
        [newRule.condition]: parseFloat(newRule.value),
        action: newRule.action,
        parameters: newRule.parameters
      };

      const response = await actuatorAPI.updateAutoRules(id, autoRules);
      
      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to update automatic rules');
      }
      
      // Update status
      setActuator(prev => ({
        ...prev,
        auto_rules: autoRules
      }));
      setAutoRuleDialogOpen(false);
      setNewRule({
        sensor_type: '',
        condition: 'gt',
        value: 0,
        action: 'on',
        parameters: {}
      });
      
      // Show success message briefly
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update automatic control rules:', err);
      setError(err.message || 'Update rule failed, please try again later');
    }
  };

  const handleRemoveAutoRule = async (sensorType) => {
    try {
      const autoRules = { ...(actuator.auto_rules || {}) };
      delete autoRules[sensorType];
      
      const response = await actuatorAPI.updateAutoRules(id, autoRules);
      
      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to remove automatic rule');
      }
      
      // Update status
      setActuator(prev => ({
        ...prev,
        auto_rules: autoRules
      }));
      
      // Show success message briefly
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to remove automatic control rule:', err);
      setError(err.message || 'Failed to remove rule, please try again later');
    }
  };

  const handleEditParameters = async () => {
    try {
      const response = await actuatorAPI.updateParameters(id, parameterEdit);
      
      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to update parameters');
      }
      
      // Update status
      setActuator(prev => ({
        ...prev,
        parameters: {...prev.parameters, ...parameterEdit}
      }));
      setParameterEdit({});
      
      // Show success message briefly
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update parameters:', err);
      setError(err.message || 'Update parameters failed, please try again later');
    }
  };

  const getParameterFields = () => {
    if (!actuator || !actuator.parameters) return null;
    
    const parameters = actuator.parameters;
    
    switch(actuator.type) {
      case 'fan':
        return (
          <>
            <Typography variant="subtitle2" gutterBottom>Fan Speed</Typography>
            <Box sx={{ px: 2, pb: 2 }}>
              <Slider
                value={parameterEdit.speed || parameters.speed || 0}
                min={0}
                max={parameters.max_speed || 5}
                step={1}
                marks
                valueLabelDisplay="auto"
                onChange={(_, value) => setParameterEdit({...parameterEdit, speed: value})}
              />
            </Box>
            <FormControl fullWidth margin="normal">
              <InputLabel>Direction</InputLabel>
              <Select
                value={parameterEdit.direction || parameters.direction || 'forward'}
                onChange={(e) => setParameterEdit({...parameterEdit, direction: e.target.value})}
              >
                <MenuItem value="forward">Forward</MenuItem>
                <MenuItem value="reverse">Reverse</MenuItem>
              </Select>
            </FormControl>
          </>
        );
      case 'lighting':
        return (
          <>
            <Typography variant="subtitle2" gutterBottom>Brightness</Typography>
            <Box sx={{ px: 2, pb: 2 }}>
              <Slider
                value={parameterEdit.brightness || parameters.brightness || 0}
                min={0}
                max={100}
                valueLabelDisplay="auto"
                onChange={(_, value) => setParameterEdit({...parameterEdit, brightness: value})}
              />
            </Box>
            <Typography variant="subtitle2" gutterBottom>Color Temperature (K)</Typography>
            <Box sx={{ px: 2, pb: 2 }}>
              <Slider
                value={parameterEdit.color_temp || parameters.color_temp || 3000}
                min={2000}
                max={6500}
                step={100}
                valueLabelDisplay="auto"
                onChange={(_, value) => setParameterEdit({...parameterEdit, color_temp: value})}
              />
            </Box>
          </>
        );
      case 'irrigation':
      case 'water_pump':
      case 'pump':
        return (
          <>
            <Typography variant="subtitle2" gutterBottom>Flow Rate (%)</Typography>
            <Box sx={{ px: 2, pb: 2 }}>
              <Slider
                value={parameterEdit.flow_rate || parameters.flow_rate || 100}
                min={10}
                max={100}
                valueLabelDisplay="auto"
                onChange={(_, value) => setParameterEdit({...parameterEdit, flow_rate: value})}
              />
            </Box>
          </>
        );
      case 'humidifier':
        return (
          <>
            <Typography variant="subtitle2" gutterBottom>Humidity Intensity</Typography>
            <Box sx={{ px: 2, pb: 2 }}>
              <Slider
                value={parameterEdit.intensity || parameters.intensity || 0}
                min={0}
                max={parameters.max_intensity || 10}
                step={1}
                marks
                valueLabelDisplay="auto"
                onChange={(_, value) => setParameterEdit({...parameterEdit, intensity: value})}
              />
            </Box>
          </>
        );
      default:
        return (
          <Typography variant="body2">No parameters available for this actuator type</Typography>
        );
    }
  };

  // Get rule parameter fields based on actuator type
  const getRuleParameterFields = (actuatorType, actionValue) => {
    switch(actuatorType) {
      case 'fan':
        return (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Fan Speed</InputLabel>
              <Select
                value={newRule.parameters.speed || ''}
                onChange={(e) => setNewRule({
                  ...newRule, 
                  parameters: {...newRule.parameters, speed: parseInt(e.target.value)}
                })}
              >
                {[0, 1, 2, 3, 4, 5].map(speed => (
                  <MenuItem key={speed} value={speed}>{speed}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        );
      case 'lighting':
        return (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="Brightness"
              type="number"
              value={newRule.parameters.brightness || ''}
              onChange={(e) => setNewRule({
                ...newRule, 
                parameters: {...newRule.parameters, brightness: parseInt(e.target.value)}
              })}
              InputProps={{ inputProps: { min: 0, max: 100 } }}
            />
          </>
        );
      default:
        return null;
    }
  };

  // Tab switch handling
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Render auto rules
  const renderAutoRules = () => {
    if (!actuator || !actuator.auto_rules || Object.keys(actuator.auto_rules).length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          No automatic control rules yet, please add one
        </Typography>
      );
    }

    return Object.entries(actuator.auto_rules).map(([sensorType, rule]) => {
      const condition = Object.keys(rule)[0];
      if (!condition) return null;
      
      const value = rule[condition];
      const action = rule.action;
      const parameters = rule.parameters || {};
      
      return (
        <Card key={sensorType} sx={{ mb: 2 }}>
          <CardHeader
            title={`${SENSOR_TYPE_NAMES[sensorType] || sensorType} ${CONDITION_TYPE_NAMES[condition] || condition} ${value}`}
            subheader={`Action: ${STATUS_STYLES[action]?.label || action}`}
            action={
              <IconButton onClick={() => handleRemoveAutoRule(sensorType)}>
                <DeleteIcon />
              </IconButton>
            }
          />
          {Object.keys(parameters).length > 0 && (
            <CardContent>
              <Typography variant="body2">Parameter Settings:</Typography>
              <Box sx={{ mt: 1 }}>
                {Object.entries(parameters).map(([key, value]) => (
                  <Chip 
                    key={key} 
                    label={`${key}: ${value}`} 
                    size="small" 
                    sx={{ mr: 1, mb: 1 }} 
                  />
                ))}
              </Box>
            </CardContent>
          )}
        </Card>
      );
    });
  };

  // Render operation logs
  const renderLogs = () => {
    if (logs.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          No operation records
        </Typography>
      );
    }

    return logs.map(log => {
      const date = new Date(log.timestamp);
      const formattedDate = date.toLocaleString();
      
      return (
        <Card key={log.id} sx={{ mb: 2 }}>
          <CardHeader
            title={log.message}
            subheader={formattedDate}
            avatar={
              <Chip 
                label={STATUS_STYLES[log.status]?.label || log.status} 
                color={STATUS_STYLES[log.status]?.color === 'default' ? 'default' : STATUS_STYLES[log.status]?.color || 'primary'} 
                size="small" 
              />
            }
          />
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              {`Changed from ${STATUS_STYLES[log.previous_state]?.label || log.previous_state} to ${STATUS_STYLES[log.status]?.label || log.status}`}
            </Typography>
            {log.parameters && Object.keys(log.parameters).length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">Parameter changes:</Typography>
                {Object.entries(log.parameters).map(([key, value]) => (
                  <Chip 
                    key={key} 
                    label={`${key}: ${value}`} 
                    size="small" 
                    sx={{ mr: 1, mt: 1 }} 
                  />
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      );
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/actuators')}
            sx={{ mt: 2 }}
          >
            Back to Actuator List
          </Button>
        </Box>
      </Container>
    );
  }

  if (!actuator) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="warning">Actuator information not found</Alert>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/actuators')}
            sx={{ mt: 2 }}
          >
            Back to Actuator List
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Button 
              variant="outlined" 
              startIcon={<ArrowBackIcon />} 
              onClick={() => navigate('/actuators')}
            >
              Back
            </Button>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" component="h1">
              Actuator Details
            </Typography>
          </Grid>
          <Grid item>
            <Chip 
              label={STATUS_STYLES[actuator.status]?.label || actuator.status} 
              color={STATUS_STYLES[actuator.status]?.color === 'default' ? 'default' : STATUS_STYLES[actuator.status]?.color || 'primary'} 
              size="medium"
            />
          </Grid>
        </Grid>
      </Box>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>Saved successfully</Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="Actuator detail tabs">
          <Tab label="Overview" />
          <Tab label="Control Panel" />
          <Tab label="Automatic Rules" />
          <Tab label="Operation History" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Basic Information Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getActuatorIcon(actuator.type)}
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h5" component="h2">
                      {actuator.name}
                    </Typography>
                    <Chip 
                      label={actuator.is_active ? 'Enabled' : 'Disabled'} 
                      color={actuator.is_active ? 'primary' : 'error'}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Type</Typography>
                    <Typography variant="body1">{ACTUATOR_TYPE_NAMES[actuator.type] || actuator.type}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Location</Typography>
                    <Typography variant="body1">{actuator.location}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Typography variant="body1">{STATUS_STYLES[actuator.status]?.label || actuator.status}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Mode</Typography>
                    <Typography variant="body1">{actuator.mode === 'auto' ? 'Automatic' : 'Manual'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">MQTT Topic</Typography>
                    <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>{actuator.mqtt_topic}</Typography>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {allowedStates.map(state => (
                    <Button
                      key={state}
                      variant={actuator.status === state ? "contained" : "outlined"}
                      color={STATUS_STYLES[state]?.color === 'default' ? 'inherit' : STATUS_STYLES[state]?.color || 'primary'}
                      onClick={() => handleControlActuator(state)}
                      size="small"
                    >
                      {STATUS_STYLES[state]?.label || state}
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Technical Information Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Technical Information
                </Typography>
                
                <List disablePadding>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText 
                      primary="Model" 
                      secondary={actuator.model || `Generic ${ACTUATOR_TYPE_NAMES[actuator.type] || actuator.type}`} 
                    />
                  </ListItem>
                  <Divider component="li" />
                  
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText 
                      primary="Manufacturer" 
                      secondary={actuator.manufacturer || "Smart Farm Systems"} 
                    />
                  </ListItem>
                  <Divider component="li" />
                  
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText 
                      primary="Installation Date" 
                      secondary={formatDate(actuator.created_at)} 
                    />
                  </ListItem>
                  <Divider component="li" />
                  
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText 
                      primary="Last Maintenance" 
                      secondary={actuator.maintenance_date ? formatDate(actuator.maintenance_date) : "Not available"} 
                    />
                  </ListItem>
                  <Divider component="li" />
                  
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText 
                      primary="Firmware Version" 
                      secondary={actuator.firmware_version || "1.0.0"} 
                    />
                  </ListItem>
                  <Divider component="li" />
                  
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText 
                      primary="Power Consumption" 
                      secondary={`${actuator.power_consumption || (actuator.type === 'fan' ? '15-45' : actuator.type === 'lighting' ? '20-100' : '10-30')} watts`} 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Usage Statistics Card */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Usage Statistics
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Typography variant="body2" color="text.secondary">On Time (Last 7 Days)</Typography>
                      <Typography variant="h4" color="primary">{statistics.onTime}%</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Typography variant="body2" color="text.secondary">Off Time (Last 7 Days)</Typography>
                      <Typography variant="h4" color="text.secondary">{statistics.offTime}%</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Typography variant="body2" color="text.secondary">Activations Today</Typography>
                      <Typography variant="h4" color="success.main">{statistics.activationsToday}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Typography variant="body2" color="text.secondary">Avg. Duration</Typography>
                      <Typography variant="h4" color="info.main">{statistics.averageActivationDuration} min</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Historical data chart */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Operation History
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
                          formatter={(value, name) => {
                            if (name === 'status') return [value === 1 ? 'On' : 'Off', 'Status'];
                            return [value, name];
                          }}
                          labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
                        />
                        <Legend />
                        <Line 
                          type="stepAfter" 
                          dataKey="status" 
                          stroke="#2196f3" 
                          activeDot={{ r: 8 }} 
                          name="Status"
                          strokeWidth={2}
                        />
                        {actuator.type === 'fan' && (
                          <Line 
                            type="monotone" 
                            dataKey="speed" 
                            stroke="#4caf50" 
                            name="Speed"
                            dot={{ r: 3 }}
                          />
                        )}
                        {actuator.type === 'lighting' && (
                          <Line 
                            type="monotone" 
                            dataKey="brightness" 
                            stroke="#ff9800" 
                            name="Brightness"
                            dot={{ r: 3 }}
                          />
                        )}
                        {(actuator.type === 'pump' || actuator.type === 'irrigation' || actuator.type === 'water_pump') && (
                          <Line 
                            type="monotone" 
                            dataKey="flow_rate" 
                            stroke="#9c27b0" 
                            name="Flow Rate"
                            dot={{ r: 3 }}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">No historical data available</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Recent operations table */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Operations
                </Typography>
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Source</TableCell>
                        <TableCell>Parameters</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {logs.slice(0, 10).map((log, index) => (
                        <TableRow key={index}>
                          <TableCell component="th" scope="row">
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={STATUS_STYLES[log.status]?.label || log.status} 
                              color={STATUS_STYLES[log.status]?.color === 'default' ? 'default' : STATUS_STYLES[log.status]?.color || 'primary'} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>{log.source || 'manual'}</TableCell>
                          <TableCell>
                            {log.parameters && Object.keys(log.parameters).length > 0 ? (
                              Object.entries(log.parameters).map(([key, value]) => (
                                <Chip 
                                  key={key} 
                                  label={`${key}: ${value}`} 
                                  size="small" 
                                  sx={{ mr: 0.5, mb: 0.5 }} 
                                />
                              ))
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Control Panel Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Status Control</Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {allowedStates.map(state => (
                  <Button
                    key={state}
                    variant={actuator.status === state ? "contained" : "outlined"}
                    color={STATUS_STYLES[state]?.color === 'default' ? 'inherit' : STATUS_STYLES[state]?.color || 'primary'}
                    onClick={() => handleControlActuator(state)}
                    sx={{ minWidth: '100px' }}
                  >
                    {STATUS_STYLES[state]?.label || state}
                  </Button>
                ))}
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Parameter Settings</Typography>
              <Divider sx={{ mb: 3 }} />
              
              {!actuator.parameters || Object.keys(actuator.parameters).length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  This actuator has no parameter settings
                </Typography>
              ) : (
                <>
                  {getParameterFields()}
                  
                  {Object.keys(parameterEdit).length > 0 && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button 
                        variant="outlined" 
                        onClick={() => setParameterEdit({})} 
                        sx={{ mr: 1 }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="contained" 
                        onClick={handleEditParameters}
                      >
                        Apply Parameters
                      </Button>
                    </Box>
                  )}
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Automatic Rules Tab */}
      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Automatic Control Rules</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={() => setAutoRuleDialogOpen(true)}
            >
              Add Rule
            </Button>
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          {renderAutoRules()}
        </Paper>
        
        {/* Add Auto Rule Dialog */}
        <Dialog open={autoRuleDialogOpen} onClose={() => setAutoRuleDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Automatic Control Rule</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel>Sensor Type</InputLabel>
              <Select
                value={newRule.sensor_type || ''}
                onChange={(e) => setNewRule({...newRule, sensor_type: e.target.value})}
              >
                {Object.entries(SENSOR_TYPE_NAMES).map(([key, value]) => (
                  <MenuItem key={key} value={key}>{value}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Condition</InputLabel>
              <Select
                value={newRule.condition || 'gt'}
                onChange={(e) => setNewRule({...newRule, condition: e.target.value})}
              >
                {Object.entries(CONDITION_TYPE_NAMES).map(([key, value]) => (
                  <MenuItem key={key} value={key}>{value}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              margin="normal"
              label="Value"
              type="number"
              value={newRule.value || ''}
              onChange={(e) => setNewRule({...newRule, value: e.target.value})}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Action</InputLabel>
              <Select
                value={newRule.action || ''}
                onChange={(e) => setNewRule({...newRule, action: e.target.value})}
              >
                {allowedStates.map(state => (
                  <MenuItem key={state} value={state}>
                    {STATUS_STYLES[state]?.label || state}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Show parameter settings based on actuator type and action */}
            {newRule.action && getRuleParameterFields(actuator.type, newRule.action)}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAutoRuleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddAutoRule} variant="contained">Add</Button>
          </DialogActions>
        </Dialog>
      </TabPanel>

      {/* Operation Logs Tab */}
      <TabPanel value={tabValue} index={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Operation Records</Typography>
          <Divider sx={{ mb: 3 }} />
          
          {logs.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Parameters</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={STATUS_STYLES[log.status]?.label || log.status} 
                          color={STATUS_STYLES[log.status]?.color === 'default' ? 'default' : STATUS_STYLES[log.status]?.color || 'primary'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{log.message}</TableCell>
                      <TableCell>{log.source || 'manual'}</TableCell>
                      <TableCell>
                        {log.parameters && Object.keys(log.parameters).length > 0 ? (
                          Object.entries(log.parameters).map(([key, value]) => (
                            <Chip 
                              key={key} 
                              label={`${key}: ${value}`} 
                              size="small" 
                              sx={{ mr: 0.5, mb: 0.5 }} 
                            />
                          ))
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No operation records available
            </Typography>
          )}
        </Paper>
      </TabPanel>
      
      {/* Action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<SettingsIcon />}
        >
          Configuration
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
          onClick={() => {
            setTabValue(0);
            setEditMode(true);
          }}
        >
          Edit Actuator
        </Button>
      </Box>
    </Container>
  );
};

export default ActuatorDetail; 