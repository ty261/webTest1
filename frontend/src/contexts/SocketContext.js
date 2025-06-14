import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { SOCKET_URL } from '../config';
import { useAuth } from './AuthContext';

// 创建上下文
const SocketContext = createContext();

// 提供上下文的组件
export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [sensorData, setSensorData] = useState({});
  const [actuatorData, setActuatorData] = useState({});

  // 连接到Socket.io服务器
  useEffect(() => {
    let socketInstance = null;

    if (isAuthenticated) {
      socketInstance = io(SOCKET_URL);
      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        console.log('Connected to Socket.io server');
      });

      socketInstance.on('mqtt_message', (data) => {
        console.log('MQTT message received:', data);
        setLastMessage(data);

        // 处理传感器数据
        if (data.topic.startsWith('farm/sensors/')) {
          const parts = data.topic.split('/');
          const sensorType = parts[2];
          const location = parts[3].replace(/_/g, ' ');
          const sensorKey = `${sensorType}_${location}`;

          setSensorData(prev => ({
            ...prev,
            [sensorKey]: {
              type: sensorType,
              location: data.payload.location,
              value: data.payload.value,
              unit: data.payload.unit,
              timestamp: data.payload.timestamp
            }
          }));
        }

        // 处理执行器数据
        if (data.topic.startsWith('farm/actuators/')) {
          const parts = data.topic.split('/');
          const actuatorType = parts[2];
          const location = parts[3].replace(/_/g, ' ');
          const actuatorKey = `${actuatorType}_${location}`;

          setActuatorData(prev => ({
            ...prev,
            [actuatorKey]: {
              type: actuatorType,
              location: data.payload.location,
              state: data.payload.state,
              timestamp: data.payload.timestamp
            }
          }));
        }
      });

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from Socket.io server');
      });

      // 清理函数
      return () => {
        socketInstance.disconnect();
      };
    }
  }, [isAuthenticated]);

  // 提供上下文值
  const value = {
    socket,
    lastMessage,
    sensorData,
    actuatorData
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// 使用上下文的自定义Hook
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}; 