import { CLINIC_METADATA } from '../constants/app.constants';
import type { ApiAppointment } from '../types';

/**
 * Service for managing appointment slot timings, operating checks, and reschedule recommendations.
 */
export const AppointmentService = {
  /**
   * Check if a given Date/Time falls within Lumiere Med Spa operating hours.
   * Mon - Sat: 9:00 AM - 7:00 PM
   * Sunday: 10:00 AM - 5:00 PM
   */
  isWithinOperatingHours(dateInput: string | Date): { isValid: boolean; reason?: string } {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) {
      return { isValid: false, reason: 'Invalid date/time format.' };
    }

    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const timeAsDecimal = hours + minutes / 60;

    const { weekdays, sunday } = CLINIC_METADATA.operatingHours;

    if (day === 0) {
      // Sunday
      if (timeAsDecimal < sunday.startHour || timeAsDecimal >= sunday.endHour) {
        return {
          isValid: false,
          reason: `Lumière is open on Sundays from ${sunday.start} to ${sunday.end}.`,
        };
      }
    } else {
      // Mon - Sat
      if (timeAsDecimal < weekdays.startHour || timeAsDecimal >= weekdays.endHour) {
        return {
          isValid: false,
          reason: `Lumière is open Mon - Sat from ${weekdays.start} to ${weekdays.end}.`,
        };
      }
    }

    return { isValid: true };
  },

  /**
   * Check if a specific time slot is already taken by another active appointment.
   */
  hasConflict(
    dateTimeStr: string,
    appointments: ApiAppointment[],
    excludeAppointmentId?: string
  ): boolean {
    const targetTime = new Date(dateTimeStr).getTime();
    
    // Assume standard slot duration is 45 minutes
    const SLOT_DURATION_MS = 45 * 60 * 1000;
    
    return appointments.some((app) => {
      if (app.id === excludeAppointmentId) return false;
      if (app.status === 'cancelled' || app.status === 'no_show') return false;
      
      const appTime = new Date(app.appointment_date).getTime();
      
      // Check if target overlap falls inside another booking's range
      return (
        targetTime >= appTime && targetTime < appTime + SLOT_DURATION_MS
      );
    });
  },

  /**
   * Generates alternative timing slot recommendations for rescheduling suggestions.
   */
  suggestAlternativeSlots(
    dateTimeStr: string,
    appointments: ApiAppointment[]
  ): string[] {
    const targetDate = new Date(dateTimeStr);
    if (isNaN(targetDate.getTime())) return [];

    const suggestions: string[] = [];
    const testHours = [9, 10, 11, 13, 14, 15, 16, 17]; // Normal spots, skip 12 (lunch/peak)
    
    for (const hr of testHours) {
      const candidate = new Date(targetDate);
      candidate.setHours(hr, 0, 0, 0);
      
      const checkHours = this.isWithinOperatingHours(candidate);
      const checkConflict = this.hasConflict(candidate.toISOString(), appointments);
      
      if (checkHours.isValid && !checkConflict) {
        suggestions.push(candidate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }));
      }
      
      if (suggestions.length >= 3) break; // We only need 3 decent suggestions
    }

    return suggestions;
  },
};
