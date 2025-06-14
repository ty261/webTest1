import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button, 
  Chip, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon,
  Refresh as RefreshIcon, 
  Edit as EditIcon,
  Delete as DeleteIcon,
  PowerSettingsNew as PowerIcon,
  FilterList as FilterIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { actuatorAPI } from '../services/api';
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
  'on': { color: 'success', label: 'On' },
  'off': { color: 'default', label: 'Off' },
  'low': { color: 'info', label: 'Low' },
  'medium': { color: 'primary', label: 'Medium' },
  'high': { color: 'warning', label: 'High' },
  'auto': { color: 'secondary', label: 'Auto' },
  'dim': { color: 'info', label: 'Dim' },
  'bright': { color: 'warning', label: 'Bright' },
  'open': { color: 'success', label: 'Open' },
  'closed': { color: 'default', label: 'Closed' },
  'half': { color: 'info', label: 'Half open' },
  'error': { color: 'error', label: 'Error' }
};

// Actuator mode names
const MODE_NAMES = {
  'manual': 'Manual Mode',
  'automatic': 'Automatic Mode'
};

const Actuators = () => {
  const navigate = useNavigate();
  const [actuators, setActuators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    status: '',
    onlyActive: false
  });
  const { actuatorData } = useSocket();

  // Get actuator list
  const fetchActuators = async () => {
    setLoading(true);
    setError(null); // 清除之前的错误
    
    try {
      const response = await actuatorAPI.getAllActuators();
      console.log('获取执行器响应:', response);
      
      // 检查API响应格式并获取数据
      if (response && response.success) {
        // 直接从后端API响应中获取数据数组，response.data不再嵌套
        const data = response.data || [];
        console.log('设置执行器数据:', data);
        console.log('使用模拟数据成功'); // 添加调试日志
        
        if (data.length === 0) {
          console.log('没有找到执行器数据');
        }
        
        setActuators(data);
        setError(null);
      } else {
        // 处理API返回的错误信息
        const errorMsg = (response && response.message) ? response.message : '获取执行器列表失败';
        console.error('API错误:', errorMsg);
        setError(errorMsg);
        setActuators([]); // 清空执行器列表
      }
    } catch (err) {
      console.error('获取执行器列表失败:', err);
      setError('获取执行器列表失败，请稍后再试');
      setActuators([]); // 清空执行器列表
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActuators();
  }, []);
  
  // 使用SocketContext中的执行器数据更新UI
  useEffect(() => {
    if (Object.keys(actuatorData).length === 0 || actuators.length === 0) return;
    
    let hasUpdates = false;
    const updatedActuators = [...actuators];
    
    // 遍历所有Socket执行器数据
    Object.values(actuatorData).forEach(socketActuator => {
      // 寻找匹配的执行器
      const matchingActuators = updatedActuators.filter(
        actuator => actuator.type === socketActuator.type && 
                    actuator.location.toLowerCase() === socketActuator.location.toLowerCase()
      );
      
      // 更新匹配的执行器状态
      if (matchingActuators.length > 0) {
        matchingActuators.forEach(actuator => {
          actuator.status = socketActuator.state;
          actuator.last_control_time = new Date(socketActuator.timestamp * 1000).toISOString();
          actuator.is_active = true; // 收到数据意味着执行器处于活动状态
          hasUpdates = true;
        });
      }
    });
    
    // 只有当有更新时才设置状态
    if (hasUpdates) {
      setActuators(updatedActuators);
    }
  }, [actuatorData, actuators]);

  // Control actuator
  const handleControlActuator = async (id, action, currentStatus) => {
    try {
      await actuatorAPI.controlActuator(id, { action });
      
      // Update local state to avoid reloading
      const updatedActuators = actuators.map(a => 
        a.id === id ? {
          ...a, 
          status: action, 
          last_control_time: new Date().toISOString()
        } : a
      );
      
      // Set the updated actuators in state
      setActuators(updatedActuators);
      
      // No need to save to localStorage here as it's already handled in the API
    } catch (err) {
      console.error('Failed to control actuator:', err);
      setError('Operation failed, please try again later');
    }
  };

  // Open actuator details page
  const handleViewDetails = (id) => {
    navigate(`/actuators/${id}`);
  };

  // Apply filters
  const applyFilters = (actuatorsList) => {
    return actuatorsList.filter(actuator => {
      if (filters.onlyActive && !actuator.is_active) return false;
      if (filters.type && actuator.type !== filters.type) return false;
      if (filters.location && actuator.location !== filters.location) return false;
      if (filters.status && actuator.status !== filters.status) return false;
      return true;
    });
  };

  // Get available locations list (unique)
  const availableLocations = [...new Set(actuators.map(a => a.location))];
  // Get available types list (unique)
  const availableTypes = [...new Set(actuators.map(a => a.type))];
  // Get available statuses list (unique)
  const availableStatuses = [...new Set(actuators.map(a => a.status))];

  const filteredActuators = applyFilters(actuators);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">Actuator Management</Typography>
        <Box>
          <IconButton 
            color="primary" 
            onClick={() => setFilterOpen(true)}
            sx={{ mr: 1 }}
          >
            <FilterIcon />
          </IconButton>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={fetchActuators}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/actuators/new')}
          >
            Add Actuator
          </Button>
        </Box>
      </Box>

      {error && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      ) : filteredActuators.length === 0 ? (
        <Box textAlign="center" py={5}>
          <Typography variant="body1">
            No actuators match the current filters
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredActuators.map((actuator) => (
            <Grid item xs={12} sm={6} md={4} key={actuator.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column'
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6" component="h2">
                      {actuator.name}
                    </Typography>
                    <Chip 
                      label={STATUS_STYLES[actuator.status]?.label || actuator.status} 
                      color={STATUS_STYLES[actuator.status]?.color || 'default'}
                      size="small"
                    />
                  </Box>
                  <Typography color="textSecondary" gutterBottom>
                    {ACTUATOR_TYPE_NAMES[actuator.type] || actuator.type}
                  </Typography>
                  <Typography variant="body2" component="p" gutterBottom>
                    Location: {actuator.location}
                  </Typography>
                  <Typography variant="body2" component="p" gutterBottom>
                    Mode: {MODE_NAMES[actuator.mode] || actuator.mode}
                  </Typography>
                  {actuator.last_control_time && (
                    <Typography variant="caption" component="p" color="textSecondary">
                      Last control: {new Date(actuator.last_control_time).toLocaleString()}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    variant={actuator.status === 'on' ? 'contained' : 'outlined'}
                    color={actuator.status === 'on' ? 'error' : 'success'}
                    startIcon={<PowerIcon />}
                    onClick={() => handleControlActuator(actuator.id, actuator.status === 'on' ? 'off' : 'on')}
                    disabled={!actuator.is_active}
                  >
                    {actuator.status === 'on' ? 'Turn Off' : 'Turn On'}
                  </Button>
                  <Button 
                    size="small" 
                    onClick={() => handleViewDetails(actuator.id)}
                    endIcon={<SettingsIcon />}
                  >
                    Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Filter dialog */}
      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)}>
        <DialogTitle>Filter Actuators</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Actuator Type</InputLabel>
            <Select
              value={filters.type}
              label="Actuator Type"
              onChange={(e) => setFilters({...filters, type: e.target.value})}
            >
              <MenuItem value="">All</MenuItem>
              {availableTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {ACTUATOR_TYPE_NAMES[type] || type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Location</InputLabel>
            <Select
              value={filters.location}
              label="Location"
              onChange={(e) => setFilters({...filters, location: e.target.value})}
            >
              <MenuItem value="">All</MenuItem>
              {availableLocations.map(location => (
                <MenuItem key={location} value={location}>{location}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <MenuItem value="">All</MenuItem>
              {availableStatuses.map(status => (
                <MenuItem key={status} value={status}>
                  {STATUS_STYLES[status]?.label || status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch 
                checked={filters.onlyActive} 
                onChange={(e) => setFilters({...filters, onlyActive: e.target.checked})}
              />
            }
            label="Show only active actuators"
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setFilters({
              type: '',
              location: '',
              status: '',
              onlyActive: false
            });
          }}>
            Reset
          </Button>
          <Button onClick={() => setFilterOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Actuators; 