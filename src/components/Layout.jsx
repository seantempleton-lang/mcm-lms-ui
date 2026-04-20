import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { clearToken } from '../api';

function Icon({ children }) {
  return (
    <span className="side-link-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </span>
  );
}

function DashboardIcon() {
  return <Icon><path d="M4 13h7V4H4zM13 20h7v-9h-7zM13 4h7v7h-7zM4 20h7v-5H4z" /></Icon>;
}

function TrainingIcon() {
  return <Icon><path d="M4 19V5l8-2 8 2v14l-8 2-8-2z" /><path d="M9 9h6M9 13h6" /></Icon>;
}

function SessionIcon() {
  return <Icon><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></Icon>;
}

function CompetencyIcon() {
  return <Icon><path d="m12 3 7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7z" /><path d="m9.5 12 1.8 1.8 3.7-4.1" /></Icon>;
}

function MatrixIcon() {
  return <Icon><path d="M4 4h16v16H4zM4 10h16M10 4v16" /></Icon>;
}

function UsersIcon() {
  return <Icon><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="3" /><path d="M20 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 4.13a3 3 0 0 1 0 5.74" /></Icon>;
}

function ModulesIcon() {
  return <Icon><path d="M4 6h7v12H4zM13 6h7v5h-7zM13 13h7v5h-7z" /></Icon>;
}

function LearningIcon() {
  return <Icon><path d="M12 6v12" /><path d="M6 12h12" /><circle cx="12" cy="12" r="9" /></Icon>;
}

function NavItem({ to, icon, children, collapsed, onNavigate }) {
  return (
    <NavLink
      className={({ isActive }) => `side-link ${isActive ? 'active' : ''} ${collapsed ? 'collapsed' : ''}`}
      to={to}
      title={collapsed ? children : undefined}
      onClick={onNavigate}
    >
      {icon}
      <span className="side-link-text">{children}</span>
    </NavLink>
  );
}

export default function Layout({ me, children }) {
  const logout = () => { clearToken(); window.location.href = '/login'; };
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 980);

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth <= 980;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const showSidebar = !isMobile || sidebarOpen;

  function toggleSidebar() {
    if (isMobile) {
      setSidebarOpen((current) => !current);
    } else {
      setSidebarCollapsed((current) => !current);
    }
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <div className="topbar-left">
            <button className="chip sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
              {isMobile ? (sidebarOpen ? 'Close' : 'Menu') : (sidebarCollapsed ? 'Expand' : 'Collapse')}
            </button>
            <a className="brand-lockup" href="/">
              <img
                src="/McMillanDrilling-logo-transparent.png"
                alt="McMillan Drilling"
                style={{ height: 34, filter: 'brightness(0) invert(1)' }}
              />
              <div className="brand-copy">
                <span className="brand-title">McMillan LMS</span>
                <span className="brand-subtitle">{me?.name} | {me?.role}</span>
              </div>
            </a>
          </div>
          <button className="chip logout-chip" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {isMobile && showSidebar && <button className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar" />}
        <aside className={`sidebar ${showSidebar ? 'open' : ''} ${sidebarCollapsed && !isMobile ? 'collapsed' : ''}`}>
          <div className="sidebar-group">
            <div className="sidebar-label">{sidebarCollapsed && !isMobile ? 'WS' : 'Workspace'}</div>
            <NavItem to="/" icon={<DashboardIcon />} collapsed={sidebarCollapsed && !isMobile} onNavigate={() => isMobile && setSidebarOpen(false)}>Dashboard</NavItem>
          </div>

          {(me?.role === 'SUPERVISOR' || me?.role === 'ADMIN') && (
            <div className="sidebar-group">
              <div className="sidebar-label">{sidebarCollapsed && !isMobile ? 'SV' : 'Supervisor'}</div>
              <NavItem to="/supervisor/training" icon={<TrainingIcon />} collapsed={sidebarCollapsed && !isMobile} onNavigate={() => isMobile && setSidebarOpen(false)}>Required Training</NavItem>
              <NavItem to="/supervisor/competencies" icon={<CompetencyIcon />} collapsed={sidebarCollapsed && !isMobile} onNavigate={() => isMobile && setSidebarOpen(false)}>Competencies</NavItem>
              <NavItem to="/supervisor/matrix" icon={<MatrixIcon />} collapsed={sidebarCollapsed && !isMobile} onNavigate={() => isMobile && setSidebarOpen(false)}>Matrix</NavItem>
              <NavItem to="/supervisor/sessions" icon={<SessionIcon />} collapsed={sidebarCollapsed && !isMobile} onNavigate={() => isMobile && setSidebarOpen(false)}>Sessions</NavItem>
            </div>
          )}

          {me?.role === 'ADMIN' && (
            <div className="sidebar-group">
              <div className="sidebar-label">{sidebarCollapsed && !isMobile ? 'AD' : 'Administration'}</div>
              <NavItem to="/admin/modules" icon={<ModulesIcon />} collapsed={sidebarCollapsed && !isMobile} onNavigate={() => isMobile && setSidebarOpen(false)}>Modules</NavItem>
              <NavItem to="/admin/users" icon={<UsersIcon />} collapsed={sidebarCollapsed && !isMobile} onNavigate={() => isMobile && setSidebarOpen(false)}>Users</NavItem>
            </div>
          )}

          {me?.role === 'LEARNER' && (
            <div className="sidebar-group">
              <div className="sidebar-label">{sidebarCollapsed && !isMobile ? 'LR' : 'Learner'}</div>
              <NavItem to="/my-learning" icon={<LearningIcon />} collapsed={sidebarCollapsed && !isMobile} onNavigate={() => isMobile && setSidebarOpen(false)}>My Learning</NavItem>
            </div>
          )}
        </aside>

        <main className="content-area">
          <div className="container">{children}</div>
        </main>
      </div>
    </>
  );
}
