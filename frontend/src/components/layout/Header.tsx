export default function Header() {
  return (
    <header className="bg-deep h-[62px] flex items-center justify-between px-8 sticky top-0 z-100 border-b border-gold/25">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 border border-gold rounded-full flex items-center justify-center text-gold-light text-base">
          ✦
        </div>
        <div className="font-serif font-semibold text-white text-lg tracking-wide">
          Glow<em className="text-gold-light font-normal italic">Assist</em> AI
        </div>
      </div>
      <div className="text-[0.72rem] text-white/40 tracking-[2px] uppercase">
        Lumière Med Spa · AI Concierge System
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 border border-gold/40 rounded-full px-3 py-1 text-[0.68rem] text-gold-light tracking-[1px] uppercase font-semibold">
          <div className="w-1.5 h-1.5 bg-gold-light rounded-full animate-glow" />
          Live
        </div>
      </div>
    </header>
  );
}
