import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  TextField, Button, Typography, Box, Container, Alert, Link, Avatar,
  Paper, Grid, Tabs, Tab, Divider, Snackbar
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [apiStatus, setApiStatus] = useState({ message: '正在检查API连接...', severity: 'info' });
  const [showApiStatus, setShowApiStatus] = useState(false);
  const navigate = useNavigate();
  const { login, register, useLocalStorage, setUseLocalStorage } = useAuth();

  // 注册表单数据
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // 检查API连接状态
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const response = await fetch('http://localhost:5000/api');
        if (response.ok) {
          setApiStatus({ 
            message: 'API服务器连接正常，注册的用户将存储到数据库中', 
            severity: 'success' 
          });
        } else {
          throw new Error('API服务器响应异常');
        }
      } catch (error) {
        console.warn('API连接失败:', error);
        setApiStatus({ 
          message: 'API服务器连接失败，将使用本地存储模式保存注册用户', 
          severity: 'warning' 
        });
        setUseLocalStorage(true);
      } finally {
        setShowApiStatus(true);
      }
    };

    checkApiConnection();
  }, [setUseLocalStorage]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // 切换Tab时清空错误信息
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // 验证密码匹配
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const { confirmPassword, ...registerPayload } = registerData;
      await register(registerPayload);
      // 注册成功后切换到登录Tab
      setActiveTab(0);
      setEmail(registerData.email);
      setPassword('');
      // 清空注册表单
      setRegisterData({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      // 显示成功消息
      setApiStatus({ 
        message: useLocalStorage 
          ? '注册成功！用户信息已保存在本地存储中' 
          : '注册成功！用户数据已保存到数据库',
        severity: 'success'
      });
      setShowApiStatus(true);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };

  const handleCloseSnackbar = () => {
    setShowApiStatus(false);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            {activeTab === 0 ? <LockOutlinedIcon /> : <PersonAddIcon />}
          </Avatar>
          
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2, width: '100%' }}>
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {activeTab === 0 && (
            <>
              <Typography component="h1" variant="h5" gutterBottom>
                Login to Smart Farm System
              </Typography>
              
              <Box component="form" onSubmit={handleLoginSubmit} sx={{ mt: 1, width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  Login
                </Button>
                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Hint: You can use admin@smartfarm.com / password123 to login
                  </Typography>
                  <Box mt={2}>
                    <Link 
                      component="button" 
                      variant="body2" 
                      onClick={() => setActiveTab(1)}
                    >
                      Don't have an account? Register now
                    </Link>
                  </Box>
                </Box>
              </Box>
            </>
          )}
          
          {activeTab === 1 && (
            <>
              <Typography component="h1" variant="h5" gutterBottom>
                Create New Account
              </Typography>
              
              <Box component="form" onSubmit={handleRegisterSubmit} sx={{ mt: 1, width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  value={registerData.username}
                  onChange={handleRegisterChange}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="register-email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="register-password"
                  autoComplete="new-password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirm-password"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  Register
                </Button>
                <Box textAlign="center">
                  <Link 
                    component="button" 
                    variant="body2" 
                    onClick={() => setActiveTab(0)}
                  >
                    Already have an account? Login
                  </Link>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Paper>
      
      <Snackbar 
        open={showApiStatus} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={apiStatus.severity} sx={{ width: '100%' }}>
          {apiStatus.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login; 