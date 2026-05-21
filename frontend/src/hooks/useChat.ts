import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { simReply } from '../data/mock';

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

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // 1. Add client message
    addMessage({
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    });
    setInputText('');

    // Update stats: +1 handled call
    const currentStats = useAppStore.getState().stats;
    updateStats({ callsHandled: currentStats.callsHandled + 1 });

    // 2. Set assistant typing indicator
    setTyping(true);

    // 3. Simulate network response or trigger mock script
    setTimeout(() => {
      const replyText = simReply(text);
      
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: replyText,
        timestamp: new Date(),
      });
      
      setTyping(false);

      if (replyText.toLowerCase().includes('confirmed') || replyText.toLowerCase().includes('booked')) {
        const latestStats = useAppStore.getState().stats;
        updateStats({ bookings: latestStats.bookings + 1 });
        addToast('✨ New appointment booked by AI concierge');
      }
    }, 1100 + Math.random() * 700);
  };

  return {
    messages,
    isTyping,
    inputText,
    setInputText,
    mode,
    setMode,
    sendMessage: handleSendMessage,
  };
}
export default useChat;
