import { useState } from 'react';
import { callLogs as mockCallLogs } from '../data/mock';
import type { CallLog } from '../types';

const chipMap: Record<string, string> = {
  booked: 'bg-sage-pale text-sage',
  vip: 'bg-plum-pale text-plum',
  new: 'bg-[#EEF2FF] text-[#4F46E5]',
  pkg: 'bg-gold-pale text-gold',
  followup: 'bg-rose-pale text-rose',
};

export default function CallLogsPage() {
  const [callLogs] = useState<CallLog[]>(mockCallLogs);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-serif text-2xl font-semibold text-deep leading-none">
          Call Logs
        </h1>
        <button className="btn-outline">Export</button>
      </div>

      {callLogs.map((log: CallLog, i: number) => (
        <div key={i} className="bg-white border border-border rounded-xl p-5 mb-3 cursor-pointer hover:border-rose hover:shadow-[0_2px_16px_rgba(201,132,122,0.18)] transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-[0.87rem]">{log.client}</div>
            <div className="text-[0.7rem] text-text-muted flex gap-3 items-center">
              <span>⏱ {log.dur}</span>
              <span>{log.time}</span>
            </div>
          </div>
          <div className="text-[0.79rem] text-text-muted leading-relaxed mb-2">{log.summary}</div>
          <div className="flex gap-1.5 flex-wrap">
            {log.chips.map((chip) => (
              <span key={chip} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.65rem] font-semibold ${chipMap[chip] || ''}`}>
                {chip === 'booked' && '✓ Booked'}
                {chip === 'vip' && '♛ VIP'}
                {chip === 'new' && '★ New'}
                {chip === 'pkg' && '🎁 Package'}
                {chip === 'followup' && '↻ Follow-up'}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
