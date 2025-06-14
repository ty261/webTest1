import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tab,
  Tabs,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Language as LanguageIcon,
  Notifications as NotificationIcon,
  DataUsage as DataUsageIcon,
  Security as SecurityIcon,
  CloudUpload as CloudUploadIcon,
  WifiTethering as WifiIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { settingsAPI } from '../services/api';
import PropTypes from 'prop-types';
import { useAuth } from '../contexts/AuthContext';

// Mock system settings data
const mockSettings = {
  general: {
    farm_name: 'Smart Farm Demo System',
    language: 'en_US',
    time_zone: 'Asia/Shanghai',
    auto_update: true,
    units: {
      temperature: 'celsius',
      weight: 'kg',
      distance: 'm'
    }
  },
  data_management: {
    data_retention_days: 90,
    backup_enabled: true,
    backup_frequency: 'daily',
    backup_time: '02:00',
    auto_delete_old_data: true
  },
  network: {
    api_url: 'http://localhost:5000/api',
    mqtt_broker: 'mqtt://localhost:1883',
    mqtt_username: 'farm_user',
    mqtt_client_id: 'farm_web_client',
    connection_timeout: 30
  },
  notification: {
    enable_email: true,
    email_server: 'smtp.example.com',
    email_port: 587,
    email_username: 'notifications@example.com',
    admin_email: 'admin@example.com',
    enable_sms: false,
    sms_api_key: ''
  },
  security: {
    session_timeout: 30,
    two_factor_auth: false,
    user_activity_log: true,
    login_limit: true,
    max_login_attempts: 5
  }
};

// TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

const RegisteredUsers = () => {
  const [users, setUsers] = useState([]);
  const { useLocalStorage } = useAuth();
  
  useEffect(() => {
    const storedUsers = localStorage.getItem('smart_farm_registered_users');
    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers));
      } catch (e) {
        console.error('Failed to parse users data', e);
      }
    }
  }, []);
  
  if (!useLocalStorage || users.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        {useLocalStorage 
          ? '未找到本地注册的用户。本地存储模式已启用，注册的用户将保存在这里。' 
          : '本地存储模式未启用。应用正在尝试连接后端API。'}
      </Alert>
    );
  }
  
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        本地注册用户（{users.length}）
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>用户名</TableCell>
              <TableCell>邮箱</TableCell>
              <TableCell>注册时间</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

const Settings = () => {
  // State management
  const [settings, setSettings] = useState(mockSettings);
  const [editedSettings, setEditedSettings] = useState(mockSettings);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Load settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // In actual project, call API
        // const response = await settingsAPI.getAll();
        // setSettings(response.data.data);
        
        // Use mock data
        setSettings(mockSettings);
        setEditedSettings(mockSettings);
      } catch (err) {
        console.error('Failed to get system settings:', err);
        setError('Failed to load settings, please try again later');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Update settings
  const handleSaveSettings = async () => {
    setSaving(true);
    setError(null);
    try {
      // In actual project, call API
      // await settingsAPI.update(editedSettings);
      
      // Update local state
      setSettings(editedSettings);
      setSuccess('Settings saved successfully');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      console.error('Failed to save system settings:', err);
      setError('Save failed, please try again later');
    } finally {
      setSaving(false);
    }
  };
  
  // Handle form data changes
  const handleGeneralChange = (field, value) => {
    setEditedSettings({
      ...editedSettings,
      general: {
        ...editedSettings.general,
        [field]: value
      }
    });
  };
  
  const handleUnitsChange = (field, value) => {
    setEditedSettings({
      ...editedSettings,
      general: {
        ...editedSettings.general,
        units: {
          ...editedSettings.general.units,
          [field]: value
        }
      }
    });
  };
  
  const handleDataChange = (field, value) => {
    setEditedSettings({
      ...editedSettings,
      data_management: {
        ...editedSettings.data_management,
        [field]: value
      }
    });
  };
  
  const handleNetworkChange = (field, value) => {
    setEditedSettings({
      ...editedSettings,
      network: {
        ...editedSettings.network,
        [field]: value
      }
    });
  };
  
  const handleNotificationChange = (field, value) => {
    setEditedSettings({
      ...editedSettings,
      notification: {
        ...editedSettings.notification,
        [field]: value
      }
    });
  };
  
  const handleSecurityChange = (field, value) => {
    setEditedSettings({
      ...editedSettings,
      security: {
        ...editedSettings.security,
        [field]: value
      }
    });
  };

  // Reset to default settings
  const handleResetSettings = () => {
    setEditedSettings(settings);
  };

  // Render general settings tab
  const renderGeneralSettings = () => {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Basic Settings</Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Farm Name"
              value={editedSettings.general?.farm_name || ''}
              onChange={(e) => handleGeneralChange('farm_name', e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={editedSettings.general?.language || 'en_US'}
                label="Language"
                onChange={(e) => handleGeneralChange('language', e.target.value)}
              >
                <MenuItem value="zh_CN">Chinese (Simplified)</MenuItem>
                <MenuItem value="en_US">English</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Time Zone</InputLabel>
              <Select
                value={editedSettings.general?.time_zone || 'Asia/Shanghai'}
                label="Time Zone"
                onChange={(e) => handleGeneralChange('time_zone', e.target.value)}
              >
                <MenuItem value="Asia/Shanghai">China Standard Time (GMT+8)</MenuItem>
                <MenuItem value="UTC">Coordinated Universal Time (UTC)</MenuItem>
                <MenuItem value="America/New_York">US Eastern Time</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>Unit Settings</Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Temperature Unit</InputLabel>
              <Select
                value={editedSettings.general?.units?.temperature || 'celsius'}
                label="Temperature Unit"
                onChange={(e) => handleUnitsChange('temperature', e.target.value)}
              >
                <MenuItem value="celsius">Celsius (°C)</MenuItem>
                <MenuItem value="fahrenheit">Fahrenheit (°F)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Weight Unit</InputLabel>
              <Select
                value={editedSettings.general?.units?.weight || 'kg'}
                label="Weight Unit"
                onChange={(e) => handleUnitsChange('weight', e.target.value)}
              >
                <MenuItem value="kg">Kilograms (kg)</MenuItem>
                <MenuItem value="lb">Pounds (lb)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Distance Unit</InputLabel>
              <Select
                value={editedSettings.general?.units?.distance || 'm'}
                label="Distance Unit"
                onChange={(e) => handleUnitsChange('distance', e.target.value)}
              >
                <MenuItem value="m">Meters (m)</MenuItem>
                <MenuItem value="ft">Feet (ft)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={editedSettings.general?.auto_update || false}
                  onChange={(e) => handleGeneralChange('auto_update', e.target.checked)}
                />
              }
              label="Automatic System Updates"
            />
          </Grid>
        </Grid>
      </Paper>
    );
  };

  // Render data management tab
  const renderDataSettings = () => {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Data Management</Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Data Retention Days"
              value={editedSettings.data_management?.data_retention_days || 90}
              onChange={(e) => handleDataChange('data_retention_days', parseInt(e.target.value))}
              InputProps={{ inputProps: { min: 1, max: 365 } }}
              helperText="Set data retention period. Data older than this will be automatically cleaned up."
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={editedSettings.data_management?.backup_enabled || false}
                  onChange={(e) => handleDataChange('backup_enabled', e.target.checked)}
                />
              }
              label="Enable Automatic Backup"
            />
          </Grid>
          
          {editedSettings.data_management?.backup_enabled && (
            <>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Backup Frequency</InputLabel>
                  <Select
                    value={editedSettings.data_management?.backup_frequency || 'daily'}
                    label="Backup Frequency"
                    onChange={(e) => handleDataChange('backup_frequency', e.target.value)}
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Backup Time"
                  type="time"
                  value={editedSettings.data_management?.backup_time || '02:00'}
                  onChange={(e) => handleDataChange('backup_time', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                />
              </Grid>
            </>
          )}
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={editedSettings.data_management?.auto_delete_old_data || false}
                  onChange={(e) => handleDataChange('auto_delete_old_data', e.target.checked)}
                />
              }
              label="Automatically Delete Expired Data"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<CloudUploadIcon />}
              >
                Backup Now
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  // Render network settings tab
  const renderNetworkSettings = () => {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Network Settings</Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="API Server URL"
              value={editedSettings.network?.api_url || ''}
              onChange={(e) => handleNetworkChange('api_url', e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="MQTT Broker Address"
              value={editedSettings.network?.mqtt_broker || ''}
              onChange={(e) => handleNetworkChange('mqtt_broker', e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="MQTT Username"
              value={editedSettings.network?.mqtt_username || ''}
              onChange={(e) => handleNetworkChange('mqtt_username', e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="MQTT Client ID"
              value={editedSettings.network?.mqtt_client_id || ''}
              onChange={(e) => handleNetworkChange('mqtt_client_id', e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Connection Timeout (sec)"
              value={editedSettings.network?.connection_timeout || 30}
              onChange={(e) => handleNetworkChange('connection_timeout', parseInt(e.target.value))}
              InputProps={{ inputProps: { min: 5, max: 300 } }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<WifiIcon />}
              >
                Test Connection
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  // Render notification settings tab
  const renderNotificationSettings = () => {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Notification Settings</Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={editedSettings.notification?.enable_email || false}
                  onChange={(e) => handleNotificationChange('enable_email', e.target.checked)}
                />
              }
              label="Enable Email Notifications"
            />
          </Grid>
          
          {editedSettings.notification?.enable_email && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP Server"
                  value={editedSettings.notification?.email_server || ''}
                  onChange={(e) => handleNotificationChange('email_server', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP Port"
                  type="number"
                  value={editedSettings.notification?.email_port || 587}
                  onChange={(e) => handleNotificationChange('email_port', parseInt(e.target.value))}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Username"
                  value={editedSettings.notification?.email_username || ''}
                  onChange={(e) => handleNotificationChange('email_username', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Admin Email"
                  value={editedSettings.notification?.admin_email || ''}
                  onChange={(e) => handleNotificationChange('admin_email', e.target.value)}
                />
              </Grid>
            </>
          )}
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={editedSettings.notification?.enable_sms || false}
                  onChange={(e) => handleNotificationChange('enable_sms', e.target.checked)}
                />
              }
              label="Enable SMS Notifications"
            />
          </Grid>
          
          {editedSettings.notification?.enable_sms && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMS API Key"
                value={editedSettings.notification?.sms_api_key || ''}
                onChange={(e) => handleNotificationChange('sms_api_key', e.target.value)}
              />
            </Grid>
          )}
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
              <Button
                variant="outlined"
                color="primary"
              >
                Send Test Notification
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    );
  };
  
  // Render security settings tab
  const renderSecuritySettings = () => {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Security Settings</Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Session Timeout (minutes)"
              value={editedSettings.security?.session_timeout || 30}
              onChange={(e) => handleSecurityChange('session_timeout', parseInt(e.target.value))}
              InputProps={{ inputProps: { min: 5, max: 1440 } }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={editedSettings.security?.two_factor_auth || false}
                  onChange={(e) => handleSecurityChange('two_factor_auth', e.target.checked)}
                />
              }
              label="Enable Two-Factor Authentication"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={editedSettings.security?.user_activity_log || true}
                  onChange={(e) => handleSecurityChange('user_activity_log', e.target.checked)}
                />
              }
              label="Log User Activity"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={editedSettings.security?.login_limit || true}
                  onChange={(e) => handleSecurityChange('login_limit', e.target.checked)}
                />
              }
              label="Limit Failed Login Attempts"
            />
          </Grid>
          
          {editedSettings.security?.login_limit && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Max Failed Attempts"
                value={editedSettings.security?.max_login_attempts || 5}
                onChange={(e) => handleSecurityChange('max_login_attempts', parseInt(e.target.value))}
                InputProps={{ inputProps: { min: 3, max: 10 } }}
              />
            </Grid>
          )}
        </Grid>
      </Paper>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        System Settings
      </Typography>
      
      {/* Alert messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      {/* Tabs */}
      <Paper sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="System settings tabs"
          >
            <Tab icon={<SettingsIcon />} label="Basic Settings" />
            <Tab icon={<DataUsageIcon />} label="Data Management" />
            <Tab icon={<WifiIcon />} label="Network Settings" />
            <Tab icon={<NotificationIcon />} label="Notification Settings" />
            <Tab icon={<SecurityIcon />} label="Security Settings" />
          </Tabs>
        </Box>
        
        {/* Tab content */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <TabPanel value={tabValue} index={0}>
            {renderGeneralSettings()}
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            {renderDataSettings()}
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            {renderNetworkSettings()}
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            {renderNotificationSettings()}
          </TabPanel>
          <TabPanel value={tabValue} index={4}>
            {renderSecuritySettings()}
          </TabPanel>
        </Box>
        
        {/* Action buttons */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            sx={{ mr: 2 }}
            onClick={handleResetSettings}
          >
            Reset
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSaveSettings}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Save Settings'}
          </Button>
        </Box>
      </Paper>
      
      <Accordion sx={{ mt: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">本地用户管理</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <RegisteredUsers />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default Settings; 