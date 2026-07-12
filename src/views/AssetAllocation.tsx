import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Asset } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { 
  Plus, 
  GitPullRequest, 
  ArrowRightLeft, 
  AlertTriangle,
  RotateCcw,
  Check,
  X
} from 'lucide-react';

export const AssetAllocation: React.FC = () => {
  const { 
    assets, 
    users, 
    departments, 
    transfers, 
    currentUser, 
    allocateAsset, 
    requestTransfer, 
    processTransferAction, 
    returnAsset 
  } = useApp();

  const TODAY_STR = '2026-07-12';

  // Allocation Form State
  const [showAllocForm, setShowAllocForm] = useState(false);
  const [allocAssetId, setAllocAssetId] = useState('');
  const [allocHolderType, setAllocHolderType] = useState<'employee' | 'department'>('employee');
  const [allocHolderId, setAllocHolderId] = useState('');
  const [allocReturnDate, setAllocReturnDate] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [conflictAsset, setConflictAsset] = useState<Asset | null>(null);

  // Return Check-in Modal State
  const [selectedReturnAsset, setSelectedReturnAsset] = useState<Asset | null>(null);
  const [returnNotes, setReturnNotes] = useState('');
  const [returnCondition, setReturnCondition] = useState<Asset['condition']>('Good');

  const isManager = currentUser?.role === 'Admin' || currentUser?.role === 'Asset Manager';
  const isDeptHead = currentUser?.role === 'Department Head';

  // Get active allocations (not including retired/lost/disposed)
  const activeAllocatedAssets = assets.filter(a => a.status === 'Allocated');

  // Helper: Name of holder
  const getHolderName = (asset: Asset) => {
    if (asset.holderType === 'employee') {
      const u = users.find(x => x.id === asset.holderId);
      return u ? `${u.name} (Employee)` : 'Unknown Employee';
    } else if (asset.holderType === 'department') {
      const d = departments.find(x => x.id === asset.holderId);
      return d ? `${d.name} (Dept)` : 'Unknown Department';
    }
    return 'Unassigned';
  };

  // Helper: Name by ID
  const getUserName = (id: string) => {
    return users.find(u => u.id === id)?.name || 'Unknown';
  };

  // Handle Allocation Submit
  const handleAllocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setConflictAsset(null);

    if (!allocAssetId || !allocHolderId) {
      setErrorMsg('Please select an asset and a target holder.');
      return;
    }

    const res = allocateAsset(allocAssetId, allocHolderType, allocHolderId, allocReturnDate);

    if (res.success) {
      // Clear Form
      setAllocAssetId('');
      setAllocHolderId('');
      setAllocReturnDate('');
      setShowAllocForm(false);
    } else {
      // Check if it was blocked because of double-allocation conflict
      const asset = assets.find(a => a.id === allocAssetId);
      if (asset && asset.status === 'Allocated') {
        setConflictAsset(asset);
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  // Trigger Transfer Request
  const handleInitiateTransfer = () => {
    if (!conflictAsset || !currentUser) return;
    const res = requestTransfer(conflictAsset.id, currentUser.id);
    if (res.success) {
      setConflictAsset(null);
      setShowAllocForm(false);
      alert('Transfer Request submitted successfully. Awaiting Manager/Department Head approval.');
    } else {
      setErrorMsg(res.message);
    }
  };

  // Handle Return Check-in Submit
  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturnAsset) return;

    const res = returnAsset(selectedReturnAsset.id, returnNotes, returnCondition);
    if (res.success) {
      setSelectedReturnAsset(null);
      setReturnNotes('');
      setReturnCondition('Good');
    }
  };

  // Can approve helper: Asset Managers can approve anything; Department Heads can approve if the current holder is in their department
  const canApproveTransfer = (t: typeof transfers[0]) => {
    if (isManager) return true;
    if (isDeptHead) {
      const fromUser = users.find(u => u.id === t.fromUserId);
      return fromUser?.departmentId === currentUser?.departmentId;
    }
    return false;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Allocations & Transfers</h1>
          <p className="page-subtitle">Track individual check-outs, schedule returns, and process transfers.</p>
        </div>
        {isManager && (
          <button className="btn btn-primary btn-sm" onClick={() => { setErrorMsg(''); setConflictAsset(null); setShowAllocForm(true); }}>
            <Plus size={16} /> Allocate Asset
          </button>
        )}
      </div>

      {/* Grid: Active Allocations (Left) & Transfer Workflow Panel (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* LEFT: Active Allocations */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
            Current Asset Placements
          </h2>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tag</th>
                  <th>Asset Name</th>
                  <th>Current Holder</th>
                  <th>Return Schedule</th>
                  {isManager && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {activeAllocatedAssets.map(a => {
                  const isOverdue = a.expectedReturnDate && a.expectedReturnDate < TODAY_STR;
                  return (
                    <tr key={a.id}>
                      <td><span className="asset-tag">{a.tag}</span></td>
                      <td style={{ fontWeight: 600 }}>{a.name}</td>
                      <td>{getHolderName(a)}</td>
                      <td>
                        {a.expectedReturnDate ? (
                          <span style={{ 
                            color: isOverdue ? 'hsl(var(--danger))' : 'var(--text-secondary)',
                            fontWeight: isOverdue ? 700 : 500
                          }}>
                            {a.expectedReturnDate} {isOverdue && ' (OVERDUE)'}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Indefinite</span>
                        )}
                      </td>
                      {isManager && (
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedReturnAsset(a)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <RotateCcw size={12} /> Check-In Return
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {activeAllocatedAssets.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>
                      No assets are currently checked out.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: Transfer Requests */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowRightLeft size={16} /> Asset Transfer Requests
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {transfers.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
                No active transfer requests pending review.
              </p>
            ) : (
              transfers.map(t => {
                const asset = assets.find(a => a.id === t.assetId);
                const canApprove = canApproveTransfer(t) && t.status === 'Pending';

                return (
                  <div 
                    key={t.id} 
                    style={{ 
                      padding: '1rem', 
                      backgroundColor: 'var(--bg-tertiary)', 
                      borderRadius: 'var(--border-radius-sm)',
                      border: '1px solid var(--card-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}
                  >
                    <div className="flex-between">
                      <span className="asset-tag">{asset?.tag || 'AF-XXXX'}</span>
                      <span className={`badge badge-${t.status.toLowerCase()}`}>
                        {t.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem' }}>
                      <span style={{ display: 'block', fontWeight: 700 }}>{asset?.name}</span>
                      <span style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                        From: <b>{getUserName(t.fromUserId)}</b>
                      </span>
                      <span style={{ color: 'var(--text-secondary)', display: 'block' }}>
                        To Reallocate: <b>{getUserName(t.toUserId)}</b>
                      </span>
                    </div>

                    {canApprove && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignSelf: 'flex-end' }}>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => processTransferAction(t.id, false)}
                          style={{ color: 'hsl(var(--danger))', padding: '0.25rem 0.6rem' }}
                        >
                          <X size={12} /> Deny
                        </button>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => processTransferAction(t.id, true)}
                          style={{ padding: '0.25rem 0.6rem' }}
                        >
                          <Check size={12} /> Approve
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* MODAL: ALLOCATE ASSET */}
      <Modal isOpen={showAllocForm} onClose={() => setShowAllocForm(false)} title="Allocate Asset / Check-Out">
        <form onSubmit={handleAllocateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {errorMsg && (
            <div style={{ backgroundColor: 'var(--danger-glow)', color: 'hsl(var(--danger))', padding: '0.75rem', borderRadius: '4px', fontSize: '0.82rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              {errorMsg}
            </div>
          )}

          {conflictAsset ? (
            <div style={{ border: '1px solid hsl(var(--warning))', backgroundColor: 'var(--warning-glow)', padding: '1rem', borderRadius: 'var(--border-radius-sm)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--warning))', fontWeight: 700 }}>
                <AlertTriangle size={18} />
                <span>Asset Double-Allocation Blocked</span>
              </div>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.4 }}>
                <b>{conflictAsset.tag} ({conflictAsset.name})</b> is currently allocated to <b>{getHolderName(conflictAsset)}</b>.
                You cannot allocate it to another recipient directly.
              </p>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleInitiateTransfer}
                style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'hsl(var(--warning))', color: '#000000', border: 'none' }}
              >
                <GitPullRequest size={16} /> Request Transfer Ownership
              </button>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>Select Asset to Check-Out</label>
                <select 
                  className="form-control" 
                  required
                  value={allocAssetId}
                  onChange={(e) => setAllocAssetId(e.target.value)}
                >
                  <option value="">-- Choose Asset --</option>
                  {assets.filter(a => !a.isShared && !['Retired', 'Disposed'].includes(a.status)).map(a => (
                    <option key={a.id} value={a.id}>
                      {a.tag} - {a.name} ({a.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Recipient Assignment Type</label>
                  <select 
                    className="form-control" 
                    value={allocHolderType}
                    onChange={(e) => { setAllocHolderType(e.target.value as any); setAllocHolderId(''); }}
                  >
                    <option value="employee">Individual Employee</option>
                    <option value="department">Department-wide</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Select Holder</label>
                  {allocHolderType === 'employee' ? (
                    <select 
                      className="form-control" 
                      required
                      value={allocHolderId}
                      onChange={(e) => setAllocHolderId(e.target.value)}
                    >
                      <option value="">-- Choose Employee --</option>
                      {users.filter(u => u.status === 'Active').map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  ) : (
                    <select 
                      className="form-control" 
                      required
                      value={allocHolderId}
                      onChange={(e) => setAllocHolderId(e.target.value)}
                    >
                      <option value="">-- Choose Department --</option>
                      {departments.filter(d => d.status === 'Active').map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Expected Return Date (Optional)</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={allocReturnDate}
                  onChange={(e) => setAllocReturnDate(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAllocForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Allocation
                </button>
              </div>
            </>
          )}
        </form>
      </Modal>

      {/* MODAL: RETURN CHECK-IN */}
      {selectedReturnAsset && (
        <Modal isOpen={true} onClose={() => setSelectedReturnAsset(null)} title={`Asset Check-In: ${selectedReturnAsset.tag}`}>
          <form onSubmit={handleReturnSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Checking in <b>{selectedReturnAsset.name}</b>, currently held by <b>{getHolderName(selectedReturnAsset)}</b>.
            </p>

            <div className="form-group">
              <label>Returned Condition Check</label>
              <select 
                className="form-control" 
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value as any)}
              >
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div className="form-group">
              <label>Condition Check-In Notes</label>
              <textarea 
                className="form-control" 
                rows={3}
                placeholder="Log any physical damage, missing components, or functional issues..."
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedReturnAsset(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Approve Return Check-In
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
