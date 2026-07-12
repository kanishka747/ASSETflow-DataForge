import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bell, 
  History, 
  Search, 
  Check, 
  Clock, 
  User
} from 'lucide-react';

export const ActivityLogs: React.FC = () => {
  const { 
    notifications, 
    activityLogs, 
    markAllNotificationsRead
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterUser, setFilterUser] = useState('');

  // Mark notifications read on load/mount or via click
  const handleMarkRead = () => {
    markAllNotificationsRead();
  };

  // Filtered Logs
  const filteredLogs = activityLogs.filter(log => {
    const term = search.toLowerCase().trim();
    const matchSearch = 
      log.action.toLowerCase().includes(term) ||
      log.userName.toLowerCase().includes(term);

    const matchUser = filterUser === '' || log.userId === filterUser;

    return matchSearch && matchUser;
  });

  // Unique users who logged actions
  const uniqueLoggingUsers = Array.from(
    new Map(activityLogs.map(log => [log.userId, log.userName])).entries()
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications & Activity Logs</h1>
          <p className="page-subtitle">Inspect user notification threads and view the secure, immutable system activity ledger.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem', alignItems: 'stretch' }}>
        
        {/* LEFT COLUMN: Notifications */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="flex-between" style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Bell size={18} /> Notification Alerts
            </h3>
            {notifications.some(n => !n.isRead) && (
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={handleMarkRead}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                <Check size={12} /> Clear Unread
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '550px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '3rem 0' }}>
                No recent notifications.
              </p>
            ) : (
              notifications.map(n => {
                const isWarning = n.type === 'warning';
                const isSuccess = n.type === 'success';
                let borderStyle = '1px solid var(--card-border)';
                let bgStyle = 'var(--bg-tertiary)';

                if (isWarning) {
                  borderStyle = '1px solid rgba(249, 115, 22, 0.3)';
                  bgStyle = 'var(--warning-glow)';
                } else if (isSuccess) {
                  borderStyle = '1px solid rgba(34, 197, 94, 0.3)';
                  bgStyle = 'var(--success-glow)';
                }

                return (
                  <div 
                    key={n.id} 
                    style={{ 
                      padding: '0.85rem 1rem', 
                      backgroundColor: bgStyle,
                      border: borderStyle,
                      borderRadius: 'var(--border-radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      opacity: n.isRead ? 0.65 : 1,
                      transition: 'opacity 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    {!n.isRead && (
                      <span style={{ 
                        position: 'absolute', 
                        top: '12px', 
                        right: '12px', 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        backgroundColor: 'hsl(var(--primary))' 
                      }} />
                    )}
                    <p style={{ fontSize: '0.85rem', fontWeight: n.isRead ? 500 : 700, paddingRight: '12px', lineHeight: 1.35 }}>
                      {n.message}
                    </p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Clock size={10} /> {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Activity Log */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <History size={18} /> Global System Audit Log
            </h3>
          </div>

          {/* Search filters */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search audit actions..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '32px', fontSize: '0.8rem', height: '36px' }}
              />
            </div>

            <select 
              className="form-control"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              style={{ fontSize: '0.8rem', width: '160px', height: '36px' }}
            >
              <option value="">-- All Staff --</option>
              {uniqueLoggingUsers.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>

          {/* Logs List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '460px', overflowY: 'auto' }}>
            {filteredLogs.map(log => (
              <div 
                key={log.id} 
                style={{ 
                  padding: '0.75rem 1rem', 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px solid var(--card-border)', 
                  borderRadius: 'var(--border-radius-sm)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <User size={14} style={{ color: 'hsl(var(--primary))', marginTop: '0.2rem' }} />
                  <div style={{ fontSize: '0.82rem' }}>
                    <span style={{ fontWeight: 700, marginRight: '0.4rem' }}>{log.userName}:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{log.action}</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.15rem' }}>
                  <Clock size={10} /> {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            ))}
            {filteredLogs.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '3rem 0' }}>
                No audit entries match filter query.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
