import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Mail, Lock, UserPlus, LogIn } from 'lucide-react';

export const LoginSignup: React.FC = () => {
  const { login, signup } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Listen for prefill events from Quick Switcher
  React.useEffect(() => {
    const checkPrefilled = () => {
      const prefilled = localStorage.getItem('af_prefilled_email');
      if (prefilled) {
        setEmail(prefilled);
        setPassword('');
        setError('');
        setSuccess('');
        localStorage.removeItem('af_prefilled_email');
      }
    };
    checkPrefilled();
    window.addEventListener('prefill_email_changed', checkPrefilled);
    return () => window.removeEventListener('prefill_email_changed', checkPrefilled);
  }, []);

  const handlePrefill = (emailAddress: string) => {
    setEmail(emailAddress);
    setPassword('');
    setError('');
    setSuccess('');
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      setError('Please enter your work email address to receive a password reset link.');
      setSuccess('');
    } else {
      setSuccess(`A password reset link has been sent to ${email}. Check your inbox!`);
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }

    if (!isLogin && !name) {
      setError('Please provide your full name.');
      return;
    }

    if (isLogin) {
      const res = login(email, password);
      if (res.success) {
        setSuccess(res.message);
      } else {
        setError(res.message);
      }
    } else {
      const res = signup(name, email, password);
      if (res.success) {
        setSuccess(res.message);
        // Reset
        setName('');
        setEmail('');
        setPassword('');
        setIsLogin(true);
      } else {
        setError(res.message);
      }
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.backgroundGlow} />

      <div className="glass-panel" style={styles.container}>
        {/* Brand Header */}
        <div style={styles.brand}>
          <div style={styles.logoIcon}>AF</div>
          <h1 style={styles.brandTitle}>AssetFlow</h1>
          <p style={styles.brandSubtitle}>Enterprise Resource & Asset Management</p>
        </div>

        {/* Tab Selector */}
        <div style={styles.tabs}>
          <button 
            style={styles.tabBtn(isLogin)} 
            onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
          >
            <LogIn size={16} /> Sign In
          </button>
          <button 
            style={styles.tabBtn(!isLogin)} 
            onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
          >
            <UserPlus size={16} /> Register
          </button>
        </div>

        {/* Quick Account Selectors */}
        {isLogin && (
          <div style={styles.roleSelectionContainer}>
            <label style={styles.roleSelectionLabel}>Choose Account Type</label>
            <div style={styles.roleSelectionGrid}>
              <button type="button" onClick={() => handlePrefill('admin@assetflow.com')} style={styles.roleSelectionBtn(email === 'admin@assetflow.com')}>Admin</button>
              <button type="button" onClick={() => handlePrefill('manager@assetflow.com')} style={styles.roleSelectionBtn(email === 'manager@assetflow.com')}>Manager</button>
              <button type="button" onClick={() => handlePrefill('head@assetflow.com')} style={styles.roleSelectionBtn(email === 'head@assetflow.com')}>Dept Head</button>
              <button type="button" onClick={() => handlePrefill('priya@assetflow.com')} style={styles.roleSelectionBtn(email === 'priya@assetflow.com')}>Employee</button>
            </div>
          </div>
        )}

        {/* Message Banner */}
        {error && <div style={styles.errorBanner}>{error}</div>}
        {success && <div style={styles.successBanner}>{success}</div>}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <div style={styles.inputWrapper}>
                <ShieldCheck style={styles.inputIcon} size={18} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="John Doe" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Work Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail style={styles.inputIcon} size={18} />
              <input 
                type="email" 
                className="form-control" 
                placeholder="you@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ marginBottom: 0 }}>Password</label>
              {isLogin && (
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  style={{ background: 'none', border: 'none', color: 'hsl(var(--primary))', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'var(--font-secondary)', padding: 0 }}
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div style={styles.inputWrapper}>
              <Lock style={styles.inputIcon} size={18} />
              <input 
                type="password" 
                className="form-control" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={styles.submitBtn}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Notes */}
        <div style={styles.note}>
          {isLogin ? (
            <p>Demo accounts (pre-filled): <br /> 
              Admin: <code>admin@assetflow.com</code> | 
              Manager: <code>manager@assetflow.com</code> <br />
              Employee: <code>priya@assetflow.com</code>
            </p>
          ) : (
            <p>New signups are assigned the <b>Employee</b> role. Access roles are managed by Admins in the Directory Setup.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-primary)',
    position: 'relative' as const,
    overflow: 'hidden',
    padding: '2rem'
  },
  backgroundGlow: {
    position: 'absolute' as const,
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--primary-glow) 0%, rgba(99, 102, 241, 0) 70%)',
    top: '20%',
    left: '30%',
    filter: 'blur(40px)',
    pointerEvents: 'none' as const
  },
  container: {
    width: '100%',
    maxWidth: '420px',
    padding: '2.5rem 2rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
    position: 'relative' as const,
    zIndex: 2,
    backgroundColor: 'var(--card-bg)'
  },
  brand: {
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.5rem'
  },
  logoIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: 'hsl(var(--primary))',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '1.25rem',
    boxShadow: '0 4px 15px var(--primary-glow)'
  },
  brandTitle: {
    fontSize: '1.8rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    letterSpacing: '-0.03em'
  },
  brandSubtitle: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    fontWeight: 500
  },
  tabs: {
    display: 'flex',
    background: 'var(--bg-tertiary)',
    padding: '0.25rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--card-border)'
  },
  tabBtn: (isActive: boolean) => ({
    flex: 1,
    padding: '0.6rem',
    border: 'none',
    borderRadius: '6px',
    background: isActive ? 'var(--bg-secondary)' : 'transparent',
    color: isActive ? 'hsl(var(--primary))' : 'var(--text-secondary)',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    transition: 'all 0.2s ease',
    outline: 'none',
    fontFamily: 'var(--font-secondary)'
  }),
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem'
  },
  inputWrapper: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute' as const,
    left: '12px',
    color: 'var(--text-muted)',
    pointerEvents: 'none' as const
  },
  input: {
    paddingLeft: '38px'
  },
  submitBtn: {
    width: '100%',
    padding: '0.8rem',
    marginTop: '0.5rem'
  },
  errorBanner: {
    backgroundColor: 'var(--danger-glow)',
    color: 'hsl(var(--danger))',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.75rem',
    fontSize: '0.82rem',
    fontWeight: 500,
    textAlign: 'center' as const
  },
  successBanner: {
    backgroundColor: 'var(--success-glow)',
    color: 'hsl(var(--success))',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.75rem',
    fontSize: '0.82rem',
    fontWeight: 500,
    textAlign: 'center' as const
  },
  note: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    textAlign: 'center' as const,
    lineHeight: 1.4,
    borderTop: '1px solid var(--card-border)',
    paddingTop: '0.8rem'
  },
  roleSelectionContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.4rem',
    marginTop: '0.5rem',
    marginBottom: '0.5rem'
  },
  roleSelectionLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-secondary)'
  },
  roleSelectionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.35rem'
  },
  roleSelectionBtn: (isActive: boolean) => ({
    padding: '0.5rem 0.2rem',
    fontSize: '0.72rem',
    fontWeight: 700,
    borderRadius: '6px',
    cursor: 'pointer',
    border: isActive ? '1px solid hsl(var(--primary))' : '1px solid var(--card-border)',
    backgroundColor: isActive ? 'var(--primary-glow)' : 'var(--bg-tertiary)',
    color: isActive ? 'hsl(var(--primary))' : 'var(--text-secondary)',
    transition: 'all 0.2s ease',
    outline: 'none',
    fontFamily: 'var(--font-secondary)',
    textAlign: 'center' as const
  })
};
