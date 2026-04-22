import { Link } from 'react-router-dom';

export default function Dashboard({ me }) {
  return (
    <div className="grid">

      {/* Welcome card */}
      <div className="card" style={{ borderTop: '3px solid var(--mcm-red)' }}>
        <div className="h1">Welcome, {me.name}</div>
        <div className="row" style={{ marginTop: 6, gap: 8 }}>
          <span className="badge">{me.role}</span>
          <span className="badge">{me.username}</span>
        </div>
      </div>

      {/* Supervisor / Admin modules */}
      {(me.role === 'SUPERVISOR' || me.role === 'ADMIN') && (
        <div className="card">
          <div className="h2">Supervisor</div>
          <p className="small" style={{ marginBottom: 16 }}>
            Assign required training, review learner completions, and track team progress.
          </p>
          <div className="grid two" style={{ gap: 12 }}>
            <Link className="btn" to="/supervisor/training">
              Required Training
            </Link>
            <Link className="btn" to="/supervisor/sessions">
              Sessions
            </Link>
            <Link className="btn secondary" to="/supervisor/competencies">
              Competencies
            </Link>
            <Link className="btn secondary" to="/supervisor/matrix">
              Competency Matrix
            </Link>
          </div>
        </div>
      )}

      {/* Admin-only modules */}
      {me.role === 'ADMIN' && (
        <div className="card">
          <div className="h2">Administration</div>
          <p className="small" style={{ marginBottom: 16 }}>
            Manage user accounts and system settings.
          </p>
          <div className="grid two" style={{ gap: 12 }}>
            <Link className="btn secondary" to="/admin/users">
              User Management
            </Link>
            <Link className="btn secondary" to="/admin/modules">
              Module Management
            </Link>
          </div>
        </div>
      )}

      {/* Learner section */}
      {me.role === 'LEARNER' && (
        <div className="card">
          <div className="h2">My Learning</div>
          <p className="small" style={{ marginBottom: 16 }}>Track assigned modules, update progress, and submit work for supervisor review.</p>
          <Link className="btn" to="/my-learning">
            Open My Learning
          </Link>
        </div>
      )}

    </div>
  );
}
