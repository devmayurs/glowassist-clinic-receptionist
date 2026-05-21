const { supabase } = require('../config/supabase');
const { validationResult } = require('express-validator');

// Create Client: POST /api/clients
const createClient = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  const { fullName, phoneNumber, email, notes, clientType, bookingSource } = req.body;

  try {
    // Check if client already exists by phone
    const { data: existingClient, error: searchError } = await supabase
      .from('clients')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();

    if (searchError && searchError.code !== 'PGRST116') { // PGRST116 is PostgreSQL "no rows returned"
      throw searchError;
    }

    if (existingClient) {
      return res.status(409).json({
        status: 'error',
        message: 'Client with this phone number already exists',
        data: {
          ...existingClient,
          name: existingClient.full_name
        }
      });
    }

    // Insert new client
    const { data: newClient, error: insertError } = await supabase
      .from('clients')
      .insert({
        full_name: fullName,
        phone_number: phoneNumber,
        email: email || null,
        client_type: clientType || 'first_time',
        booking_source: bookingSource || 'whatsapp_ai',
        notes: notes || null,
        total_bookings: 0
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return res.status(201).json({
      status: 'success',
      message: 'Client created successfully',
      data: {
        ...newClient,
        name: newClient.full_name
      }
    });
  } catch (error) {
    console.error('Error in createClient:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while creating client',
      error: error.message
    });
  }
};

// Get Clients: GET /api/clients
const getClients = async (req, res) => {
  const { search, clientType, bookingSource, page = 1, limit = 10 } = req.query;

  try {
    let query = supabase.from('clients').select('*', { count: 'exact' });

    // Dynamic Filter: Search on Name or Phone Number
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone_number.ilike.%${search}%`);
    }

    // Dynamic Filter: Client Type ('first_time', 'regular', 'vip')
    if (clientType) {
      query = query.eq('client_type', clientType);
    }

    // Dynamic Filter: Booking Source ('whatsapp_ai', 'manual_crm', 'live_chat')
    if (bookingSource) {
      query = query.eq('booking_source', bookingSource);
    }

    // Pagination
    const fromIndex = (page - 1) * limit;
    const toIndex = fromIndex + parseInt(limit) - 1;
    query = query.range(fromIndex, toIndex).order('created_at', { ascending: false });

    const { data: clientsList, count, error } = await query;
    if (error) throw error;

    const mappedList = (clientsList || []).map(c => ({
      ...c,
      name: c.full_name
    }));

    return res.status(200).json({
      status: 'success',
      data: mappedList,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error in getClients:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while fetching clients',
      error: error.message
    });
  }
};

// Update Client: PUT /api/clients/:id
const updateClient = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  const { id } = req.params;
  const { fullName, email, clientType, bookingSource, notes } = req.body;

  try {
    const updateData = {};
    if (fullName) updateData.full_name = fullName;
    if (email !== undefined) updateData.email = email;
    if (clientType) updateData.client_type = clientType;
    if (bookingSource) updateData.booking_source = bookingSource;
    if (notes !== undefined) updateData.notes = notes;

    const { data: updatedClient, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ status: 'error', message: 'Client not found' });
      }
      throw error;
    }

    return res.status(200).json({
      status: 'success',
      message: 'Client updated successfully',
      data: {
        ...updatedClient,
        name: updatedClient.full_name
      }
    });
  } catch (error) {
    console.error('Error in updateClient:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while updating client',
      error: error.message
    });
  }
};

// Client Details & History: GET /api/clients/:id
const getClientById = async (req, res) => {
  const { id } = req.params;

  try {
    // Get client details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (clientError) {
      if (clientError.code === 'PGRST116') {
        return res.status(404).json({ status: 'error', message: 'Client not found' });
      }
      throw clientError;
    }

    // Get historical list of appointments
    const { data: appointmentsList, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .eq('client_id', id)
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: false });

    if (appointmentsError) throw appointmentsError;

    client.name = client.full_name;

    // Normalize client historical appointments to ApiAppointment shape
    const normalizedAppts = (appointmentsList || []).map(a => ({
      id: a.id,
      client_id: a.client_id,
      client_name: client.full_name,
      phone_number: client.phone_number,
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

    client.appointments = normalizedAppts;

    return res.status(200).json({
      status: 'success',
      data: client
    });
  } catch (error) {
    console.error('Error in getClientById:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while fetching client details',
      error: error.message
    });
  }
};

module.exports = {
  createClient,
  getClients,
  updateClient,
  getClientById
};
