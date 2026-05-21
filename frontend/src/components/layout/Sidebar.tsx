import SidebarStats from './SidebarStats';
import SidebarNav from './SidebarNav';
import ClientList from './ClientList';

export default function Sidebar() {
  return (
    <aside className="w-[250px] bg-white border-r border-border flex flex-col overflow-y-auto">
      <div className="p-5 border-b border-border">
        <div className="text-[0.62rem] font-semibold tracking-[2px] uppercase text-text-muted mb-3.5">
          Today's Overview
        </div>
        <SidebarStats />
      </div>
      <div className="p-5 border-b border-border">
        <div className="text-[0.62rem] font-semibold tracking-[2px] uppercase text-text-muted mb-3.5">
          Menu
        </div>
        <SidebarNav />
      </div>
      <div className="p-5 flex-1">
        <div className="text-[0.62rem] font-semibold tracking-[2px] uppercase text-text-muted mb-3.5">
          Recent Clients
        </div>
        <ClientList />
      </div>
    </aside>
  );
}
