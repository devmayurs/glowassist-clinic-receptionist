import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/appointments', icon: '📅', label: 'Appointments', badge: undefined },
  { path: '/calls',        icon: '📞', label: 'Call Logs',    badge: 4 },
  { path: '/analytics',   icon: '✦',  label: 'Dashboard',    badge: undefined },
  { path: '/clients',     icon: '👤', label: 'Clients',       badge: undefined },
  { path: '/packages',    icon: '🎁', label: 'Packages',      badge: undefined },
];

export default function SidebarNav() {
  return (
    <nav className="flex flex-col gap-0.5">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[0.82rem] font-medium cursor-pointer transition-all duration-150 ${
              isActive ? 'bg-rose-pale text-rose' : 'text-text-muted hover:bg-warm'
            }`
          }
        >
          <span className="w-5 text-center text-[0.9rem]">{item.icon}</span>
          <span>{item.label}</span>
          {item.badge && (
            <span className="ml-auto bg-rose text-white text-[0.62rem] font-bold rounded-full px-2 py-0.5">
              {item.badge}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
