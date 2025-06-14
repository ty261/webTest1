import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  FormHelperText,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { SENSOR_TYPES } from '../config';
import { sensorAPI } from '../services/api';

const AddSensorDialog = ({ open, onClose, onSensorAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    location: '',
    model: '',
    manufacturer: '',
    mqtt_topic: '',
    current_value: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [autoGenerateTopic, setAutoGenerateTopic] = useState(true);

  // Function to generate MQTT topic based on sensor type and location
  const generateMqttTopic = (type, location) => {
    if (!type || !location) return '';
    
    // Format: farm/sensors/{type}/{sanitized_location}
    const sanitizedLocation = location.trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
    
    return `farm/sensors/${type}/${sanitizedLocation}`;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.type) newErrors.type = 'Type is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.mqtt_topic.trim()) newErrors.mqtt_topic = 'MQTT Topic is required';
    if (formData.current_value === '' || isNaN(formData.current_value)) newErrors.current_value = 'Valid reading value is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      
      // Automatically generate MQTT topic when type or location changes
      if (autoGenerateTopic && (name === 'type' || name === 'location')) {
        const topicType = name === 'type' ? value : prev.type;
        const topicLocation = name === 'location' ? value : prev.location;
        updated.mqtt_topic = generateMqttTopic(topicType, topicLocation);
      }
      
      return updated;
    });
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Function to toggle auto-generate topic
  const handleTopicChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      mqtt_topic: value
    }));
    
    // If user manually edits the topic, turn off auto-generation
    if (autoGenerateTopic && value !== generateMqttTopic(formData.type, formData.location)) {
      setAutoGenerateTopic(false);
    }
    
    // Clear error when field is modified
    if (errors.mqtt_topic) {
      setErrors(prev => ({
        ...prev,
        mqtt_topic: undefined
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // In a real application, this would call the actual API
      // const response = await sensorAPI.addSensor(formData);
      
      // Using mock implementation for now
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate a successful response
      const newSensor = {
        id: Math.floor(Math.random() * 1000) + 5, // Random ID for mock
        ...formData,
        current_value: parseFloat(formData.current_value),
        status: 'active',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        calibration_date: new Date().toISOString(),
        last_reading: {
          value: parseFloat(formData.current_value),
          unit: SENSOR_TYPES.find(t => t.id === formData.type)?.unit || '',
          timestamp: new Date().toISOString()
        }
      };
      
      onSensorAdded(newSensor);
      handleClose();
    } catch (error) {
      console.error('Failed to add sensor:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to add sensor. Please try again.'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      type: '',
      location: '',
      model: '',
      manufacturer: '',
      mqtt_topic: '',
      current_value: ''
    });
    setErrors({});
    onClose();
  };

  // Get unit label for current value field
  const getCurrentValueUnit = () => {
    if (!formData.type) return '';
    const sensorType = SENSOR_TYPES.find(t => t.id === formData.type);
    return sensorType ? sensorType.unit : '';
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Sensor</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            margin="dense"
            label="Sensor Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            disabled={loading}
          />
          
          <FormControl fullWidth margin="dense" error={!!errors.type} disabled={loading}>
            <InputLabel>Sensor Type</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              label="Sensor Type"
            >
              {SENSOR_TYPES.map(type => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name} ({type.unit})
                </MenuItem>
              ))}
            </Select>
            {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
          </FormControl>
          
          <TextField
            fullWidth
            margin="dense"
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            error={!!errors.location}
            helperText={errors.location}
            disabled={loading}
          />
          
          <TextField
            fullWidth
            margin="dense"
            label="Model (Optional)"
            name="model"
            value={formData.model}
            onChange={handleChange}
            disabled={loading}
          />
          
          <TextField
            fullWidth
            margin="dense"
            label="Manufacturer (Optional)"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleChange}
            disabled={loading}
          />
          
          <TextField
            fullWidth
            margin="dense"
            label="MQTT Topic"
            name="mqtt_topic"
            value={formData.mqtt_topic}
            onChange={handleTopicChange}
            error={!!errors.mqtt_topic}
            helperText={errors.mqtt_topic || 
              (autoGenerateTopic ? "Auto-generated based on type and location" : "Example: farm/sensors/temperature/greenhouse_1")}
            disabled={loading || autoGenerateTopic}
          />
          
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
            <Button 
              size="small" 
              color={autoGenerateTopic ? "primary" : "inherit"}
              onClick={() => {
                const newState = !autoGenerateTopic;
                setAutoGenerateTopic(newState);
                
                // If turning auto-generate back on, update the MQTT topic
                if (newState) {
                  setFormData(prev => ({
                    ...prev,
                    mqtt_topic: generateMqttTopic(prev.type, prev.location)
                  }));
                }
              }}
              sx={{ textTransform: 'none' }}
            >
              {autoGenerateTopic ? "Auto-generating topic ✓" : "Click to auto-generate topic"}
            </Button>
          </Box>
          
          <TextField
            fullWidth
            margin="dense"
            label={`Current Reading${getCurrentValueUnit() ? ` (${getCurrentValueUnit()})` : ''}`}
            name="current_value"
            value={formData.current_value}
            onChange={handleChange}
            error={!!errors.current_value}
            helperText={errors.current_value}
            disabled={loading}
            type="number"
            InputProps={{
              endAdornment: getCurrentValueUnit() ? (
                <InputAdornment position="end">{getCurrentValueUnit()}</InputAdornment>
              ) : null
            }}
          />
          
          {errors.submit && (
            <FormHelperText error sx={{ mt: 2 }}>
              {errors.submit}
            </FormHelperText>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Adding...' : 'Add Sensor'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSensorDialog; 