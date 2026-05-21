import { useAppStore } from '../../store/useAppStore';

export default function ModeToggle() {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const addToast = useAppStore((s) => s.addToast);

  const toggle = (newMode: 'sim' | 'live') => {
    setMode(newMode);
    if (newMode === 'live') {
      addToast('🔴 Live AI — powered by Mayur API');
    }
  };

  return (
    <div className="ml-auto flex bg-warm rounded-lg p-0.5">
      <button
        onClick={() => toggle('sim')}
        className={`px-2.5 py-1 rounded-md cursor-pointer text-[0.7rem] font-sans border-none transition-all ${mode === 'sim' ? 'bg-white text-rose shadow-sm' : 'bg-transparent text-text-muted'
          }`}
      >
        Simulate
      </button>
      <button
        onClick={() => toggle('live')}
        className={`px-2.5 py-1 rounded-md cursor-pointer text-[0.7rem] font-sans border-none transition-all ${mode === 'live' ? 'bg-white text-rose shadow-sm' : 'bg-transparent text-text-muted'
          }`}
      >
        Live AI
      </button>
    </div>
  );
}
