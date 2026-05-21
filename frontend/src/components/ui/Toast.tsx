import { useAppStore } from '../../store/useAppStore';

export default function ToastContainer() {
  const toasts = useAppStore((s) => s.toasts);
  const removeToast = useAppStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-deep text-white px-4 py-3 rounded-xl text-[0.79rem] max-w-[290px] shadow-lg flex items-center gap-2 animate-toastIn border-l-3 border-rose"
          onAnimationEnd={() => {
            setTimeout(() => removeToast(t.id), t.duration || 4000);
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
