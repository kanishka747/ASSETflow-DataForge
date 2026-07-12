import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { AuditCycle } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { 
  CheckSquare, 
  Plus, 
  Calendar, 
  AlertTriangle,
  FileSpreadsheet,
  Lock
} from 'lucide-react';

export const Audits: React.FC = () => {
  const { 
    audits, 
    assets, 
    departments, 
    users, 
    currentUser, 
    createAuditCycle, 
    verifyAssetInAudit, 
    closeAuditCycle 
  } = useApp();

  // Create Campaign state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [auditName, setAuditName] = useState('');
  const [auditDeptId, setAuditDeptId] = useState('');
  const [auditLoc, setAuditLoc] = useState('');
  const [auditStart, setAuditStart] = useState('2026-07-12');
  const [auditEnd, setAuditEnd] = useState('2026-07-20');
  const [selectedAuditors, setSelectedAuditors] = useState<string[]>([]);

  // Checklist verification modal state
  const [activeCheckingCycle, setActiveCheckingCycle] = useState<AuditCycle | null>(null);

  // View discrepancy report state
  const [viewReportCycle, setViewReportCycle] = useState<AuditCycle | null>(null);

  const isAdmin = currentUser?.role === 'Admin';
  const isAuditorOrMgr = (audit: AuditCycle) => {
    if (!currentUser) return false;
    return audit.auditors.includes(currentUser.id) || ['Admin', 'Asset Manager'].includes(currentUser.role);
  };

  // Get assets scoped to a specific audit campaign
  const getScopedAssets = (audit: AuditCycle) => {
    return assets.filter(a => {
      // Filter by department
      if (audit.departmentId) {
        if (a.holderType === 'department' && a.holderId !== audit.departmentId) return false;
        if (a.holderType === 'employee') {
          const holder = users.find(u => u.id === a.holderId);
          if (holder?.departmentId !== audit.departmentId) return false;
        }
      }
      // Filter by location
      if (audit.location && a.location.toLowerCase() !== audit.location.toLowerCase()) return false;
      return true;
    });
  };

  // Handle Auditor multiselect
  const toggleAuditorSelection = (userId: string) => {
    if (selectedAuditors.includes(userId)) {
      setSelectedAuditors(selectedAuditors.filter(id => id !== userId));
    } else {
      setSelectedAuditors([...selectedAuditors, userId]);
    }
  };

  // Create Submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditName || selectedAuditors.length === 0) return;

    createAuditCycle({
      name: auditName,
      departmentId: auditDeptId || undefined,
      location: auditLoc || undefined,
      startDate: auditStart,
      endDate: auditEnd,
      auditors: selectedAuditors
    });

    // Reset
    setAuditName('');
    setAuditDeptId('');
    setAuditLoc('');
    setSelectedAuditors([]);
    setShowCreateForm(false);
  };

  const getDepartmentName = (id?: string) => {
    return departments.find(d => d.id === id)?.name || 'All Departments';
  };

  const getUserNamesList = (ids: string[]) => {
    return ids.map(id => users.find(u => u.id === id)?.name || 'Staff').join(', ');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Physical Audits</h1>
          <p className="page-subtitle">Configure asset reconciliation calendars, assign internal auditors, and analyze discrepancy audits.</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateForm(true)}>
            <Plus size={16} /> Create Audit Cycle
          </button>
        )}
      </div>

      {/* Audit Campaigns List */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <CheckSquare size={18} /> Verification Campaigns
        </h2>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Campaign Name</th>
                <th>Audited Department</th>
                <th>Target Location</th>
                <th>Auditors Assigned</th>
                <th>Timeline</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {audits.map(au => {
                const isClosed = au.status === 'Closed';
                const canVerify = isAuditorOrMgr(au) && !isClosed;
                const scopedAssets = getScopedAssets(au);
                const verifiedCount = Object.keys(au.results).filter(id => scopedAssets.some(sa => sa.id === id)).length;

                return (
                  <tr key={au.id}>
                    <td style={{ fontWeight: 600 }}>{au.name}</td>
                    <td>{getDepartmentName(au.departmentId)}</td>
                    <td>{au.location || <span style={{ color: 'var(--text-muted)' }}>Corporate-wide</span>}</td>
                    <td>{getUserNamesList(au.auditors)}</td>
                    <td><span style={{ fontSize: '0.82rem' }}><Calendar size={12} /> {au.startDate} to {au.endDate}</span></td>
                    <td>
                      <span className={`badge badge-${au.status.toLowerCase()}`}>
                        {au.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                        {canVerify && (
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => setActiveCheckingCycle(au)}
                            style={{ padding: '0.25rem 0.6rem' }}
                          >
                            Verify Checklist ({verifiedCount}/{scopedAssets.length})
                          </button>
                        )}
                        {isClosed && (
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => setViewReportCycle(au)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem' }}
                          >
                            <FileSpreadsheet size={12} /> Discrepancies
                          </button>
                        )}
                        {!isClosed && isAdmin && (
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => closeAuditCycle(au.id)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem' }}
                          >
                            <Lock size={12} /> Close Cycle
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {audits.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>
                    No audit cycles recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE AUDIT CYCLE FORM MODAL */}
      <Modal isOpen={showCreateForm} onClose={() => setShowCreateForm(false)} title="Initialize Audit Campaign">
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Campaign Name</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Q3 IT Hardware Scan" 
              required
              value={auditName}
              onChange={(e) => setAuditName(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Audited Department Scope (Optional)</label>
              <select 
                className="form-control"
                value={auditDeptId}
                onChange={(e) => setAuditDeptId(e.target.value)}
              >
                <option value="">-- All Departments --</option>
                {departments.filter(d => d.status === 'Active').map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Audited Location Scope (Optional)</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. HQ Floor 3"
                value={auditLoc}
                onChange={(e) => setAuditLoc(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Campaign Start Date</label>
              <input 
                type="date" 
                className="form-control" 
                required
                value={auditStart}
                onChange={(e) => setAuditStart(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Campaign End Date</label>
              <input 
                type="date" 
                className="form-control" 
                required
                value={auditEnd}
                onChange={(e) => setAuditEnd(e.target.value)}
              />
            </div>
          </div>

          {/* Assigned Auditors Selector */}
          <div className="form-group">
            <label>Assign Internal Auditors</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--card-border)', padding: '0.5rem', borderRadius: 'var(--border-radius-sm)', background: 'var(--bg-tertiary)' }}>
              {users.map(u => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <input 
                    type="checkbox" 
                    id={`auditor-${u.id}`} 
                    checked={selectedAuditors.includes(u.id)}
                    onChange={() => toggleAuditorSelection(u.id)}
                    style={{ width: '15px', height: '15px' }}
                  />
                  <label htmlFor={`auditor-${u.id}`} style={{ cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                    {u.name} ({u.role})
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={selectedAuditors.length === 0}>
              Create Campaign
            </button>
          </div>
        </form>
      </Modal>

      {/* AUDITOR CHECKLIST WORKSPACE MODAL */}
      {activeCheckingCycle && (
        <Modal 
          isOpen={true} 
          onClose={() => setActiveCheckingCycle(null)} 
          title={`Checklist: ${activeCheckingCycle.name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Mark every physical asset matching this campaign scope as verified, missing, or damaged.
            </p>

            <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {getScopedAssets(activeCheckingCycle).map(a => {
                const currentStatus = activeCheckingCycle.results[a.id];
                return (
                  <div 
                    key={a.id} 
                    style={{ 
                      padding: '0.75rem 1rem', 
                      backgroundColor: 'var(--bg-tertiary)', 
                      borderRadius: 'var(--border-radius-sm)',
                      border: '1px solid var(--card-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <span className="asset-tag" style={{ display: 'inline-block', marginBottom: '0.2rem' }}>{a.tag}</span>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 700 }}>{a.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location: {a.location}</span>
                    </div>

                    {/* Auditors buttons */}
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button 
                        type="button"
                        className="btn"
                        onClick={() => verifyAssetInAudit(activeCheckingCycle.id, a.id, 'Verified')}
                        style={{ 
                          padding: '0.35rem 0.5rem', 
                          fontSize: '0.75rem',
                          backgroundColor: currentStatus === 'Verified' ? 'var(--success-glow)' : 'var(--bg-primary)',
                          border: currentStatus === 'Verified' ? '1px solid hsl(var(--success))' : '1px solid var(--card-border)',
                          color: currentStatus === 'Verified' ? 'hsl(var(--success))' : 'var(--text-secondary)'
                        }}
                      >
                        Verified
                      </button>
                      <button 
                        type="button"
                        className="btn"
                        onClick={() => verifyAssetInAudit(activeCheckingCycle.id, a.id, 'Damaged')}
                        style={{ 
                          padding: '0.35rem 0.5rem', 
                          fontSize: '0.75rem',
                          backgroundColor: currentStatus === 'Damaged' ? 'var(--warning-glow)' : 'var(--bg-primary)',
                          border: currentStatus === 'Damaged' ? '1px solid hsl(var(--warning))' : '1px solid var(--card-border)',
                          color: currentStatus === 'Damaged' ? 'hsl(var(--warning))' : 'var(--text-secondary)'
                        }}
                      >
                        Damaged
                      </button>
                      <button 
                        type="button"
                        className="btn"
                        onClick={() => verifyAssetInAudit(activeCheckingCycle.id, a.id, 'Missing')}
                        style={{ 
                          padding: '0.35rem 0.5rem', 
                          fontSize: '0.75rem',
                          backgroundColor: currentStatus === 'Missing' ? 'var(--danger-glow)' : 'var(--bg-primary)',
                          border: currentStatus === 'Missing' ? '1px solid hsl(var(--danger))' : '1px solid var(--card-border)',
                          color: currentStatus === 'Missing' ? 'hsl(var(--danger))' : 'var(--text-secondary)'
                        }}
                      >
                        Missing
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveCheckingCycle(null)}>
                Save Progress & Exit
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* DISCREPANCY REPORT PANEL MODAL */}
      {viewReportCycle && (
        <Modal 
          isOpen={true} 
          onClose={() => setViewReportCycle(null)} 
          title={`Discrepancy Report: ${viewReportCycle.name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="flex-between">
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Closed date: {viewReportCycle.closedAt}</span>
              <span className="badge badge-lost" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                <AlertTriangle size={12} /> {viewReportCycle.discrepancyReport?.length || 0} Flags
              </span>
            </div>

            <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
              {viewReportCycle.discrepancyReport && viewReportCycle.discrepancyReport.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {viewReportCycle.discrepancyReport.map(r => (
                    <div 
                      key={r.assetId} 
                      style={{ 
                        padding: '1rem', 
                        backgroundColor: 'var(--bg-tertiary)', 
                        borderRadius: 'var(--border-radius-sm)', 
                        border: '1px solid var(--card-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem'
                      }}
                    >
                      <div className="flex-between">
                        <span className="asset-tag">{r.tag}</span>
                        <span className={`badge badge-lost`}>
                          {r.auditResult}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 700 }}>{r.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'hsl(var(--danger))', fontStyle: 'italic', marginTop: '0.2rem' }}>
                        <b>Reconciliation:</b> {r.reconciliationAction}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: 'hsl(var(--success))', fontWeight: 600, fontSize: '0.9rem', padding: '2rem 0' }}>
                  Perfect Check! No discrepancies or missing assets detected.
                </p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setViewReportCycle(null)}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
