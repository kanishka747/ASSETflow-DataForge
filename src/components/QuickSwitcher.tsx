import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, ChevronUp, ChevronDown } from 'lucide-react';

export const QuickSwitcher: React.FC = () => {
  const { users, currentUser, logout } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={styles.container}>
      {/* Toggle Button */}
      <button 
        style={styles.toggleBtn} 
        onClick={() => setIsOpen(!isOpen)}
        title="Quick Role Impersonator (Evaluator Shortcut)"
      >
        <Users size={16} />
        <span style={styles.btnText}>Quick Switch Role</span>
        {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {/* Selector Dropdown Panel */}
      {isOpen && (
        <div className="glass-panel" style={styles.panel}>
          <div style={styles.header}>
            <span style={styles.headerTitle}>Evaluator Impersonation Shortcut</span>
            <p style={styles.headerDesc}>Swap user sessions instantly to test approvals, bookings, and audits.</p>
          </div>
          <div style={styles.list}>
            {users.map(u => {
              const isSelected = currentUser ? u.id === currentUser.id : false;
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    logout();
                    localStorage.setItem('af_prefilled_email', u.email);
                    setIsOpen(false);
                    window.dispatchEvent(new Event('prefill_email_changed'));
                  }}
                  style={styles.userRow(isSelected)}
                >
                  <div style={styles.avatar(isSelected)}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.info}>
                    <span style={styles.name}>{u.name}</span>
                    <div style={styles.meta}>
                      <span style={styles.role(u.role)}>{u.role}</span>
                      {u.departmentId && <span style={styles.dot}>•</span>}
                      {u.departmentId && <span style={styles.dept}>Eng</span>}
                    </div>
                  </div>
                  {isSelected && <span style={styles.indicator}>Active</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed' as const,
    bottom: '1.5rem',
    right: '1.5rem',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
    gap: '0.5rem',
    fontFamily: 'var(--font-primary)'
  },
  toggleBtn: {
    backgroundColor: '#181829',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    padding: '0.6rem 1rem',
    borderRadius: '50px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
    fontWeight: 600,
    fontSize: '0.82rem',
    transition: 'all 0.2s ease',
    outline: 'none'
  },
  btnText: {
    fontFamily: 'var(--font-secondary)'
  },
  panel: {
    width: '320px',
    backgroundColor: '#12121e',
    border: '1px solid rgba(99, 102, 241, 0.35)',
    borderRadius: 'var(--border-radius-md)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    maxHeight: '400px',
    overflowY: 'auto' as const
  },
  header: {
    borderBottom: '1px solid var(--card-border)',
    paddingBottom: '0.5rem'
  },
  headerTitle: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    display: 'block'
  },
  headerDesc: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    marginTop: '0.15rem',
    lineHeight: 1.3
  },
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.35rem'
  },
  userRow: (isSelected: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    width: '100%',
    padding: '0.5rem',
    borderRadius: 'var(--border-radius-sm)',
    border: 'none',
    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'all 0.2s ease',
    outline: 'none'
  }),
  avatar: (isSelected: boolean) => ({
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: isSelected ? 'hsl(var(--primary))' : 'var(--bg-tertiary)',
    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.8rem',
    border: isSelected ? 'none' : '1px solid var(--card-border)'
  }),
  info: {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: 1,
    overflow: 'hidden'
  },
  name: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    marginTop: '0.1rem'
  },
  role: (role: string) => {
    let color = 'var(--text-muted)';
    if (role === 'Admin') color = 'hsl(var(--danger))';
    if (role === 'Asset Manager') color = 'hsl(var(--warning))';
    if (role === 'Department Head') color = 'hsl(var(--purple))';
    return {
      fontSize: '0.68rem',
      fontWeight: 700,
      color
    };
  },
  dot: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)'
  },
  dept: {
    fontSize: '0.68rem',
    color: 'var(--text-secondary)'
  },
  indicator: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: 'hsl(var(--success))',
    backgroundColor: 'var(--success-glow)',
    padding: '0.1rem 0.3rem',
    borderRadius: '4px'
  }
};
