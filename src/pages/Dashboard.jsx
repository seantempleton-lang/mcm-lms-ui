import { Link } from 'react-router-dom';
export default function Dashboard({ me }){
  return (
    <div className="grid two">
      <div className="card">
        <div className="h1">Welcome, {me.name}</div>
        <div className="row"><span className="badge">Role: {me.role}</span><span className="badge">{me.email}</span></div>
        <p className="small" style={{marginTop:12}}>Supervisor workflows are enabled.</p>
      </div>
      {(me.role==='SUPERVISOR'||me.role==='ADMIN') ? (
        <div className="card">
          <div className="h2">Supervisor</div>
          <div className="grid">
            <Link className="btn" to="/supervisor/sessions">Sessions</Link>
            <Link className="btn secondary" to="/supervisor/competencies">Competencies</Link>
          </div>
        </div>
      ) : (
        <div className="card"><div className="h2">Learner</div><p className="small">Learner dashboards later.</p></div>
      )}
    </div>
  );
}
