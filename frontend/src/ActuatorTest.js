import React, { useState, useEffect } from 'react';

// 直接从您的API文件导入
import { actuatorAPI } from './services/api';

// 简单的测试组件
const ActuatorTest = () => {
  const [actuators, setActuators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responseDetails, setResponseDetails] = useState(null);

  const fetchActuators = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 直接使用fetch，不通过API服务
      const response = await fetch('http://localhost:5000/api/actuators');
      const responseData = await response.json();
      setResponseDetails({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers]),
        url: response.url,
        redirected: response.redirected
      });
      
      if (response.ok) {
        setActuators(responseData.data || []);
      } else {
        setError(`API返回错误: ${response.statusText}`);
      }
    } catch (err) {
      setError(`获取执行器列表失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActuators();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>执行器测试组件</h1>
      
      <button onClick={fetchActuators} disabled={loading}>
        {loading ? '加载中...' : '刷新数据'}
      </button>
      
      {error && (
        <div style={{ color: 'red', margin: '10px 0' }}>
          <h3>错误</h3>
          <p>{error}</p>
        </div>
      )}
      
      {responseDetails && (
        <div style={{ margin: '10px 0' }}>
          <h3>响应详情</h3>
          <pre>{JSON.stringify(responseDetails, null, 2)}</pre>
        </div>
      )}
      
      <div style={{ margin: '10px 0' }}>
        <h3>执行器列表 ({actuators.length})</h3>
        {loading ? (
          <p>正在加载数据...</p>
        ) : actuators.length > 0 ? (
          <ul>
            {actuators.map(actuator => (
              <li key={actuator.id}>
                <strong>{actuator.name}</strong> - 类型: {actuator.type}, 状态: {actuator.status}
              </li>
            ))}
          </ul>
        ) : (
          <p>没有找到执行器</p>
        )}
      </div>
    </div>
  );
};

export default ActuatorTest; 