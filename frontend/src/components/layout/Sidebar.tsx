import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Kanban,
  Mail,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainNav: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Companies', to: '/companies', icon: Building2 },
  { label: 'Contacts', to: '/contacts', icon: Users },
  { label: 'Contracts', to: '/contracts', icon: FileText },
  { label: 'Pipeline', to: '/pipeline', icon: Kanban },
  { label: 'Email', to: '/email', icon: Mail },
];

const bottomNav: NavItem[] = [
  { label: 'Settings', to: '/settings', icon: Settings },
];

export default function Sidebar() {
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-[240px] flex-col bg-sidebar border-r border-divider">
      {/* Logo / Brand */}
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-card bg-sage text-white font-headline text-label-lg font-bold">
          A
        </div>
        <span className="font-headline text-headline-sm text-ink">AQS CRM</span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 scrollbar-hide">
        <ul className="space-y-1">
          {mainNav.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 rounded-input px-3 py-2.5 text-body-md transition-colors duration-150',
                    isActive
                      ? 'bg-sage-light text-primary font-medium'
                      : 'text-stone-text hover:bg-divider hover:text-ink',
                  )
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-divider px-3 py-2">
        <ul className="space-y-1">
          {bottomNav.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 rounded-input px-3 py-2.5 text-body-md transition-colors duration-150',
                    isActive
                      ? 'bg-sage-light text-primary font-medium'
                      : 'text-stone-text hover:bg-divider hover:text-ink',
                  )
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
          <li>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-input px-3 py-2.5 text-body-md text-stone-text transition-colors duration-150 hover:bg-divider hover:text-ink"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span>Log out</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
