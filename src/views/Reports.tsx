import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { Download, AreaChart, Flame, Settings, AlertTriangle } from 'lucide-react';

export const Reports: React.FC = () => {
  const { assets, categories, departments, bookings, maintenance, users } = useApp();

  // 1. Department Allocation Data
  const deptData = departments.map(d => {
    // Count assets held by this department or by employees in this department
    const count = assets.filter(a => {
      if (a.holderType === 'department' && a.holderId === d.id) return true;
      if (a.holderType === 'employee') {
        const holder = users.find(u => u.id === a.holderId);
        return holder?.departmentId === d.id;
      }
      return false;
    }).length;

    return {
      name: d.name,
      value: count
    };
  }).filter(item => item.value > 0);

  // 2. Maintenance Frequency by Category
  const maintenanceData = categories.map(c => {
    // Count maintenance requests for assets in this category
    const count = maintenance.filter(m => {
      const asset = assets.find(a => a.id === m.assetId);
      return asset?.categoryId === c.id;
    }).length;

    return {
      category: c.name,
      repairs: count
    };
  });


  // 4. Booking Heatmap calculations (Hours 08:00 - 18:00 vs Days of the Week Mon-Fri)
  // Grid layout helper
  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8:00 to 18:00
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const getHeatmapLevel = (dayName: string, hour: number) => {
    // Mock booking concentration or map from active bookings date
    // Mon (1) to Fri (5)
    // Map day name to week offset
    let count = 0;
    
    // Scan actual bookings count that covers this day/hour range
    bookings.forEach(b => {
      if (b.status === 'Cancelled') return;
      const bDate = new Date(b.startDate);
      const bDay = bDate.toLocaleDateString('en-US', { weekday: 'long' });
      if (bDay !== dayName) return;

      const startH = parseInt(b.startTime.split(':')[0]);
      const endH = parseInt(b.endTime.split(':')[0]);

      if (hour >= startH && hour < endH) {
        count++;
      }
    });

    // Return level 0-4
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count === 3) return 3;
    return 4;
  };

  // 5. Assets nearing retirement/due for check
  const criticalAssets = assets.filter(a => {
    // Critical if condition is Poor or status is Lost or expired expected return
    const isOverdue = a.status === 'Allocated' && a.expectedReturnDate && a.expectedReturnDate < '2026-07-12';
    return a.condition === 'Poor' || a.status === 'Lost' || isOverdue;
  });

  // Export JSON summary
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      assets,
      bookings,
      maintenance,
      departments
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `AssetFlow_Enterprise_Report_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const COLORS = ['#6366f1', '#a855f7', '#06b6d4', '#22c55e', '#f97316', '#ef4444'];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics & Reports</h1>
          <p className="page-subtitle">Actionable visual intelligence of asset lifecycles, maintenance schedules, and resource allocations.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleExportData}>
          <Download size={16} /> Export System Ledger (JSON)
        </button>
      </div>

      {/* Row 1: Allocation and breakdown charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Department allocation pie chart */}
        <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '340px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AreaChart size={16} /> Department Placement Summary
          </h3>
          {deptData.length > 0 ? (
            <div style={{ width: '100%', height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deptData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: '8px' }}
                    labelStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '5rem' }}>No asset allocations recorded.</p>
          )}
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '340px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Settings size={16} /> Maintenance Frequency by Category
          </h3>
          {maintenanceData.some(d => d.repairs > 0) ? (
            <div style={{ width: '100%', height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintenanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                  <XAxis dataKey="category" stroke="var(--text-secondary)" fontSize={11} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: '8px' }}
                    labelStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Bar dataKey="repairs" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '5rem' }}>No maintenance requests logged.</p>
          )}
        </div>
      </div>

      {/* Row 2: Heatmap Visuals */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Flame size={16} style={{ color: 'hsl(var(--warning))' }} /> Shared Resource Booking Heatmap (Peak Window Density)
        </h3>

        {/* Heatmap Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Timeline Hours Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '120px repeat(11, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            <div />
            {hours.map(h => (
              <div key={h}>{h}:00</div>
            ))}
          </div>

          {/* Days Rows */}
          {days.map(day => (
            <div key={day} style={{ display: 'grid', gridTemplateColumns: '120px repeat(11, 1fr)', gap: '4px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '12px', color: 'var(--text-secondary)' }}>
                {day}
              </div>
              {hours.map(h => {
                const lvl = getHeatmapLevel(day, h);
                return (
                  <div 
                    key={h}
                    className={`heatmap-cell level-${lvl}`}
                    title={`${day} at ${h}:00 - Booking density level: ${lvl}`}
                    style={{
                      height: '32px',
                      borderRadius: 'var(--border-radius-sm)',
                      border: '1px solid var(--card-border)'
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Heatmap Legend */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span>Key: </span>
          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: 'rgba(99, 102, 241, 0.03)', border: '1px solid var(--card-border)' }} /> Idle
            <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: 'rgba(99, 102, 241, 0.25)' }} /> Low
            <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: 'rgba(99, 102, 241, 0.5)' }} /> Medium
            <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: 'rgba(99, 102, 241, 0.75)' }} /> High
            <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: 'rgba(99, 102, 241, 1)' }} /> Peak
          </div>
        </div>
      </div>

      {/* Row 3: Actionable Alerts for critical assets */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'hsl(var(--danger))' }}>
          <AlertTriangle size={16} /> Attention Required (Replacement / Recovery Scope)
        </h3>
        
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Asset Name</th>
                <th>Condition</th>
                <th>Status</th>
                <th>Location</th>
                <th>Issue Flag</th>
              </tr>
            </thead>
            <tbody>
              {criticalAssets.map(a => {
                const isOverdue = a.status === 'Allocated' && a.expectedReturnDate && a.expectedReturnDate < '2026-07-12';
                return (
                  <tr key={a.id}>
                    <td><span className="asset-tag">{a.tag}</span></td>
                    <td style={{ fontWeight: 600 }}>{a.name}</td>
                    <td>
                      <span className="badge badge-lost" style={{ opacity: 0.9 }}>{a.condition}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${a.status.toLowerCase().replace(' ', '')}`}>
                        {a.status}
                      </span>
                    </td>
                    <td>{a.location}</td>
                    <td style={{ fontWeight: 600, color: 'hsl(var(--danger))' }}>
                      {a.status === 'Lost' && 'Confirmed Missing'}
                      {a.condition === 'Poor' && 'Poor Mechanical Health'}
                      {isOverdue && 'Overdue Check-in'}
                    </td>
                  </tr>
                );
              })}
              {criticalAssets.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'hsl(var(--success))', padding: '2rem 0', fontWeight: 600 }}>
                    Excellent: No immediate recovery flags or mechanical exceptions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
