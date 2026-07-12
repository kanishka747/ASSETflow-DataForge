import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Asset, AssetCondition } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { 
  Search, 
  Plus, 
  QrCode, 
  QrCode as Barcode, 
  User, 
  Info,
  Calendar,
  Layers,
  MapPin,
  CircleDollarSign,
  Activity
} from 'lucide-react';

export const AssetRegistry: React.FC = () => {
  const { 
    assets, 
    categories, 
    currentUser, 
    registerAsset, 
    deleteAsset, 
    users,
    departments,
    maintenance,
    transfers
  } = useApp();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterBookable, setFilterBookable] = useState('all');

  // Detail Modal state
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // QR Scan Modal
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [qrScanning, setQRScanning] = useState(false);
  const [qrMessage, setQRMessage] = useState('');

  // Register Asset Form state
  const [showRegForm, setShowRegForm] = useState(false);
  const [regName, setRegName] = useState('');
  const [regCatId, setRegCatId] = useState('');
  const [regSerial, setRegSerial] = useState('');
  const [regAcqDate, setRegAcqDate] = useState('2026-07-12');
  const [regAcqCost, setRegAcqCost] = useState(0);
  const [regCondition, setRegCondition] = useState<AssetCondition>('Good');
  const [regLocation, setRegLocation] = useState('');
  const [regIsShared, setRegIsShared] = useState(false);
  const [regCustomValues, setRegCustomValues] = useState<Record<string, string | number>>({});

  const isManager = currentUser?.role === 'Admin' || currentUser?.role === 'Asset Manager';

  // Find category helper
  const getCategoryName = (catId: string) => {
    return categories.find(c => c.id === catId)?.name || 'Unknown';
  };

  // Filtered Assets
  const filteredAssets = assets.filter(a => {
    const term = search.toLowerCase().trim();
    const matchSearch = 
      a.tag.toLowerCase().includes(term) ||
      a.serialNumber.toLowerCase().includes(term) ||
      a.name.toLowerCase().includes(term) ||
      a.location.toLowerCase().includes(term);

    const matchCategory = filterCategory === '' || a.categoryId === filterCategory;
    const matchStatus = filterStatus === '' || a.status === filterStatus;
    const matchBookable = 
      filterBookable === 'all' || 
      (filterBookable === 'yes' && a.isShared) || 
      (filterBookable === 'no' && !a.isShared);

    return matchSearch && matchCategory && matchStatus && matchBookable;
  });

  // Handle Dynamic Fields loading when category is selected
  const handleCatChange = (catId: string) => {
    setRegCatId(catId);
    const cat = categories.find(c => c.id === catId);
    if (cat) {
      const initialCustoms: Record<string, string | number> = {};
      cat.fields.forEach(f => {
        initialCustoms[f.name] = f.type === 'number' ? 0 : '';
      });
      setRegCustomValues(initialCustoms);
    } else {
      setRegCustomValues({});
    }
  };

  const handleCustomFieldChange = (name: string, val: string) => {
    setRegCustomValues({
      ...regCustomValues,
      [name]: val
    });
  };

  // Register Asset Form Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regCatId || !regSerial) return;

    registerAsset({
      name: regName,
      categoryId: regCatId,
      serialNumber: regSerial,
      acquisitionDate: regAcqDate,
      acquisitionCost: Number(regAcqCost),
      condition: regCondition,
      location: regLocation,
      isShared: regIsShared,
      customFields: regCustomValues
    });

    // Reset Form
    setRegName('');
    setRegCatId('');
    setRegSerial('');
    setRegAcqDate('2026-07-12');
    setRegAcqCost(0);
    setRegCondition('Good');
    setRegLocation('');
    setRegIsShared(false);
    setRegCustomValues({});
    setShowRegForm(false);
  };

  // QR Barcode Camera Simulation
  const triggerQRScan = () => {
    setShowQRScanner(true);
    setQRScanning(true);
    setQRMessage('Initializing camera stream...');

    setTimeout(() => {
      setQRMessage('Scanning barcode...');
    }, 1000);

    setTimeout(() => {
      // Mock scan of asset AF-0001
      setQRScanning(false);
      setQRMessage('Asset Tag detected: AF-0001! Loading details...');
      
      setTimeout(() => {
        const found = assets.find(a => a.tag === 'AF-0001');
        if (found) {
          setSelectedAsset(found);
        }
        setShowQRScanner(false);
      }, 800);

    }, 2500);
  };

  // Retrieve histories for detailed view
  const getAssetAllocationHistory = (asset: Asset) => {
    const res: { date: string; holder: string; action: string }[] = [];
    
    // Add current allocation
    if (asset.status === 'Allocated' && asset.holderId) {
      let holder = 'Unknown';
      if (asset.holderType === 'employee') {
        holder = users.find(u => u.id === asset.holderId)?.name || 'Employee';
      } else {
        holder = departments.find(d => d.id === asset.holderId)?.name || 'Department';
      }
      res.push({
        date: asset.acquisitionDate, // Fallback timestamp
        holder,
        action: `Currently held (Due: ${asset.expectedReturnDate || 'No limit'})`
      });
    }

    // Scan completed transfers
    transfers
      .filter(t => t.assetId === asset.id && t.status === 'Approved')
      .forEach(t => {
        const toUser = users.find(u => u.id === t.toUserId)?.name || 'Employee';
        res.push({
          date: t.approvedAt?.split('T')[0] || t.requestedAt.split('T')[0],
          holder: toUser,
          action: 'Transferred & Checked Out'
        });
      });

    return res;
  };

  const getAssetMaintenanceHistory = (asset: Asset) => {
    return maintenance.filter(m => m.assetId === asset.id);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Asset Registry</h1>
          <p className="page-subtitle">Track hardware, shared devices, workspaces, and company fleets.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={triggerQRScan}>
            <QrCode size={16} /> Scan Tag (QR)
          </button>
          {isManager && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowRegForm(true)}>
              <Plus size={16} /> Register Asset
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, auto)', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search Tag, Name, Location..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
            />
          </div>

          <select 
            className="form-control" 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ fontSize: '0.85rem', width: '150px' }}
          >
            <option value="">-- All Categories --</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select 
            className="form-control" 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ fontSize: '0.85rem', width: '150px' }}
          >
            <option value="">-- All Statuses --</option>
            <option value="Available">Available</option>
            <option value="Allocated">Allocated</option>
            <option value="Reserved">Reserved</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Lost">Lost</option>
            <option value="Retired">Retired</option>
            <option value="Disposed">Disposed</option>
          </select>

          <select 
            className="form-control" 
            value={filterBookable} 
            onChange={(e) => setFilterBookable(e.target.value)}
            style={{ fontSize: '0.85rem', width: '150px' }}
          >
            <option value="all">-- All Formats --</option>
            <option value="yes">Bookable Shared</option>
            <option value="no">Individual Allocation</option>
          </select>
        </div>
      </div>

      {/* Main Assets Table */}
      <div className="glass-panel table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Asset Tag</th>
              <th>Asset Name</th>
              <th>Category</th>
              <th>Condition</th>
              <th>Location</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map(a => (
              <tr key={a.id}>
                <td><span className="asset-tag">{a.tag}</span></td>
                <td style={{ fontWeight: 600 }}>{a.name}</td>
                <td>{getCategoryName(a.categoryId)}</td>
                <td>{a.condition}</td>
                <td>{a.location}</td>
                <td>
                  <span className={`badge badge-${a.status.toLowerCase().replace(' ', '')}`}>
                    {a.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setSelectedAsset(a)}>
                    <Info size={12} /> View Lifecycle Details
                  </button>
                </td>
              </tr>
            ))}
            {filteredAssets.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>
                  No matching assets found in the register.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* REGISTER ASSET MODAL */}
      <Modal isOpen={showRegForm} onClose={() => setShowRegForm(false)} title="Register Enterprise Asset">
        <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Asset Name</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Dell Latitude Laptop" 
              required
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Asset Category</label>
              <select 
                className="form-control" 
                required
                value={regCatId}
                onChange={(e) => handleCatChange(e.target.value)}
              >
                <option value="">-- Choose Category --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Serial Number (S/N)</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Unique manufacturer key" 
                required
                value={regSerial}
                onChange={(e) => setRegSerial(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Acquisition Date</label>
              <input 
                type="date" 
                className="form-control" 
                value={regAcqDate}
                onChange={(e) => setRegAcqDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Acquisition Cost ($)</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="Purchase cost"
                value={regAcqCost || ''}
                onChange={(e) => setRegAcqCost(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Initial Condition</label>
              <select 
                className="form-control" 
                value={regCondition}
                onChange={(e) => setRegCondition(e.target.value as AssetCondition)}
              >
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div className="form-group">
              <label>Location / Placement</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Floor 3 Rack C" 
                value={regLocation}
                onChange={(e) => setRegLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
            <input 
              type="checkbox" 
              id="isShared" 
              checked={regIsShared}
              onChange={(e) => setRegIsShared(e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
            <label htmlFor="isShared" style={{ cursor: 'pointer', margin: 0 }}>Register as shared/bookable resource (e.g. meeting rooms, pool vehicles)</label>
          </div>

          {/* DYNAMIC CATEGORY FIELDS */}
          {regCatId && categories.find(c => c.id === regCatId)?.fields.map(f => (
            <div className="form-group" key={f.name}>
              <label>{f.name}</label>
              <input 
                type={f.type} 
                className="form-control" 
                placeholder={`Enter custom ${f.name}`}
                required={f.required}
                value={regCustomValues[f.name] || ''}
                onChange={(e) => handleCustomFieldChange(f.name, e.target.value)}
              />
            </div>
          ))}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowRegForm(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Tag
            </button>
          </div>
        </form>
      </Modal>

      {/* QR SCAN MOCK MODAL */}
      <Modal isOpen={showQRScanner} onClose={() => setShowQRScanner(false)} title="Camera QR & Barcode Simulator">
        <div style={{ textAlign: 'center' }}>
          <div className="qr-scanner-box">
            <Barcode size={64} style={{ color: 'rgba(255,255,255,0.4)' }} />
          </div>
          <p style={{ marginTop: '1rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {qrMessage}
          </p>
          {qrScanning && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hold tag in front of lens...</span>}
        </div>
      </Modal>

      {/* DETAILED VIEW MODAL */}
      {selectedAsset && (
        <Modal isOpen={true} onClose={() => setSelectedAsset(null)} title={`Asset Profile: ${selectedAsset.tag}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header info */}
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedAsset.name}</h2>
              <span className={`badge badge-${selectedAsset.status.toLowerCase().replace(' ', '')}`} style={{ marginTop: '0.5rem' }}>
                {selectedAsset.status}
              </span>
            </div>

            {/* Grid stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--card-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={16} style={{ color: 'hsl(var(--primary))' }} />
                <div style={{ fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>CATEGORY</span>
                  <span style={{ fontWeight: 700 }}>{getCategoryName(selectedAsset.categoryId)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} style={{ color: 'hsl(var(--primary))' }} />
                <div style={{ fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>LOCATION</span>
                  <span style={{ fontWeight: 700 }}>{selectedAsset.location}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} style={{ color: 'hsl(var(--primary))' }} />
                <div style={{ fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>ACQUIRED</span>
                  <span style={{ fontWeight: 700 }}>{selectedAsset.acquisitionDate}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CircleDollarSign size={16} style={{ color: 'hsl(var(--primary))' }} />
                <div style={{ fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>COST VALUE</span>
                  <span style={{ fontWeight: 700 }}>${selectedAsset.acquisitionCost}</span>
                </div>
              </div>
            </div>

            {/* Custom attributes dynamic rendering */}
            {Object.keys(selectedAsset.customFields).length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Category Specifications
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '4px' }}>
                  {Object.entries(selectedAsset.customFields).map(([key, val]) => (
                    <div key={key} style={{ fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{key}: </span>
                      <span style={{ fontWeight: 600 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Allocation History */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <User size={14} /> Allocation History Log
              </h4>
              {getAssetAllocationHistory(selectedAsset).length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No historical allocations logged.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {getAssetAllocationHistory(selectedAsset).map((h, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.35rem' }}>
                      <span>
                        <b>{h.holder}</b> - <span style={{ color: 'var(--text-secondary)' }}>{h.action}</span>
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>{h.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Maintenance history */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Activity size={14} /> Maintenance Log History
              </h4>
              {getAssetMaintenanceHistory(selectedAsset).length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No recorded hardware repairs.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {getAssetMaintenanceHistory(selectedAsset).map((m, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', fontSize: '0.8rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                        <span style={{ color: m.status === 'Resolved' ? 'hsl(var(--success))' : 'hsl(var(--warning))' }}>[{m.status}] {m.issue}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{m.requestedAt}</span>
                      </div>
                      {m.resolutionNotes && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem', fontStyle: 'italic' }}>
                          Tech: {m.technician}. Notes: {m.resolutionNotes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              {isManager && (
                <button 
                  className="btn btn-danger btn-sm" 
                  onClick={() => { if(confirm('Confirm deletion of asset tag?')) { deleteAsset(selectedAsset.id); setSelectedAsset(null); } }}
                >
                  Deregister Asset
                </button>
              )}
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedAsset(null)}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
