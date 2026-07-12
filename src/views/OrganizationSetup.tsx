import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Department, UserRole } from '../context/AppContext';
import { 
  Building, 
  Settings2, 
  Users2, 
  Plus, 
  ToggleLeft, 
  ToggleRight, 
  ShieldAlert,
  Edit2
} from 'lucide-react';

export const OrganizationSetup: React.FC = () => {
  const { 
    currentUser, 
    departments, 
    categories, 
    users, 
    addDepartment, 
    updateDepartment, 
    addCategory, 
    promoteEmployee,
    deactivateEmployee
  } = useApp();

  const [activeTab, setActiveTab] = useState<'A' | 'B' | 'C'>('A');

  // Modal / Form state for Department
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptHead, setDeptHead] = useState('');
  const [deptParent, setDeptParent] = useState('');
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);

  // Modal / Form state for Category
  const [showCatForm, setShowCatForm] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [customFields, setCustomFields] = useState<{ name: string; type: 'text' | 'number'; required: boolean }[]>([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number'>('text');

  // Verify Admin authorization
  if (currentUser?.role !== 'Admin') {
    return (
      <div className="glass-panel animate-fade-in" style={{ padding: '3rem', textAlign: 'center', margin: '2rem auto', maxWidth: '500px' }}>
        <ShieldAlert size={48} style={{ color: 'hsl(var(--danger))', marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Authorization Denied</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
          This interface is restricted to System Administrators only.
        </p>
      </div>
    );
  }

  // ==========================================
  // DEPARTMENTS HANDLERS
  // ==========================================
  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName) return;

    if (editingDeptId) {
      updateDepartment(editingDeptId, {
        name: deptName,
        headId: deptHead,
        parentDepartmentId: deptParent
      });
    } else {
      addDepartment({
        name: deptName,
        headId: deptHead,
        parentDepartmentId: deptParent,
        status: 'Active'
      });
    }

    // Reset
    setDeptName('');
    setDeptHead('');
    setDeptParent('');
    setEditingDeptId(null);
    setShowDeptForm(false);
  };

  const handleEditDept = (dept: Department) => {
    setEditingDeptId(dept.id);
    setDeptName(dept.name);
    setDeptHead(dept.headId);
    setDeptParent(dept.parentDepartmentId);
    setShowDeptForm(true);
  };

  // ==========================================
  // CATEGORIES HANDLERS
  // ==========================================
  const addFieldToCategory = () => {
    if (!newFieldName.trim()) return;
    setCustomFields([...customFields, { name: newFieldName.trim(), type: newFieldType, required: true }]);
    setNewFieldName('');
  };

  const removeFieldFromCategory = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;

    addCategory({
      name: catName,
      description: catDesc,
      fields: customFields
    });

    setCatName('');
    setCatDesc('');
    setCustomFields([]);
    setShowCatForm(false);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Organization Setup</h1>
          <p className="page-subtitle">Configure system master files, metadata fields, and roles.</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="tab-headers">
        <button 
          className={`tab-btn ${activeTab === 'A' ? 'active' : ''}`}
          onClick={() => setActiveTab('A')}
        >
          <Building size={16} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
          Departments
        </button>
        <button 
          className={`tab-btn ${activeTab === 'B' ? 'active' : ''}`}
          onClick={() => setActiveTab('B')}
        >
          <Settings2 size={16} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
          Asset Categories
        </button>
        <button 
          className={`tab-btn ${activeTab === 'C' ? 'active' : ''}`}
          onClick={() => setActiveTab('C')}
        >
          <Users2 size={16} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
          Employee Directory
        </button>
      </div>

      {/* TAB CONTENT: DEPARTMENTS */}
      {activeTab === 'A' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="flex-between">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Registered Departments</h2>
            <button className="btn btn-primary btn-sm" onClick={() => { setEditingDeptId(null); setShowDeptForm(true); }}>
              <Plus size={16} /> Add Department
            </button>
          </div>

          {showDeptForm && (
            <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid hsl(var(--primary), 0.3)' }}>
              <form onSubmit={handleSaveDept} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                  {editingDeptId ? 'Modify Department Details' : 'Register New Department'}
                </h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Department Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Quality Assurance" 
                      value={deptName}
                      onChange={(e) => setDeptName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Department Head</label>
                    <select 
                      className="form-control" 
                      value={deptHead} 
                      onChange={(e) => setDeptHead(e.target.value)}
                    >
                      <option value="">-- Unassigned --</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Parent Department (Optional)</label>
                    <select 
                      className="form-control" 
                      value={deptParent} 
                      onChange={(e) => setDeptParent(e.target.value)}
                    >
                      <option value="">-- None (Top Level) --</option>
                      {departments.filter(d => d.id !== editingDeptId).map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowDeptForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    {editingDeptId ? 'Save Changes' : 'Create Department'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="glass-panel table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Department Name</th>
                  <th>Head of Department</th>
                  <th>Hierarchical Parent</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map(d => {
                  const headUser = users.find(u => u.id === d.headId);
                  const parentDept = departments.find(p => p.id === d.parentDepartmentId);
                  return (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 600 }}>{d.name}</td>
                      <td>{headUser ? headUser.name : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                      <td>{parentDept ? parentDept.name : <span style={{ color: 'var(--text-muted)' }}>Top Level</span>}</td>
                      <td>
                        <button 
                          onClick={() => updateDepartment(d.id, { status: d.status === 'Active' ? 'Inactive' : 'Active' })}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          {d.status === 'Active' ? (
                            <span style={{ color: 'hsl(var(--success))', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                              <ToggleRight size={24} /> Active
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                              <ToggleLeft size={24} /> Inactive
                            </span>
                          )}
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEditDept(d)} style={{ padding: '0.3rem 0.6rem' }}>
                          <Edit2 size={12} /> Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ASSET CATEGORIES */}
      {activeTab === 'B' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="flex-between">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Asset Classification Categories</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCatForm(true)}>
              <Plus size={16} /> Add Category
            </button>
          </div>

          {showCatForm && (
            <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid hsl(var(--primary), 0.3)' }}>
              <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Configure New Asset Category</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category Title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Lab Equipment" 
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Description / Usage</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Define assets classified under this category" 
                      value={catDesc}
                      onChange={(e) => setCatDesc(e.target.value)}
                    />
                  </div>
                </div>

                {/* Custom Attributes Fields Builder */}
                <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                    Add Category-Specific Dynamic Fields
                  </h4>

                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Field Name (e.g. Screen Size)" 
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      style={{ maxWidth: '250px' }}
                    />
                    <select 
                      className="form-control" 
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value as 'text' | 'number')}
                      style={{ maxWidth: '120px' }}
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                    </select>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={addFieldToCategory}>
                      Add Field
                    </button>
                  </div>

                  {customFields.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)' }}>
                      {customFields.map((f, i) => (
                        <span key={i} className="badge badge-allocated" style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                          {f.name} ({f.type})
                          <button type="button" onClick={() => removeFieldFromCategory(i)} style={{ border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer', fontWeight: 800 }}>×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCatForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Create Category
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="dashboard-grid">
            {categories.map(c => (
              <div key={c.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{c.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineClamp: 2, overflow: 'hidden' }}>{c.description}</p>
                </div>
                {c.fields.length > 0 ? (
                  <div style={{ marginTop: '1rem', borderTop: '1px solid var(--card-border)', paddingTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>SPECIFIC ATTRIBUTES:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                      {c.fields.map((f, i) => (
                        <span key={i} style={{ fontSize: '0.68rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--card-border)', padding: '0.1rem 0.4rem', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                          {f.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>No custom fields configured</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: EMPLOYEE DIRECTORY */}
      {activeTab === 'C' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="flex-between">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Employee Access & Directory</h2>
          </div>

          <div className="glass-panel table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Corporate Email</th>
                  <th>Department Assigned</th>
                  <th>Functional Role</th>
                  <th>System Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  return (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <select 
                          className="form-control"
                          value={u.departmentId} 
                          onChange={(e) => promoteEmployee(u.id, u.role, e.target.value)}
                          style={{ padding: '0.35rem 0.5rem', width: 'auto', fontSize: '0.85rem' }}
                        >
                          <option value="">-- Unassigned --</option>
                          {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        {/* Admin promotes employees here */}
                        <select 
                          className="form-control"
                          value={u.role} 
                          onChange={(e) => promoteEmployee(u.id, e.target.value as UserRole)}
                          style={{ padding: '0.35rem 0.5rem', width: 'auto', fontSize: '0.85rem', fontWeight: 700 }}
                          disabled={u.id === currentUser.id} // Don't let admin demote self
                        >
                          <option value="Employee">Employee</option>
                          <option value="Department Head">Department Head</option>
                          <option value="Asset Manager">Asset Manager</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <button 
                          onClick={() => deactivateEmployee(u.id, u.status !== 'Active')}
                          style={{ background: 'none', border: 'none', cursor: u.id === currentUser.id ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}
                          disabled={u.id === currentUser.id} // Don't let admin lock self
                        >
                          {u.status === 'Active' ? (
                            <span style={{ color: 'hsl(var(--success))', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                              <ToggleRight size={24} /> Active
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                              <ToggleLeft size={24} /> Inactive
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
