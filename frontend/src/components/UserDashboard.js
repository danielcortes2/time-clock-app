import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Button, Avatar, Chip, CircularProgress, Snackbar, Alert,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { getMyEntries, clockIn, clockOut, getMe, getMySchedule } from '../api';
import { useNavigate } from 'react-router-dom';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import HistoryIcon from '@mui/icons-material/History';
import TimerIcon from '@mui/icons-material/Timer';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';

const formatDuration = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  return `${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
};

const formatHours = (ms) => (ms / 3600000).toFixed(1) + 'h';

const StatCard = ({ icon, label, value, color }) => (
  <Box
    sx={{
      background: 'rgba(13,33,55,0.7)',
      border: `1px solid ${color}25`,
      borderRadius: 3,
      p: 2.5,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      flex: 1,
    }}
  >
    <Box sx={{ p: 1, borderRadius: 2, background: `${color}20`, display: 'flex' }}>
      {React.cloneElement(icon, { sx: { color, fontSize: 24 } })}
    </Box>
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ color, lineHeight: 1 }}>{value}</Typography>
      <Typography variant="caption" sx={{ color: '#8BAFC7' }}>{label}</Typography>
    </Box>
  </Box>
);

const UserDashboard = () => {
  const [entries, setEntries] = useState([]);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [activeEntry, setActiveEntry] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [schedule, setSchedule] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const timerRef = useRef(null);
  const navigate = useNavigate();

  // Clock tick
  useEffect(() => {
    const tick = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  // Elapsed timer when clocked in
  useEffect(() => {
    if (isClockedIn && activeEntry) {
      timerRef.current = setInterval(() => {
        setElapsed(Date.now() - new Date(activeEntry.clock_in).getTime());
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setElapsed(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isClockedIn, activeEntry]);

  const fetchData = useCallback(async () => {
    try {
      const [entriesRes, userRes, scheduleRes] = await Promise.all([getMyEntries(), getMe(), getMySchedule()]);
      setEntries(entriesRes);
      setUser(userRes);
      setSchedule(scheduleRes);
      const open = entriesRes.find(e => !e.clock_out);
      setIsClockedIn(!!open);
      setActiveEntry(open || null);
    } catch (err) {
      if (err.response?.status === 401) navigate('/');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleClock = async () => {
    setActionLoading(true);
    try {
      if (isClockedIn) {
        await clockOut();
        setSnackbar({ open: true, message: 'Clocked out successfully!', severity: 'info' });
      } else {
        await clockIn();
        setSnackbar({ open: true, message: 'Clocked in! Have a great shift.', severity: 'success' });
      }
      await fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.detail || 'Action failed', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Weekly hours
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weeklyMs = entries
    .filter(e => new Date(e.clock_in) >= weekStart && e.clock_out)
    .reduce((sum, e) => sum + (new Date(e.clock_out) - new Date(e.clock_in)), 0);
  const todayMs = entries
    .filter(e => new Date(e.clock_in).toDateString() === new Date().toDateString() && e.clock_out)
    .reduce((sum, e) => sum + (new Date(e.clock_out) - new Date(e.clock_in)), 0);

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || '?';

  const greetHour = currentTime.getHours();
  const greeting = greetHour < 12 ? 'Good morning' : greetHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Bar */}
      <motion.div initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
        <Box
          sx={{
            background: 'rgba(10,25,41,0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0,212,255,0.1)',
            px: 3, py: 1.5,
            display: 'flex', alignItems: 'center', gap: 2,
            position: 'sticky', top: 0, zIndex: 100,
          }}
        >
          <AccessTimeIcon sx={{ color: '#00D4FF', fontSize: 28 }} />
          <Typography variant="h6" fontWeight={700} sx={{ color: '#E8F4FD', flex: 1 }}>
            TimeClock
          </Typography>
          <Avatar sx={{ bgcolor: 'rgba(0,212,255,0.2)', color: '#00D4FF', width: 34, height: 34, fontSize: 14, fontWeight: 700 }}>
            {initials}
          </Avatar>
          <Typography variant="body2" sx={{ color: '#8BAFC7', display: { xs: 'none', sm: 'block' } }}>
            {user?.full_name || user?.email}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={() => { localStorage.removeItem('token'); navigate('/'); }}
            size="small"
            sx={{ borderColor: 'rgba(255,82,82,0.4)', color: '#FF5252', '&:hover': { borderColor: '#FF5252', bgcolor: 'rgba(255,82,82,0.08)' } }}
          >
            Logout
          </Button>
        </Box>
      </motion.div>

      <Box sx={{ maxWidth: 700, mx: 'auto', px: 3, py: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 12 }}>
            <CircularProgress sx={{ color: '#00D4FF' }} />
          </Box>
        ) : (
          <>
            {/* Greeting */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: '#E8F4FD' }}>
                  {greeting}, {user?.full_name?.split(' ')[0] || 'there'} 👋
                </Typography>
                <Typography variant="body1" sx={{ color: '#8BAFC7', mt: 0.5 }}>
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  {' · '}
                  <Typography component="span" sx={{ color: '#00D4FF', fontWeight: 600 }}>
                    {currentTime.toLocaleTimeString()}
                  </Typography>
                </Typography>
              </Box>
            </motion.div>

            {/* Clock In / Out Button */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 5,
                  mb: 4,
                  background: isClockedIn
                    ? 'linear-gradient(135deg, rgba(0,230,118,0.06), rgba(13,33,55,0.9))'
                    : 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(13,33,55,0.9))',
                  border: `1px solid ${isClockedIn ? 'rgba(0,230,118,0.2)' : 'rgba(0,212,255,0.15)'}`,
                  borderRadius: 4,
                }}
              >
                {/* Pulsing ring when clocked in */}
                <Box sx={{ position: 'relative', mb: 3 }}>
                  {isClockedIn && (
                    <>
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          style={{
                            position: 'absolute',
                            inset: -8 - i * 16,
                            borderRadius: '50%',
                            border: '2px solid rgba(0,230,118,0.3)',
                          }}
                          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                        />
                      ))}
                    </>
                  )}
                  <motion.button
                    onClick={handleClock}
                    disabled={actionLoading}
                    style={{
                      width: 140,
                      height: 140,
                      borderRadius: '50%',
                      border: 'none',
                      cursor: actionLoading ? 'wait' : 'pointer',
                      background: isClockedIn
                        ? 'linear-gradient(135deg, #00E676, #00B259)'
                        : 'linear-gradient(135deg, #00D4FF, #7C4DFF)',
                      boxShadow: isClockedIn
                        ? '0 8px 40px rgba(0,230,118,0.5)'
                        : '0 8px 40px rgba(0,212,255,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: 4,
                      position: 'relative',
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.94 }}
                  >
                    {actionLoading ? (
                      <CircularProgress size={32} sx={{ color: 'white' }} />
                    ) : (
                      <>
                        {isClockedIn
                          ? <LogoutIcon sx={{ fontSize: 40, color: 'white' }} />
                          : <LoginIcon sx={{ fontSize: 40, color: 'white' }} />
                        }
                        <Typography variant="caption" fontWeight={700} sx={{ color: 'white', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>
                          {isClockedIn ? 'Clock Out' : 'Clock In'}
                        </Typography>
                      </>
                    )}
                  </motion.button>
                </Box>

                <AnimatePresence mode="wait">
                  {isClockedIn ? (
                    <motion.div key="active" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <Chip
                        icon={<TimerIcon sx={{ fontSize: '16px!important' }} />}
                        label={formatDuration(elapsed)}
                        sx={{
                          bgcolor: 'rgba(0,230,118,0.15)',
                          color: '#00E676',
                          fontWeight: 700,
                          fontSize: 16,
                          height: 36,
                          px: 1,
                          '& .MuiChip-icon': { color: '#00E676' },
                        }}
                      />
                      <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#8BAFC7', mt: 1 }}>
                        Session started {activeEntry ? new Date(activeEntry.clock_in).toLocaleTimeString() : ''}
                      </Typography>
                    </motion.div>
                  ) : (
                    <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <Typography variant="body2" sx={{ color: '#8BAFC7' }}>You are currently not clocked in</Typography>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                <StatCard icon={<CalendarTodayIcon />} label="Today's Hours" value={formatHours(todayMs)} color="#00D4FF" />
                <StatCard icon={<TimerIcon />} label="This Week" value={formatHours(weeklyMs)} color="#7C4DFF" />
                <StatCard icon={<HistoryIcon />} label="Total Entries" value={entries.length} color="#00E676" />
              </Box>
            </motion.div>

            {/* Weekly Schedule */}
            {schedule.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CalendarMonthIcon sx={{ color: '#00D4FF', fontSize: 20 }} />
                    <Typography variant="h6" fontWeight={600} sx={{ color: '#E8F4FD' }}>My Schedule</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => {
                      const entry = schedule.find(s => s.day_of_week === i);
                      // JS getDay(): 0=Sun,1=Mon...6=Sat => our i: 0=Mon...6=Sun
                      const todayJs = new Date().getDay();
                      const todayIdx = todayJs === 0 ? 6 : todayJs - 1;
                      const isToday = todayIdx === i;
                      const active = entry?.is_active;
                      return (
                        <Box
                          key={i}
                          sx={{
                            borderRadius: 2, p: 1.5, textAlign: 'center', minWidth: 72,
                            background: isToday
                              ? (active ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)')
                              : (active ? 'rgba(13,33,55,0.8)' : 'rgba(13,33,55,0.4)'),
                            border: isToday
                              ? `2px solid ${active ? '#00D4FF' : 'rgba(255,255,255,0.1)'}`
                              : '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          <Typography variant="caption" fontWeight={700}
                            sx={{ color: isToday ? '#00D4FF' : (active ? '#E8F4FD' : '#8BAFC7'), display: 'block' }}>
                            {day}
                          </Typography>
                          {active ? (
                            <>
                              <EventAvailableIcon sx={{ fontSize: 14, color: isToday ? '#00D4FF' : '#00E676', my: 0.3 }} />
                              <Typography variant="caption" sx={{ color: '#8BAFC7', display: 'block', fontSize: 10 }}>
                                {entry.start_time}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#8BAFC7', display: 'block', fontSize: 10 }}>
                                {entry.end_time}
                              </Typography>
                            </>
                          ) : (
                            <EventBusyIcon sx={{ fontSize: 14, color: '#8BAFC7', my: 0.3, display: 'block', mx: 'auto' }} />
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </motion.div>
            )}

            {/* Entry History */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Typography variant="h6" fontWeight={600} sx={{ color: '#E8F4FD', mb: 2 }}>Recent Activity</Typography>
              {entries.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <HistoryIcon sx={{ fontSize: 48, color: '#8BAFC7', mb: 1 }} />
                  <Typography sx={{ color: '#8BAFC7' }}>No entries yet — clock in to get started!</Typography>
                </Box>
              ) : (
                [...entries].reverse().slice(0, 10).map((entry, i) => {
                  const duration = entry.clock_out
                    ? (new Date(entry.clock_out) - new Date(entry.clock_in))
                    : null;
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 2,
                          mb: 1,
                          background: 'rgba(13,33,55,0.6)',
                          border: '1px solid rgba(0,212,255,0.08)',
                          borderRadius: 2,
                          gap: 2,
                        }}
                      >
                        <Box sx={{ p: 1, borderRadius: 1.5, background: entry.clock_out ? 'rgba(0,212,255,0.1)' : 'rgba(0,230,118,0.15)', display: 'flex' }}>
                          <AccessTimeIcon sx={{ fontSize: 18, color: entry.clock_out ? '#00D4FF' : '#00E676' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={600} sx={{ color: '#E8F4FD' }}>
                            {new Date(entry.clock_in).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#8BAFC7' }}>
                            {new Date(entry.clock_in).toLocaleTimeString()}
                            {entry.clock_out && ` → ${new Date(entry.clock_out).toLocaleTimeString()}`}
                          </Typography>
                        </Box>
                        {duration ? (
                          <Typography variant="body2" fontWeight={600} sx={{ color: '#00D4FF' }}>
                            {formatHours(duration)}
                          </Typography>
                        ) : (
                          <Chip label="Active" size="small" sx={{ bgcolor: 'rgba(0,230,118,0.2)', color: '#00E676', fontSize: 11 }} />
                        )}
                      </Box>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          </>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default UserDashboard;