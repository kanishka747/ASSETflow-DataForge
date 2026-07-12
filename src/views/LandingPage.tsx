import React from 'react';
import { useApp } from '../context/AppContext';
import { BubblesBackground } from '../components/BubblesBackground';
import { 
  Sun, 
  Moon, 
  ArrowRight, 
  Settings, 
  Package, 
  CalendarDays, 
  Wrench,
  ShieldAlert
} from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const { theme, toggleTheme } = useApp();

  const steps = [
    {
      number: '01',
      title: 'Setup & Hierarchy',
      description: 'Configure departments, nested child organizations, and roles such as Admins, Managers, and Department Heads.',
      icon: Settings,
      color: 'hsl(var(--primary))'
    },
    {
      number: '02',
      title: 'Register & Track',
      description: 'Log inventory categories, hardware serial numbers, and custom field templates. Generate physical QR codes for tagging.',
      icon: Package,
      color: 'hsl(var(--purple))'
    },
    {
      number: '03',
      title: 'Reserve Resources',
      description: 'Book shared rooms, lab equipment, or company vehicles. High-fidelity schedules prevent double-booking conflicts.',
      icon: CalendarDays,
      color: 'hsl(var(--success))'
    },
    {
      number: '04',
      title: 'Maintain & Audit',
      description: 'File maintenance tickets with priority levels, assign technicians, and run site-wide physical asset verification audits.',
      icon: Wrench,
      color: 'hsl(var(--danger))'
    }
  ];

  return (
    <div style={styles.page}>
      {/* Interactive Floating Bubbles in Background */}
      <BubblesBackground />

      {/* Decorative Glow Elements */}
      <div style={styles.glowTop} />
      <div style={styles.glowBottom} />

      {/* Header Panel */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>AF</div>
          <span style={styles.logoText}>AssetFlow</span>
        </div>
        <button 
          onClick={toggleTheme} 
          style={styles.themeToggle} 
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Main Content Area */}
      <main style={styles.main}>
        {/* Hero Section */}
        <section style={styles.hero}>
          <div style={styles.tagline}>
            <ShieldAlert size={14} style={{ marginRight: 6, color: 'hsl(var(--primary))' }} />
            <span>CENTRALIZED ENTERPRISE ERP</span>
          </div>
          <h1 style={styles.title}>
            Master Your Enterprise <br />
            <span style={styles.titleGradient}>Asset Lifecycle</span>
          </h1>
          <p style={styles.description}>
            A centralized platform to track physical assets, schedule conflict-free resource bookings, 
            route maintenance requests, and manage organizational audit cycles.
          </p>
          <button onClick={onEnter} className="btn btn-primary" style={styles.ctaBtn}>
            Enter Platform <ArrowRight size={18} />
          </button>
        </section>

        {/* Steps / Features Grid */}
        <section style={styles.stepsSection}>
          <h2 style={styles.stepsSectionTitle}>Central Operations Workflow</h2>
          <p style={styles.stepsSectionSubtitle}>Everything you need to orchestrate corporate assets in four simple steps</p>
          
          <div style={styles.stepsGrid}>
            {steps.map((step, idx) => (
              <div key={idx} className="glass-panel" style={styles.stepCard}>
                <div style={styles.stepCardHeader}>
                  <span style={{ ...styles.stepNumber, color: step.color }}>{step.number}</span>
                  <div style={{ ...styles.stepIconWrapper, backgroundColor: `${step.color}15`, color: step.color }}>
                    <step.icon size={22} />
                  </div>
                </div>
                <h3 style={styles.stepTitle}>{step.title}</h3>
                <p style={styles.stepDesc}>{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2026 AssetFlow Technologies. Centralized Resource Management System.</p>
      </footer>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    position: 'relative' as const,
    overflowX: 'hidden' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    fontFamily: 'var(--font-primary)',
    transition: 'background-color var(--transition-normal)'
  },
  glowTop: {
    position: 'absolute' as const,
    top: '-10%',
    right: '5%',
    width: '450px',
    height: '450px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--primary-glow) 0%, rgba(99, 102, 241, 0) 70%)',
    filter: 'blur(50px)',
    pointerEvents: 'none' as const,
    zIndex: 0
  },
  glowBottom: {
    position: 'absolute' as const,
    bottom: '10%',
    left: '-5%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, rgba(168, 85, 247, 0) 70%)',
    filter: 'blur(60px)',
    pointerEvents: 'none' as const,
    zIndex: 0
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 3rem',
    position: 'relative' as const,
    zIndex: 10,
    maxWidth: '1400px',
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box' as const
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--purple)) 100%)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '1.1rem',
    boxShadow: '0 4px 12px var(--primary-glow)'
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    background: 'linear-gradient(135deg, var(--text-primary) 30%, hsl(var(--primary)) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  themeToggle: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    border: '1px solid var(--card-border)',
    background: 'var(--card-bg)',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    boxShadow: 'var(--shadow-sm)'
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    zIndex: 2,
    padding: '2rem 1.5rem 4rem 1.5rem',
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box' as const
  },
  hero: {
    textAlign: 'center' as const,
    maxWidth: '750px',
    margin: '3rem auto 5rem auto',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '1.5rem',
  },
  tagline: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.4rem 1rem',
    borderRadius: '100px',
    border: '1px solid var(--card-border)',
    background: 'var(--card-bg)',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: 'var(--text-secondary)'
  },
  title: {
    fontSize: '3.5rem',
    fontWeight: 850,
    lineHeight: 1.1,
    letterSpacing: '-0.03em',
    margin: 0
  },
  titleGradient: {
    background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--purple)) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  description: {
    fontSize: '1.15rem',
    lineHeight: 1.6,
    color: 'var(--text-secondary)',
    margin: '0.5rem 0 1rem 0'
  },
  ctaBtn: {
    fontSize: '1rem',
    padding: '1rem 2rem',
    borderRadius: 'var(--border-radius-sm)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.75rem',
    boxShadow: '0 8px 24px var(--primary-glow)'
  },
  stepsSection: {
    width: '100%',
    marginTop: '2rem'
  },
  stepsSectionTitle: {
    fontSize: '2rem',
    fontWeight: 800,
    textAlign: 'center' as const,
    letterSpacing: '-0.02em',
    marginBottom: '0.5rem'
  },
  stepsSectionSubtitle: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    textAlign: 'center' as const,
    marginBottom: '3.5rem'
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    width: '100%'
  },
  stepCard: {
    padding: '2rem 1.75rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.25rem',
    backgroundColor: 'var(--card-bg)',
    cursor: 'default',
    transform: 'translateY(0)',
    transition: 'all var(--transition-normal)'
  },
  stepCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  stepNumber: {
    fontSize: '1.5rem',
    fontWeight: 800,
    fontFamily: 'var(--font-secondary)'
  },
  stepIconWrapper: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    margin: 0
  },
  stepDesc: {
    fontSize: '0.9rem',
    lineHeight: 1.5,
    color: 'var(--text-secondary)',
    margin: 0
  },
  footer: {
    padding: '2rem',
    textAlign: 'center' as const,
    borderTop: '1px solid var(--card-border)',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    position: 'relative' as const,
    zIndex: 2,
    maxWidth: '1400px',
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box' as const
  }
};
