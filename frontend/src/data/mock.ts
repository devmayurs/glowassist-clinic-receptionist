import type { Client, Appointment, CallLog, Package } from '../types';

export const clients: Client[] = [
  { name: 'Sophia Laurent', ini: 'SL', bg: '#F9EDEB', tc: '#C9847A', last: 'Botox + Filler', status: '#7A9E7E' },
  { name: 'Isabella Park', ini: 'IP', bg: '#F3EBF1', tc: '#7B4F6E', last: 'HydraFacial', status: '#C9847A' },
  { name: 'Natasha Rivera', ini: 'NR', bg: '#FBF5E8', tc: '#B8965A', last: 'Laser Resurfacing', status: '#7A9E7E' },
  { name: 'Chloe Winters', ini: 'CW', bg: '#EDF3EE', tc: '#7A9E7E', last: 'Chemical Peel', status: '#7A9E7E' },
  { name: 'Amara Singh', ini: 'AS', bg: '#F9EDEB', tc: '#C9847A', last: 'Microneedling', status: '#B8965A' },
];

export const appointments: Appointment[] = [
  { time: '9:30 AM', client: 'Sophia Laurent', service: 'Botox — Forehead & Crow\'s Feet', provider: 'Dr. Reeves', status: 'confirmed', bookedBy: 'AI', ini: 'SL', bg: '#F9EDEB', tc: '#C9847A', price: '$450' },
  { time: '10:15 AM', client: 'Isabella Park', service: 'HydraFacial Deluxe', provider: 'Esthetician Maya', status: 'confirmed', bookedBy: 'AI', ini: 'IP', bg: '#F3EBF1', tc: '#7B4F6E', price: '$280' },
  { time: '11:00 AM', client: 'New Client', service: 'Dermal Filler Consultation', provider: 'Dr. Reeves', status: 'pending', bookedBy: 'AI', ini: 'NC', bg: '#FBF5E8', tc: '#B8965A', price: 'Free' },
  { time: '12:30 PM', client: 'Natasha Rivera', service: 'Laser Skin Resurfacing', provider: 'Dr. Chen', status: 'confirmed', bookedBy: 'Human', ini: 'NR', bg: '#FBF5E8', tc: '#B8965A', price: '$650' },
  { time: '2:00 PM', client: 'Chloe Winters', service: 'VI Chemical Peel', provider: 'Esthetician Maya', status: 'vip', bookedBy: 'AI', ini: 'CW', bg: '#EDF3EE', tc: '#7A9E7E', price: '$350' },
  { time: '3:30 PM', client: 'Amara Singh', service: 'Microneedling + PRP', provider: 'Dr. Chen', status: 'confirmed', bookedBy: 'AI', ini: 'AS', bg: '#F9EDEB', tc: '#C9847A', price: '$580' },
  { time: '4:45 PM', client: 'Priya Mehta', service: 'Lip Filler', provider: 'Dr. Reeves', status: 'confirmed', bookedBy: 'AI', ini: 'PM', bg: '#F3EBF1', tc: '#7B4F6E', price: '$480' },
];

export const callLogs: CallLog[] = [
  { client: 'Sophia Laurent', time: '8:55 AM', dur: '4m 10s', summary: 'Returning VIP client called to book her quarterly Botox session. AI recognised her as returning client, pre-filled her preferences (forehead + crow\'s feet, Dr. Reeves preferred). Booking confirmed for 9:30 AM. Membership discount applied automatically.', chips: ['booked', 'vip'] },
  { client: 'New Client — Jessica T.', time: '8:30 AM', dur: '5m 22s', summary: 'First-time caller inquiring about anti-aging treatments. Expressed interest in Botox and fillers. AI explained treatment options, pricing, and aftercare. Consultation slot booked. New client profile created.', chips: ['new', 'booked'] },
  { client: 'Chloe Winters', time: '7:58 AM', dur: '2m 45s', summary: 'Package holder called to use one of her 6-session peel package credits. AI verified package balance (3 sessions remaining). Booking confirmed. Remaining sessions updated.', chips: ['pkg', 'booked'] },
  { client: 'Unknown — (555) 912-3456', time: '7:30 AM', dur: '3m 05s', summary: 'Caller asked about laser hair removal pricing for full leg and Brazilian. AI provided full pricing breakdown and treatment timeline. Caller asked to think about it and call back. Follow-up reminder set.', chips: ['followup'] },
];

export const packages: Package[] = [
  { name: 'Radiance Membership', price: '$299/mo', includes: '1 HydraFacial + 20% off all treatments + priority booking', active: 14 },
  { name: 'Glow Bundle — 6 Peels', price: '$1,499', includes: '6 VI Chemical Peels (save $601)', active: 8 },
  { name: 'Botox Club', price: '$199/mo', includes: 'Up to 40 units Botox monthly + free consultations', active: 22 },
  { name: 'Laser Package — 6 Sessions', price: '$2,400', includes: '6 laser resurfacing sessions (save $700)', active: 5 },
];

export function simReply(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('botox') || t.includes('wrinkle') || t.includes('forehead')) {
    return "Wonderful choice! ✨ Botox treatments at Lumière start from $14/unit — a typical forehead treatment uses 20–30 units ($280–420). Dr. Reeves has availability today at 11:00 AM or 4:30 PM. Shall I reserve a slot for you?";
  }
  if (t.includes('facial') || t.includes('hydra') || t.includes('skin')) {
    return "Our HydraFacial Deluxe is a client favourite — a deeply nourishing 60-minute treatment for $280 🌸 It cleanses, exfoliates, and infuses your skin with serums. Esthetician Maya has availability this week. Would you like to book?";
  }
  if (t.includes('filler') || t.includes('lip') || t.includes('cheek')) {
    return "Our dermal filler treatments are performed exclusively by Dr. Reeves, our lead aesthetic physician. Lip fillers start at $480 and cheek/jawline from $650. We always recommend a complimentary consultation first — shall I book one for you?";
  }
  if (t.includes('price') || t.includes('cost') || t.includes('how much')) {
    return "Here's a quick overview of our most popular treatments:\n💉 Botox: from $280\n✨ HydraFacial: $280\n💋 Lip Filler: $480\n🔬 Microneedling: $380\n🔥 Laser Resurfacing: $650\n\nWe also offer membership plans starting from $199/month. Which treatment interests you most?";
  }
  if (t.includes('member') || t.includes('package') || t.includes('bundle')) {
    return "We have three beautiful membership options 🎁 Our most popular is the **Radiance Membership** at $299/month — includes a monthly HydraFacial plus 20% off all treatments. For injectables, the **Botox Club** at $199/month gives you up to 40 units monthly. Shall I tell you more?";
  }
  if (t.includes('hour') || t.includes('open') || t.includes('time')) {
    return "Lumière Med Spa is open Monday–Saturday, 9:00 AM to 7:00 PM, and Sunday 10:00 AM to 5:00 PM 🌸 We're located at 45 Blossom Avenue, Suite 200. Is there a time you'd like to come in?";
  }
  if (t.includes('laser') || t.includes('hair removal') || t.includes('resurfacing')) {
    return "Our laser treatments are performed by Dr. Chen, our laser specialist ✨ Laser skin resurfacing starts at $650 per session, and laser hair removal pricing varies by area. We often recommend a package of 6 sessions for best results — would you like details on our laser package pricing?";
  }
  if (t.includes('book') || t.includes('appointment') || t.includes('schedule')) {
    return "It would be my pleasure to arrange that for you! 🌸 May I have your name and the treatment you're interested in? We have availability today at 11:00 AM and 4:30 PM, and throughout the week.";
  }
  if (t.includes('confirm') || t.includes('yes') || t.includes('perfect')) {
    return "✅ Your appointment has been beautifully confirmed. You'll receive an SMS with all the details shortly. We recommend arriving 10 minutes early to enjoy a complimentary welcome consultation. We look forward to seeing you at Lumière! 🌸";
  }
  return "Thank you for reaching out to Lumière Med Spa 🌸 I'd be delighted to assist you with bookings, treatment information, pricing, or anything else. What can I help you with today?";
}
