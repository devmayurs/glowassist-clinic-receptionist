const { supabase } = require('../config/supabase');

/**
 * GET /api/booking-sessions/:phone
 * Retrieve booking session by phone number.
 * Returns the session object or null if no active session exists.
 */
const getSession = async (req, res) => {
  const { phone } = req.params;

  if (!phone) {
    return res.status(400).json({ status: 'error', message: 'Phone number is required' });
  }

  try {
    const { data, error } = await supabase
      .from('booking_sessions')
      .select('*')
      .eq('phone_number', phone)
      .maybeSingle();

    if (error) throw error;

    return res.status(200).json({
      status: 'success',
      data: data || null
    });
  } catch (error) {
    console.error('Error in getSession:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while fetching booking session',
      error: error.message
    });
  }
};

/**
 * PUT /api/booking-sessions/:phone
 * Upsert (create or update) a booking session for a phone number.
 * Body: { fullName, serviceName, preferredDate, preferredTime, paymentMethod, paymentStatus, notes }
 */
const upsertSession = async (req, res) => {
  const { phone } = req.params;

  if (!phone) {
    return res.status(400).json({ status: 'error', message: 'Phone number is required' });
  }

  const {
    fullName, full_name,
    serviceName, service_name,
    preferredDate, preferred_date,
    preferredTime, preferred_time,
    paymentMethod, payment_method,
    paymentStatus, payment_status,
    notes
  } = req.body;

  try {
    const upsertData = {
      phone_number: phone,
      full_name: fullName || full_name || null,
      service_name: serviceName || service_name || null,
      preferred_date: preferredDate || preferred_date || null,
      preferred_time: preferredTime || preferred_time || null,
      payment_method: paymentMethod || payment_method || 'cash',
      payment_status: paymentStatus || payment_status || 'pending',
      notes: notes || null,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('booking_sessions')
      .upsert(upsertData, { onConflict: 'phone_number' })
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    console.error('Error in upsertSession:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while saving booking session',
      error: error.message
    });
  }
};

/**
 * DELETE /api/booking-sessions/:phone
 * Delete a booking session for a phone number (cleanup after booking/cancel).
 */
const deleteSession = async (req, res) => {
  const { phone } = req.params;

  if (!phone) {
    return res.status(400).json({ status: 'error', message: 'Phone number is required' });
  }

  try {
    const { error } = await supabase
      .from('booking_sessions')
      .delete()
      .eq('phone_number', phone);

    if (error) throw error;

    return res.status(200).json({
      status: 'success',
      message: `Booking session deleted for ${phone}`
    });
  } catch (error) {
    console.error('Error in deleteSession:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while deleting booking session',
      error: error.message
    });
  }
};

module.exports = {
  getSession,
  upsertSession,
  deleteSession
};
