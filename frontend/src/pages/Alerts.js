import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Alert,
  Tooltip,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Done as DoneIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationIcon,
  NotificationsActive as NotificationActiveIcon,
  NotificationsOff as NotificationOffIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  DoneAll as DoneAllIcon,
  Visibility as VisibilityIcon,
  CheckCircleOutline as CheckCircleOutlineIcon
} from '@mui/icons-material';
import { alertsAPI } from '../services/api';
import AlertSettings from '../components/alerts/AlertSettings';

// Mock alert data generation
const generateMockAlerts = (count = 20) => {
  const alertTypes = [
    { type: 'temperature_high', message: 'Temperature too high', severity: 'high', icon: <WarningIcon />, color: 'error' },
    { type: 'temperature_low', message: 'Temperature too low', severity: 'medium', icon: <WarningIcon />, color: 'warning' },
    { type: 'humidity_high', message: 'Humidity too high', severity: 'medium', icon: <WarningIcon />, color: 'warning' },
    { type: 'humidity_low', message: 'Humidity too low', severity: 'medium', icon: <WarningIcon />, color: 'warning' },
    { type: 'soil_moisture_low', message: 'Soil moisture too low', severity: 'high', icon: <WarningIcon />, color: 'error' },
    { type: 'light_low', message: 'Insufficient light', severity: 'low', icon: <InfoIcon />, color: 'info' },
    { type: 'actuator_failure', message: 'Actuator failure', severity: 'high', icon: <ErrorIcon />, color: 'error' },
    { type: 'system_warning', message: 'System warning', severity: 'low', icon: <InfoIcon />, color: 'info' },
    { type: 'connection_lost', message: 'Connection lost', severity: 'medium', icon: <WarningIcon />, color: 'warning' },
    { type: 'power_warning', message: 'Power warning', severity: 'medium', icon: <WarningIcon />, color: 'warning' }
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

// TabPanel component for tab switching
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`alerts-tabpanel-${index}`}
      aria-labelledby={`alerts-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Alerts = () => {
  // State management
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [newAlertOpen, setNewAlertOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [tabValue, setTabValue] = useState(0); // Tab state

  // Load alert data
  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real project, API would be called
      // const response = await alertsAPI.getAll();
      // setAlerts(response.data.data);
      
      // Using mock data
      const mockAlerts = generateMockAlerts(50);
      setAlerts(mockAlerts);
    } catch (err) {
      console.error('Failed to get alert data:', err);
      setError('Failed to get alert data, please try again later');
    } finally {
      setLoading(false);
    }
  };

  // Initial loading
  useEffect(() => {
    fetchAlerts();
  }, []);

  // Auto refresh
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchAlerts();
      }, 30000); // Refresh every 30 seconds
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Filtering
  useEffect(() => {
    let result = [...alerts];
    
    // Search term filtering
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(alert => 
        alert.message.toLowerCase().includes(term) ||
        alert.location.toLowerCase().includes(term) ||
        alert.device.toLowerCase().includes(term) ||
        alert.details.toLowerCase().includes(term)
      );
    }
    
    // Severity filtering
    if (severityFilter !== 'all') {
      result = result.filter(alert => alert.severity === severityFilter);
    }
    
    // Status filtering
    if (statusFilter === 'unread') {
      result = result.filter(alert => !alert.is_read);
    } else if (statusFilter === 'read') {
      result = result.filter(alert => alert.is_read && !alert.is_acknowledged);
    } else if (statusFilter === 'acknowledged') {
      result = result.filter(alert => alert.is_acknowledged);
    }
    
    setFilteredAlerts(result);
  }, [alerts, searchTerm, severityFilter, statusFilter]);

  // Pagination handling
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Mark as read
  const handleMarkAsRead = async (id) => {
    try {
      // In a real project, API would be called
      // await alertsAPI.markAsRead(id);
      
      // Update local state
      setAlerts(alerts.map(alert => 
        alert.id === id ? { ...alert, is_read: true } : alert
      ));
    } catch (err) {
      console.error('Failed to mark alert as read:', err);
      setError('Operation failed, please try again later');
    }
  };

  // Mark as acknowledged
  const handleAcknowledge = async (id) => {
    try {
      // In a real project, API would be called
      // await alertsAPI.acknowledge(id);
      
      // Update local state
      setAlerts(alerts.map(alert => 
        alert.id === id ? { ...alert, is_read: true, is_acknowledged: true } : alert
      ));
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
      setError('Operation failed, please try again later');
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      // In a real project, batch API call would be made
      // await alertsAPI.markAllAsRead();
      
      // Update local state
      setAlerts(alerts.map(alert => ({ ...alert, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      setError('Operation failed, please try again later');
    }
  };

  // View details
  const handleViewDetails = (alert) => {
    setSelectedAlert(alert);
    setDetailsOpen(true);
  };

  // Close details dialog
  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };

  // Get severity info (color and label)
  const getSeverityInfo = (severity) => {
    if (severity === 'high') {
      return { color: 'error', label: 'Critical' };
    } else if (severity === 'medium') {
      return { color: 'warning', label: 'Warning' };
    } else if (severity === 'low') {
      return { color: 'info', label: 'Info' };
    } else {
      return { color: 'default', label: 'Unknown' };
    }
  };

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const alertTime = new Date(timestamp);
    
    // Calculate time difference (milliseconds)
    const diff = now.getTime() - alertTime.getTime();
    const diffSec = Math.floor(diff / 1000);
    const diffMin = Math.floor(diff / (1000 * 60));
    const diffHour = Math.floor(diff / (1000 * 60 * 60));
    const diffDay = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    // Display different formats based on time difference
    if (diffDay > 0) {
      return diffDay === 1 ? '1 day ago' : `${diffDay} days ago`;
    } else if (diffHour > 0) {
      return diffHour === 1 ? '1 hour ago' : `${diffHour} hours ago`;
    } else if (diffMin > 0) {
      return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
    } else if (diffSec >= 0) {
      return diffSec < 30 ? 'Just now' : `${diffSec} seconds ago`;
    }
    
    return 'Unknown time';
  };

  // Render alert statistics cards
  const renderAlertStats = () => {
    const totalAlerts = alerts.length;
    const unreadAlerts = alerts.filter(a => !a.is_read).length;
    const highSeverity = alerts.filter(a => a.severity === 'high').length;
    const mediumSeverity = alerts.filter(a => a.severity === 'medium').length;
    const lowSeverity = alerts.filter(a => a.severity === 'low').length;
    
    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography color="text.secondary" gutterBottom>
                  Total Alerts
                </Typography>
                <NotificationIcon color="primary" />
              </Box>
              <Typography variant="h4" component="div">
                {totalAlerts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unread: {unreadAlerts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography color="text.secondary" gutterBottom>
                  Critical Alerts
                </Typography>
                <WarningIcon color="error" />
              </Box>
              <Typography variant="h4" component="div">
                {highSeverity}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {((highSeverity / totalAlerts) * 100).toFixed(1)}% of total alerts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography color="text.secondary" gutterBottom>
                  Warning Alerts
                </Typography>
                <WarningIcon color="warning" />
              </Box>
              <Typography variant="h4" component="div">
                {mediumSeverity}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {((mediumSeverity / totalAlerts) * 100).toFixed(1)}% of total alerts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography color="text.secondary" gutterBottom>
                  Info Alerts
                </Typography>
                <InfoIcon color="info" />
              </Box>
              <Typography variant="h4" component="div">
                {lowSeverity}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {((lowSeverity / totalAlerts) * 100).toFixed(1)}% of total alerts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Render alerts tab content
  const renderAlertsTab = () => {
    return (
      <>
        {/* Alert statistics */}
        {renderAlertStats()}
        
        {/* Filter and toolbar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Severity</InputLabel>
                <Select
                  value={severityFilter}
                  label="Severity"
                  onChange={(e) => setSeverityFilter(e.target.value)}
                >
                  <MenuItem value="all">All Severities</MenuItem>
                  <MenuItem value="high">Critical</MenuItem>
                  <MenuItem value="medium">Warning</MenuItem>
                  <MenuItem value="low">Info</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="unread">Unread</MenuItem>
                  <MenuItem value="read">Read</MenuItem>
                  <MenuItem value="acknowledged">Acknowledged</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Mark all as read">
                  <IconButton
                    color="primary"
                    onClick={handleMarkAllAsRead}
                    disabled={alerts.every(a => a.is_read)}
                  >
                    <DoneAllIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={autoRefresh ? "Disable auto-refresh" : "Enable auto-refresh"}>
                  <IconButton
                    color={autoRefresh ? "primary" : "default"}
                    onClick={() => setAutoRefresh(!autoRefresh)}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Refresh now">
                  <IconButton onClick={fetchAlerts}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Alert list */}
        <Paper>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : filteredAlerts.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No alerts found matching your filters
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table sx={{ minWidth: 750 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Severity</TableCell>
                      <TableCell>Message</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Device</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAlerts
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((alert) => {
                        const severityInfo = getSeverityInfo(alert.severity);
                        
                        return (
                          <TableRow 
                            key={alert.id}
                            hover
                            sx={{ 
                              bgcolor: !alert.is_read ? 'action.hover' : 'inherit',
                              '&:last-child td, &:last-child th': { border: 0 }
                            }}
                          >
                            <TableCell>
                              <Chip 
                                icon={alert.icon} 
                                label={severityInfo.label}
                                color={severityInfo.color}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={!alert.is_read ? 'bold' : 'normal'}>
                                {alert.message}
                              </Typography>
                            </TableCell>
                            <TableCell>{alert.location}</TableCell>
                            <TableCell>{alert.device}</TableCell>
                            <TableCell>{formatTime(alert.timestamp)}</TableCell>
                            <TableCell align="right">
                              <Tooltip title="View details">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleViewDetails(alert)}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              {!alert.is_read && (
                                <Tooltip title="Mark as read">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleMarkAsRead(alert.id)}
                                  >
                                    <DoneIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              {alert.is_read && !alert.is_acknowledged && (
                                <Tooltip title="Acknowledge">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleAcknowledge(alert.id)}
                                  >
                                    <CheckCircleOutlineIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredAlerts.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </Paper>
      </>
    );
  };

  // Render settings tab content
  const renderSettingsTab = () => {
    return <AlertSettings />;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Alert Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View, filter, and manage system alerts
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ width: '100%', mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="Alert tabs"
          >
            <Tab 
              icon={<NotificationIcon />} 
              label="Alerts" 
              id="alerts-tab-0"
              aria-controls="alerts-tabpanel-0"
            />
            <Tab 
              icon={<SettingsIcon />} 
              label="Alert Settings" 
              id="alerts-tab-1"
              aria-controls="alerts-tabpanel-1"
            />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          {renderAlertsTab()}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {renderSettingsTab()}
        </TabPanel>
      </Box>

      {/* Alert details dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedAlert && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center">
                <Box mr={1}>
                  {selectedAlert.icon}
                </Box>
                Alert Details
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    {selectedAlert.message}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedAlert.details}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Severity" 
                        secondary={getSeverityInfo(selectedAlert.severity).label} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Location" 
                        secondary={selectedAlert.location} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Device" 
                        secondary={selectedAlert.device} 
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Time" 
                        secondary={new Date(selectedAlert.timestamp).toLocaleString()} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Status" 
                        secondary={
                          selectedAlert.is_acknowledged ? 'Acknowledged' : 
                          (selectedAlert.is_read ? 'Read' : 'Unread')
                        } 
                      />
                    </ListItem>
                    {selectedAlert.values && Object.keys(selectedAlert.values).length > 0 && (
                      <ListItem>
                        <ListItemText 
                          primary="Values" 
                          secondary={
                            <>
                              {Object.entries(selectedAlert.values).map(([key, value], idx) => (
                                <Box key={idx} component="span" mr={1}>
                                  {key}: {value}
                                </Box>
                              ))}
                            </>
                          } 
                        />
                      </ListItem>
                    )}
                  </List>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              {!selectedAlert.is_acknowledged && (
                <Button 
                  onClick={() => {
                    handleAcknowledge(selectedAlert.id);
                    handleCloseDetails();
                  }}
                  color="primary"
                  startIcon={<CheckCircleOutlineIcon />}
                >
                  Acknowledge
                </Button>
              )}
              <Button 
                onClick={handleCloseDetails}
                color="primary"
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Alerts; 