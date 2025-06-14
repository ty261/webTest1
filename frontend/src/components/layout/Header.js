import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  MenuItem,
  Menu,
  Tooltip,
  Avatar,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Header = ({ open, drawerWidth, toggleDrawer }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleNotificationsMenuOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationsAnchor(null);
  };
  
  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };
  
  const handleProfile = () => {
    handleMenuClose();
    navigate('/settings');
  };
  
  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${open ? drawerWidth : 0}px)` },
        ml: { md: `${open ? drawerWidth : 0}px` },
        transition: (theme) =>
          theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        ...(open && {
          transition: (theme) =>
            theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }),
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={toggleDrawer}
          sx={{ mr: 2, display: { xs: 'block', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ display: { xs: 'none', sm: 'block' } }}
        >
          Smart Farm
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={mode === 'dark'}
              onChange={toggleTheme}
              icon={<LightModeIcon />}
              checkedIcon={<DarkModeIcon />}
              color="default"
            />
          }
          label=""
          sx={{ ml: 2 }}
        />
        
        <div style={{ flexGrow: 1 }} />
        
        <Tooltip title="Notifications">
          <IconButton
            color="inherit"
            aria-label="show notifications"
            onClick={handleNotificationsMenuOpen}
          >
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Account">
          <IconButton
            color="inherit"
            edge="end"
            onClick={handleProfileMenuOpen}
            aria-label="account"
            sx={{ ml: 1 }}
          >
            {user?.username ? (
              <Avatar
                alt={user.username}
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'secondary.main',
                  color: 'white',
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </Avatar>
            ) : (
              <AccountCircle />
            )}
          </IconButton>
        </Tooltip>
      </Toolbar>
      
      {/* Profile menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfile}>Profile</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
      
      {/* Notifications menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleMenuClose}>
          Temperature alert: Greenhouse 1 exceeds threshold
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          Soil moisture alert: Field 2 below threshold
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          Irrigation system: Zone 3 activated
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          System update available
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header; 