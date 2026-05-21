const { calendar } = require('../config/google');
const { supabase } = require('../config/supabase');
const { normalizeTime } = require('../utils/appointment.utils');

/**
 * Helper to fetch a service's duration from the database.
 * Falls back to 30 minutes if service is not found or fails.
 * 
 * @param {string} serviceName 
 * @returns {Promise<number>} duration in minutes
 */
async function getServiceDuration(serviceName) {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('duration_minutes')
      .eq('name', serviceName)
      .single();

    if (error || !data) {
      // Fallback standard nail service duration is 30 mins
      return 30;
    }
    return data.duration_minutes;
  } catch (err) {
    console.error('Error fetching service duration:', err.message);
    return 30;
  }
}

/**
 * Creates an event in Google Calendar and returns the event metadata.
 * 
 * @param {Object} appointmentData 
 * @returns {Promise<Object>} event object containing ID and link
 */
async function createEvent(appointmentData) {
  const {
    clientName,
    clientPhone,
    serviceName,
    appointmentDate,
    appointmentTime,
    paymentMethod = 'unpaid',
    paymentStatus = 'pending',
    notes = '',
    bookingSource = 'whatsapp_ai'
  } = appointmentData;

  try {
    const normalizedTime = normalizeTime(appointmentTime);
    const durationMinutes = await getServiceDuration(serviceName);

    // Build start/end as local datetime strings (no UTC conversion — interpreted as IST by Google)
    const [sh, sm] = normalizedTime.split(':').map(Number);
    const totalEndMinutes = sh * 60 + sm + durationMinutes;
    const endH = String(Math.floor(totalEndMinutes / 60) % 24).padStart(2, '0');
    const endM = String(totalEndMinutes % 60).padStart(2, '0');
    const startDateTime = `${appointmentDate}T${normalizedTime}`;
    const endDateTime   = `${appointmentDate}T${endH}:${endM}:00`;

    const descriptionText = [
      `Client: ${clientName}`,
      `Phone: ${clientPhone}`,
      `Service: ${serviceName}`,
      `Payment: ${paymentMethod} (${paymentStatus})`,
      `Notes: ${notes || 'None'}`,
      `Source: ${bookingSource === 'whatsapp_ai' ? 'WhatsApp AI' : 'CRM Dashboard'}`
    ].join('\n');

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: `Lumière Med Spa — ${serviceName} (${clientName})`,
        description: descriptionText,
        start: {
          dateTime: startDateTime,
          timeZone: 'Asia/Kolkata'
        },
        end: {
          dateTime: endDateTime,
          timeZone: 'Asia/Kolkata'
        },
        status: 'confirmed'
      }
    });

    console.log(`Successfully created Google Calendar Event. ID: ${response.data.id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to create event in Google Calendar:', error.message);
    throw new Error(`Google Calendar Service Error: ${error.message}`);
  }
}

/**
 * Updates/Reschedules an existing event in Google Calendar.
 * Computes new end time keeping the original event duration.
 * 
 * @param {string} eventId 
 * @param {string} newDate - YYYY-MM-DD
 * @param {string} newTime - HH:MM:SS
 * @returns {Promise<Object>} updated event metadata
 */
async function updateEvent(eventId, newDate, newTime) {
  if (!eventId) {
    console.warn('No Google Calendar Event ID provided for rescheduling. Skipping Google Calendar sync.');
    return null;
  }

  try {
    // 1. Fetch current event from Google Calendar to check its duration
    let durationMs = 30 * 60 * 1000; // Default 30 minutes in ms
    try {
      const currentEvent = await calendar.events.get({
        calendarId: 'primary',
        eventId: eventId
      });

      const oldStart = new Date(currentEvent.data.start.dateTime);
      const oldEnd = new Date(currentEvent.data.end.dateTime);
      if (!isNaN(oldStart) && !isNaN(oldEnd)) {
        durationMs = oldEnd.getTime() - oldStart.getTime();
      }
    } catch (fetchError) {
      console.warn(`Could not fetch original calendar event details: ${fetchError.message}. Using default duration.`);
    }

    const normalizedTime = normalizeTime(newTime);
    const [rsh, rsm] = normalizedTime.split(':').map(Number);
    const durationMins = Math.round(durationMs / 60000);
    const totalREndMinutes = rsh * 60 + rsm + durationMins;
    const rEndH = String(Math.floor(totalREndMinutes / 60) % 24).padStart(2, '0');
    const rEndM = String(totalREndMinutes % 60).padStart(2, '0');
    const newStartDateTime = `${newDate}T${normalizedTime}`;
    const newEndDateTime   = `${newDate}T${rEndH}:${rEndM}:00`;

    const response = await calendar.events.patch({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: {
        start: {
          dateTime: newStartDateTime,
          timeZone: 'Asia/Kolkata'
        },
        end: {
          dateTime: newEndDateTime,
          timeZone: 'Asia/Kolkata'
        }
      }
    });

    console.log(`Successfully updated Google Calendar Event. ID: ${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to update event in Google Calendar:', error.message);
    throw new Error(`Google Calendar Service Error: ${error.message}`);
  }
}

/**
 * Deletes/Cancels an existing event in Google Calendar.
 * 
 * @param {string} eventId 
 * @returns {Promise<boolean>} status of deletion
 */
async function cancelEvent(eventId) {
  if (!eventId) {
    console.warn('No Google Calendar Event ID provided for deletion. Skipping Google Calendar sync.');
    return true;
  }

  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId
    });
    console.log(`Successfully deleted Google Calendar Event. ID: ${eventId}`);
    return true;
  } catch (error) {
    // 404 or 410 means already deleted or expired
    if (error.code === 404 || error.code === 410) {
      console.warn(`Google Calendar Event ${eventId} was already deleted or not found.`);
      return true;
    }
    console.error('Failed to delete event in Google Calendar:', error.message);
    throw new Error(`Google Calendar Service Error: ${error.message}`);
  }
}

module.exports = {
  createEvent,
  updateEvent,
  cancelEvent
};
