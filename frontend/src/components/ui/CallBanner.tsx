import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';

export default function CallBanner() {
  const isCallActive = useAppStore((s) => s.isCallActive);
  const activeCall = useAppStore((s) => s.activeCall);
  const endCall = useAppStore((s) => s.endCall);
  const addToast = useAppStore((s) => s.addToast);
  const updateStats = useAppStore((s) => s.updateStats);

  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isCallActive && activeCall) {
      const start = Date.now();
      intervalRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - start) / 1000));
      }, 1000);

      // Auto-end call after 18 seconds (simulated)
      const timeout = setTimeout(() => {
        endCall();
        addToast('✦ Call ended — transcript & booking saved');
        updateStats({ callsHandled: useAppStore.getState().stats.callsHandled + 1 });
      }, 18000);

      return () => {
        clearInterval(intervalRef.current!);
        clearTimeout(timeout);
      };
    }
  }, [isCallActive, activeCall]);

  if (!isCallActive || !activeCall) return null;

  const formatTime = (secs: number) =>
    `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;

  return (
    <div className="bg-gradient-to-r from-deep to-brown p-3 flex items-center gap-2.5 text-sm border-b border-gold/30">
      <div className="w-8 h-8 rounded-full bg-rose flex items-center justify-center text-base animate-callRing flex-shrink-0">
        📞
      </div>
      <div className="flex-1">
        <div className="text-[0.62rem] text-white/45 tracking-[1px] uppercase">Active Call — AI Handling</div>
        <div className="text-white font-semibold text-[0.83rem]">Incoming: {activeCall.phone}</div>
      </div>
      <div className="text-gold-light font-semibold text-sm" id="ctimer">
        {formatTime(duration)}
      </div>
    </div>
  );
}
