import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

function formatDate(value) {
  if (!value) return 'Unscheduled';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function SessionsList() {
  const [sessions, setSessions] = useState([]);
  const [modules, setModules] = useState([]);
  const [form, setForm] = useState({
    moduleId: '',
    date: '',
    location: '',
    project: ''
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [sessionItems, moduleItems] = await Promise.all([
        api('/sessions'),
        api('/modules')
      ]);
      setSessions(sessionItems || []);
      setModules(moduleItems || []);
      setForm((current) => ({
        ...current,
        moduleId: current.moduleId || moduleItems?.[0]?.id || ''
      }));
    } catch {
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [sessions]);

  async function createSession(event) {
    event.preventDefault();
    if (!form.moduleId || !form.date) return;

    setSaving(true);
    setError('');
    try {
      await api('/sessions', {
        method: 'POST',
        body: JSON.stringify({
          moduleId: form.moduleId,
          date: new Date(form.date).toISOString(),
          location: form.location || undefined,
          project: form.project || undefined
        })
      });
      setForm((current) => ({
        ...current,
        date: '',
        location: '',
        project: ''
      }));
      await load();
    } catch {
      setError('Failed to create session');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid">
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="h1">Sessions</div>
            <p className="small">Schedule a session, then open it to manage attendance and assessments.</p>
          </div>
          <button className="btn secondary" onClick={load} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        {error && <p style={{ color: 'var(--bad)' }}>{error}</p>}
      </div>

      <div className="grid two">
        <div className="card">
          <div className="h2">New session</div>
          <form className="grid" onSubmit={createSession}>
            <div>
              <label className="small">Module</label>
              <select
                className="input"
                value={form.moduleId}
                onChange={(event) => setForm((current) => ({ ...current, moduleId: event.target.value }))}
              >
                <option value="" disabled>Select a module</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="small">Date and time</label>
              <input
                className="input"
                type="datetime-local"
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              />
            </div>
            <div>
              <label className="small">Location</label>
              <input
                className="input"
                value={form.location}
                onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
              />
            </div>
            <div>
              <label className="small">Project</label>
              <input
                className="input"
                value={form.project}
                onChange={(event) => setForm((current) => ({ ...current, project: event.target.value }))}
              />
            </div>
            <button className="btn" disabled={saving || !modules.length || !form.moduleId || !form.date}>
              {saving ? 'Creating...' : 'Create session'}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="h2">Upcoming and recent</div>
          {!sortedSessions.length ? (
            <p className="small">No sessions yet.</p>
          ) : (
            <div className="grid" style={{ gap: 10 }}>
              {sortedSessions.map((session) => (
                <div key={session.id} className="card" style={{ background: 'var(--panel2)' }}>
                  <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{session.module?.title || 'Untitled module'}</div>
                      <div className="small">{formatDate(session.date)}</div>
                      <div className="small">
                        Facilitator: {session.facilitator?.name || 'Unknown'}
                        {session.location ? ` | ${session.location}` : ''}
                        {session.project ? ` | ${session.project}` : ''}
                      </div>
                    </div>
                    <Link className="btn" to={`/supervisor/sessions/${session.id}`}>
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
