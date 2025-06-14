import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box, Card, CardContent, TextField, Button, Avatar, Typography, CircularProgress } from '@mui/material';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import axios from 'axios';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Sensors from './pages/Sensors';
import SensorDetail from './pages/SensorDetail';
import Actuators from './pages/Actuators';
import ActuatorDetail from './pages/ActuatorDetail';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Debug from './pages/Debug';

// DeepSeek Chat Component
const DeepSeekChat = () => {
  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const messagesEndRef = React.useRef(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', content: input }]);
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: input }],
        },
        {
          headers: {
            'Authorization': 'Bearer sk-2475d1348ab64cef874b4ddfbe00153e',
            'Content-Type': 'application/json',
          },
        }
      );
      setMessages((msgs) => [
        ...msgs,
        { role: 'assistant', content: res.data.choices[0].message.content },
      ]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { role: 'assistant', content: '出错了，请检查API设置' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, margin: '40px auto', display: 'flex', flexDirection: 'column', height: '70vh' }}>
      <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 3 }}>
        <CardContent sx={{ pb: 1, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
            <ChatBubbleOutlineIcon />
          </Avatar>
          <Typography variant="h6" fontWeight={700}>AI Chat</Typography>
        </CardContent>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: '#f9f9f9' }}>
          {messages.map((msg, idx) => (
            <Box key={idx} sx={{ display: 'flex', mb: 2, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
              <Avatar sx={{ bgcolor: msg.role === 'user' ? 'primary.main' : 'grey.400', ml: msg.role === 'user' ? 2 : 0, mr: msg.role === 'assistant' ? 2 : 0 }}>
                {msg.role === 'user' ? '我' : <ChatBubbleOutlineIcon fontSize="small" />}
              </Avatar>
              <Box sx={{ maxWidth: '70%', bgcolor: msg.role === 'user' ? 'primary.light' : 'white', color: 'text.primary', p: 1.5, borderRadius: 2, boxShadow: 1, wordBreak: 'break-word' }}>
                <Typography variant="body2">{msg.content}</Typography>
              </Box>
            </Box>
          ))}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <CircularProgress size={22} />
              <Typography variant="body2" sx={{ ml: 1 }}>AI 正在思考...</Typography>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
        <Box sx={{ p: 2, borderTop: '1px solid #eee', bgcolor: '#fafbfc', display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="请输入你的问题..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !loading && handleSend()}
            disabled={loading}
            sx={{ mr: 2, bgcolor: 'white', borderRadius: 1 }}
          />
          <Button variant="contained" onClick={handleSend} disabled={loading || !input.trim()}>
            发送
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  
  return (
    <SocketProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <CssBaseline />
        
        <Routes>
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} />
          </Route>
          
          {/* Main app routes - protected */}
          <Route element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sensors" element={<Sensors />} />
            <Route path="/sensors/:id" element={<SensorDetail />} />
            <Route path="/actuators" element={<Actuators />} />
            <Route path="/actuators/:id" element={<ActuatorDetail />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/debug" element={<Debug />} />
            <Route path="/deepseek-chat" element={<DeepSeekChat />} />
          </Route>
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
    </SocketProvider>
  );
}

export default App;
export { DeepSeekChat }; 