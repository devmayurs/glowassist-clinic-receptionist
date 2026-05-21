import { clients } from '../../data/mock';

export default function ClientList() {
  return (
    <div className="flex-1 overflow-y-auto">
      {clients.map((c) => (
        <div key={c.name} className="flex items-center gap-2.5 px-2 py-2.5 rounded-lg cursor-pointer hover:bg-warm transition-colors mb-0.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[0.65rem] font-bold flex-shrink-0"
            style={{ background: c.bg, color: c.tc }}
          >
            {c.ini}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[0.8rem] font-semibold text-text truncate">{c.name}</div>
            <div className="text-[0.68rem] text-text-muted truncate">{c.last}</div>
          </div>
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.status }} />
        </div>
      ))}
    </div>
  );
}
