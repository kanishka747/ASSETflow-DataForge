import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Booking } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { 
  Clock, 
  Plus, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export const ResourceBooking: React.FC = () => {
  const { 
    assets, 
    bookings, 
    currentUser, 
    departments, 
    users, 
    bookResource, 
    cancelBooking 
  } = useApp();

  const SYSTEM_DATE = '2026-07-12';

  // Shared bookable resources list
  const bookableResources = assets.filter(a => a.isShared && !['Retired', 'Disposed'].includes(a.status));

  // State
  const [selectedResourceId, setSelectedResourceId] = useState<string>(
    bookableResources.length > 0 ? bookableResources[0].id : ''
  );
  
  // Booking Form State
  const [showBookForm, setShowBookForm] = useState(false);
  const [bookDate, setBookDate] = useState(SYSTEM_DATE);
  const [bookStartTime, setBookStartTime] = useState('10:00');
  const [bookEndTime, setBookEndTime] = useState('11:00');
  const [bookPurpose, setBookPurpose] = useState('');
  const [bookOnBehalfDept, setBookOnBehalfDept] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const selectedResource = assets.find(a => a.id === selectedResourceId);

  // Calendar parameters (July 2026)
  const currentYear = 2026;
  const monthName = 'July 2026';

  // Generate days for July 2026 (starts on Wednesday, 31 days)
  const startDayOfWeek = 3; // Wednesday (0: Sun, 1: Mon, 2: Tue, 3: Wed...)
  const totalDays = 31;

  const calendarCells = [];
  // Empty spaces for previous month
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push({ day: null, dateStr: '' });
  }
  // Days of the month
  for (let d = 1; d <= totalDays; d++) {
    const dayStr = d.toString().padStart(2, '0');
    calendarCells.push({
      day: d,
      dateStr: `${currentYear}-07-${dayStr}`
    });
  }

  // Get bookings for selected resource
  const resourceBookings = bookings.filter(
    b => b.assetId === selectedResourceId && b.status !== 'Cancelled'
  );

  // Check booking status helper
  const getBookingStatusText = (b: Booking) => {
    return b.status;
  };

  const getBookerName = (b: Booking) => {
    const u = users.find(x => x.id === b.userId);
    return u ? u.name : 'Unknown';
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedResourceId || !bookDate || !bookStartTime || !bookEndTime || !bookPurpose) {
      setErrorMsg('All fields are required.');
      return;
    }

    const res = bookResource({
      assetId: selectedResourceId,
      userId: currentUser?.id || '',
      departmentId: bookOnBehalfDept || undefined,
      startDate: bookDate,
      startTime: bookStartTime,
      endDate: bookDate, // Assumes single-day slots
      endTime: bookEndTime,
      purpose: bookPurpose
    });

    if (res.success) {
      setSuccessMsg(res.message);
      setBookPurpose('');
      setTimeout(() => {
        setShowBookForm(false);
        setSuccessMsg('');
      }, 1000);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Resource Booking</h1>
          <p className="page-subtitle">Reserve shared conference rooms, workspaces, or company transport without scheduling conflicts.</p>
        </div>
        <button 
          className="btn btn-primary btn-sm" 
          disabled={!selectedResourceId}
          onClick={() => { setErrorMsg(''); setSuccessMsg(''); setShowBookForm(true); }}
        >
          <Plus size={16} /> New Reservation
        </button>
      </div>

      {/* Main Layout: Resource selector + Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'stretch' }}>
        
        {/* LEFT: Bookable Resources Selector List */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Bookable Resources
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {bookableResources.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedResourceId(r.id)}
                style={{
                  padding: '0.8rem 1rem',
                  borderRadius: 'var(--border-radius-sm)',
                  backgroundColor: selectedResourceId === r.id ? 'var(--primary-glow)' : 'var(--bg-tertiary)',
                  border: selectedResourceId === r.id ? '1px solid hsl(var(--primary))' : '1px solid var(--card-border)',
                  color: selectedResourceId === r.id ? 'hsl(var(--primary))' : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  <span>{r.name}</span>
                  <span style={{ fontSize: '0.72rem', color: selectedResourceId === r.id ? 'hsl(var(--primary))' : 'var(--text-muted)', fontWeight: 500 }}>
                    {r.location}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Visual Calendar Grid */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {selectedResource ? (
            <>
              {/* Calendar Header info */}
              <div className="calendar-header">
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedResource.name}</h2>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Location: {selectedResource.location} • Tag: {selectedResource.tag}
                  </span>
                </div>
                <div style={{ fontWeight: 700, color: 'hsl(var(--primary))' }}>
                  {monthName}
                </div>
              </div>

              {/* Day Headers */}
              <div className="calendar-container">
                <div className="calendar-grid">
                  <div className="calendar-day-header">Sun</div>
                  <div className="calendar-day-header">Mon</div>
                  <div className="calendar-day-header">Tue</div>
                  <div className="calendar-day-header">Wed</div>
                  <div className="calendar-day-header">Thu</div>
                  <div className="calendar-day-header">Fri</div>
                  <div className="calendar-day-header">Sat</div>
                </div>

                {/* Calendar Cells */}
                <div className="calendar-grid">
                  {calendarCells.map((cell, idx) => {
                    const isToday = cell.dateStr === SYSTEM_DATE;
                    
                    // Filter bookings for this day
                    const cellBookings = resourceBookings.filter(b => b.startDate === cell.dateStr);

                    return (
                      <div 
                        key={idx} 
                        className={`calendar-day ${!cell.day ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                        onClick={() => {
                          if (cell.dateStr) {
                            setBookDate(cell.dateStr);
                            setErrorMsg('');
                            setSuccessMsg('');
                            setShowBookForm(true);
                          }
                        }}
                      >
                        {cell.day && (
                          <>
                            <span className="calendar-day-number">{cell.day}</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', overflow: 'hidden' }}>
                              {cellBookings.slice(0, 3).map(cb => (
                                <div 
                                  key={cb.id} 
                                  className="calendar-booking-item"
                                  style={{
                                    backgroundColor: 'var(--primary-glow)',
                                    color: 'hsl(var(--primary))',
                                    borderLeft: '2px solid hsl(var(--primary))',
                                    fontSize: '0.65rem',
                                    padding: '2px 4px'
                                  }}
                                  title={`${cb.startTime}-${cb.endTime}: ${cb.purpose}`}
                                >
                                  {cb.startTime} {cb.purpose}
                                </div>
                              ))}
                              {cellBookings.length > 3 && (
                                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                                  +{cellBookings.length - 3} more
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 0' }}>
              No shared bookable resources registered in the system.
            </p>
          )}
        </div>
      </div>

      {/* BOTTOM: Current User Schedule Reservations */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
          Your Scheduled Bookings
        </h3>
        
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reserved Resource</th>
                <th>Reservation Date</th>
                <th>Time Window</th>
                <th>Booked By</th>
                <th>Booking Purpose</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.filter(b => b.userId === currentUser?.id || (currentUser?.role === 'Department Head' && b.departmentId === currentUser.departmentId)).map(b => {
                const asset = assets.find(x => x.id === b.assetId);
                return (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600 }}>{asset?.name || 'Resource'}</td>
                    <td>{b.startDate}</td>
                    <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> {b.startTime} - {b.endTime}</span></td>
                    <td>{getBookerName(b)}</td>
                    <td>{b.purpose}</td>
                    <td>
                      <span className={`badge badge-${b.status.toLowerCase()}`}>
                        {getBookingStatusText(b)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {b.status === 'Upcoming' && (
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => cancelBooking(b.id)}
                          style={{ color: 'hsl(var(--danger))', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                        >
                          Cancel Booking
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {bookings.filter(b => b.userId === currentUser?.id || (currentUser?.role === 'Department Head' && b.departmentId === currentUser.departmentId)).length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
                    No bookings logged for you or your department.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOOKING MODAL */}
      <Modal isOpen={showBookForm} onClose={() => setShowBookForm(false)} title={`Create Reservation: ${selectedResource?.name}`}>
        <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {errorMsg && (
            <div style={{ backgroundColor: 'var(--danger-glow)', color: 'hsl(var(--danger))', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', fontSize: '0.82rem', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ backgroundColor: 'var(--success-glow)', color: 'hsl(var(--success))', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', fontSize: '0.82rem', border: '1px solid rgba(34, 197, 94, 0.3)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="form-group">
            <label>Selected Resource</label>
            <input 
              type="text" 
              className="form-control" 
              readOnly 
              value={`${selectedResource?.name} (${selectedResource?.location})`} 
              style={{ opacity: 0.8, backgroundColor: 'var(--bg-primary)' }}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Booking Date</label>
              <input 
                type="date" 
                className="form-control" 
                required
                value={bookDate}
                onChange={(e) => setBookDate(e.target.value)}
              />
            </div>

            {(currentUser?.role === 'Department Head' || currentUser?.role === 'Admin' || currentUser?.role === 'Asset Manager') && (
              <div className="form-group">
                <label>Book On Behalf of Department</label>
                <select 
                  className="form-control"
                  value={bookOnBehalfDept}
                  onChange={(e) => setBookOnBehalfDept(e.target.value)}
                >
                  <option value="">-- No (Book for Self) --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} Department</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Time (HH:MM)</label>
              <input 
                type="time" 
                className="form-control" 
                required
                value={bookStartTime}
                onChange={(e) => setBookStartTime(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>End Time (HH:MM)</label>
              <input 
                type="time" 
                className="form-control" 
                required
                value={bookEndTime}
                onChange={(e) => setBookEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Reservation Purpose</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Weekly Planning Sync" 
              required
              value={bookPurpose}
              onChange={(e) => setBookPurpose(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowBookForm(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Reservation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
