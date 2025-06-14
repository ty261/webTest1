import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  TextField, 
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { useSocket } from '../contexts/SocketContext';
import { SOCKET_URL } from '../config';

const Debug = () => {
  const { socket, sensorData, actuatorData, lastMessage } = useSocket();
  const [connected, setConnected] = useState(false);
  const [testValue, setTestValue] = useState(75.5);
  const [testLocation, setTestLocation] = useState('大棚1');
  const [logs, setLogs] = useState([]);

  // 监听Socket连接状态
  useEffect(() => {
    setConnected(!!socket);
    
    if (socket) {
      addLog('Socket.io连接已建立');
      
      socket.on('connect', () => {
        setConnected(true);
        addLog('Socket.io连接成功');
      });
      
      socket.on('disconnect', () => {
        setConnected(false);
        addLog('Socket.io连接断开');
      });
      
      socket.on('mqtt_message', (data) => {
        addLog(`收到MQTT消息: ${data.topic} - ${JSON.stringify(data.payload)}`);
      });
    }
    
    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('mqtt_message');
      }
    };
  }, [socket]);
  
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };
  
  // 手动触发模拟消息
  const sendMockData = (type) => {
    if (!socket) {
      addLog('错误: Socket未连接');
      return;
    }
    
    let topic, payload;
    
    if (type === 'temperature') {
      topic = `farm/sensors/temperature/${testLocation.replace(/ /g, '_')}`;
      payload = {
        value: parseFloat(testValue),
        unit: '°C',
        timestamp: Date.now() / 1000,
        sensor_id: `temperature_${testLocation.replace(/ /g, '_')}`,
        location: testLocation
      };
    } else if (type === 'humidity') {
      topic = `farm/sensors/humidity/${testLocation.replace(/ /g, '_')}`;
      payload = {
        value: parseFloat(testValue),
        unit: '%',
        timestamp: Date.now() / 1000,
        sensor_id: `humidity_${testLocation.replace(/ /g, '_')}`,
        location: testLocation
      };
    }
    
    // 直接向自己触发模拟消息
    socket.emit('mqtt_message', { topic, payload });
    addLog(`手动触发模拟消息: ${topic} - ${JSON.stringify(payload)}`);
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Socket调试页面</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>连接状态</Typography>
            <Box sx={{ mb: 2 }}>
              <Typography>
                Socket URL: {SOCKET_URL}
              </Typography>
              <Typography>
                连接状态: {connected ? '已连接' : '未连接'}
              </Typography>
            </Box>
            
            <Button 
              variant="contained" 
              color={connected ? "error" : "primary"}
              onClick={() => {
                if (connected && socket) {
                  socket.disconnect();
                  addLog('手动断开Socket连接');
                } else {
                  window.location.reload();
                  addLog('刷新页面以重新连接');
                }
              }}
            >
              {connected ? "断开连接" : "重新连接"}
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>发送模拟消息</Typography>
            <Box sx={{ mb: 2 }}>
              <TextField
                label="数值"
                type="number"
                value={testValue}
                onChange={(e) => setTestValue(e.target.value)}
                sx={{ mr: 2, mb: 2 }}
              />
              <TextField
                label="位置"
                value={testLocation}
                onChange={(e) => setTestLocation(e.target.value)}
                sx={{ mb: 2 }}
              />
            </Box>
            
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => sendMockData('temperature')}
              sx={{ mr: 2 }}
              disabled={!connected}
            >
              发送温度数据
            </Button>
            
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => sendMockData('humidity')}
              disabled={!connected}
            >
              发送湿度数据
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>传感器数据</Typography>
            <pre style={{ maxHeight: 300, overflow: 'auto' }}>
              {JSON.stringify(sensorData, null, 2)}
            </pre>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>执行器数据</Typography>
            <pre style={{ maxHeight: 300, overflow: 'auto' }}>
              {JSON.stringify(actuatorData, null, 2)}
            </pre>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>最后接收的消息</Typography>
            <pre style={{ maxHeight: 200, overflow: 'auto' }}>
              {lastMessage ? JSON.stringify(lastMessage, null, 2) : '无'}
            </pre>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>日志</Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {logs.map((log, index) => (
                <Typography key={index} variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {log}
                </Typography>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Debug; 