import { NavLink } from 'react-router-dom';
import { clearToken } from '../api';

export default function Layout({ me, children }) {
  const logout = () => { clearToken(); window.location.href = '/login'; };

  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-mcmillan">M<sup style={{fontSize:'0.6em'}}>c</sup>MILLAN</span>
            <span className="brand-drilling">Drilling</span>
            <span className="brand-lms">LMS</span>
          </div>
          <div className="nav">
            <NavLink className={({ isActive }) => `chip ${isActive ? 'active' : ''}`} to="/">
              Dashboard
            </NavLink>
            {(me?.role === 'SUPERVISOR' || me?.role === 'ADMIN') && (<>
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
            <button className="chip" onClick={logout}>Logout</button>
          </div>
        </div>
      </div>
      <div className="container">{children}</div>
    </>
  );
}