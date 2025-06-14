import React from 'react';
import {
  Drawer,
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  ListItemButton,
  useTheme,
  IconButton,
  Box,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Sensors as SensorsIcon,
  SettingsRemote as ActuatorsIcon,
  BarChart as AnalyticsIcon,
  Notifications as AlertsIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { name: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { name: 'Sensors', icon: <SensorsIcon />, path: '/sensors' },
  { name: 'Actuators', icon: <ActuatorsIcon />, path: '/actuators' },
  { name: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
  { name: 'Alerts', icon: <AlertsIcon />, path: '/alerts' },
  { name: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const Sidebar = ({ open, drawerWidth, toggleDrawer }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleNavigation = (path) => {
    navigate(path);
  };
  
  // Determine if menu item is active
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    
    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }
    
    return false;
  };
  
  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
        display: { xs: open ? 'block' : 'none', md: 'block' },
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          px: [1],
        }}
      >
        <IconButton onClick={toggleDrawer}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      
      <Divider />
      
      <List component="nav">
        {menuItems.map((item) => (
          <ListItem 
            key={item.name} 
            disablePadding
          >
            <ListItemButton
              selected={isActive(item.path)}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(76, 175, 80, a0.2)',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive(item.path) ? 'primary.main' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src="/images/logo.png"
          alt="Smart Farm Logo"
          style={{ maxWidth: '120px', opacity: 0.7 }}
        />
      </Box>
    </Drawer>
  );
};

export default Sidebar; 