import React, { createContext, useContext, useState, useEffect } from 'react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export type UserRole = 'Admin' | 'Asset Manager' | 'Department Head' | 'Employee';
export type AssetCondition = 'New' | 'Good' | 'Fair' | 'Poor';
export type AssetStatus = 'Available' | 'Allocated' | 'Reserved' | 'Under Maintenance' | 'Lost' | 'Retired' | 'Disposed';
export type BookingStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
export type TransferStatus = 'Pending' | 'Approved' | 'Rejected';
export type MaintenanceStatus = 'Pending' | 'Approved' | 'Rejected' | 'Technician Assigned' | 'In Progress' | 'Resolved';
export type AuditStatus = 'Active' | 'Closed';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  departmentId: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  headId: string; // User ID
  parentDepartmentId: string; // Self-referential hierarchy
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface AssetCategory {
  id: string;
  name: string;
  description: string;
  fields: { name: string; type: 'text' | 'number'; required: boolean }[];
  createdAt: string;
}

export interface Asset {
  id: string;
  tag: string; // AF-0001
  name: string;
  categoryId: string;
  serialNumber: string;
  acquisitionDate: string;
  acquisitionCost: number;
  condition: AssetCondition;
  location: string;
  isShared: boolean; // Bookable resource flag
  status: AssetStatus;
  holderType: 'employee' | 'department' | null;
  holderId: string | null; // Employee ID or Department ID
  expectedReturnDate: string | null;
  customFields: Record<string, string | number>;
  createdAt: string;
}

export interface Booking {
  id: string;
  assetId: string;
  userId: string;
  departmentId?: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endDate: string; // YYYY-MM-DD
  endTime: string; // HH:MM
  status: BookingStatus;
  purpose: string;
  createdAt: string;
}

export interface TransferRequest {
  id: string;
  assetId: string;
  fromUserId: string;
  toUserId: string;
  departmentId?: string; // If allocating to a dept instead
  status: TransferStatus;
  requestedAt: string;
  approvedAt?: string;
}

export interface MaintenanceRequest {
  id: string;
  assetId: string;
  requestedBy: string; // User ID
  issue: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  technician?: string;
  status: MaintenanceStatus;
  requestedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface AuditCycle {
  id: string;
  name: string;
  departmentId?: string; // Scope department
  location?: string; // Scope location
  startDate: string;
  endDate: string;
  status: AuditStatus;
  auditors: string[]; // List of User IDs
  results: Record<string, 'Verified' | 'Missing' | 'Damaged'>; // assetId -> result
  closedAt?: string;
  discrepancyReport?: {
    assetId: string;
    tag: string;
    name: string;
    expectedStatus: string;
    auditResult: 'Missing' | 'Damaged';
    reconciliationAction: string;
  }[];
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  isRead: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  departments: Department[];
  categories: AssetCategory[];
  assets: Asset[];
  bookings: Booking[];
  transfers: TransferRequest[];
  maintenance: MaintenanceRequest[];
  audits: AuditCycle[];
  notifications: Notification[];
  activityLogs: ActivityLog[];
  theme: 'dark' | 'light';
  
  // Auth Functions
  login: (email: string, password?: string) => { success: boolean; message: string };
  signup: (name: string, email: string, password?: string) => { success: boolean; message: string };
  logout: () => void;
  impersonateUser: (userId: string) => void;
  toggleTheme: () => void;
  
  // Org Admin Functions
  addDepartment: (dept: Omit<Department, 'id' | 'createdAt'>) => void;
  updateDepartment: (id: string, dept: Partial<Department>) => void;
  addCategory: (cat: Omit<AssetCategory, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, cat: Partial<AssetCategory>) => void;
  promoteEmployee: (userId: string, role: UserRole, departmentId?: string) => void;
  deactivateEmployee: (userId: string, active: boolean) => void;

  // Asset Functions
  registerAsset: (asset: Omit<Asset, 'id' | 'tag' | 'status' | 'holderType' | 'holderId' | 'expectedReturnDate' | 'createdAt'>) => { success: boolean; tag: string };
  updateAsset: (id: string, asset: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  
  // Allocation & Return Functions
  allocateAsset: (assetId: string, holderType: 'employee' | 'department', holderId: string, expectedReturnDate?: string) => { success: boolean; message: string };
  requestTransfer: (assetId: string, toUserId: string) => { success: boolean; message: string };
  processTransferAction: (requestId: string, approve: boolean) => { success: boolean; message: string };
  returnAsset: (assetId: string, conditionNotes: string, newCondition: AssetCondition) => { success: boolean; message: string };

  // Resource Bookings
  bookResource: (booking: Omit<Booking, 'id' | 'status' | 'createdAt'>) => { success: boolean; message: string };
  cancelBooking: (bookingId: string) => void;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;

  // Maintenance Requests
  raiseMaintenance: (assetId: string, issue: string, priority: 'Low' | 'Medium' | 'High' | 'Critical') => void;
  approveMaintenance: (requestId: string, approve: boolean) => void;
  assignTechnician: (requestId: string, technician: string) => void;
  resolveMaintenance: (requestId: string, notes: string, condition: AssetCondition) => void;

  // Audits
  createAuditCycle: (audit: Omit<AuditCycle, 'id' | 'status' | 'results'>) => void;
  verifyAssetInAudit: (cycleId: string, assetId: string, result: 'Verified' | 'Missing' | 'Damaged') => void;
  closeAuditCycle: (cycleId: string) => void;

  // Notifications
  markAllNotificationsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ==========================================
// SEED DATA
// ==========================================

const DEFAULT_USERS: User[] = [
  { id: 'u-1', name: 'System Admin', email: 'admin@assetflow.com', password: 'admin123', role: 'Admin', departmentId: 'd-2', status: 'Active', createdAt: '2026-01-01' },
  { id: 'u-2', name: 'Sarah AssetMgr', email: 'manager@assetflow.com', password: 'manager123', role: 'Asset Manager', departmentId: 'd-2', status: 'Active', createdAt: '2026-01-01' },
  { id: 'u-3', name: 'John EngineeringHead', email: 'head@assetflow.com', password: 'head123', role: 'Department Head', departmentId: 'd-1', status: 'Active', createdAt: '2026-01-01' },
  { id: 'u-4', name: 'Priya Sharma', email: 'priya@assetflow.com', password: 'priya123', role: 'Employee', departmentId: 'd-1', status: 'Active', createdAt: '2026-01-02' },
  { id: 'u-5', name: 'Raj Patel', email: 'raj@assetflow.com', password: 'raj123', role: 'Employee', departmentId: 'd-1', status: 'Active', createdAt: '2026-01-02' },
  { id: 'u-6', name: 'Alex Technician', email: 'alex@assetflow.com', password: 'alex123', role: 'Employee', departmentId: 'd-2', status: 'Active', createdAt: '2026-01-05' },
];

const DEFAULT_DEPARTMENTS: Department[] = [
  { id: 'd-1', name: 'Engineering', headId: 'u-3', parentDepartmentId: '', status: 'Active', createdAt: '2026-01-01' },
  { id: 'd-2', name: 'Operations & IT', headId: 'u-2', parentDepartmentId: '', status: 'Active', createdAt: '2026-01-01' },
  { id: 'd-3', name: 'Human Resources', headId: '', parentDepartmentId: '', status: 'Active', createdAt: '2026-01-02' },
];

const DEFAULT_CATEGORIES: AssetCategory[] = [
  {
    id: 'c-1',
    name: 'Electronics',
    description: 'Computers, screens, keyboards, cellphones',
    fields: [
      { name: 'Warranty Period (Months)', type: 'number', required: true },
      { name: 'RAM (GB)', type: 'number', required: false },
    ],
    createdAt: '2026-01-01'
  },
  {
    id: 'c-2',
    name: 'Furniture',
    description: 'Desks, chairs, whiteboards, filing cabinets',
    fields: [],
    createdAt: '2026-01-01'
  },
  {
    id: 'c-3',
    name: 'Vehicles',
    description: 'Company-owned transportation resources',
    fields: [
      { name: 'License Plate', type: 'text', required: true },
      { name: 'Mileage (km)', type: 'number', required: true }
    ],
    createdAt: '2026-01-02'
  }
];

const DEFAULT_ASSETS: Asset[] = [
  {
    id: 'a-1',
    tag: 'AF-0001',
    name: 'MacBook Pro 16"',
    categoryId: 'c-1',
    serialNumber: 'C02FX5G8MD6R',
    acquisitionDate: '2026-01-10',
    acquisitionCost: 2499,
    condition: 'New',
    location: 'HQ Floor 3',
    isShared: false,
    status: 'Allocated',
    holderType: 'employee',
    holderId: 'u-4', // Priya
    expectedReturnDate: '2026-12-31',
    customFields: { 'Warranty Period (Months)': 24, 'RAM (GB)': 32 },
    createdAt: '2026-01-10'
  },
  {
    id: 'a-2',
    tag: 'AF-0002',
    name: 'Standing Desk Dual-Motor',
    categoryId: 'c-2',
    serialNumber: 'SD-8827361',
    acquisitionDate: '2026-02-15',
    acquisitionCost: 650,
    condition: 'Good',
    location: 'HQ Floor 3',
    isShared: false,
    status: 'Available',
    holderType: null,
    holderId: null,
    expectedReturnDate: null,
    customFields: {},
    createdAt: '2026-02-15'
  },
  {
    id: 'a-3',
    tag: 'AF-0003',
    name: 'Conference Room B2 (Projector & VC)',
    categoryId: 'c-1',
    serialNumber: 'CONF-B2',
    acquisitionDate: '2026-01-05',
    acquisitionCost: 1500,
    condition: 'Good',
    location: 'Operations Wing',
    isShared: true, // Shared resource
    status: 'Available',
    holderType: null,
    holderId: null,
    expectedReturnDate: null,
    customFields: { 'Warranty Period (Months)': 12 },
    createdAt: '2026-01-05'
  },
  {
    id: 'a-4',
    tag: 'AF-0004',
    name: 'Ford Transit Cargo Van',
    categoryId: 'c-3',
    serialNumber: '1FTYF38479X',
    acquisitionDate: '2026-03-20',
    acquisitionCost: 42000,
    condition: 'Good',
    location: 'Parking Deck A',
    isShared: true,
    status: 'Available',
    holderType: null,
    holderId: null,
    expectedReturnDate: null,
    customFields: { 'License Plate': 'CA-993-AF', 'Mileage (km)': 12800 },
    createdAt: '2026-03-20'
  },
  {
    id: 'a-5',
    tag: 'AF-0005',
    name: 'iPad Pro 12.9"',
    categoryId: 'c-1',
    serialNumber: 'DMP89201A',
    acquisitionDate: '2026-01-12',
    acquisitionCost: 1099,
    condition: 'Fair',
    location: 'HR Desk 2',
    isShared: false,
    status: 'Allocated',
    holderType: 'employee',
    holderId: 'u-5', // Raj
    expectedReturnDate: '2026-07-01', // OVERDUE based on current time 2026-07-12
    customFields: { 'Warranty Period (Months)': 12, 'RAM (GB)': 8 },
    createdAt: '2026-01-12'
  }
];

const DEFAULT_BOOKINGS: Booking[] = [
  {
    id: 'b-1',
    assetId: 'a-3', // Conf Room B2
    userId: 'u-4', // Priya
    startDate: '2026-07-12', // Today in additional metadata
    startTime: '09:00',
    endDate: '2026-07-12',
    endTime: '10:00',
    status: 'Upcoming',
    purpose: 'Daily Engineering Standup',
    createdAt: '2026-07-11'
  },
  {
    id: 'b-2',
    assetId: 'a-3',
    userId: 'u-3', // John (Dept Head)
    departmentId: 'd-1',
    startDate: '2026-07-12',
    startTime: '14:00',
    endDate: '2026-07-12',
    endTime: '15:30',
    status: 'Upcoming',
    purpose: 'Architecture Review Session',
    createdAt: '2026-07-11'
  }
];

const DEFAULT_MAINTENANCE: MaintenanceRequest[] = [
  {
    id: 'm-1',
    assetId: 'a-1',
    requestedBy: 'u-4', // Priya
    issue: 'Screen occasionally flickers and turns green',
    priority: 'High',
    status: 'Resolved',
    requestedAt: '2026-02-01',
    resolvedAt: '2026-02-03',
    resolutionNotes: 'Technician replaced display ribbon cable. Re-calibrated colors.',
    technician: 'Alex Technician'
  },
  {
    id: 'm-2',
    assetId: 'a-2',
    requestedBy: 'u-2', // Sarah AssetMgr
    issue: 'Desk stuck in low position. Motor error E08.',
    priority: 'Medium',
    status: 'Pending',
    requestedAt: '2026-07-10'
  }
];

const DEFAULT_AUDITS: AuditCycle[] = [
  {
    id: 'au-1',
    name: 'Mid-Year Engineering Check',
    departmentId: 'd-1',
    startDate: '2026-07-01',
    endDate: '2026-07-20',
    status: 'Active',
    auditors: ['u-2'], // Sarah AssetMgr
    results: {
      'a-1': 'Verified',
    }
  }
];

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: 'n-1',
    userId: 'u-4',
    message: 'Your request for MacBook Pro AF-0001 was approved.',
    type: 'success',
    isRead: false,
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'u-5', // Assigned to Raj
    userId: 'u-5',
    message: 'ALERT: Your expected return date for iPad Pro AF-0005 has passed. Please contact the Asset Manager.',
    type: 'warning',
    isRead: false,
    createdAt: '2026-07-02T09:00:00Z'
  }
];

const DEFAULT_LOGS: ActivityLog[] = [
  { id: 'l-1', userId: 'u-2', userName: 'Sarah AssetMgr', action: 'Registered asset AF-0001 MacBook Pro 16"', timestamp: '2026-01-10T09:30:00Z' },
  { id: 'l-2', userId: 'u-2', userName: 'Sarah AssetMgr', action: 'Allocated asset AF-0001 to Priya Sharma', timestamp: '2026-01-10T10:00:00Z' },
  { id: 'l-3', userId: 'u-4', userName: 'Priya Sharma', action: 'Booked resource Conference Room B2 for 2026-07-12 09:00-10:00', timestamp: '2026-07-11T16:00:00Z' }
];

// ==========================================
// PROVIDER IMPLEMENTATION
// ==========================================

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [audits, setAudits] = useState<AuditCycle[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Load from LocalStorage or initialize with seed data
  useEffect(() => {
    const localUsers = localStorage.getItem('af_users');
    const localDepts = localStorage.getItem('af_depts');
    const localCats = localStorage.getItem('af_cats');
    const localAssets = localStorage.getItem('af_assets');
    const localBookings = localStorage.getItem('af_bookings');
    const localTransfers = localStorage.getItem('af_transfers');
    const localMaint = localStorage.getItem('af_maintenance');
    const localAudits = localStorage.getItem('af_audits');
    const localNotifications = localStorage.getItem('af_notifications');
    const localLogs = localStorage.getItem('af_logs');
    const localUser = localStorage.getItem('af_current_user');
    const localTheme = localStorage.getItem('af_theme') as 'dark' | 'light';

    let loadedUsers = localUsers ? JSON.parse(localUsers) : DEFAULT_USERS;
    loadedUsers = loadedUsers.map((u: User) => {
      const defaultUser = DEFAULT_USERS.find(du => du.id === u.id);
      if (defaultUser && !u.password) {
        return { ...u, password: defaultUser.password };
      }
      return u;
    });
    setUsers(loadedUsers);
    localStorage.setItem('af_users', JSON.stringify(loadedUsers));
    setDepartments(localDepts ? JSON.parse(localDepts) : DEFAULT_DEPARTMENTS);
    setCategories(localCats ? JSON.parse(localCats) : DEFAULT_CATEGORIES);
    setAssets(localAssets ? JSON.parse(localAssets) : DEFAULT_ASSETS);
    setBookings(localBookings ? JSON.parse(localBookings) : DEFAULT_BOOKINGS);
    setTransfers(localTransfers ? JSON.parse(localTransfers) : []);
    setMaintenance(localMaint ? JSON.parse(localMaint) : DEFAULT_MAINTENANCE);
    setAudits(localAudits ? JSON.parse(localAudits) : DEFAULT_AUDITS);
    setNotifications(localNotifications ? JSON.parse(localNotifications) : DEFAULT_NOTIFICATIONS);
    setActivityLogs(localLogs ? JSON.parse(localLogs) : DEFAULT_LOGS);
    setTheme(localTheme || 'dark');

    if (localUser) {
      setCurrentUser(JSON.parse(localUser));
    } else {
      setCurrentUser(null);
    }
  }, []);

  // Synchronizers
  const sync = (key: string, data: any, stateSetter: Function) => {
    stateSetter(data);
    localStorage.setItem(key, JSON.stringify(data));
  };

  const syncUsers = (data: User[]) => sync('af_users', data, setUsers);
  const syncDepts = (data: Department[]) => sync('af_depts', data, setDepartments);
  const syncCats = (data: AssetCategory[]) => sync('af_cats', data, setCategories);
  const syncAssets = (data: Asset[]) => sync('af_assets', data, setAssets);
  const syncBookings = (data: Booking[]) => sync('af_bookings', data, setBookings);
  const syncTransfers = (data: TransferRequest[]) => sync('af_transfers', data, setTransfers);
  const syncMaint = (data: MaintenanceRequest[]) => sync('af_maintenance', data, setMaintenance);
  const syncAudits = (data: AuditCycle[]) => sync('af_audits', data, setAudits);
  const syncNotifications = (data: Notification[]) => sync('af_notifications', data, setNotifications);
  const syncLogs = (data: ActivityLog[]) => sync('af_logs', data, setActivityLogs);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('af_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Logging and Alert Helper
  const logAction = (userId: string, userName: string, action: string) => {
    const newLog: ActivityLog = {
      id: `l-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId,
      userName,
      action,
      timestamp: new Date().toISOString()
    };
    syncLogs([newLog, ...activityLogs]);
  };

  const addNotification = (userId: string, message: string, type: 'info' | 'warning' | 'success') => {
    const newNotif: Notification = {
      id: `n-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    syncNotifications([newNotif, ...notifications]);
  };

  // ==========================================
  // AUTHENTICATION OPERATIONS
  // ==========================================

  const login = (email: string, password?: string) => {
    const trimmed = email.toLowerCase().trim();
    const user = users.find(u => u.email.toLowerCase() === trimmed);
    if (!user) {
      return { success: false, message: 'Employee email not found in directory. Try signing up.' };
    }
    if (password && user.password && user.password !== password) {
      return { success: false, message: 'Invalid password. Access denied.' };
    }
    if (user.status === 'Inactive') {
      return { success: false, message: 'Your account is deactivated. Contact an Administrator.' };
    }
    setCurrentUser(user);
    localStorage.setItem('af_current_user', JSON.stringify(user));
    logAction(user.id, user.name, 'Logged in');
    return { success: true, message: `Welcome back, ${user.name}!` };
  };

  const signup = (name: string, email: string, password?: string) => {
    const trimmed = email.toLowerCase().trim();
    if (users.some(u => u.email.toLowerCase() === trimmed)) {
      return { success: false, message: 'An employee with this email already exists.' };
    }
    const newUser: User = {
      id: `u-${Date.now()}`,
      name: name.trim(),
      email: trimmed,
      password: password || 'default123',
      role: 'Employee', // ALWAYS defaults to Employee
      departmentId: '', // Unassigned initially
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    const updatedUsers = [...users, newUser];
    syncUsers(updatedUsers);
    setCurrentUser(newUser);
    localStorage.setItem('af_current_user', JSON.stringify(newUser));
    logAction(newUser.id, newUser.name, 'Signed up and registered in the employee directory');
    
    // Notify admins about new user
    users.filter(u => u.role === 'Admin').forEach(admin => {
      addNotification(admin.id, `New employee registered: ${newUser.name}. Please assign department and roles.`, 'info');
    });

    return { success: true, message: 'Registration successful! Role: Employee' };
  };

  const logout = () => {
    if (currentUser) {
      logAction(currentUser.id, currentUser.name, 'Logged out');
    }
    setCurrentUser(null);
    localStorage.removeItem('af_current_user');
  };

  const impersonateUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('af_current_user', JSON.stringify(user));
      logAction(user.id, user.name, `Impersonated as ${user.name} (${user.role})`);
    }
  };

  // ==========================================
  // ORGANIZATION ADMIN OPERATIONS
  // ==========================================

  const addDepartment = (dept: Omit<Department, 'id' | 'createdAt'>) => {
    const newDept: Department = {
      ...dept,
      id: `d-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    syncDepts([...departments, newDept]);
    if (currentUser) {
      logAction(currentUser.id, currentUser.name, `Created department: ${dept.name}`);
    }
  };

  const updateDepartment = (id: string, dept: Partial<Department>) => {
    const updated = departments.map(d => d.id === id ? { ...d, ...dept } : d);
    syncDepts(updated);
    if (currentUser) {
      logAction(currentUser.id, currentUser.name, `Updated department ID ${id}`);
    }
    // If head changed, promote user to Department Head role automatically
    if (dept.headId) {
      promoteEmployee(dept.headId, 'Department Head', id);
    }
  };

  const addCategory = (cat: Omit<AssetCategory, 'id' | 'createdAt'>) => {
    const newCat: AssetCategory = {
      ...cat,
      id: `c-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    syncCats([...categories, newCat]);
    if (currentUser) {
      logAction(currentUser.id, currentUser.name, `Created category: ${cat.name}`);
    }
  };

  const updateCategory = (id: string, cat: Partial<AssetCategory>) => {
    const updated = categories.map(c => c.id === id ? { ...c, ...cat } : c);
    syncCats(updated);
    if (currentUser) {
      logAction(currentUser.id, currentUser.name, `Updated category ID ${id}`);
    }
  };

  const promoteEmployee = (userId: string, role: UserRole, departmentId?: string) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        const uDept = departmentId !== undefined ? departmentId : u.departmentId;
        return { ...u, role, departmentId: uDept };
      }
      return u;
    });
    syncUsers(updated);
    
    const targetUser = users.find(u => u.id === userId);
    if (currentUser && targetUser) {
      logAction(currentUser.id, currentUser.name, `Promoted ${targetUser.name} to ${role}`);
      addNotification(userId, `Your role was updated to: ${role} by Admin.`, 'success');
    }
  };

  const deactivateEmployee = (userId: string, active: boolean) => {
    const updated = users.map(u => u.id === userId ? { ...u, status: (active ? 'Active' : 'Inactive') as 'Active' | 'Inactive' } : u);
    syncUsers(updated);
    
    const targetUser = users.find(u => u.id === userId);
    if (currentUser && targetUser) {
      logAction(currentUser.id, currentUser.name, `${active ? 'Activated' : 'Deactivated'} employee ${targetUser.name}`);
      if (!active) {
        addNotification(userId, `Your account has been deactivated by the system administrator.`, 'warning');
      }
    }
  };

  // ==========================================
  // ASSET REGISTRATION
  // ==========================================

  const registerAsset = (asset: Omit<Asset, 'id' | 'tag' | 'status' | 'holderType' | 'holderId' | 'expectedReturnDate' | 'createdAt'>) => {
    // Generate unique tags like AF-0006
    const num = assets.length + 1;
    const tag = `AF-${num.toString().padStart(4, '0')}`;
    const newAsset: Asset = {
      ...asset,
      id: `a-${Date.now()}`,
      tag,
      status: 'Available',
      holderType: null,
      holderId: null,
      expectedReturnDate: null,
      createdAt: new Date().toISOString().split('T')[0]
    };
    syncAssets([...assets, newAsset]);
    if (currentUser) {
      logAction(currentUser.id, currentUser.name, `Registered new asset ${tag}: ${asset.name}`);
    }
    return { success: true, tag };
  };

  const updateAsset = (id: string, asset: Partial<Asset>) => {
    const updated = assets.map(a => a.id === id ? { ...a, ...asset } : a);
    syncAssets(updated);
    if (currentUser) {
      logAction(currentUser.id, currentUser.name, `Updated asset ID ${id}`);
    }
  };

  const deleteAsset = (id: string) => {
    const item = assets.find(a => a.id === id);
    if (item) {
      syncAssets(assets.filter(a => a.id !== id));
      if (currentUser) {
        logAction(currentUser.id, currentUser.name, `Deleted asset ${item.tag}`);
      }
    }
  };

  // ==========================================
  // ALLOCATION & RETURNS & TRANSFERS WORKFLOWS
  // ==========================================

  const allocateAsset = (assetId: string, holderType: 'employee' | 'department', holderId: string, expectedReturnDate?: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) {
      return { success: false, message: 'Asset not found.' };
    }

    // Guard: Block if already allocated
    if (asset.status !== 'Available') {
      let currentHolderName = 'Unknown';
      if (asset.holderType === 'employee') {
        const user = users.find(u => u.id === asset.holderId);
        currentHolderName = user ? user.name : 'an employee';
      } else if (asset.holderType === 'department') {
        const dept = departments.find(d => d.id === asset.holderId);
        currentHolderName = dept ? `${dept.name} Department` : 'a department';
      }
      return {
        success: false,
        message: `${asset.tag} is not available. Currently held by ${currentHolderName}.`
      };
    }

    // Guard: Block if under maintenance or lost/retired
    if (['Under Maintenance', 'Lost', 'Retired', 'Disposed'].includes(asset.status)) {
      return { success: false, message: `${asset.tag} cannot be allocated as it is currently ${asset.status}.` };
    }

    const updated = assets.map(a => {
      if (a.id === assetId) {
        return {
          ...a,
          status: 'Allocated' as AssetStatus,
          holderType,
          holderId,
          expectedReturnDate: expectedReturnDate || null
        };
      }
      return a;
    });
    syncAssets(updated);

    let holderName = '';
    if (holderType === 'employee') {
      const u = users.find(x => x.id === holderId);
      holderName = u ? u.name : 'Employee';
      addNotification(holderId, `Asset ${asset.tag} (${asset.name}) has been allocated to you. Expected return: ${expectedReturnDate || 'N/A'}.`, 'success');
    } else {
      const d = departments.find(x => x.id === holderId);
      holderName = d ? `${d.name} Department` : 'Department';
      if (d?.headId) {
        addNotification(d.headId, `Asset ${asset.tag} has been allocated to your department: ${d.name}.`, 'info');
      }
    }

    if (currentUser) {
      logAction(currentUser.id, currentUser.name, `Allocated ${asset.tag} to ${holderName}`);
    }

    return { success: true, message: `Successfully allocated ${asset.tag} to ${holderName}.` };
  };

  const requestTransfer = (assetId: string, toUserId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) {
      return { success: false, message: 'Asset not found.' };
    }
    
    // Can only transfer allocated assets
    if (asset.status !== 'Allocated' || !asset.holderId) {
      return { success: false, message: 'Asset is not currently allocated to anyone, can be allocated directly.' };
    }

    const fromUserId = asset.holderId;
    if (fromUserId === toUserId) {
      return { success: false, message: 'Cannot transfer to the same person currently holding it.' };
    }

    const newRequest: TransferRequest = {
      id: `tr-${Date.now()}`,
      assetId,
      fromUserId,
      toUserId,
      status: 'Pending',
      requestedAt: new Date().toISOString()
    };

    syncTransfers([newRequest, ...transfers]);

    const requester = users.find(u => u.id === toUserId);
    const holder = users.find(u => u.id === fromUserId);

    if (requester && holder) {
      // Notify managers and the current holder
      users.filter(u => u.role === 'Asset Manager').forEach(mgr => {
        addNotification(mgr.id, `Transfer Request: ${requester.name} requested transfer of ${asset.tag} from ${holder.name}.`, 'info');
      });
      // Notify current holder's department head if any
      const holderDept = departments.find(d => d.id === holder.departmentId);
      if (holderDept?.headId && holderDept.headId !== mgrsOnlyCheck(holderDept.headId)) {
        addNotification(holderDept.headId, `Transfer Request: ${requester.name} requested transfer of department asset ${asset.tag} held by ${holder.name}.`, 'info');
      }

      logAction(toUserId, requester.name, `Requested asset transfer for ${asset.tag} from ${holder.name}`);
    }

    return { success: true, message: 'Transfer request submitted successfully. Awaiting approval.' };
  };

  // Helper
  const mgrsOnlyCheck = (id: string) => {
    return users.find(u => u.id === id)?.role === 'Asset Manager' ? id : '';
  };

  const processTransferAction = (requestId: string, approve: boolean) => {
    const req = transfers.find(t => t.id === requestId);
    if (!req) return { success: false, message: 'Transfer request not found.' };
    
    if (req.status !== 'Pending') {
      return { success: false, message: 'This transfer request has already been processed.' };
    }

    const updatedRequests = transfers.map(t => {
      if (t.id === requestId) {
        return {
          ...t,
          status: (approve ? 'Approved' : 'Rejected') as TransferStatus,
          approvedAt: approve ? new Date().toISOString() : undefined
        };
      }
      return t;
    });
    syncTransfers(updatedRequests);

    const asset = assets.find(a => a.id === req.assetId);
    const toUser = users.find(u => u.id === req.toUserId);

    if (!asset || !toUser) {
      return { success: false, message: 'Asset or target employee not found.' };
    }

    if (approve) {
      // Re-allocate asset
      const updatedAssets = assets.map(a => {
        if (a.id === req.assetId) {
          return {
            ...a,
            status: 'Allocated' as AssetStatus,
            holderType: 'employee' as const,
            holderId: req.toUserId,
            expectedReturnDate: null // Reset expect return date on transfer
          };
        }
        return a;
      });
      syncAssets(updatedAssets);

      addNotification(req.toUserId, `Your transfer request for ${asset.tag} (${asset.name}) was approved.`, 'success');
      addNotification(req.fromUserId, `Asset ${asset.tag} has been transferred from you to ${toUser.name}.`, 'info');
      
      if (currentUser) {
        logAction(currentUser.id, currentUser.name, `Approved transfer of ${asset.tag} to ${toUser.name}`);
      }
      return { success: true, message: `Approved. Asset ${asset.tag} successfully transferred to ${toUser.name}.` };
    } else {
      addNotification(req.toUserId, `Your transfer request for ${asset.tag} was rejected.`, 'warning');
      if (currentUser) {
        logAction(currentUser.id, currentUser.name, `Rejected transfer of ${asset.tag} to ${toUser.name}`);
      }
      return { success: true, message: 'Transfer request rejected.' };
    }
  };

  const returnAsset = (assetId: string, conditionNotes: string, newCondition: AssetCondition) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return { success: false, message: 'Asset not found.' };

    const oldHolderId = asset.holderId;
    const oldHolderType = asset.holderType;

    const updated = assets.map(a => {
      if (a.id === assetId) {
        return {
          ...a,
          status: 'Available' as AssetStatus,
          holderType: null,
          holderId: null,
          expectedReturnDate: null,
          condition: newCondition
        };
      }
      return a;
    });
    syncAssets(updated);

    if (currentUser) {
      logAction(currentUser.id, currentUser.name, `Returned asset ${asset.tag}. Check-in condition: ${newCondition}. Notes: ${conditionNotes}`);
    }

    // Notify old holder if they are different from return processor
    if (oldHolderType === 'employee' && oldHolderId && oldHolderId !== currentUser?.id) {
      addNotification(oldHolderId, `Asset ${asset.tag} you held was checked back in. Condition: ${newCondition}`, 'info');
    }

    return { success: true, message: `Asset ${asset.tag} returned and checked in successfully.` };
  };

  // ==========================================
  // SHARED RESOURCE BOOKINGS
  // ==========================================

  const bookResource = (booking: Omit<Booking, 'id' | 'status' | 'createdAt'>) => {
    const asset = assets.find(a => a.id === booking.assetId);
    if (!asset) return { success: false, message: 'Resource not found.' };
    if (!asset.isShared) return { success: false, message: 'Asset is not registered as a bookable shared resource.' };

    // Formulate ISO comparable start/end times
    const newStart = new Date(`${booking.startDate}T${booking.startTime}:00`);
    const newEnd = new Date(`${booking.endDate}T${booking.endTime}:00`);

    if (newStart >= newEnd) {
      return { success: false, message: 'End time must be after the start time.' };
    }

    // Overlap validation logic:
    // startA < endB && endA > startB
    const hasOverlap = bookings.some(b => {
      if (b.assetId !== booking.assetId || b.status === 'Cancelled') return false;
      const bStart = new Date(`${b.startDate}T${b.startTime}:00`);
      const bEnd = new Date(`${b.endDate}T${b.endTime}:00`);
      return newStart < bEnd && newEnd > bStart;
    });

    if (hasOverlap) {
      return {
        success: false,
        message: `Booking Conflict: ${asset.name} is already booked during this time slot. Please choose another window.`
      };
    }

    const newBooking: Booking = {
      ...booking,
      id: `b-${Date.now()}`,
      status: 'Upcoming',
      createdAt: new Date().toISOString()
    };

    syncBookings([newBooking, ...bookings]);

    const booker = users.find(u => u.id === booking.userId);
    if (booker) {
      logAction(booking.userId, booker.name, `Booked resource ${asset.tag} for ${booking.startDate} from ${booking.startTime} to ${booking.endTime}`);
      addNotification(booking.userId, `Booking Confirmed: ${asset.name} on ${booking.startDate} at ${booking.startTime}.`, 'success');
    }

    return { success: true, message: 'Booking confirmed successfully.' };
  };

  const cancelBooking = (bookingId: string) => {
    const updated = bookings.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' as BookingStatus } : b);
    syncBookings(updated);

    const b = bookings.find(x => x.id === bookingId);
    if (b && currentUser) {
      const asset = assets.find(a => a.id === b.assetId);
      logAction(currentUser.id, currentUser.name, `Cancelled booking for ${asset?.name || 'Resource'}`);
      addNotification(b.userId, `Booking Cancelled: ${asset?.name || 'Resource'} on ${b.startDate}.`, 'info');
    }
  };

  const updateBookingStatus = (bookingId: string, status: BookingStatus) => {
    const updated = bookings.map(b => b.id === bookingId ? { ...b, status } : b);
    syncBookings(updated);
  };

  // ==========================================
  // MAINTENANCE MANAGEMENT
  // ==========================================

  const raiseMaintenance = (assetId: string, issue: string, priority: 'Low' | 'Medium' | 'High' | 'Critical') => {
    const req: MaintenanceRequest = {
      id: `m-${Date.now()}`,
      assetId,
      requestedBy: currentUser?.id || 'Unknown',
      issue,
      priority,
      status: 'Pending',
      requestedAt: new Date().toISOString().split('T')[0]
    };

    syncMaint([req, ...maintenance]);

    const asset = assets.find(a => a.id === assetId);
    if (currentUser && asset) {
      logAction(currentUser.id, currentUser.name, `Raised maintenance request for ${asset.tag}: ${issue}`);
      
      // Notify Asset Managers
      users.filter(u => u.role === 'Asset Manager').forEach(mgr => {
        addNotification(mgr.id, `New maintenance request for ${asset.tag} by ${currentUser.name}.`, 'info');
      });
    }
  };

  const approveMaintenance = (requestId: string, approve: boolean) => {
    const req = maintenance.find(m => m.id === requestId);
    if (!req) return;

    const updatedRequests = maintenance.map(m => {
      if (m.id === requestId) {
        return {
          ...m,
          status: (approve ? 'Approved' : 'Rejected') as MaintenanceStatus
        };
      }
      return m;
    });
    syncMaint(updatedRequests);

    const asset = assets.find(a => a.id === req.assetId);
    if (!asset) return;

    if (approve) {
      // Locked state: Under Maintenance
      const updatedAssets = assets.map(a => {
        if (a.id === req.assetId) {
          return { ...a, status: 'Under Maintenance' as AssetStatus };
        }
        return a;
      });
      syncAssets(updatedAssets);
      
      addNotification(req.requestedBy, `Maintenance request for ${asset.tag} was APPROVED. Asset status set to Under Maintenance.`, 'success');
      if (currentUser) {
        logAction(currentUser.id, currentUser.name, `Approved maintenance for ${asset.tag}`);
      }
    } else {
      addNotification(req.requestedBy, `Maintenance request for ${asset.tag} was REJECTED.`, 'warning');
      if (currentUser) {
        logAction(currentUser.id, currentUser.name, `Rejected maintenance for ${asset.tag}`);
      }
    }
  };

  const assignTechnician = (requestId: string, technician: string) => {
    const updated = maintenance.map(m => {
      if (m.id === requestId) {
        return {
          ...m,
          status: 'Technician Assigned' as MaintenanceStatus,
          technician
        };
      }
      return m;
    });
    syncMaint(updated);

    const req = maintenance.find(m => m.id === requestId);
    const asset = assets.find(a => a.id === req?.assetId);
    if (currentUser && asset) {
      logAction(currentUser.id, currentUser.name, `Assigned technician ${technician} to repair ${asset.tag}`);
      
      // If tech is an employee in our directory, alert them
      const techUser = users.find(u => u.name === technician);
      if (techUser) {
        addNotification(techUser.id, `You have been assigned to repair asset ${asset.tag} (${asset.name}).`, 'info');
      }
    }
  };

  const resolveMaintenance = (requestId: string, notes: string, condition: AssetCondition) => {
    const req = maintenance.find(m => m.id === requestId);
    if (!req) return;

    const updatedRequests = maintenance.map(m => {
      if (m.id === requestId) {
        return {
          ...m,
          status: 'Resolved' as MaintenanceStatus,
          resolutionNotes: notes,
          resolvedAt: new Date().toISOString().split('T')[0]
        };
      }
      return m;
    });
    syncMaint(updatedRequests);

    const asset = assets.find(a => a.id === req.assetId);
    if (!asset) return;

    // Transition back:
    // If it was allocated to an employee before, revert to Allocated (and preserve holder) or set to Available.
    // We will set to Available unless it was registered to a holder, in which case we restore it to Priya/Raj.
    const targetStatus = asset.holderId ? 'Allocated' : 'Available';

    const updatedAssets = assets.map(a => {
      if (a.id === req.assetId) {
        return {
          ...a,
          status: targetStatus as AssetStatus,
          condition
        };
      }
      return a;
    });
    syncAssets(updatedAssets);

    addNotification(req.requestedBy, `Maintenance resolved for ${asset.tag}. Status reverted to: ${targetStatus}.`, 'success');
    if (currentUser) {
      logAction(currentUser.id, currentUser.name, `Resolved maintenance for ${asset.tag}. Notes: ${notes}`);
    }
  };

  // ==========================================
  // PERIODIC AUDIT CYCLES
  // ==========================================

  const createAuditCycle = (audit: Omit<AuditCycle, 'id' | 'status' | 'results'>) => {
    const newAudit: AuditCycle = {
      ...audit,
      id: `au-${Date.now()}`,
      status: 'Active',
      results: {}
    };
    syncAudits([...audits, newAudit]);

    if (currentUser) {
      logAction(currentUser.id, currentUser.name, `Created audit campaign: ${audit.name}`);
      // Notify assigned auditors
      audit.auditors.forEach(auditorId => {
        addNotification(auditorId, `You are assigned as auditor to campaign: ${audit.name}.`, 'info');
      });
    }
  };

  const verifyAssetInAudit = (cycleId: string, assetId: string, result: 'Verified' | 'Missing' | 'Damaged') => {
    const updated = audits.map(au => {
      if (au.id === cycleId) {
        return {
          ...au,
          results: {
            ...au.results,
            [assetId]: result
          }
        };
      }
      return au;
    });
    syncAudits(updated);

    const asset = assets.find(a => a.id === assetId);
    const audit = audits.find(au => au.id === cycleId);
    if (currentUser && asset && audit) {
      logAction(currentUser.id, currentUser.name, `[Audit: ${audit.name}] Checked ${asset.tag} as ${result}`);
    }
  };

  const closeAuditCycle = (cycleId: string) => {
    const audit = audits.find(au => au.id === cycleId);
    if (!audit) return;

    // Filter scoped assets for this audit
    const scopedAssets = assets.filter(a => {
      // Filter by department
      if (audit.departmentId && a.holderType === 'department' && a.holderId !== audit.departmentId) return false;
      if (audit.departmentId && a.holderType === 'employee') {
        const holder = users.find(u => u.id === a.holderId);
        if (holder?.departmentId !== audit.departmentId) return false;
      }
      // Filter by location
      if (audit.location && a.location.toLowerCase() !== audit.location.toLowerCase()) return false;
      return true;
    });

    // Auto-generate discrepancy report
    const discrepancyReport: AuditCycle['discrepancyReport'] = [];
    const updatedAssets = [...assets];

    scopedAssets.forEach(a => {
      const result = audit.results[a.id];
      if (result === 'Missing' || result === 'Damaged') {
        let reconciliationAction = '';
        if (result === 'Missing') {
          reconciliationAction = 'Status updated to Lost. Investigation initiated.';
          // Update asset status in memory
          const idx = updatedAssets.findIndex(x => x.id === a.id);
          if (idx !== -1) {
            updatedAssets[idx] = { ...updatedAssets[idx], status: 'Lost' };
          }
        } else {
          reconciliationAction = 'Raised pending maintenance checklist ticket.';
        }

        discrepancyReport.push({
          assetId: a.id,
          tag: a.tag,
          name: a.name,
          expectedStatus: a.status,
          auditResult: result,
          reconciliationAction
        });
      }
    });

    // Save final changes to assets & audit
    syncAssets(updatedAssets);

    const updatedAudits = audits.map(au => {
      if (au.id === cycleId) {
        return {
          ...au,
          status: 'Closed' as AuditStatus,
          closedAt: new Date().toISOString().split('T')[0],
          discrepancyReport
        };
      }
      return au;
    });
    syncAudits(updatedAudits);

    if (currentUser) {
      logAction(currentUser.id, currentUser.name, `Closed audit campaign: ${audit.name}. Discrepancies flagged: ${discrepancyReport.length}`);
      
      // Notify managers
      users.filter(u => u.role === 'Asset Manager').forEach(mgr => {
        addNotification(mgr.id, `Audit Closed: ${audit.name} closed with ${discrepancyReport.length} discrepancy warnings.`, discrepancyReport.length > 0 ? 'warning' : 'success');
      });
    }
  };

  const markAllNotificationsRead = () => {
    if (!currentUser) return;
    const updated = notifications.map(n => n.userId === currentUser.id ? { ...n, isRead: true } : n);
    syncNotifications(updated);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      departments,
      categories,
      assets,
      bookings,
      transfers,
      maintenance,
      audits,
      notifications: notifications.filter(n => currentUser && n.userId === currentUser.id),
      activityLogs,
      theme,
      login,
      signup,
      logout,
      impersonateUser,
      toggleTheme,
      addDepartment,
      updateDepartment,
      addCategory,
      updateCategory,
      promoteEmployee,
      deactivateEmployee,
      registerAsset,
      updateAsset,
      deleteAsset,
      allocateAsset,
      requestTransfer,
      processTransferAction,
      returnAsset,
      bookResource,
      cancelBooking,
      updateBookingStatus,
      raiseMaintenance,
      approveMaintenance,
      assignTechnician,
      resolveMaintenance,
      createAuditCycle,
      verifyAssetInAudit,
      closeAuditCycle,
      markAllNotificationsRead
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
