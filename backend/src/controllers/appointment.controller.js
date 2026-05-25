const { supabase } = require('../config/supabase');
const { validationResult } = require('express-validator');
const {
  isWithinWorkingHours,
  normalizeTime,
  getAvailableSuggestions
} = require('../utils/appointment.utils');
const calendarService = require('../services/calendar');

// Create Appointment: POST /api/appointments
const createAppointment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  // Support both camelCase and snake_case inputs
  const clientId = req.body.clientId || req.body.client_id;
  const serviceName = req.body.serviceName || req.body.service_name;
  const appointmentDate = req.body.appointmentDate || req.body.appointment_date;
  const appointmentTime = req.body.appointmentTime || req.body.appointment_time;
  const paymentMethod = req.body.paymentMethod || req.body.payment_method || 'unpaid';
  const paymentStatus = req.body.paymentStatus || req.body.payment_status || 'pending';
  const staffId = req.body.staffId || req.body.staff_id || null;
  const notes = req.body.notes || '';
  const bookingSource = req.body.bookingSource || req.body.booking_source || 'whatsapp_ai';

  if (!clientId || !serviceName || !appointmentDate || !appointmentTime) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required fields: clientId, serviceName, appointmentDate, appointmentTime'
    });
  }

  try {
    // Normalize requested time
    const normalizedTime = normalizeTime(appointmentTime);

    // 1. Working Hours Check
    if (!isWithinWorkingHours(appointmentDate, normalizedTime)) {
      return res.status(400).json({
        status: 'error',
        message: `Requested time ${appointmentTime} is outside salon working hours. Monday-Saturday: 9AM-7PM, Sunday: 10AM-5PM.`
      });
    }

    // 2. Fetch Client Info (required for Google Calendar summary & description)
    const { data: client, error: clientFetchErr } = await supabase
      .from('clients')
      .select('full_name, phone_number')
      .eq('id', clientId)
      .single();

    if (clientFetchErr || !client) {
      return res.status(404).json({
        status: 'error',
        message: 'Client not found. Cannot schedule appointment without a valid client.'
      });
    }

    // 3. Time Slot Conflict Check
    // Fetch all active (scheduled or rescheduled) appointments on the same date
    const { data: existingAppointments, error: queryError } = await supabase
      .from('appointments')
      .select('*')
      .eq('appointment_date', appointmentDate)
      .in('status', ['scheduled', 'rescheduled']);

    if (queryError) throw queryError;

    // Check if slot conflicts
    const conflictExists = existingAppointments.some(
      app => normalizeTime(app.appointment_time) === normalizedTime
    );

    if (conflictExists) {
      const suggestions = getAvailableSuggestions(
        appointmentDate,
        normalizedTime,
        existingAppointments
      );

      return res.status(409).json({
        status: 'conflict',
        message: `${appointmentTime} is already booked on ${appointmentDate}.`,
        suggestions
      });
    }

    // 4. Create Google Calendar Event (if OAuth is configured)
    let googleCalendarEventId = null;
    try {
      const eventData = await calendarService.createEvent({
        clientName: client.full_name,
        clientPhone: client.phone_number,
        serviceName: serviceName,
        appointmentDate: appointmentDate,
        appointmentTime: normalizedTime,
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        notes: notes,
        bookingSource: bookingSource
      });
      
      if (eventData && eventData.id) {
        googleCalendarEventId = eventData.id;
      }
    } catch (calError) {
      console.warn('Google Calendar event creation failed, proceeding with DB booking only:', calError.message);
    }

    // 5. Insert Appointment into Supabase
    const { data: newAppointment, error: insertError } = await supabase
      .from('appointments')
      .insert({
        client_id: clientId,
        service_name: serviceName,
        appointment_date: appointmentDate,
        appointment_time: normalizedTime,
        status: 'scheduled',
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        staff_id: staffId,
        booking_source: bookingSource,
        notes: notes,
        google_calendar_event_id: googleCalendarEventId
      })
      .select()
      .single();

    if (insertError) {
      // Roll back Google Calendar event if database insertion fails
      if (googleCalendarEventId) {
        try {
          await calendarService.cancelEvent(googleCalendarEventId);
        } catch (rollbackErr) {
          console.error('Failed to roll back Google Calendar event after DB failure:', rollbackErr.message);
        }
      }
      throw insertError;
    }

    // 6. Update Client's Total Bookings Count
    const { data: clientData, error: clientDataFetchErr } = await supabase
      .from('clients')
      .select('total_bookings')
      .eq('id', clientId)
      .single();

    if (!clientDataFetchErr && clientData) {
      await supabase
        .from('clients')
        .update({ total_bookings: (clientData.total_bookings || 0) + 1 })
        .eq('id', clientId);
    }

    // 7. Audit Log Entry
    await supabase.from('appointment_logs').insert({
      appointment_id: newAppointment.id,
      previous_status: null,
      new_status: 'scheduled',
      changed_by: bookingSource === 'whatsapp_ai' ? 'whatsapp_ai' : 'admin_crm',
      notes: `Appointment scheduled for ${appointmentDate} at ${normalizedTime}. Google Event: ${googleCalendarEventId || 'none'}`
    });

    return res.status(201).json({
      status: 'success',
      message: 'Appointment scheduled successfully',
      data: {
        ...newAppointment,
        client_name: client.full_name,
        phone_number: client.phone_number,
        appointment_date: `${newAppointment.appointment_date}T${newAppointment.appointment_time || '00:00:00'}`,
        booked_by: newAppointment.booking_source,
      }
    });
  } catch (error) {
    console.error('Error in createAppointment:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while scheduling appointment',
      error: error.message
    });
  }
};

// Reschedule Appointment: PUT /api/appointments/:id/reschedule
const rescheduleAppointment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  const { id } = req.params;
  const newDate = req.body.newDate || req.body.new_date;
  const newTime = req.body.newTime || req.body.new_time;
  const changedBy = req.body.changedBy || req.body.changed_by || 'admin_crm';

  if (!newDate || !newTime) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required fields: newDate, newTime'
    });
  }

  try {
    // 1. Fetch current appointment details
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ status: 'error', message: 'Appointment not found' });
      }
      throw fetchError;
    }

    const normalizedTime = normalizeTime(newTime);

    // 2. Working Hours Check
    if (!isWithinWorkingHours(newDate, normalizedTime)) {
      return res.status(400).json({
        status: 'error',
        message: `Requested time ${newTime} is outside salon working hours. Monday-Saturday: 9AM-7PM, Sunday: 10AM-5PM.`
      });
    }

    // 3. Conflict Check (excluding current appointment being rescheduled)
    const { data: existingAppointments, error: queryError } = await supabase
      .from('appointments')
      .select('*')
      .eq('appointment_date', newDate)
      .neq('id', id)
      .in('status', ['scheduled', 'rescheduled']);

    if (queryError) throw queryError;

    const conflictExists = existingAppointments.some(
      app => normalizeTime(app.appointment_time) === normalizedTime
    );

    if (conflictExists) {
      const suggestions = getAvailableSuggestions(
        newDate,
        normalizedTime,
        existingAppointments
      );

      return res.status(409).json({
        status: 'conflict',
        message: `${newTime} is already booked on ${newDate}.`,
        suggestions
      });
    }

    // 4. Update Google Calendar Event
    if (appointment.google_calendar_event_id) {
      try {
        await calendarService.updateEvent(
          appointment.google_calendar_event_id,
          newDate,
          normalizedTime
        );
      } catch (calError) {
        console.warn('Google Calendar update failed, proceeding with database rescheduling:', calError.message);
      }
    }

    // 5. Perform Update in Supabase
    const previousStatus = appointment.status;
    const previousDate = appointment.appointment_date;
    const previousTime = appointment.appointment_time;

    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update({
        appointment_date: newDate,
        appointment_time: normalizedTime,
        status: 'rescheduled'
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Fetch client for name/phone normalization
    const { data: client } = await supabase
      .from('clients')
      .select('full_name, phone_number')
      .eq('id', updatedAppointment.client_id)
      .single();

    // 6. Create Audit Log Entry
    await supabase.from('appointment_logs').insert({
      appointment_id: id,
      previous_status: previousStatus,
      new_status: 'rescheduled',
      changed_by: changedBy,
      notes: `Rescheduled from ${previousDate} ${previousTime} to ${newDate} ${normalizedTime}.`
    });

    return res.status(200).json({
      status: 'success',
      message: 'Appointment rescheduled successfully',
      data: {
        ...updatedAppointment,
        client_name: client?.full_name || 'Unknown',
        phone_number: client?.phone_number || '',
        appointment_date: `${updatedAppointment.appointment_date}T${updatedAppointment.appointment_time || '00:00:00'}`,
        booked_by: updatedAppointment.booking_source,
      }
    });
  } catch (error) {
    console.error('Error in rescheduleAppointment:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while rescheduling appointment',
      error: error.message
    });
  }
};

// Cancel Appointment: PUT /api/appointments/:id/cancel
const cancelAppointment = async (req, res) => {
  const { id } = req.params;
  const reason = req.body.reason || '';
  const changedBy = req.body.changedBy || req.body.changed_by || 'admin_crm';

  try {
    // 1. Fetch current appointment details
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ status: 'error', message: 'Appointment not found' });
      }
      throw fetchError;
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        status: 'error',
        message: 'Appointment is already cancelled'
      });
    }

    // 2. Cancel Google Calendar Event
    if (appointment.google_calendar_event_id) {
      try {
        await calendarService.cancelEvent(appointment.google_calendar_event_id);
      } catch (calError) {
        console.warn('Google Calendar cancellation failed, proceeding with database update:', calError.message);
      }
    }

    // 3. Perform Update in Supabase
    const previousStatus = appointment.status;

    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Fetch client for name/phone normalization
    const { data: client } = await supabase
      .from('clients')
      .select('full_name, phone_number')
      .eq('id', updatedAppointment.client_id)
      .single();

    // 4. Create Audit Log Entry
    await supabase.from('appointment_logs').insert({
      appointment_id: id,
      previous_status: previousStatus,
      new_status: 'cancelled',
      changed_by: changedBy,
      notes: `Cancelled. Reason: ${reason || 'None provided'}`
    });

    return res.status(200).json({
      status: 'success',
      message: 'Appointment cancelled successfully',
      data: {
        ...updatedAppointment,
        client_name: client?.full_name || 'Unknown',
        phone_number: client?.phone_number || '',
        appointment_date: `${updatedAppointment.appointment_date}T${updatedAppointment.appointment_time || '00:00:00'}`,
        booked_by: updatedAppointment.booking_source,
      }
    });
  } catch (error) {
    console.error('Error in cancelAppointment:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while cancelling appointment',
      error: error.message
    });
  }
};

// Get Appointments: GET /api/appointments
const getAppointments = async (req, res) => {
  const { startDate, endDate, status, paymentStatus, clientId } = req.query;

  try {
    // Select appointments joined with client details
    let query = supabase
      .from('appointments')
      .select('*, clients:client_id(*)');

    if (startDate) {
      query = query.gte('appointment_date', startDate);
    }
    if (endDate) {
      query = query.lte('appointment_date', endDate);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (paymentStatus) {
      query = query.eq('payment_status', paymentStatus);
    }
    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    // Order by date and time descending
    query = query.order('appointment_date', { ascending: false }).order('appointment_time', { ascending: false });

    const { data: appointmentsList, error } = await query;

    if (error) throw error;

    // Normalize appointments to ApiAppointment shape the frontend expects
    const normalizedList = (appointmentsList || []).map(a => ({
      id: a.id,
      client_id: a.client_id,
      client_name: a.clients?.full_name || 'Unknown',
      phone_number: a.clients?.phone_number || '',
      service_name: a.service_name,
      service_price: a.service_price,
      appointment_date: `${a.appointment_date}T${a.appointment_time || '00:00:00'}`,
      status: a.status,
      payment_status: a.payment_status,
      booked_by: a.booking_source,
      google_event_id: a.google_calendar_event_id,
      notes: a.notes,
      created_at: a.created_at,
    }));

    return res.status(200).json({
      status: 'success',
      data: normalizedList
    });
  } catch (error) {
    console.error('Error in getAppointments:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while fetching appointments',
      error: error.message
    });
  }
};


// Log Reminder Sent: POST /api/appointments/:id/log
// Called by n8n reminder cron nodes to record that a WhatsApp reminder was dispatched.
const logReminderSent = async (req, res) => {
  const { id } = req.params;
  const action = req.body.action || 'reminder_sent';
  const changedBy = req.body.changedBy || req.body.changed_by || 'system';
  const note = req.body.note || `Reminder action: ${action}`;

  try {
    // Verify appointment exists
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('id, status')
      .eq('id', id)
      .single();

    if (fetchError || !appointment) {
      return res.status(404).json({ status: 'error', message: 'Appointment not found' });
    }

    // Insert audit log entry for the reminder
    const { error: logError } = await supabase.from('appointment_logs').insert({
      appointment_id: id,
      previous_status: appointment.status,
      new_status: appointment.status,  // status unchanged — just logging the reminder
      changed_by: changedBy,
      notes: note
    });

    if (logError) throw logError;

    return res.status(200).json({
      status: 'success',
      message: `Reminder log recorded for appointment ${id}`,
      action
    });
  } catch (error) {
    console.error('Error in logReminderSent:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while logging reminder',
      error: error.message
    });
  }
};

// Archive Conversations: POST /api/conversations/archive
// Called by n8n daily 3AM cron to archive WhatsApp AI conversation logs.
const archiveConversations = async (req, res) => {
  const date = req.body.date;
  const source = req.body.source || 'whatsapp_ai';
  const archivedBy = req.body.archivedBy || req.body.archived_by || 'n8n_cron';

  if (!date) {
    return res.status(400).json({ status: 'error', message: 'date is required (YYYY-MM-DD)' });
  }

  try {
    // Fetch crm_live_chats records created on the given date
    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;

    const { data: chats, error: fetchError } = await supabase
      .from('crm_live_chats')
      .select('id, client_id, source, agent_type, created_at')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay);

    if (fetchError) throw fetchError;

    const count = chats ? chats.length : 0;

    console.log(`[Conv Archive] ${archivedBy} archived ${count} conversation(s) for ${date} (source: ${source})`);

    return res.status(200).json({
      status: 'success',
      message: `Conversation archive complete for ${date}`,
      date,
      source,
      archivedBy,
      conversationsArchived: count
    });
  } catch (error) {
    console.error('Error in archiveConversations:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while archiving conversations',
      error: error.message
    });
  }
};

// Get Available Slots: GET /api/appointments/available-slots?date=YYYY-MM-DD&serviceName=xxx
const getAvailableSlots = async (req, res) => {
  const { date, serviceName } = req.query;

  if (!date) {
    return res.status(400).json({
      status: 'error',
      message: 'Query parameter "date" is required (YYYY-MM-DD)'
    });
  }

  try {
    // Determine working hours for the requested day
    const dateObj = new Date(`${date}T00:00:00`);
    const day = dateObj.getDay(); // 0 = Sunday

    let openMinutes, closeMinutes;
    if (day === 0) {
      // Sunday: 10:00 AM – 5:00 PM
      openMinutes = 600;   // 10:00
      closeMinutes = 1020; // 17:00
    } else {
      // Mon-Sat: 9:00 AM – 7:00 PM
      openMinutes = 540;   // 09:00
      closeMinutes = 1140; // 19:00
    }

    // Define service duration map (in minutes)
    const durationMap = {
      'gel manicure deluxe': 45,
      'luxury pedicure': 60,
      'full gel nail extensions': 75,
      'botox aesthetic session': 30,
      'lip dermal filler session': 45,
      'lip filler session': 45
    };

    // Determine slot interval (defaults to 30 minutes if no matching service found)
    let interval = 30;
    if (serviceName) {
      const normalizedService = serviceName.toLowerCase().trim();
      for (const [key, val] of Object.entries(durationMap)) {
        if (normalizedService.includes(key) || key.includes(normalizedService)) {
          interval = val;
          break;
        }
      }
    }

    // Generate all slots within working hours using the dynamic interval
    const allSlots = [];
    for (let m = openMinutes; m + interval <= closeMinutes; m += interval) {
      const hh = String(Math.floor(m / 60)).padStart(2, '0');
      const mm = String(m % 60).padStart(2, '0');
      allSlots.push(`${hh}:${mm}`);
    }

    // Fetch existing appointments for this date
    const { data: existingAppointments, error } = await supabase
      .from('appointments')
      .select('appointment_time')
      .eq('appointment_date', date)
      .in('status', ['scheduled', 'rescheduled']);

    if (error) throw error;

    // Build set of booked times (normalized to HH:MM)
    const bookedTimes = new Set(
      (existingAppointments || []).map(app => {
        const parts = app.appointment_time.split(':');
        return `${parts[0]}:${parts[1]}`;
      })
    );

    // Filter out booked slots
    const availableSlots = allSlots.filter(slot => !bookedTimes.has(slot));

    return res.status(200).json({
      status: 'success',
      date,
      serviceName: serviceName || null,
      slots: availableSlots
    });
  } catch (error) {
    console.error('Error in getAvailableSlots:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while fetching available slots',
      error: error.message
    });
  }
};

module.exports = {
  createAppointment,
  rescheduleAppointment,
  cancelAppointment,
  getAppointments,
  getAvailableSlots,
  logReminderSent,
  archiveConversations
};
