import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Avatar, Chip, IconButton, Tooltip, Collapse, CircularProgress, Alert, Snackbar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  InputAdornment, Switch, FormControlLabel, ToggleButton,
  useTheme, useMediaQuery,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllEntries, createUser as apiCreateUser, getUsers, getUserSchedule, setUserSchedule, deleteUser, exportEntries } from '../api';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import BadgeIcon from '@mui/icons-material/Badge';
import RefreshIcon from '@mui/icons-material/Refresh';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DEFAULT_SCHEDULE = DAYS.map((_, i) => ({
  day_of_week: i,
  start_time: '09:00',
  end_time: '17:00',
  is_active: i < 5, // Mon-Fri active by default
}));

const StatCard = ({ icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    style={{ flex: 1, minWidth: 140 }}
  >
    <Box
      sx={{
        background: 'linear-gradient(135deg, rgba(13,33,55,0.9), rgba(10,25,41,0.9))',
        border: `1px solid ${color}30`,
        borderRadius: 3,
        p: { xs: 1.5, sm: 2.5 },
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 1, sm: 2 },
        boxShadow: `0 4px 20px ${color}15`,
      }}
    >
      <Box sx={{ p: { xs: 0.8, sm: 1.2 }, borderRadius: 2, background: `${color}20`, display: 'flex' }}>
        {React.cloneElement(icon, { sx: { color, fontSize: { xs: 20, sm: 28 } } })}
      </Box>
      <Box>
        <Typography variant="h4" fontWeight={700} sx={{ color, lineHeight: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>{value}</Typography>
        <Typography variant="caption" sx={{ color: '#8BAFC7', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>{label}</Typography>
      </Box>
    </Box>
  </motion.div>
);

// ─── Schedule Editor Dialog ──────────────────────────────────────────────────
const ScheduleDialog = ({ open, onClose, user, onSaved, showSnackbar }) => {
  const [rows, setRows] = useState(DEFAULT_SCHEDULE.map(d => ({ ...d })));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    getUserSchedule(user.id)
      .then(data => {
        if (data.length === 0) {
          setRows(DEFAULT_SCHEDULE.map(d => ({ ...d })));
        } else {
          // Merge saved entries into the 7-day grid
          const grid = DEFAULT_SCHEDULE.map(def => {
            const saved = data.find(d => d.day_of_week === def.day_of_week);
            return saved
              ? { day_of_week: saved.day_of_week, start_time: saved.start_time, end_time: saved.end_time, is_active: saved.is_active }
              : { ...def };
          });
          setRows(grid);
        }
      })
      .catch(() => setRows(DEFAULT_SCHEDULE.map(d => ({ ...d }))))
      .finally(() => setLoading(false));
  }, [open, user]);

  const updateRow = (i, field, value) => {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setUserSchedule(user.id, rows);
      showSnackbar(`Schedule saved for ${user.full_name || user.email}`, 'success');
      onSaved();
      onClose();
    } catch (err) {
      showSnackbar(err.response?.data?.detail || 'Failed to save schedule', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          background: '#0A1929',
          border: fullScreen ? 'none' : '1px solid rgba(0,212,255,0.15)',
          borderRadius: fullScreen ? 0 : 3,
        },
      }}
    >
      <DialogTitle component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <CalendarMonthIcon sx={{ color: '#00D4FF' }} />
        <Box>
          <Typography variant="h6" fontWeight={600}>{t('admin.weeklySchedule')}</Typography>
          {user && (
            <Typography variant="caption" sx={{ color: '#8BAFC7' }}>
              {user.full_name || user.email}
            </Typography>
          )}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#00D4FF' }} size={28} />
          </Box>
        ) : (
          <Box>
            <Typography variant="caption" sx={{ color: '#8BAFC7', display: 'block', mb: 2 }}>
              Toggle days on/off and set the working hours for each day.
            </Typography>
            {rows.map((row, i) => (
              <motion.div
                key={row.day_of_week}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 1, sm: 1.5 },
                    py: 1.2,
                    px: { xs: 1, sm: 1.5 },
                    mb: 0.5,
                    borderRadius: 2,
                    background: row.is_active ? 'rgba(0,212,255,0.05)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${row.is_active ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)'}`,
                    transition: 'all 0.2s',
                    flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  }}
                >
                  {/* Day toggle */}
                  <ToggleButton
                    value="active"
                    selected={row.is_active}
                    onChange={() => updateRow(i, 'is_active', !row.is_active)}
                    size="small"
                    sx={{
                      width: 52,
                      height: 32,
                      fontWeight: 700,
                      fontSize: 12,
                      border: 'none',
                      borderRadius: '6px!important',
                      color: row.is_active ? '#00D4FF' : '#8BAFC7',
                      bgcolor: row.is_active ? 'rgba(0,212,255,0.15)!important' : 'rgba(255,255,255,0.05)!important',
                    }}
                  >
                    {DAYS[i]}
                  </ToggleButton>

                  {/* Time inputs */}
                  <TextField
                    type="time"
                    size="small"
                    value={row.start_time}
                    onChange={e => updateRow(i, 'start_time', e.target.value)}
                    disabled={!row.is_active}
                    inputProps={{ style: { fontSize: 13, padding: '6px 8px', colorScheme: 'dark' } }}
                    sx={{ width: { xs: '100px', sm: '110px' } }}
                  />
                  <Typography sx={{ color: '#8BAFC7', fontSize: 13 }}>to</Typography>
                  <TextField
                    type="time"
                    size="small"
                    value={row.end_time}
                    onChange={e => updateRow(i, 'end_time', e.target.value)}
                    disabled={!row.is_active}
                    inputProps={{ style: { fontSize: 13, padding: '6px 8px', colorScheme: 'dark' } }}
                    sx={{ width: { xs: '100px', sm: '110px' } }}
                  />

                  {/* Hours label */}
                  <Typography variant="caption" sx={{ color: row.is_active ? '#00D4FF' : '#8BAFC7', ml: 'auto', minWidth: 42, textAlign: 'right' }}>
                    {row.is_active ? (() => {
                      const [sh, sm] = row.start_time.split(':').map(Number);
                      const [eh, em] = row.end_time.split(':').map(Number);
                      const h = ((eh * 60 + em) - (sh * 60 + sm)) / 60;
                      return h > 0 ? `${h.toFixed(1)}h` : '—';
                    })() : 'Off'}
                  </Typography>
                </Box>
              </motion.div>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: '#8BAFC7' }}>Cancel</Button>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving || loading}
            sx={{ background: 'linear-gradient(135deg, #00D4FF, #7C4DFF)', px: 3 }}
          >
            Save Schedule
          </Button>
        </motion.div>
      </DialogActions>
    </Dialog>
  );
};

// ─── User Row ────────────────────────────────────────────────────────────────
const UserRow = ({ user, entries, index, onSchedule, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const userEntries = entries.filter(e => e.user_id === user.id);
  const isActive = userEntries.some(e => !e.clock_out);

  const totalMs = userEntries
    .filter(e => e.clock_out)
    .reduce((sum, e) => sum + (new Date(e.clock_out) - new Date(e.clock_in)), 0);
  const totalHours = (totalMs / 3600000).toFixed(1);

  const initials = user.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  const colors = ['#00D4FF', '#7C4DFF', '#00E676', '#FF6B35', '#FFD600'];
  const color = colors[index % colors.length];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 + 0.2 }}
    >
      <Box
        sx={{
          background: 'rgba(13,33,55,0.6)',
          border: '1px solid rgba(0,212,255,0.08)',
          borderRadius: 2,
          mb: 1,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: { xs: 1.5, sm: 2 },
            cursor: 'pointer',
            '&:hover': { background: 'rgba(0,212,255,0.04)' },
            flexWrap: 'wrap',
            gap: 1,
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <Avatar sx={{ bgcolor: `${color}30`, color, fontWeight: 700, mr: { xs: 1, sm: 2 }, width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 }, fontSize: { xs: 12, sm: 14 } }}>
            {initials}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body1" fontWeight={600} sx={{ color: '#E8F4FD', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              {user.full_name || 'No name'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#8BAFC7', fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>{user.email}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {user.is_superuser && (
              <Chip label="Admin" size="small" icon={<AdminPanelSettingsIcon />} 
                sx={{ bgcolor: 'rgba(124,77,255,0.2)', color: '#7C4DFF', borderColor: 'rgba(124,77,255,0.3)', border: '1px solid', fontSize: { xs: '0.7rem', sm: '0.75rem' } }} />
            )}
            <Chip
              label={isActive ? 'Clocked In' : 'Offline'}
              size="small"
              icon={<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: isActive ? '#00E676' : '#8BAFC7', ml: '8px!important' }} />}
              sx={{
                bgcolor: isActive ? 'rgba(0,230,118,0.15)' : 'rgba(139,175,199,0.15)',
                color: isActive ? '#00E676' : '#8BAFC7',
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
              }}
            />
            <Typography variant="caption" sx={{ color: '#8BAFC7', minWidth: 60, textAlign: 'right', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
              {totalHours}h total
            </Typography>
            {!user.is_superuser && (
              <Tooltip title="Manage schedule">
                <IconButton
                  size="small"
                  onClick={e => { e.stopPropagation(); onSchedule(user); }}
                  sx={{ color: '#00D4FF', '&:hover': { bgcolor: 'rgba(0,212,255,0.1)' }, p: { xs: 0.5, sm: 1 } }}
                >
                  <CalendarMonthIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {!user.is_superuser && (
              <Tooltip title="Delete user">
                <IconButton
                  size="small"
                  onClick={e => { e.stopPropagation(); onDelete(user); }}
                  sx={{ color: '#FF6B35', '&:hover': { bgcolor: 'rgba(255,107,53,0.1)' }, p: { xs: 0.5, sm: 1 } }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <IconButton size="small" sx={{ color: '#8BAFC7', p: { xs: 0.5, sm: 1 } }}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ px: 2, pb: 2 }}>
            {userEntries.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#8BAFC7', py: 1, pl: 7 }}>No entries yet</Typography>
            ) : (
              <TableContainer component={Paper} sx={{ background: 'rgba(5,13,26,0.5)', borderRadius: 2, overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#8BAFC7', borderColor: 'rgba(255,255,255,0.05)', fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>{t('admin.clockIn')}</TableCell>
                      <TableCell sx={{ color: '#8BAFC7', borderColor: 'rgba(255,255,255,0.05)', fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>{t('admin.clockOut')}</TableCell>
                      <TableCell sx={{ color: '#8BAFC7', borderColor: 'rgba(255,255,255,0.05)', fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>{t('admin.duration')}</TableCell>
                      <TableCell sx={{ color: '#8BAFC7', borderColor: 'rgba(255,255,255,0.05)', fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>{t('admin.status')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...userEntries].reverse().map(entry => {
                      const duration = entry.clock_out
                        ? ((new Date(entry.clock_out) - new Date(entry.clock_in)) / 3600000).toFixed(2) + 'h'
                        : '—';
                      return (
                        <TableRow key={entry.id} sx={{ '&:last-child td': { border: 0 } }}>
                          <TableCell sx={{ color: '#E8F4FD', borderColor: 'rgba(255,255,255,0.05)', fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>
                            {new Date(entry.clock_in).toLocaleString()}
                          </TableCell>
                          <TableCell sx={{ color: '#E8F4FD', borderColor: 'rgba(255,255,255,0.05)', fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>
                            {entry.clock_out ? new Date(entry.clock_out).toLocaleString() : '—'}
                          </TableCell>
                          <TableCell sx={{ color: '#00D4FF', borderColor: 'rgba(255,255,255,0.05)', fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>
                            {duration}
                          </TableCell>
                          <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                            {!entry.clock_out
                              ? <Chip label="Active" size="small" sx={{ bgcolor: 'rgba(0,230,118,0.2)', color: '#00E676', fontSize: { xs: '0.65rem', sm: '0.75rem' } }} />
                              : <Chip label="Done" size="small" sx={{ bgcolor: 'rgba(139,175,199,0.1)', color: '#8BAFC7', fontSize: { xs: '0.65rem', sm: '0.75rem' } }} />
                            }
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Collapse>
      </Box>
    </motion.div>
  );
};

// ─── Admin Dashboard ─────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [entries, setEntries] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', full_name: '', is_superuser: false });
  const [creating, setCreating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formError, setFormError] = useState('');
  const [scheduleTarget, setScheduleTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [entriesRes, usersRes] = await Promise.all([getAllEntries(), getUsers()]);
      setEntries(entriesRes);
      setUsersList(usersRes);
    } catch (err) {
      if (err.response?.status === 401) navigate('/');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportEntries();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'time_entries.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showSnackbar('Export completed', 'success');
    } catch (err) {
      showSnackbar('Failed to export data', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      showSnackbar(`User ${deleteTarget.full_name || deleteTarget.email} deleted`, 'success');
      fetchData(); // Refresh data
    } catch (err) {
      showSnackbar(err.response?.data?.detail || 'Failed to delete user', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      setFormError('All fields are required');
      return;
    }
    setCreating(true);
    setFormError('');
    try {
      await apiCreateUser(newUser.email, newUser.password, newUser.full_name, newUser.is_superuser);
      setNewUser({ email: '', password: '', full_name: '', is_superuser: false });
      setCreateDialogOpen(false);
      showSnackbar(`User ${newUser.email} created successfully`);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const logout = () => { localStorage.removeItem('token'); navigate('/'); };

  const activeNow = entries.filter(e => !e.clock_out).length;
  const todayEntries = entries.filter(e =>
    new Date(e.clock_in).toDateString() === new Date().toDateString()
  ).length;
  const filteredUsers = usersList.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Bar */}
      <motion.div initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
        <Box sx={{
          background: 'rgba(10,25,41,0.95)', backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,212,255,0.1)',
          px: { xs: 2, sm: 3 }, py: 1.5,
          display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 2 },
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <AccessTimeIcon sx={{ color: '#00D4FF', fontSize: { xs: 22, sm: 28 } }} />
          <Typography
            variant="h6" fontWeight={700}
            sx={{ color: '#E8F4FD', flex: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}
          >
            TimeClock
            <Typography component="span" variant="caption" sx={{ color: '#8BAFC7', ml: 1 }}>Admin</Typography>
          </Typography>

          {/* Refresh */}
          <Tooltip title="Refresh">
            <IconButton onClick={fetchData} size={isMobile ? 'small' : 'medium'} sx={{ color: '#8BAFC7' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          {/* New User — icon-only on mobile */}
          <Tooltip title="New User">
            {isMobile ? (
              <IconButton
                size="small"
                onClick={() => setCreateDialogOpen(true)}
                sx={{ color: '#00D4FF', border: '1px solid rgba(0,212,255,0.4)', borderRadius: 2, p: 0.8 }}
              >
                <PersonAddIcon fontSize="small" />
              </IconButton>
            ) : (
              <Button variant="outlined" startIcon={<PersonAddIcon />} onClick={() => setCreateDialogOpen(true)}
                sx={{ borderColor: 'rgba(0,212,255,0.4)', color: '#00D4FF', '&:hover': { borderColor: '#00D4FF', bgcolor: 'rgba(0,212,255,0.08)' } }}>
                New User
              </Button>
            )}
          </Tooltip>

          {/* Export — icon-only on mobile */}
          <Tooltip title="Export Excel">
            {isMobile ? (
              <IconButton
                size="small"
                onClick={handleExport}
                disabled={exporting}
                sx={{ color: '#00E676', border: '1px solid rgba(0,230,118,0.4)', borderRadius: 2, p: 0.8 }}
              >
                {exporting ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon fontSize="small" />}
              </IconButton>
            ) : (
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport} disabled={exporting}
                sx={{ borderColor: 'rgba(0,230,118,0.4)', color: '#00E676', '&:hover': { borderColor: '#00E676', bgcolor: 'rgba(0,230,118,0.08)' } }}>
                {exporting ? <CircularProgress size={18} color="inherit" /> : 'Export Excel'}
              </Button>
            )}
          </Tooltip>

          {/* Logout — icon-only on mobile */}
          <Tooltip title={t('dashboard.logout')}>
            {isMobile ? (
              <IconButton
                size="small"
                onClick={logout}
                sx={{ color: '#FF5252', border: '1px solid rgba(255,82,82,0.4)', borderRadius: 2, p: 0.8 }}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            ) : (
              <Button variant="outlined" startIcon={<LogoutIcon />} onClick={logout}
                sx={{ borderColor: 'rgba(255,82,82,0.4)', color: '#FF5252', '&:hover': { borderColor: '#FF5252', bgcolor: 'rgba(255,82,82,0.08)' } }}>
                {t('dashboard.logout')}
              </Button>
            )}
          </Tooltip>
        </Box>
      </motion.div>

      <Box sx={{ maxWidth: 1000, mx: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 4 } }}>
        {/* Stat Cards */}
        <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, mb: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
          <StatCard icon={<PeopleIcon />} label="Total Users" value={usersList.length} color="#00D4FF" delay={0.1} />
          <StatCard icon={<CheckCircleIcon />} label="Clocked In Now" value={activeNow} color="#00E676" delay={0.15} />
          <StatCard icon={<AccessTimeIcon />} label="Entries Today" value={todayEntries} color="#7C4DFF" delay={0.2} />
        </Box>

        {/* Users & Entries */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ color: '#E8F4FD' }}>{t('admin.employees')}</Typography>
            <TextField
              size="small" placeholder="Search..." value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#8BAFC7', fontSize: 18 }} /></InputAdornment> }}
              sx={{ width: { xs: '100%', sm: 220 } }}
            />
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#00D4FF' }} />
            </Box>
          ) : filteredUsers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <PeopleIcon sx={{ fontSize: 48, color: '#8BAFC7', mb: 1 }} />
              <Typography sx={{ color: '#8BAFC7' }}>No employees found</Typography>
            </Box>
          ) : (
            <AnimatePresence>
              {filteredUsers.map((user, i) => (
                <UserRow key={user.id} user={user} entries={entries} index={i}
                  onSchedule={setScheduleTarget} onDelete={setDeleteTarget} />
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      </Box>

      {/* Create User Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => { setCreateDialogOpen(false); setFormError(''); }}
        fullScreen={isMobile}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { background: '#0A1929', border: isMobile ? 'none' : '1px solid rgba(0,212,255,0.15)', borderRadius: isMobile ? 0 : 3 } }}
      >
        <DialogTitle component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PersonAddIcon sx={{ color: '#00D4FF' }} />
          <Typography variant="h6" fontWeight={600}>{t('admin.createEmployee')}</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: '8px!important' }}>
          <AnimatePresence>
            {formError && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{formError}</Alert>
              </motion.div>
            )}
          </AnimatePresence>
          <TextField fullWidth label="Full Name" value={newUser.full_name}
            onChange={e => setNewUser({ ...newUser, full_name: e.target.value })}
            sx={{ mb: 2 }} autoFocus
            InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ color: '#8BAFC7', fontSize: 20 }} /></InputAdornment> }} />
          <TextField fullWidth label="Email" type="email" value={newUser.email}
            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
            sx={{ mb: 2 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#8BAFC7', fontSize: 20 }} /></InputAdornment> }} />
          <TextField fullWidth label="Password" type="password" value={newUser.password}
            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
            sx={{ mb: 2 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#8BAFC7', fontSize: 20 }} /></InputAdornment> }} />
          <FormControlLabel
            control={
              <Switch checked={newUser.is_superuser}
                onChange={e => setNewUser({ ...newUser, is_superuser: e.target.checked })}
                sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#7C4DFF' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#7C4DFF' } }} />
            }
            label={<Typography variant="body2" sx={{ color: '#8BAFC7' }}>Admin privileges</Typography>}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => { setCreateDialogOpen(false); setFormError(''); }} sx={{ color: '#8BAFC7' }}>Cancel</Button>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button variant="contained" onClick={handleCreateUser} disabled={creating}
              sx={{ background: 'linear-gradient(135deg, #00D4FF, #7C4DFF)', px: 3 }}>
              {creating ? <CircularProgress size={18} color="inherit" /> : 'Create User'}
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>

      {/* Schedule Dialog */}
      <ScheduleDialog
        open={!!scheduleTarget}
        onClose={() => setScheduleTarget(null)}
        user={scheduleTarget}
        onSaved={fetchData}
        showSnackbar={showSnackbar}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        PaperProps={{ sx: { background: '#0A1929', border: '1px solid rgba(255,107,53,0.15)', borderRadius: 3 } }}>
        <DialogTitle component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DeleteIcon sx={{ color: '#FF6B35' }} />
          <Typography variant="h6" fontWeight={600}>{t('admin.deleteUser')}</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#E8F4FD' }}>
            Are you sure you want to delete <strong>{deleteTarget?.full_name || deleteTarget?.email}</strong>?
            This action cannot be undone and will remove all their time entries and schedules.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ color: '#8BAFC7' }}>Cancel</Button>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button variant="contained" onClick={handleDeleteUser} disabled={deleting}
              sx={{ background: 'linear-gradient(135deg, #FF6B35, #FF8A65)', px: 3 }}>
              {deleting ? <CircularProgress size={18} color="inherit" /> : 'Delete'}
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;
