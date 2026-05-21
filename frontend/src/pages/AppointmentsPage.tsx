import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Select, 
  MenuItem, 
  TextField, 
  FormControl, 
  InputLabel, 
  Alert,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import TableRowsIcon from '@mui/icons-material/TableRows';
import { useAppointments } from '../hooks/useAppointments';
import AppointmentsCalendar from './Appointments/components/AppointmentsCalendar';
import AppointmentsTable from './Appointments/components/AppointmentsTable';
import AppointmentDetailDrawer from './Appointments/components/AppointmentDetailDrawer';
import RescheduleDialog from './Appointments/components/RescheduleDialog';
import CancelDialog from './Appointments/components/CancelDialog';

export default function AppointmentsPage() {
  const {
    appointments,
    loading,
    viewMode,
    setViewMode,
    statusFilter,
    setStatusFilter,
    payFilter,
    setPayFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedAppt,
    setSelectedAppt,
    rescheduleTarget,
    setRescheduleTarget,
    cancelTarget,
    setCancelTarget,
    successMsg,
    clearFilters,
    handleRescheduleSuccess,
    handleCancelSuccess,
  } = useAppointments();

  const handleRescheduleClick = (e: React.MouseEvent, appt: any) => {
    e.stopPropagation();
    setRescheduleTarget(appt);
  };

  const handleCancelClick = (e: React.MouseEvent, appt: any) => {
    e.stopPropagation();
    setCancelTarget(appt);
  };

  const hasFilters = statusFilter !== 'all' || payFilter !== 'all' || startDate || endDate;

  return (
    <Box sx={{ flex1: 1, overflowY: 'auto', p: 4, bgcolor: '#FAF8F5', minHeight: '100vh' }}>
      {/* Header Panel */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography 
            variant="h1" 
            sx={{ 
              fontSize: '2rem', 
              fontWeight: 600, 
              color: '#2A1F1A',
              fontFamily: "'Cormorant Garamond', serif"
            }}
          >
            Appointments
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
            {appointments.length} records
          </Typography>
        </Box>

        {/* View Mode Switcher */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, val) => val && setViewMode(val)}
          size="small"
          sx={{
            bgcolor: '#FFFFFF',
            border: '1px solid',
            borderColor: 'divider',
            '& .MuiToggleButton-root': {
              border: 'none',
              px: 2,
              py: 0.75,
              fontSize: '0.78rem',
              fontWeight: 500,
              textTransform: 'none',
              color: 'text.secondary',
              borderRadius: 3,
              '&.Mui-selected': {
                bgcolor: '#2A1F1A',
                color: '#FFFFFF',
                '&:hover': {
                  bgcolor: '#2A1F1A',
                }
              }
            }
          }}
        >
          <ToggleButton value="table">
            <TableRowsIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} /> Table
          </ToggleButton>
          <ToggleButton value="calendar">
            <GridViewIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} /> Calendar
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Success notification banner */}
      {successMsg && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3, 
            borderRadius: 3, 
            fontSize: '0.8rem',
            bgcolor: 'rgba(122, 158, 126, 0.08)',
            color: '#7A9E7E',
            border: '1px solid rgba(122, 158, 126, 0.2)'
          }}
        >
          {successMsg}
        </Alert>
      )}

      {/* Filter toolbar */}
      <Box 
        display="flex" 
        gap={2} 
        alignItems="center" 
        flexWrap="wrap" 
        sx={{ mb: 3.5 }}
      >
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="status-filter-label" sx={{ fontSize: '0.82rem' }}>Status</InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ borderRadius: 2.5, bgcolor: '#FFFFFF', fontSize: '0.82rem' }}
          >
            <MenuItem value="all" sx={{ fontSize: '0.82rem' }}>All Statuses</MenuItem>
            <MenuItem value="scheduled" sx={{ fontSize: '0.82rem' }}>Scheduled</MenuItem>
            <MenuItem value="completed" sx={{ fontSize: '0.82rem' }}>Completed</MenuItem>
            <MenuItem value="cancelled" sx={{ fontSize: '0.82rem' }}>Cancelled</MenuItem>
            <MenuItem value="rescheduled" sx={{ fontSize: '0.82rem' }}>Rescheduled</MenuItem>
            <MenuItem value="no_show" sx={{ fontSize: '0.82rem' }}>No Show</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="pay-filter-label" sx={{ fontSize: '0.82rem' }}>Payment</InputLabel>
          <Select
            labelId="pay-filter-label"
            value={payFilter}
            label="Payment"
            onChange={(e) => setPayFilter(e.target.value)}
            sx={{ borderRadius: 2.5, bgcolor: '#FFFFFF', fontSize: '0.82rem' }}
          >
            <MenuItem value="all" sx={{ fontSize: '0.82rem' }}>All Payments</MenuItem>
            <MenuItem value="pending" sx={{ fontSize: '0.82rem' }}>Pending</MenuItem>
            <MenuItem value="paid" sx={{ fontSize: '0.82rem' }}>Paid</MenuItem>
            <MenuItem value="partial" sx={{ fontSize: '0.82rem' }}>Partial</MenuItem>
            <MenuItem value="refunded" sx={{ fontSize: '0.82rem' }}>Refunded</MenuItem>
          </Select>
        </FormControl>

        <TextField
          type="date"
          size="small"
          label="From date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ 
            bgcolor: '#FFFFFF', 
            borderRadius: 2.5,
            '& .MuiOutlinedInput-root': { borderRadius: 2.5 },
            '& .MuiInputBase-input': { fontSize: '0.82rem' }
          }}
        />

        <TextField
          type="date"
          size="small"
          label="To date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ 
            bgcolor: '#FFFFFF', 
            borderRadius: 2.5,
            '& .MuiOutlinedInput-root': { borderRadius: 2.5 },
            '& .MuiInputBase-input': { fontSize: '0.82rem' }
          }}
        />

        {hasFilters && (
          <Button
            variant="outlined"
            onClick={clearFilters}
            sx={{
              borderColor: 'rgba(201, 132, 122, 0.4)',
              color: '#C9847A',
              borderRadius: 2.5,
              fontSize: '0.78rem',
              fontWeight: 600,
              textTransform: 'none',
              py: 0.75,
              px: 2,
              '&:hover': {
                borderColor: '#C9847A',
                bgcolor: 'rgba(201, 132, 122, 0.04)'
              }
            }}
          >
            Clear Filters
          </Button>
        )}
      </Box>

      {/* Main Grid View Selection */}
      {viewMode === 'calendar' ? (
        <AppointmentsCalendar 
          appointments={appointments} 
          onSelect={setSelectedAppt} 
        />
      ) : (
        <AppointmentsTable
          appointments={appointments}
          loading={loading}
          onSelect={setSelectedAppt}
          onRescheduleClick={handleRescheduleClick}
          onCancelClick={handleCancelClick}
        />
      )}

      {/* Sidebar Panel overlay detail view */}
      <AppointmentDetailDrawer
        appt={selectedAppt}
        open={Boolean(selectedAppt) && !rescheduleTarget && !cancelTarget}
        onClose={() => setSelectedAppt(null)}
        onRescheduleClick={() => setRescheduleTarget(selectedAppt)}
        onCancelClick={() => setCancelTarget(selectedAppt)}
      />

      {/* Action dialogues overlay modals */}
      <RescheduleDialog
        appt={rescheduleTarget}
        open={Boolean(rescheduleTarget)}
        onClose={() => setRescheduleTarget(null)}
        onSuccess={handleRescheduleSuccess}
      />

      <CancelDialog
        appt={cancelTarget}
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onSuccess={handleCancelSuccess}
      />
    </Box>
  );
}
