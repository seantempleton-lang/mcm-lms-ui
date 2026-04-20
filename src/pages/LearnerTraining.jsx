import { useEffect, useState } from 'react';
import { api } from '../api';

const statusText = {
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In progress',
  PENDING_REVIEW: 'Pending review',
  COMPLETED: 'Completed'
};

export default function LearnerTraining() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState({});
  const [busyId, setBusyId] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await api('/training/my');
      setItems(data || []);
      setNotes(Object.fromEntries((data || []).map((item) => [item.id, item.learnerNotes || ''])));
    } catch {
      setError('Failed to load your required training');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function updateAssignment(id, action) {
    setBusyId(id);
    setError('');
    try {
      await api(`/training/${id}/${action}`, {
        method: 'POST',
        body: JSON.stringify({ learnerNotes: notes[id] || '' })
      });
      await load();
    } catch {
      setError(action === 'submit' ? 'Failed to submit training for review' : 'Failed to update training progress');
    } finally {
      setBusyId('');
    }
  }

  return (
    <div className="grid">
      <div className="card">
        <div className="h1">My Learning</div>
        <p className="small">Work through your assigned modules and submit them to your supervisor when you are ready for review.</p>
        {error && <p style={{ color: 'var(--bad)', marginTop: 12 }}>{error}</p>}
      </div>

      {loading ? <div className="card"><p>Loading...</p></div> : items.length ? items.map((item) => (
        <div key={item.id} className="card">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="h2">{item.module.title}</div>
              <p className="small">
                Status: <span className="badge">{statusText[item.status] || item.status}</span>
              </p>
              <p className="small">
                Assigned by {item.assignedBy?.name || 'Supervisor'} on {new Date(item.assignedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <label className="small">Learner notes</label>
            <textarea
              className="input"
              rows={3}
              value={notes[item.id] || ''}
              disabled={item.status === 'COMPLETED' || busyId === item.id}
              onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))}
            />
          </div>

          <div className="grid" style={{ gap: 10, marginTop: 14 }}>
            <div className="small">Competencies covered by this module</div>
            {(item.module.competencies || []).map((mapping) => (
              <div key={mapping.id} className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{mapping.competency.code} - {mapping.competency.title}</span>
                <span className="badge">{mapping.evidenceType}</span>
              </div>
            ))}
          </div>

          <div className="row" style={{ marginTop: 16, justifyContent: 'flex-end' }}>
            {item.status !== 'COMPLETED' && item.status !== 'PENDING_REVIEW' && (
              <button className="btn secondary" disabled={busyId === item.id} onClick={() => updateAssignment(item.id, 'start')}>
                {busyId === item.id ? 'Saving...' : item.status === 'ASSIGNED' ? 'Start module' : 'Update progress'}
              </button>
            )}
            {item.status !== 'COMPLETED' && (
              <button className="btn" disabled={busyId === item.id} onClick={() => updateAssignment(item.id, 'submit')}>
                {busyId === item.id ? 'Submitting...' : item.status === 'PENDING_REVIEW' ? 'Re-submit for review' : 'Mark complete and request review'}
              </button>
            )}
          </div>
        </div>
      )) : (
        <div className="card"><p className="small">No required training has been assigned yet.</p></div>
      )}
    </div>
  );
}
