import { Search, Bell } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface HeaderProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function Header({ title = 'Dashboard', breadcrumbs }: HeaderProps) {
  const user = useAuthStore((s) => s.user);

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : user?.username?.slice(0, 2).toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-divider bg-card/80 px-6 backdrop-blur-sm">
      {/* Left side — Breadcrumb / Title */}
      <div className="flex items-center gap-2">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav className="flex items-center gap-1.5 text-body-sm text-stone-text">
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                {idx > 0 && <span className="text-divider">/</span>}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="transition-colors hover:text-ink"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-ink font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : (
          <h1 className="font-headline text-headline-sm text-ink">{title}</h1>
        )}
      </div>

      {/* Right side — Search, Notifications, Avatar */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-text" />
          <input
            type="text"
            placeholder="Search…"
            className="h-9 w-56 rounded-input border border-stone-border bg-canvas pl-9 pr-3 text-body-sm text-ink placeholder:text-stone-text/60 transition-shadow focus:border-sage focus:shadow-focus-sage focus:outline-none"
          />
        </div>

        {/* Notification Bell */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-input text-stone-text transition-colors hover:bg-divider hover:text-ink focus-sage"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {/* Unread dot */}
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-sage" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-light font-headline text-label-md font-semibold text-sage-dark">
            {initials}
          </div>
          {user && (
            <span className="hidden text-body-sm font-medium text-ink lg:inline">
              {user.fullName || user.username}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
