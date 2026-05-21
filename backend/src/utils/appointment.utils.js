/**
 * Helper to check if a booking time falls within salon working hours.
 * Monday to Saturday: 9:00 AM – 7:00 PM (09:00 to 19:00)
 * Sunday: 10:00 AM – 5:00 PM (10:00 to 17:00)
 * 
 * @param {string} dateStr - YYYY-MM-DD
 * @param {string} timeStr - HH:MM:SS or HH:MM
 * @returns {boolean}
 */
function isWithinWorkingHours(dateStr, timeStr) {
  // Use local time representation
  const date = new Date(`${dateStr}T00:00:00`);
  const day = date.getDay(); // 0 = Sunday, 1-6 = Mon-Sat

  const [hours, minutes] = timeStr.split(':').map(Number);
  const timeInMinutes = hours * 60 + minutes;

  if (day === 0) {
    // Sunday: 10:00 AM (600 mins) to 5:00 PM (1020 mins)
    return timeInMinutes >= 600 && timeInMinutes <= 1020;
  } else {
    // Mon-Sat: 9:00 AM (540 mins) to 7:00 PM (1140 mins)
    return timeInMinutes >= 540 && timeInMinutes <= 1140;
  }
}

/**
 * Normalizes HH:MM or HH:MM:SS to HH:MM:SS format
 * @param {string} timeStr 
 * @returns {string}
 */
function normalizeTime(timeStr) {
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
  }
  return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:${parts[2].padStart(2, '0')}`;
}

/**
 * Formats time from minutes to HH:MM:SS
 * @param {number} totalMinutes 
 * @returns {string}
 */
function minutesToTimeStr(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
}

/**
 * Searches for the next 3 available 30-minute slots if there is a conflict.
 * Normalizes checking working hours and overlapping bookings.
 * 
 * @param {string} dateStr - YYYY-MM-DD
 * @param {string} timeStr - HH:MM:SS / HH:MM
 * @param {Array} existingAppointments - List of existing appointments on that day
 * @returns {string[]} Suggestions array
 */
function getAvailableSuggestions(dateStr, timeStr, existingAppointments) {
  const normalizedRequestedTime = normalizeTime(timeStr);
  const [hours, minutes] = normalizedRequestedTime.split(':').map(Number);
  let currentMinutes = hours * 60 + minutes;

  // Set of booked times on that day (in HH:MM:SS or HH:MM normalized form)
  const bookedTimes = new Set(
    existingAppointments.map(app => normalizeTime(app.appointment_time))
  );

  const suggestions = [];
  
  // We search forward in 30-minute intervals
  // Give up after looking at 20 slots (10 hours) to prevent infinite loops
  let attempts = 0;
  while (suggestions.length < 3 && attempts < 20) {
    currentMinutes += 30;
    attempts++;

    const candidateTimeStr = minutesToTimeStr(currentMinutes);

    // 1. Check if candidate time is within working hours
    if (!isWithinWorkingHours(dateStr, candidateTimeStr)) {
      continue;
    }

    // 2. Check if candidate time is already booked
    if (bookedTimes.has(candidateTimeStr)) {
      continue;
    }

    // Convert to readable HH:MM AM/PM format or standard 24h format for the frontend
    // The plan specifies returning them in "suggestions" array as clean strings like "3:30 PM" or "15:30:00"
    // Let's return standard 24h normalized "HH:MM:SS" but we can also format it beautifully.
    // Let's format it as HH:MM or HH:MM:SS so it is extremely robust for APIs.
    suggestions.push(candidateTimeStr);
  }

  return suggestions;
}

/**
 * Flexibly parses and normalizes a time string (e.g. "12.00pm", "12pm", "3:30 pm", "14:30") 
 * into a standard 24-hour "HH:MM" format. Returns the input unmodified if it doesn't match
 * the expected shapes.
 * @param {string} val 
 * @returns {string}
 */
function parseAndNormalizeTime(val) {
  if (typeof val !== 'string') return val;
  
  // Clean string: lower case, remove spaces
  const cleaned = val.toLowerCase().replace(/\s+/g, '');
  
  // Regex to match formats like: 12:00pm, 12.00pm, 12pm, 12:00, 12.00, 12
  const match = cleaned.match(/^(\d{1,2})(?:[:.](\d{2}))?(am|pm)?$/);
  if (!match) return val;
  
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const ampm = match[3];
  
  if (hours < 0 || minutes < 0 || minutes > 59) return val;
  
  if (ampm) {
    if (hours < 1 || hours > 12) return val;
    if (ampm === 'pm' && hours !== 12) {
      hours += 12;
    } else if (ampm === 'am' && hours === 12) {
      hours = 0;
    }
  } else {
    if (hours > 23) return val;
  }
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

module.exports = {
  isWithinWorkingHours,
  normalizeTime,
  parseAndNormalizeTime,
  getAvailableSuggestions
};
