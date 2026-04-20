import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
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

function DashboardIcon()  { return <Icon><path d="M4 13h7V4H4zM13 20h7v-9h-7zM13 4h7v7h-7zM4 20h7v-5H4z" /></Icon>; }
function TrainingIcon()   { return <Icon><path d="M4 19V5l8-2 8 2v14l-8 2-8-2z" /><path d="M9 9h6M9 13h6" /></Icon>; }
function SessionIcon()    { return <Icon><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></Icon>; }
function CompetencyIcon() { return <Icon><path d="m12 3 7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7z" /><path d="m9.5 12 1.8 1.8 3.7-4.1" /></Icon>; }
function MatrixIcon()     { return <Icon><path d="M4 4h16v16H4zM4 10h16M10 4v16" /></Icon>; }
function UsersIcon()      { return <Icon><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="3" /><path d="M20 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 4.13a3 3 0 0 1 0 5.74" /></Icon>; }
function ModulesIcon()    { return <Icon><path d="M4 6h7v12H4zM13 6h7v5h-7zM13 13h7v5h-7z" /></Icon>; }
function LearningIcon()   { return <Icon><path d="M12 6v12" /><path d="M6 12h12" /><circle cx="12" cy="12" r="9" /></Icon>; }
function LogoutIcon()     { return <Icon><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></Icon>; }

function NavItem({ to, icon, children, onNavigate }) {
  return (
    <NavLink
      className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}
      to={to}
      title={children}
      onClick={onNavigate}
    >
      {icon}
      <span className="side-link-text">{children}</span>
    </NavLink>
  );
}

export default function Layout({ me, children }) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 980);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const logout = () => { clearToken(); window.location.href = '/login'; };

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth <= 980;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mobileExpanded = isMobile && sidebarOpen;

  function handleNavigate() {
    if (isMobile) setSidebarOpen(false);
  }

  return (
    <>
      <div className="topbar compact">
        <div className="topbar-inner compact">
          <a className="brand-lockup centered" href="/">
            <img
              src="/"/>
            <span className="brand-title">LMS</span>
          </a>
          <div className="brand-subtitle centered">{me?.name} | {me?.role}</div>
        </div>
      </div>

      <div className={`app-shell rail-shell ${mobileExpanded ? 'sidebar-expanded' : ''}`}>
        {isMobile && mobileExpanded && (
          <button
            className="sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          />
        )}

