import { useEffect, useState } from 'react';

type AnimatedStats = { calls: number; bookings: number; newClients: number; revenue: number };

export default function SidebarStats() {
  const [animated, setAnimated] = useState<AnimatedStats>({ calls: 0, bookings: 0, newClients: 0, revenue: 0 });

  useEffect(() => {
    const targets = { calls: 14, bookings: 7, newClients: 3, revenue: 23 } as const;
    const intervals: ReturnType<typeof setInterval>[] = [];

    (['calls', 'bookings', 'newClients', 'revenue'] as const).forEach((key) => {
      let v = 0;
      const target = targets[key];
      const iv = setInterval(() => {
        v++;
        setAnimated((prev) => ({ ...prev, [key]: v }));
        if (v >= target) clearInterval(iv);
      }, 70);
      intervals.push(iv);
    });

    return () => intervals.forEach(clearInterval);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-warm rounded-lg p-3 text-center border border-border">
        <div className="font-serif text-2xl font-semibold text-rose leading-none">{animated.calls}</div>
        <div className="text-[0.6rem] text-text-muted mt-1 font-medium tracking-[0.3px]">Calls Handled</div>
      </div>
      <div className="bg-warm rounded-lg p-3 text-center border border-border">
        <div className="font-serif text-2xl font-semibold text-rose leading-none">{animated.bookings}</div>
        <div className="text-[0.6rem] text-text-muted mt-1 font-medium tracking-[0.3px]">Bookings</div>
      </div>
      <div className="bg-warm rounded-lg p-3 text-center border border-border">
        <div className="font-serif text-2xl font-semibold text-rose leading-none">{animated.newClients}</div>
        <div className="text-[0.6rem] text-text-muted mt-1 font-medium tracking-[0.3px]">New Clients</div>
      </div>
      <div className="bg-warm rounded-lg p-3 text-center border border-border">
        <div className="font-serif text-2xl font-semibold text-gold leading-none">${animated.revenue * 300}</div>
        <div className="text-[0.6rem] text-text-muted mt-1 font-medium tracking-[0.3px]">Est. Revenue</div>
      </div>
    </div>
  );
}
