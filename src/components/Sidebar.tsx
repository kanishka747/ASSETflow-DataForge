import React from 'react';
import { useApp } from '../context/AppContext';
import type { UserRole } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Settings, 
  Package, 
  GitPullRequest, 
  CalendarDays, 
  Wrench, 
  CheckSquare, 
  BarChart3, 
  History, 
  LogOut,
  Sun,
  Moon
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const { currentUser, logout, theme, toggleTheme, notifications } = useApp();

  if (!currentUser) return null;

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { id: 'setup', label: 'Organization Setup', icon: Settings, roles: ['Admin'] },
    { id: 'assets', label: 'Asset Registry', icon: Package, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { id: 'allocations', label: 'Allocations & Transfers', icon: GitPullRequest, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { id: 'bookings', label: 'Resource Booking', icon: CalendarDays, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { id: 'audits', label: 'Audits', icon: CheckSquare, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { id: 'reports', label: 'Analytics', icon: BarChart3, roles: ['Admin', 'Asset Manager', 'Department Head'] },
    { id: 'activity', label: 'Activity Logs', icon: History, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <aside style={styles.sidebar}>
      {/* Brand Header */}
      <div style={styles.brand}>
        <div style={styles.logoIcon}>AF</div>
        <div style={styles.brandText}>
          <span style={styles.brandName}>AssetFlow</span>
          <span style={styles.brandSub}>Enterprise ERP</span>
        </div>
      </div>

      {/* User Section */}
      <div style={styles.userCard}>
        <div style={styles.avatar}>
          {currentUser.name.charAt(0).toUpperCase()}
        </div>
        <div style={styles.userInfo}>
          <div style={styles.userName}>{currentUser.name}</div>
          <div style={styles.userRoleBadge(currentUser.role)}>{currentUser.role}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              style={styles.navLink(isActive)}
            >
              <Icon size={18} />
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
              {item.id === 'activity' && unreadNotifications > 0 && (
                <span style={styles.badge}>{unreadNotifications}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Controls */}
      <div style={styles.footer}>
        <button onClick={toggleTheme} style={styles.footerBtn}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <button onClick={logout} style={{ ...styles.footerBtn, color: 'hsl(var(--danger))' }}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: 'var(--sidebar-width)',
    height: '100vh',
    position: 'fixed' as const,
    top: 0,
    left: 0,
    backgroundColor: 'var(--bg-secondary)',
    borderRight: '1px solid var(--card-border)',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '1.5rem',
    zIndex: 99,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '2rem',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: 'hsl(var(--primary))',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '1rem',
    boxShadow: '0 4px 10px var(--primary-glow)',
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  brandName: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    lineHeight: 1.2,
  },
  brandSub: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--card-border)',
    marginBottom: '2rem',
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: 'hsl(var(--primary), 0.1)',
    color: 'hsl(var(--primary))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '1.1rem',
    border: '1px solid hsl(var(--primary), 0.3)',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.2rem',
    overflow: 'hidden',
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRoleBadge: (role: UserRole) => {
    let color = 'hsl(var(--primary))';
    let bg = 'var(--primary-glow)';
    if (role === 'Admin') {
      color = 'hsl(var(--danger))';
      bg = 'var(--danger-glow)';
    } else if (role === 'Asset Manager') {
      color = 'hsl(var(--warning))';
      bg = 'var(--warning-glow)';
    } else if (role === 'Department Head') {
      color = 'hsl(var(--purple))';
      bg = 'var(--purple-glow)';
    }
    return {
      fontSize: '0.7rem',
      fontWeight: 700,
      color,
      backgroundColor: bg,
      padding: '0.1rem 0.4rem',
      borderRadius: '4px',
      alignSelf: 'flex-start',
    };
  },
  nav: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.35rem',
    flex: 1,
    overflowY: 'auto' as const,
  },
  navLink: (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.8rem 1rem',
    borderRadius: 'var(--border-radius-sm)',
    color: isActive ? 'hsl(var(--primary))' : 'var(--text-secondary)',
    backgroundColor: isActive ? 'var(--primary-glow)' : 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-secondary)',
    fontWeight: 600,
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
    outline: 'none',
    width: '100%',
    borderLeft: isActive ? '3px solid hsl(var(--primary))' : '3px solid transparent',
  }),
  badge: {
    backgroundColor: 'hsl(var(--danger))',
    color: 'white',
    fontSize: '0.7rem',
    fontWeight: 700,
    padding: '0.15rem 0.4rem',
    borderRadius: '50px',
  },
  footer: {
    borderTop: '1px solid var(--card-border)',
    paddingTop: '1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  footerBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
    borderRadius: 'var(--border-radius-sm)',
    transition: 'all 0.2s ease',
    width: '100%',
    textAlign: 'left' as const,
  },
};
