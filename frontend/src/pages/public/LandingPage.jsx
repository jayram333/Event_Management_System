import React from 'react';
import { Link } from 'react-router-dom';
import {
  IconCalendar,
  IconUsers,
  IconCheckCircle,
  IconShield,
  IconBuilding,
  IconClock,
  IconChevronRight,
  IconUser,
} from '../../components/common/Icons';

export const LandingPage = () => {
  return (
    <div style={{ background: 'var(--bg-dark)', minHeight: '100vh', color: 'var(--text-main)' }}>
      {/* Header / Navbar */}
      <header
        style={{
          height: '72px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
          background: 'rgba(11, 15, 25, 0.8)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              color: '#ffffff',
              fontSize: '1.2rem',
            }}
          >
            E
          </div>
          <span style={{ fontWeight: '800', fontSize: '1.3rem', letterSpacing: '-0.02em' }} className="gradient-text">
            Event Management System
          </span>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link to="/login" className="secondary-btn">
            Login
          </Link>
          <Link to="/register/user" className="gradient-btn">
            Get Started <IconChevronRight size={16} />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '100px 20px 80px',
          textAlign: 'center',
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          className="badge badge-upcoming"
          style={{ padding: '8px 16px', fontSize: '0.85rem', marginBottom: '24px' }}
        >
          ✨ Next-Generation Event Operations Platform
        </div>
        <h1
          style={{
            fontSize: '3.75rem',
            fontWeight: 800,
            lineHeight: '1.15',
            letterSpacing: '-0.03em',
            marginBottom: '24px',
          }}
        >
          Plan. Coordinate. <span className="gradient-text">Execute.</span>
        </h1>
        <p
          style={{
            fontSize: '1.2rem',
            color: 'var(--text-muted)',
            maxWidth: '720px',
            marginBottom: '40px',
            lineHeight: '1.6',
          }}
        >
          Streamline event management, delegate coordinator tasks with pinpoint precision, track progress in real-time, and host unforgettable multi-scale events seamlessly.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/register/user" className="gradient-btn" style={{ padding: '14px 32px', fontSize: '1rem' }}>
            Register as User
          </Link>
          <Link to="/register/organizer" className="secondary-btn" style={{ padding: '14px 32px', fontSize: '1rem' }}>
            Register as Organizer
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '12px' }}>Powerful Event Capabilities</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            Everything organizers and coordinators need to manage live schedules effortlessly.
          </p>
        </div>

        <div className="cards-grid">
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', padding: '12px', borderRadius: '12px', width: 'fit-content', marginBottom: '20px' }}>
              <IconCalendar size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>Event Creation & Scheduling</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
              Define event times, coordinator thresholds, locations, and structured sub-task itineraries automatically parsed down to minute precision.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--secondary)', padding: '12px', borderRadius: '12px', width: 'fit-content', marginBottom: '20px' }}>
              <IconUsers size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>Coordinator Management</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
              Review coordinator join requests, approve team members, and assign verified coordinators to key task responsibilities.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', padding: '12px', borderRadius: '12px', width: 'fit-content', marginBottom: '20px' }}>
              <IconCheckCircle size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>Live Task Tracking</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
              Monitor task statuses, progress bars, guidelines, remarks, and priority rankings for each stage of execution.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 20px', background: 'rgba(17, 24, 39, 0.5)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '12px' }}>How It Works</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>Simple, streamlined 5-step operational workflow.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            {[
              { step: '01', title: 'Register Account', desc: 'Sign up as a User or Organizer and verify email via OTP.' },
              { step: '02', title: 'Discover & Create', desc: 'Organizers publish events; users browse upcoming opportunities.' },
              { step: '03', title: 'Join Request', desc: 'Users request to join events as coordinators; organizers approve.' },
              { step: '04', title: 'Assign Tasks', desc: 'Organizers delegate specific task responsibilities to approved coordinators.' },
              { step: '05', title: 'Execute Event', desc: 'Track progress live until event completion.' },
            ].map((s, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', display: 'block', marginBottom: '8px' }}>
                  {s.step}
                </span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>{s.title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Breakdown */}
      <section style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '12px' }}>Tailored For Every Role</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>Strict role-aware dashboards designed for clarity.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px' }}>
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <IconShield size={24} style={{ color: '#f43f5e' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Admin Portal</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
              System-wide oversight to manage organizer and user account statuses, view all published events, and audit platform security.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <IconBuilding size={24} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Organizer Studio</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
              Full event management suite to publish events, dynamically sequence tasks, evaluate join applications, and assign coordinators.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <IconUser size={24} style={{ color: 'var(--accent-emerald)' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Coordinator Hub</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
              Browse upcoming events, send join requests, view assigned tasks with guidelines, and collaborate smoothly on live events.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '48px 20px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-card-dark)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', textAlign: 'left' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }} className="gradient-text">
              Event Management System
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Streamlined event coordination, dynamic task timing management, and real-time operations portal.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>Contact & Help</h4>
            <p style={{ fontSize: '0.875rem', marginBottom: '8px' }}>
              <strong>Email:</strong> <a href="mailto:pulakalasriram@gmail.com" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>pulakalasriram@gmail.com</a>
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              <strong>Address:</strong> Visakhapatnam, Andhra Pradesh 530026
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>Portals & Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.875rem' }}>
              <Link to="/login" style={{ color: 'var(--text-muted)' }}>Login Portal</Link>
              <Link to="/register/user" style={{ color: 'var(--text-muted)' }}>User Registration</Link>
              <Link to="/register/organizer" style={{ color: 'var(--text-muted)' }}>Organizer Registration</Link>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '32px auto 0', paddingTop: '24px', borderTop: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          © 2026 Event Management System. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
