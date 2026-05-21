import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { simReply } from '../../data/mock';
import type { ChatMessage } from '../../types';
import CallBanner from '../ui/CallBanner';
import ModeToggle from '../ui/ModeToggle';

export default function ChatPanel() {
  const messages = useAppStore((s) => s.messages);
  const addMessage = useAppStore((s) => s.addMessage);
  const isTyping = useAppStore((s) => s.isTyping);
  const setTyping = useAppStore((s) => s.setTyping);


  const addToast = useAppStore((s) => s.addToast);
  const isCallActive = useAppStore((s) => s.isCallActive);

  const [input, setInput] = useState('');
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async () => {
    const txt = input.trim();
    if (!txt) return;
    setInput('');

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: txt,
      timestamp: new Date(),
    };
    addMessage(userMsg);

    useAppStore.getState().updateStats({ callsHandled: useAppStore.getState().stats.callsHandled + 1 });

    setTyping(true);

    setTimeout(async () => {
      setTyping(false);

      const reply = simReply(txt);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      };
      addMessage(aiMsg);

      if (reply.toLowerCase().includes('confirmed') || reply.toLowerCase().includes('booked')) {
        useAppStore.getState().updateStats({
          bookings: useAppStore.getState().stats.bookings + 1,
        });
        addToast('✨ New appointment booked by AI concierge');
      }
    }, 1100 + Math.random() * 700);
  };

  const sendQuickReply = (text: string) => {
    setInput(text);
    sendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <aside className="w-[370px] border-l border-border bg-white flex flex-col">
      {isCallActive && <CallBanner />}

      <div className="p-3.5 border-b border-border flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose to-rose-light flex items-center justify-center text-lg shadow-sm border-2 border-rose/30">
          ✦
        </div>
        <div>
          <div className="font-serif font-semibold text-deep text-base">Aria — AI Concierge</div>
          <div className="text-[0.68rem] text-sage flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-sage rounded-full animate-glow" />
            Online & Attending
          </div>
        </div>
        <ModeToggle />
      </div>

      <div ref={chatBoxRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 animate-slideUp ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[0.7rem] flex-shrink-0 mt-0.5 ${
                msg.role === 'assistant' ? 'bg-gradient-to-br from-rose to-rose-light' : 'bg-deep text-white'
              }`}
            >
              {msg.role === 'assistant' ? '✦' : '👤'}
            </div>
            <div>
              <div
                className={`max-w-[82%] px-3.5 py-2.5 rounded-xl text-[0.8rem] leading-relaxed ${
                  msg.role === 'assistant'
                    ? 'bg-warm text-text border border-border rounded-bl-md'
                    : 'bg-rose text-white rounded-br-md'
                }`}
              >
                {msg.content.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
                ))}
              </div>
              <div className={`text-[0.6rem] text-text-muted mt-0.5 ${msg.role === 'assistant' ? 'text-left' : 'text-right'}`}>
                {formatTime(msg.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose to-rose-light flex items-center justify-center text-[0.7rem]">
              ✦
            </div>
            <div className="bg-warm border border-border px-3.5 py-2.5 rounded-xl rounded-bl-md flex gap-1">
              <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
      </div>

      <div className="px-3.5 py-2 border-t border-border flex flex-wrap gap-1.5">
        {[
          { label: '💉 Botox', text: 'I want to book a Botox appointment' },
          { label: '✨ Facials', text: 'Tell me about your facial treatments' },
          { label: '💰 Pricing', text: 'What are your prices?' },
          { label: '🎁 Memberships', text: 'Do you have membership packages?' },
          { label: '🕐 Hours', text: 'What are your hours?' },
        ].map((btn) => (
          <button
            key={btn.text}
            onClick={() => sendQuickReply(btn.text)}
            className="px-2.5 py-1 border border-rose text-rose text-[0.7rem] rounded-full cursor-pointer bg-white font-sans hover:bg-rose hover:text-white transition-all"
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className="p-3 border-t border-border flex gap-2 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a client message…"
          rows={1}
          className="flex-1 border border-border rounded-lg px-3 py-2 text-[0.8rem] font-sans text-text bg-warm resize-none outline-none min-h-[38px] max-h-[90px] focus:border-rose focus:bg-white transition-colors"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="w-10 h-10 bg-rose border-none rounded-lg text-white cursor-pointer flex items-center justify-center text-[0.9rem] hover:bg-rose-light transition-all disabled:bg-border disabled:cursor-not-allowed flex-shrink-0"
        >
          ➤
        </button>
      </div>
    </aside>
  );
}
