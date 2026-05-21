import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { simReply } from '../data/mock';
import { clientApi } from '../apis/client.api';
import { appointmentApi } from '../apis/appointment.api';

interface BookingSession {
  stage: 'none' | 'name' | 'phone' | 'service' | 'date' | 'time' | 'payment';
  name?: string;
  phone?: string;
  service?: string;
  date?: string;
  time?: string;
  payment?: string;
}

const mapService = (text: string): string => {
  const t = text.toLowerCase();
  if (t.includes('botox')) return 'Botox Aesthetic Session (Forehead)';
  if (t.includes('filler') || t.includes('lip')) return 'Lip Dermal Filler Session';
  if (t.includes('pedicure') || t.includes('pedi')) return 'Luxury Pedicure';
  if (t.includes('manicure') || t.includes('mani')) return 'Gel Manicure Deluxe';
  if (t.includes('extension') || t.includes('nail')) return 'Full Gel Nail Extensions';
  return text; // fallback
};

const isBookingIntent = (text: string): boolean => {
  const t = text.toLowerCase();
  return (
    t.includes('book') ||
    t.includes('appointment') ||
    t.includes('schedule') ||
    t.includes('reserve') ||
    t.includes('treatment') ||
    t.includes('session')
  );
};

export function useChat() {
  const messages = useAppStore((s) => s.messages);
  const addMessage = useAppStore((s) => s.addMessage);
  const isTyping = useAppStore((s) => s.isTyping);
  const setTyping = useAppStore((s) => s.setTyping);
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  
  const [inputText, setInputText] = useState<string>('');
  const addToast = useAppStore((s) => s.addToast);
  const updateStats = useAppStore((s) => s.updateStats);

  // Sync state machine using sessionStorage to survive reloads
  const [booking, setBooking] = useState<BookingSession>(() => {
    try {
      const saved = sessionStorage.getItem('glowassist_booking_session');
      return saved ? JSON.parse(saved) : { stage: 'none' };
    } catch {
      return { stage: 'none' };
    }
  });

  const saveBooking = (newBooking: BookingSession) => {
    setBooking(newBooking);
    sessionStorage.setItem('glowassist_booking_session', JSON.stringify(newBooking));
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // 1. Add user message
    addMessage({
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    });
    setInputText('');

    // Update stats: +1 handled call/interaction
    const currentStats = useAppStore.getState().stats;
    updateStats({ callsHandled: currentStats.callsHandled + 1 });

    // 2. Set assistant typing indicator
    setTyping(true);

    // 3. Run State Machine or Sim Reply
    setTimeout(async () => {
      try {
        const currentStage = booking.stage;

        if (currentStage === 'none') {
          if (isBookingIntent(text)) {
            saveBooking({ stage: 'name' });
            addMessage({
              id: Date.now().toString(),
              role: 'assistant',
              content: "I'd be delighted to assist you in booking a premium appointment at Lumière Med Spa! ✨\n\nTo get started, could you please provide your **Full Name**?",
              timestamp: new Date(),
            });
          } else {
            // Standard general inquiry reply
            const replyText = simReply(text);
            addMessage({
              id: Date.now().toString(),
              role: 'assistant',
              content: replyText,
              timestamp: new Date(),
            });

            if (replyText.toLowerCase().includes('confirmed') || replyText.toLowerCase().includes('booked')) {
              const latestStats = useAppStore.getState().stats;
              updateStats({ bookings: latestStats.bookings + 1 });
              addToast('✨ New appointment booked!');
            }
          }
          setTyping(false);
        } else if (currentStage === 'name') {
          saveBooking({ ...booking, stage: 'phone', name: text.trim() });
          addMessage({
            id: Date.now().toString(),
            role: 'assistant',
            content: `Thank you, **${text.trim()}**! 🌸\n\nWhat is your **Phone Number**? (Format: +1234567890 or 10 digits)`,
            timestamp: new Date(),
          });
          setTyping(false);
        } else if (currentStage === 'phone') {
          saveBooking({ ...booking, stage: 'service', phone: text.trim() });
          addMessage({
            id: Date.now().toString(),
            role: 'assistant',
            content: `Got it! What premium treatment would you like to book today?\n\n💅 **Gel Manicure Deluxe** ($45)\n🦶 **Luxury Pedicure** ($60)\n✨ **Full Gel Nail Extensions** ($85)\n💉 **Botox Aesthetic Session** ($350)\n👄 **Lip Dermal Filler Session** ($480)\n\nPlease type the name of the service.`,
            timestamp: new Date(),
          });
          setTyping(false);
        } else if (currentStage === 'service') {
          const mappedService = mapService(text.trim());
          saveBooking({ ...booking, stage: 'date', service: mappedService });
          addMessage({
            id: Date.now().toString(),
            role: 'assistant',
            content: `Excellent selection: **${mappedService}**! ✨\n\nWhat **Date** would you like? (Format: YYYY-MM-DD, e.g., 2026-05-25)`,
            timestamp: new Date(),
          });
          setTyping(false);
        } else if (currentStage === 'date') {
          const datePattern = /^\d{4}-\d{2}-\d{2}$/;
          const dateStr = text.trim();
          if (!datePattern.test(dateStr)) {
            addMessage({
              id: Date.now().toString(),
              role: 'assistant',
              content: `⚠️ The date format should be YYYY-MM-DD (e.g. **2026-05-25**). Please enter the date again.`,
              timestamp: new Date(),
            });
            setTyping(false);
            return;
          }

          saveBooking({ ...booking, stage: 'time', date: dateStr });
          addMessage({
            id: Date.now().toString(),
            role: 'assistant',
            content: `Perfect. What **Time** works best for you? (Format: HH:MM, e.g. **10:00** or **14:30**)\n\n*Working Hours:*\n📅 Mon-Sat: 9 AM - 7 PM\n📅 Sun: 10 AM - 5 PM`,
            timestamp: new Date(),
          });
          setTyping(false);
        } else if (currentStage === 'time') {
          const timeStr = text.trim();
          saveBooking({ ...booking, stage: 'payment', time: timeStr });
          addMessage({
            id: Date.now().toString(),
            role: 'assistant',
            content: `Almost there! How would you like to handle **Payment**?\n\n💳 Options: **cash**, **card**, or **online**`,
            timestamp: new Date(),
          });
          setTyping(false);
        } else if (currentStage === 'payment') {
          const payStr = text.toLowerCase().trim();
          let paymentMethod = 'unpaid';
          if (payStr.includes('cash')) paymentMethod = 'cash';
          else if (payStr.includes('card')) paymentMethod = 'card';
          else if (payStr.includes('online')) paymentMethod = 'online';
          else paymentMethod = 'card'; // default

          // Show processing message
          addMessage({
            id: Date.now().toString(),
            role: 'assistant',
            content: `Checking slot availability and securing your appointment... ⏳`,
            timestamp: new Date(),
          });

          // Search client
          let client: any = null;
          try {
            const res = await clientApi.getClients({ search: booking.phone });
            const clientsList = (res as any)?.data || res || [];
            const cleanedPhone = booking.phone!.replace(/[\s+-]/g, '');
            client = clientsList.find((c: any) => {
              const dbCleaned = c.phone_number.replace(/[\s+-]/g, '');
              return dbCleaned === cleanedPhone || 
                     dbCleaned.endsWith(cleanedPhone) || 
                     cleanedPhone.endsWith(dbCleaned);
            });
          } catch (err) {
            console.warn('Client check error, proceeding...', err);
          }

          // Create client if not found
          if (!client) {
            try {
              client = await clientApi.createClient({
                fullName: booking.name,
                phoneNumber: booking.phone,
                bookingSource: 'live_chat',
              });
            } catch (createErr: any) {
              if (createErr.response?.status === 409 && createErr.response?.data?.data) {
                console.info('Client already exists, using existing client from conflict response');
                client = createErr.response.data.data;
              } else {
                console.warn('Failed to create client via backend API, using temporary client', createErr);
                client = {
                  id: 'temp-' + Date.now(),
                  name: booking.name,
                  phone_number: booking.phone,
                  client_type: 'first_time',
                  booking_source: 'live_chat',
                  created_at: new Date().toISOString(),
                };
              }
            }
          }

          // Create appointment
          try {
            const clientObj = (client as any)?.data || client;
            const appData = {
              client_id: clientObj.id,
              clientId: clientObj.id,
              phone_number: booking.phone!,
              client_name: booking.name!,
              service_name: booking.service!,
              serviceName: booking.service!,
              appointment_date: booking.date!,
              appointmentDate: booking.date!,
              appointment_time: booking.time!,
              appointmentTime: booking.time!,
              payment_method: paymentMethod,
              paymentMethod: paymentMethod,
              payment_status: paymentMethod === 'online' ? 'paid' : 'pending',
              paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
              booking_source: 'live_chat',
              bookingSource: 'live_chat',
              notes: 'Booked via active CRM chat concierge',
            };

            await appointmentApi.createAppointment(appData);

            // Success reply!
            const successText = `✨ **Appointment Successfully Booked!** 🎉\n\nHere are your confirmation details:\n👤 **Client:** ${booking.name}\n📞 **Phone:** ${booking.phone}\n💅 **Service:** ${booking.service}\n📅 **Date:** ${booking.date}\n🕐 **Time:** ${booking.time}\n💳 **Payment:** ${paymentMethod.toUpperCase()}\n\nWe look forward to welcoming you to Lumière Med Spa! 🌸`;
            
            addMessage({
              id: Date.now().toString(),
              role: 'assistant',
              content: successText,
              timestamp: new Date(),
            });

            // Update global stats
            const stats = useAppStore.getState().stats;
            updateStats({ bookings: stats.bookings + 1 });
            addToast('✨ New appointment booked via chat panel!');

            // Fire reload event across tables!
            window.dispatchEvent(new CustomEvent('appointment-created'));

            // Clear booking session
            saveBooking({ stage: 'none' });
          } catch (err: any) {
            console.error('Error creating appointment:', err);
            
            if (err.response?.status === 409) {
              const suggestions = err.response?.data?.suggestions || [];
              let conflictMsg = `I'm sorry, but **${booking.time}** on **${booking.date}** is already booked. 😔\n\n`;
              if (suggestions.length) {
                conflictMsg += `Here are some alternative available times for **${booking.date}**:\n` +
                               suggestions.map((s: string) => `• **${s}**`).join('\n') +
                               `\n\nPlease type one of these times or enter a different time.`;
              } else {
                conflictMsg += `Please choose another time slot for that day.`;
              }
              
              addMessage({
                id: Date.now().toString(),
                role: 'assistant',
                content: conflictMsg,
                timestamp: new Date(),
              });

              // Keep stage as time to retry
              saveBooking({ ...booking, stage: 'time' });
            } else {
              const apiErrMsg = err.response?.data?.message || err.message || 'Server error';
              addMessage({
                id: Date.now().toString(),
                role: 'assistant',
                content: `⚠️ **Booking Conflict/Error:** ${apiErrMsg}\n\nPlease specify a different date or time (YYYY-MM-DD) to retry.`,
                timestamp: new Date(),
              });

              // Keep stage as time/date to retry
              saveBooking({ ...booking, stage: 'date' });
            }
          }
          setTyping(false);
        }
      } catch (err) {
        console.error('State machine error:', err);
        setTyping(false);
      }
    }, 1000 + Math.random() * 500);
  };

  return {
    messages,
    isTyping,
    inputText,
    setInputText,
    mode,
    setMode,
    sendMessage: handleSendMessage,
    bookingStage: booking.stage,
    resetBooking: () => saveBooking({ stage: 'none' }),
  };
}

export default useChat;
