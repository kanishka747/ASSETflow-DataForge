import React from 'react';
import { useApp } from '../context/AppContext';
import type { Asset } from '../context/AppContext';
import { 
  PackageCheck, 
  GitPullRequest, 
  CalendarDays, 
  Wrench, 
  AlertTriangle,
  PlusCircle
} from 'lucide-react';

interface DashboardProps {
  setView: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const { assets, bookings, transfers, currentUser, users } = useApp();

  const TODAY_STR = '2026-07-12';

  // Calculate statistics
  const countAvailable = assets.filter(a => a.status === 'Available').length;
  const countAllocated = assets.filter(a => a.status === 'Allocated').length;
  const countMaintenance = assets.filter(a => a.status === 'Under Maintenance').length;
  const activeBookings = bookings.filter(b => b.status === 'Upcoming' || b.status === 'Ongoing').length;
  const pendingTransfers = transfers.filter(t => t.status === 'Pending').length;

  // Filter overdue and upcoming returns
  const overdueAllocations = assets.filter(a => {
    if (a.status !== 'Allocated' || !a.expectedReturnDate) return false;
    return a.expectedReturnDate < TODAY_STR;
  });

  const upcomingReturnsCount = assets.filter(a => {
    if (a.status !== 'Allocated' || !a.expectedReturnDate) return false;
    return a.expectedReturnDate >= TODAY_STR;
  }).length;

  // Get holder name helper
  const getHolderName = (asset: Asset) => {
    if (asset.holderType === 'employee') {
      const u = users.find(x => x.id === asset.holderId);
      return u ? u.name : 'Unknown Employee';
    }
    return 'Departmental';
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Operational Snapshot</h1>
          <p className="page-subtitle">Welcome back, {currentUser?.name}. Current Date: {TODAY_STR}</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="dashboard-grid">
        <div className="glass-panel kpi-card" style={{ '--card-accent': 'var(--success)', '--card-accent-glow': 'var(--success-glow)' } as React.CSSProperties}>
          <div className="kpi-card-info">
            <h3>Assets Available</h3>
            <p>{countAvailable}</p>
          </div>
          <div className="kpi-icon">
            <PackageCheck size={22} />
          </div>
        </div>

        <div className="glass-panel kpi-card" style={{ '--card-accent': 'var(--primary)', '--card-accent-glow': 'var(--primary-glow)' } as React.CSSProperties}>
          <div className="kpi-card-info">
            <h3>Assets Allocated</h3>
            <p>{countAllocated}</p>
          </div>
          <div className="kpi-icon">
            <PackageCheck size={22} style={{ opacity: 0.8 }} />
          </div>
        </div>

        <div className="glass-panel kpi-card" style={{ '--card-accent': 'var(--warning)', '--card-accent-glow': 'var(--warning-glow)' } as React.CSSProperties}>
          <div className="kpi-card-info">
            <h3>Under Maintenance</h3>
            <p>{countMaintenance}</p>
          </div>
          <div className="kpi-icon">
            <Wrench size={22} />
          </div>
        </div>

        <div className="glass-panel kpi-card" style={{ '--card-accent': 'var(--purple)', '--card-accent-glow': 'var(--purple-glow)' } as React.CSSProperties}>
          <div className="kpi-card-info">
            <h3>Active Bookings</h3>
            <p>{activeBookings}</p>
          </div>
          <div className="kpi-icon">
            <CalendarDays size={22} />
          </div>
        </div>

        <div className="glass-panel kpi-card" style={{ '--card-accent': 'var(--info)', '--card-accent-glow': 'var(--info-glow)' } as React.CSSProperties}>
          <div className="kpi-card-info">
            <h3>Pending Transfers</h3>
            <p>{pendingTransfers}</p>
          </div>
          <div className="kpi-icon">
            <GitPullRequest size={22} />
          </div>
        </div>

        <div className="glass-panel kpi-card" style={{ '--card-accent': 'var(--danger)', '--card-accent-glow': 'var(--danger-glow)' } as React.CSSProperties}>
          <div className="kpi-card-info">
            <h3>Upcoming Returns</h3>
            <p>{upcomingReturnsCount}</p>
          </div>
          <div className="kpi-icon">
            <CalendarDays size={22} style={{ opacity: 0.7 }} />
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 700 }}>Quick Actions</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {(currentUser?.role === 'Admin' || currentUser?.role === 'Asset Manager') && (
            <button className="btn btn-primary" onClick={() => setView('assets')}>
              <PlusCircle size={16} /> Register New Asset
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => setView('bookings')}>
            <CalendarDays size={16} /> Book Shared Resource
          </button>
          <button className="btn btn-secondary" onClick={() => setView('maintenance')}>
            <Wrench size={16} /> File Repair Request
          </button>
          <button className="btn btn-secondary" onClick={() => setView('allocations')}>
            <GitPullRequest size={16} /> Transfer Request
          </button>
        </div>
      </div>

      {/* Overdue Returns Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="flex-between" style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--danger))' }}>
              <AlertTriangle size={18} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Overdue Returns Alert</h3>
            </div>
            <span className="badge badge-lost" style={{ fontSize: '0.7rem' }}>
              {overdueAllocations.length} Overdue
            </span>
          </div>

          {overdueAllocations.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
              Excellent! No overdue asset returns currently recorded.
            </p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tag</th>
                    <th>Asset Name</th>
                    <th>Expected Return</th>
                    <th>Current Holder</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueAllocations.map(a => (
                    <tr key={a.id}>
                      <td><span className="asset-tag">{a.tag}</span></td>
                      <td style={{ fontWeight: 600 }}>{a.name}</td>
                      <td style={{ color: 'hsl(var(--danger))', fontWeight: 700 }}>{a.expectedReturnDate}</td>
                      <td>{getHolderName(a)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User Allocation Summary */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Your Currently Held Assets</h3>
          </div>
          {assets.filter(a => a.holderType === 'employee' && a.holderId === currentUser?.id).length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
              You do not have any physical assets allocated directly to you.
            </p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tag</th>
                    <th>Asset Name</th>
                    <th>Condition</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {assets
                    .filter(a => a.holderType === 'employee' && a.holderId === currentUser?.id)
                    .map(a => (
                      <tr key={a.id}>
                        <td><span className="asset-tag">{a.tag}</span></td>
                        <td style={{ fontWeight: 600 }}>{a.name}</td>
                        <td>
                          <span className={`badge badge-available`} style={{ opacity: 0.9 }}>
                            {a.condition}
                          </span>
                        </td>
                        <td>{a.expectedReturnDate || 'No Limit'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
