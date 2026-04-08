import React, { useState } from 'react';
import {
  TextField, Button, Typography, Box, Alert, InputAdornment, IconButton,
  CircularProgress, useTheme, useMediaQuery,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { login, getMe } from '../api';
import { useNavigate } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const FloatingOrb = ({ style }) => (
  <motion.div
    style={{
      position: 'absolute',
      borderRadius: '50%',
      filter: 'blur(80px)',
      opacity: 0.15,
      pointerEvents: 'none',
      ...style,
    }}
    animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.1, 1] }}
    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
  />
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await login(email, password);
      localStorage.setItem('token', response.access_token);
      const user = await getMe();
      navigate(user.is_superuser ? '/admin' : '/user');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        '@supports (min-height: 100dvh)': { minHeight: '100dvh' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #050D1A 0%, #0A1929 50%, #0D2137 100%)',
        position: 'relative',
        overflow: 'hidden',
        px: { xs: 2, sm: 4 },
        py: 4,
      }}
    >
      {/* Background orbs – scaled for mobile */}
      <FloatingOrb style={{ width: isMobile ? 260 : 500, height: isMobile ? 260 : 500, background: '#00D4FF', top: -80, left: -100 }} />
      <FloatingOrb style={{ width: isMobile ? 200 : 400, height: isMobile ? 200 : 400, background: '#7C4DFF', bottom: -80, right: -80 }} />
      {!isMobile && (
        <FloatingOrb style={{ width: 300, height: 300, background: '#00E676', top: '50%', left: '60%' }} />
      )}

      {/* Particles – fewer on mobile to avoid clutter */}
      {[...Array(isMobile ? 4 : 8)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: 3,
            height: 3,
            borderRadius: '50%',
            background: '#00D4FF',
            left: `${8 + i * (isMobile ? 22 : 12)}%`,
            top: `${15 + (i % 4) * 22}%`,
            opacity: 0.35,
          }}
          animate={{ y: [0, -50, 0], opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.21, 1.11, 0.81, 0.99] }}
        style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 10 }}
      >
        <Box
          sx={{
            background: 'rgba(10, 25, 41, 0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(0, 212, 255, 0.15)',
            borderRadius: { xs: 3, sm: 4 },
            px: { xs: 3, sm: 4.5 },
            py: { xs: 3.5, sm: 5 },
            boxShadow: '0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4 } }}>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'inline-block', marginBottom: 12 }}
            >
              <Box
                sx={{
                  width: { xs: 60, sm: 72 },
                  height: { xs: 60, sm: 72 },
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(124,77,255,0.2))',
                  border: '2px solid rgba(0, 212, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                }}
              >
                <AccessTimeIcon sx={{ fontSize: { xs: 28, sm: 36 }, color: '#00D4FF' }} />
              </Box>
            </motion.div>
            <Typography
              fontWeight={700}
              sx={{ color: '#E8F4FD', letterSpacing: -0.5, fontSize: { xs: '1.55rem', sm: '1.9rem' }, lineHeight: 1.15 }}
            >
              TimeClock
            </Typography>
            <Typography variant="body2" sx={{ color: '#8BAFC7', mt: 0.5, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              Sign in to your workspace
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleLogin} noValidate>
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert
                    severity="error"
                    sx={{ mb: 2, borderRadius: 2, bgcolor: 'rgba(255, 82, 82, 0.1)', border: '1px solid rgba(255,82,82,0.3)' }}
                    onClose={() => setError('')}
                  >
                    {error}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              autoComplete="email"
              inputProps={{ inputMode: 'email' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#8BAFC7', fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#8BAFC7', fontSize: 18 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword
                        ? <VisibilityOffIcon sx={{ color: '#8BAFC7', fontSize: 18 }} />
                        : <VisibilityIcon sx={{ color: '#8BAFC7', fontSize: 18 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  py: { xs: 1.4, sm: 1.6 },
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #00D4FF, #7C4DFF)',
                  '&:hover': { background: 'linear-gradient(135deg, #33DDFF, #9B6DFF)' },
                  boxShadow: '0 4px 24px rgba(0, 212, 255, 0.3)',
                  borderRadius: 2,
                  minHeight: 48,
                }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
              </Button>
            </motion.div>
          </Box>

          <Typography
            variant="caption"
            sx={{ display: 'block', textAlign: 'center', color: '#8BAFC7', mt: 3, fontSize: { xs: '0.72rem', sm: '0.75rem' }, lineHeight: 1.4 }}
          >
            Contact your administrator to get access
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
};

export default Login;