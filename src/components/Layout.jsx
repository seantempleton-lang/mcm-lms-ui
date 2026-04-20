import { NavLink } from 'react-router-dom';
import { clearToken } from '../api';

export default function Layout({ me, children }) {
  const logout = () => { clearToken(); window.location.href = '/login'; };

  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">

          {/* Logo — transparent PNG, inverted to white for dark nav */}
          <a href="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0, gap: 10 }}>
            <img
              src="/McMillanDrilling-logo-transparent.png"
              alt="McMillan Drilling"
              style={{
                height: 32,
                filter: 'brightness(0) invert(1)',
              }}
            />
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.45)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              alignSelf: 'flex-end',
              marginBottom: 2,
            }}>
              LMS
            </span>
          </a>

          <div className="nav">
            <NavLink className={({ isActive }) => `chip ${isActive ? 'active' : ''}`} to="/">
              Dashboard
            </NavLink>
            {(me?.role === 'SUPERVISOR' || me?.role === 'ADMIN') && (<>
              <NavLink className={({ isActive }) => `chip ${isActive ? 'active' : ''}`} to="/supervisor/training">
                Required Training
              </NavLink>
              <NavLink className={({ isActive }) => `chip ${isActive ? 'active' : ''}`} to="/supervisor/sessions">
                Sessions
              </NavLink>
              <NavLink className={({ isActive }) => `chip ${isActive ? 'active' : ''}`} to="/supervisor/competencies">
                Competencies
              </NavLink>
              <NavLink className={({ isActive }) => `chip ${isActive ? 'active' : ''}`} to="/supervisor/matrix">
                Matrix
              </NavLink>
            </>)}
            {me?.role === 'ADMIN' && (
              <NavLink className={({ isActive }) => `chip ${isActive ? 'active' : ''}`} to="/admin/users">
                Users
              </NavLink>
            )}
            {me?.role === 'LEARNER' && (
              <NavLink className={({ isActive }) => `chip ${isActive ? 'active' : ''}`} to="/my-learning">
                My Learning
              </NavLink>
            )}
            <button className="chip" onClick={logout}>Logout</button>
          </div>

        </div>
      </div>
      <div className="container">{children}</div>
    </>
  );
}
