import { packages as mockPackages } from '../data/mock';

export default function PackagesPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-serif text-2xl font-semibold text-deep leading-none">
          Memberships & Packages
        </h1>
        <button className="btn-rose">+ New Package</button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        {mockPackages.map((pkg, i) => (
          <div
            key={i}
            className="bg-white border border-border rounded-2xl p-5 transition-all duration-150 cursor-pointer hover:border-rose"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="font-serif text-lg font-semibold text-deep">{pkg.name}</div>
              <div className="font-bold text-gold text-[0.88rem]">{pkg.price}</div>
            </div>
            <div className="text-[0.77rem] text-text-muted mb-3 leading-relaxed">{pkg.includes}</div>
            <div className="flex items-center justify-between">
              <span className="text-[0.72rem] text-rose font-semibold">{pkg.active} active clients</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.62rem] font-bold bg-rose-pale text-rose">
                ✦ AI promotes
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-rose-pale to-gold-pale border border-border rounded-lg p-4 text-[0.82rem] text-brown">
        ✦ The AI agent automatically detects when a client is booking a 3rd+ session and suggests the relevant package — converting single bookings into recurring revenue.
      </div>
    </div>
  );
}
