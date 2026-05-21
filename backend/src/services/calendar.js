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

    // Calculate start and end times in local execution timezone, then represent in ISO format
    const startLocal = new Date(`${appointmentDate}T${normalizedTime}`);
    const endLocal = new Date(startLocal.getTime() + durationMinutes * 60 * 1000);

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
        summary: `Westhill Nails Appointment - ${clientName}`,
        description: descriptionText,
        start: {
          dateTime: startLocal.toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: endLocal.toISOString(),
          timeZone: 'UTC'
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
    const newStartLocal = new Date(`${newDate}T${normalizedTime}`);
    const newEndLocal = new Date(newStartLocal.getTime() + durationMs);

    const response = await calendar.events.patch({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: {
        start: {
          dateTime: newStartLocal.toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: newEndLocal.toISOString(),
          timeZone: 'UTC'
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
