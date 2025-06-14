import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Slider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { alertAPI } from '../../services/api';

// Mock alert settings data
const mockAlertSettings = [
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

// Supported sensor types
const SENSOR_TYPES = [
  { id: 'temperature', name: 'Temperature', unit: '°C' },
  { id: 'humidity', name: 'Humidity', unit: '%' },
  { id: 'light', name: 'Light', unit: 'lux' },
  { id: 'soil_moisture', name: 'Soil Moisture', unit: '%' },
  { id: 'co2', name: 'CO2', unit: 'ppm' },
  { id: 'ph', name: 'pH Value', unit: '' },
  { id: 'water_level', name: 'Water Level', unit: '%' }
];

// Condition types
const CONDITIONS = [
  { id: 'gt', name: 'Greater Than' },
  { id: 'lt', name: 'Less Than' },
  { id: 'eq', name: 'Equal To' },
  { id: 'gte', name: 'Greater Than or Equal To' },
  { id: 'lte', name: 'Less Than or Equal To' }
];

// Severity levels
const SEVERITY_LEVELS = [
  { id: 'high', name: 'Critical', color: 'error' },
  { id: 'medium', name: 'Warning', color: 'warning' },
  { id: 'low', name: 'Information', color: 'info' }
];

// Notification methods
const NOTIFICATION_METHODS = [
  { id: 'app', name: 'In-App Notification' },
  { id: 'email', name: 'Email' },
  { id: 'sms', name: 'SMS' },
  { id: 'webhook', name: 'Webhook' }
];

// Default values by sensor type
const DEFAULT_THRESHOLD_VALUES = {
  temperature: { high: 30, low: 10 },
  humidity: { high: 85, low: 30 },
  light: { high: 50000, low: 1000 },
  soil_moisture: { high: 90, low: 20 },
  co2: { high: 1500, low: 300 },
  ph: { high: 8.5, low: 5.5 },
  water_level: { high: 90, low: 20 }
};

const AlertSettings = () => {
  // State management
  const [alertSettings, setAlertSettings] = useState([]);
  const [userPreferences, setUserPreferences] = useState({});
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [newSetting, setNewSetting] = useState({
    sensor_type: '',
    condition: 'gt',
    threshold: '',
    severity: 'medium',
    notification_method: ['app'],
    is_active: true
  });
  const [formMode, setFormMode] = useState('new'); // 'new' or 'edit'
  const [personalThresholds, setPersonalThresholds] = useState({});
  const [showPersonalForm, setShowPersonalForm] = useState(false);

  // Load alert settings
  const fetchAlertSettings = async () => {
    setLoading(true);
    try {
      // Get system thresholds
      const response = await alertAPI.getAlertThresholds();
      if (response && response.success) {
        setAlertSettings(response.data);
      } else {
        throw new Error("Failed to load alert thresholds");
      }
      
      // Load user preferences
      const prefsResponse = await alertAPI.getUserPreferences();
      if (prefsResponse && prefsResponse.success) {
        setUserPreferences(prefsResponse.data);
        
        // Initialize personal thresholds from preferences or create defaults
        if (prefsResponse.data.personalThresholds) {
          setPersonalThresholds(prefsResponse.data.personalThresholds);
        } else {
          // Create default personal thresholds for each sensor type
          const defaultPersonalThresholds = {};
          SENSOR_TYPES.forEach(sensorType => {
            defaultPersonalThresholds[sensorType.id] = { 
              high: DEFAULT_THRESHOLD_VALUES[sensorType.id].high,
              low: DEFAULT_THRESHOLD_VALUES[sensorType.id].low
            };
          });
          setPersonalThresholds(defaultPersonalThresholds);
        }
      } else {
        throw new Error("Failed to load user preferences");
      }
    } catch (err) {
      console.error('Failed to get alert settings:', err);
      setError('Failed to load alert settings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAlertSettings();
  }, []);

  // Add new alert setting
  const handleAddSetting = async () => {
    // Validate form
    if (!newSetting.sensor_type || !newSetting.threshold || !newSetting.notification_method.length) {
      setError('Please fill in all required fields.');
      return;
    }

    setSaveLoading(true);
    try {
      let response;
      
      if (formMode === 'new') {
        // Create new setting
        response = await alertAPI.createAlertThreshold(newSetting);
      } else {
        // Update existing setting
        response = await alertAPI.updateAlertThreshold(selectedSetting.id, newSetting);
      }
      
      if (response && response.success) {
        if (formMode === 'new') {
          setAlertSettings([...alertSettings, response.data]);
          // Reset form
          setNewSetting({
            sensor_type: '',
            condition: 'gt',
            threshold: '',
            severity: 'medium',
            notification_method: ['app'],
            is_active: true
          });
          setSuccess('Alert setting created successfully.');
        } else {
          // Edit mode - update existing setting
          const updatedSettings = alertSettings.map(setting => 
            setting.id === response.data.id ? response.data : setting
          );
          setAlertSettings(updatedSettings);
          setFormMode('new');
          setSelectedSetting(null);
          setSuccess('Alert setting updated successfully.');
        }
      } else {
        throw new Error(response?.message || "Failed to save alert setting");
      }
    } catch (err) {
      console.error('Failed to save alert setting:', err);
      setError(err.message || 'Save failed. Please try again later.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Edit existing alert setting
  const handleEditSetting = (setting) => {
    setSelectedSetting(setting);
    setNewSetting({...setting});
    setFormMode('edit');
  };

  // Delete alert setting
  const handleDeleteSetting = async (id) => {
    try {
      const response = await alertAPI.deleteAlertThreshold(id);
      
      if (response && response.success) {
        // Update local state
        setAlertSettings(alertSettings.filter(setting => setting.id !== id));
        setSuccess('Alert setting deleted successfully.');
        
        // If currently editing the deleted setting, reset form
        if (selectedSetting && selectedSetting.id === id) {
          setFormMode('new');
          setSelectedSetting(null);
          setNewSetting({
            sensor_type: '',
            condition: 'gt',
            threshold: '',
            severity: 'medium',
            notification_method: ['app'],
            is_active: true
          });
        }
      } else {
        throw new Error(response?.message || "Failed to delete alert setting");
      }
    } catch (err) {
      console.error('Failed to delete alert setting:', err);
      setError(err.message || 'Delete failed. Please try again later.');
    }
  };

  // Save user preferences
  const handleSaveUserPreferences = async () => {
    setSaveLoading(true);
    try {
      // Include personal thresholds in user preferences
      const prefsWithThresholds = {
        ...userPreferences,
        personalThresholds: personalThresholds
      };
      
      const response = await alertAPI.updateUserPreferences(prefsWithThresholds);
      
      if (response && response.success) {
        setSuccess('User preferences updated successfully.');
        setShowPersonalForm(false);
      } else {
        throw new Error(response?.message || "Failed to update user preferences");
      }
    } catch (err) {
      console.error('Failed to save user preferences:', err);
      setError(err.message || 'Update failed. Please try again later.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Handle changes to notification methods
  const handleNotificationMethodChange = (method) => {
    const methods = [...newSetting.notification_method];
    const index = methods.indexOf(method);
    
    if (index === -1) {
      methods.push(method);
    } else {
      methods.splice(index, 1);
    }
    
    setNewSetting({
      ...newSetting,
      notification_method: methods
    });
  };
  
  // Handle changes to personal threshold values
  const handlePersonalThresholdChange = (sensorType, threshold, value) => {
    setPersonalThresholds(prev => ({
      ...prev,
      [sensorType]: {
        ...prev[sensorType],
        [threshold]: value
      }
    }));
  };

  // Get sensor type info
  const getSensorTypeInfo = (typeId) => {
    return SENSOR_TYPES.find(type => type.id === typeId) || { name: 'Unknown', unit: '' };
  };

  // Render alert setting form
  const renderSettingForm = () => {
    return (
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {formMode === 'new' ? 'Create New Alert Setting' : 'Edit Alert Setting'}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Sensor Type</InputLabel>
              <Select
                value={newSetting.sensor_type}
                onChange={(e) => setNewSetting({...newSetting, sensor_type: e.target.value})}
              >
                {SENSOR_TYPES.map(type => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name} ({type.unit})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Condition</InputLabel>
              <Select
                value={newSetting.condition}
                onChange={(e) => setNewSetting({...newSetting, condition: e.target.value})}
              >
                {CONDITIONS.map(condition => (
                  <MenuItem key={condition.id} value={condition.id}>
                    {condition.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={`Threshold${newSetting.sensor_type ? ` (${getSensorTypeInfo(newSetting.sensor_type).unit})` : ''}`}
              type="number"
              value={newSetting.threshold}
              onChange={(e) => setNewSetting({...newSetting, threshold: e.target.value})}
              InputProps={{
                inputProps: { 
                  step: newSetting.sensor_type === 'ph' ? 0.1 : 1
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Severity</InputLabel>
              <Select
                value={newSetting.severity}
                onChange={(e) => setNewSetting({...newSetting, severity: e.target.value})}
              >
                {SEVERITY_LEVELS.map(level => (
                  <MenuItem key={level.id} value={level.id}>
                    {level.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Notification Methods</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {NOTIFICATION_METHODS.map(method => (
                <Chip
                  key={method.id}
                  label={method.name}
                  onClick={() => handleNotificationMethodChange(method.id)}
                  color={newSetting.notification_method.includes(method.id) ? 'primary' : 'default'}
                  variant={newSetting.notification_method.includes(method.id) ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={newSetting.is_active}
                  onChange={(e) => setNewSetting({...newSetting, is_active: e.target.checked})}
                />
              }
              label="Enable this alert setting"
            />
          </Grid>
          
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            {formMode === 'edit' && (
              <Button
                variant="outlined"
                onClick={() => {
                  setFormMode('new');
                  setSelectedSetting(null);
                  setNewSetting({
                    sensor_type: '',
                    condition: 'gt',
                    threshold: '',
                    severity: 'medium',
                    notification_method: ['app'],
                    is_active: true
                  });
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={formMode === 'new' ? <AddIcon /> : <SaveIcon />}
              onClick={handleAddSetting}
              disabled={saveLoading}
            >
              {saveLoading ? <CircularProgress size={24} /> : (formMode === 'new' ? 'Add Alert Setting' : 'Save Changes')}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  // Render personalized thresholds form
  const renderPersonalThresholdsForm = () => {
    return (
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Personalized Alert Thresholds
          </Typography>
          <Button 
            variant={showPersonalForm ? "outlined" : "contained"}
            color="primary"
            onClick={() => setShowPersonalForm(!showPersonalForm)}
            startIcon={showPersonalForm ? <CloseIcon /> : <PersonAddIcon />}
          >
            {showPersonalForm ? 'Cancel' : 'Customize Thresholds'}
          </Button>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        {showPersonalForm ? (
          <>
            <Typography variant="body2" color="text.secondary" paragraph>
              Customize alert thresholds based on your preferences. These values will be used when generating alerts specifically for you.
            </Typography>
            
            {SENSOR_TYPES.map(sensorType => (
              <Box key={sensorType.id} sx={{ mb: 4 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {sensorType.name} {sensorType.unit ? `(${sensorType.unit})` : ''}
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" gutterBottom>
                      High Threshold (Alert when above this value)
                    </Typography>
                    <Box sx={{ px: 2 }}>
                      <Slider
                        value={personalThresholds[sensorType.id]?.high || DEFAULT_THRESHOLD_VALUES[sensorType.id].high}
                        onChange={(_, value) => handlePersonalThresholdChange(sensorType.id, 'high', value)}
                        valueLabelDisplay="auto"
                        min={getMinMaxForSensorType(sensorType.id).min}
                        max={getMinMaxForSensorType(sensorType.id).max}
                        step={sensorType.id === 'ph' ? 0.1 : 1}
                        marks={[
                          { value: DEFAULT_THRESHOLD_VALUES[sensorType.id].high, label: 'Default' }
                        ]}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" gutterBottom>
                      Low Threshold (Alert when below this value)
                    </Typography>
                    <Box sx={{ px: 2 }}>
                      <Slider
                        value={personalThresholds[sensorType.id]?.low || DEFAULT_THRESHOLD_VALUES[sensorType.id].low}
                        onChange={(_, value) => handlePersonalThresholdChange(sensorType.id, 'low', value)}
                        valueLabelDisplay="auto"
                        min={getMinMaxForSensorType(sensorType.id).min}
                        max={getMinMaxForSensorType(sensorType.id).max}
                        step={sensorType.id === 'ph' ? 0.1 : 1}
                        marks={[
                          { value: DEFAULT_THRESHOLD_VALUES[sensorType.id].low, label: 'Default' }
                        ]}
                      />
                    </Box>
                  </Grid>
                </Grid>
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSaveUserPreferences}
                startIcon={<SaveIcon />}
                disabled={saveLoading}
              >
                {saveLoading ? <CircularProgress size={24} /> : 'Save Personal Thresholds'}
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" paragraph>
              You can customize alert thresholds to match your specific needs. Personalized thresholds will be used when generating alerts for you.
            </Typography>
            
            <Grid container spacing={2}>
              {SENSOR_TYPES.map(sensorType => {
                const personal = personalThresholds[sensorType.id] || {};
                const defaults = DEFAULT_THRESHOLD_VALUES[sensorType.id];
                const hasCustom = personal.high !== defaults.high || personal.low !== defaults.low;
                
                return (
                  <Grid item xs={12} md={6} lg={4} key={sensorType.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1">
                          {sensorType.name}
                          {hasCustom && (
                            <Chip
                              size="small"
                              label="Customized"
                              color="primary"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2">
                            High threshold: <strong>{personal.high || defaults.high}{sensorType.unit}</strong>
                          </Typography>
                          <Typography variant="body2">
                            Low threshold: <strong>{personal.low || defaults.low}{sensorType.unit}</strong>
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}
      </Paper>
    );
  };

  // Get min and max values for sensor type sliders
  const getMinMaxForSensorType = (sensorType) => {
    switch(sensorType) {
      case 'temperature':
        return { min: -10, max: 50 };
      case 'humidity':
        return { min: 0, max: 100 };
      case 'light':
        return { min: 0, max: 100000 };
      case 'soil_moisture':
        return { min: 0, max: 100 };
      case 'co2':
        return { min: 0, max: 5000 };
      case 'ph':
        return { min: 0, max: 14 };
      case 'water_level':
        return { min: 0, max: 100 };
      default:
        return { min: 0, max: 100 };
    }
  };

  // Render user preferences
  const renderUserPreferences = () => {
    return (
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>User Notification Preferences</Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={userPreferences.receive_email_notifications}
                  onChange={(e) => setUserPreferences({
                    ...userPreferences,
                    receive_email_notifications: e.target.checked
                  })}
                />
              }
              label="Receive Email Notifications"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={userPreferences.receive_sms_notifications}
                  onChange={(e) => setUserPreferences({
                    ...userPreferences,
                    receive_sms_notifications: e.target.checked
                  })}
                />
              }
              label="Receive SMS Notifications"
            />
          </Grid>
          
          {userPreferences.receive_email_notifications && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                value={userPreferences.email_address || ''}
                onChange={(e) => setUserPreferences({
                  ...userPreferences,
                  email_address: e.target.value
                })}
              />
            </Grid>
          )}
          
          {userPreferences.receive_sms_notifications && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={userPreferences.phone_number || ''}
                onChange={(e) => setUserPreferences({
                  ...userPreferences,
                  phone_number: e.target.value
                })}
              />
            </Grid>
          )}
          
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={userPreferences.mute_notifications}
                  onChange={(e) => setUserPreferences({
                    ...userPreferences,
                    mute_notifications: e.target.checked
                  })}
                />
              }
              label="Mute All Notifications"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={userPreferences.auto_acknowledge_low_severity}
                  onChange={(e) => setUserPreferences({
                    ...userPreferences,
                    auto_acknowledge_low_severity: e.target.checked
                  })}
                />
              }
              label="Auto-acknowledge Low Severity Alerts"
            />
          </Grid>
          
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveUserPreferences}
              disabled={saveLoading}
            >
              {saveLoading ? <CircularProgress size={24} /> : 'Save Preferences'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  // Render alert settings list
  const renderAlertSettingsList = () => {
    if (alertSettings.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">No alert settings found. Create your first one!</Typography>
        </Paper>
      );
    }
    
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>System Alert Settings</Typography>
        <Divider sx={{ mb: 3 }} />
        
        <List>
          {alertSettings.map(setting => {
            const sensorInfo = SENSOR_TYPES.find(s => s.id === setting.sensor_type) || { name: 'Unknown', unit: '' };
            const condition = CONDITIONS.find(c => c.id === setting.condition) || { name: 'Unknown' };
            const severity = SEVERITY_LEVELS.find(s => s.id === setting.severity) || { name: 'Unknown', color: 'default' };
            
            return (
              <ListItem key={setting.id} sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)', py: 2 }}>
                <Box sx={{ width: '100%' }}>
                  <Grid container alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle1">
                        {sensorInfo.name}
                        {!setting.is_active && <Chip label="Disabled" color="default" size="small" sx={{ ml: 1 }} />}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {condition.name} {setting.threshold} {sensorInfo.unit}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                      <Chip 
                        label={severity.name} 
                        color={severity.color === 'high' ? 'error' : severity.color === 'medium' ? 'warning' : 'info'} 
                        size="small" 
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {setting.notification_method.map(method => (
                          <Chip 
                            key={method} 
                            label={NOTIFICATION_METHODS.find(m => m.id === method)?.name || method} 
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton onClick={() => handleEditSetting(setting)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteSetting(setting.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              </ListItem>
            );
          })}
        </List>
      </Paper>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      {renderPersonalThresholdsForm()}
      
      {renderSettingForm()}
      
      {renderUserPreferences()}
      
      {renderAlertSettingsList()}
    </Box>
  );
};

export default AlertSettings; 