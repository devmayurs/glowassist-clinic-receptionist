import { create } from 'zustand';
import type { Client, Appointment, CallLog, Package, ChatMessage, Toast, DashboardStats } from '../types';

interface AppState {
  // Stats
  stats: DashboardStats;
  updateStats: (partial: Partial<DashboardStats>) => void;

  // Data
  clients: Client[];
  appointments: Appointment[];
  callLogs: CallLog[];
  packages: Package[];

  // Chat
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;

  // UI State
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mode: 'sim' | 'live';
  setMode: (mode: 'sim' | 'live') => void;
  isTyping: boolean;
  setTyping: (typing: boolean) => void;

  // Toasts
  toasts: Toast[];
  addToast: (message: string, duration?: number) => void;
  removeToast: (id: string) => void;

  // Call simulation
  isCallActive: boolean;
  activeCall: { phone: string; duration: number } | null;
  startCall: (phone: string) => void;
  endCall: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  stats: { callsHandled: 0, bookings: 0, newClients: 0, estimatedRevenue: 0 },
  updateStats: (partial) => set((state) => ({ stats: { ...state.stats, ...partial } })),

  clients: [],
  appointments: [],
  callLogs: [],
  packages: [],

  messages: [{
    id: '1',
    role: 'assistant',
    content: 'Welcome to Lumière Med Spa 🌸 I\'m Aria, your personal concierge. How may I assist you today?',
    timestamp: new Date()
  }],
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  clearMessages: () => set({ messages: [] }),

  activeTab: 'appointments',
  setActiveTab: (tab) => set({ activeTab: tab }),
  mode: 'sim',
  setMode: (mode) => set({ mode }),
  isTyping: false,
  setTyping: (typing) => set({ isTyping: typing }),

  toasts: [],
  addToast: (message, duration = 4000) => {
    const id = Date.now().toString();
    set((state) => ({ toasts: [...state.toasts, { id, message, duration }] }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id)
      }));
    }, duration);
  },
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  })),

  isCallActive: false,
  activeCall: null,
  startCall: (phone) => set({ isCallActive: true, activeCall: { phone, duration: 0 } }),
  endCall: () => set({ isCallActive: false, activeCall: null }),
}));
