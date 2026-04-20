import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';

const statusText = {
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In progress',
  PENDING_REVIEW: 'Pending review',
  COMPLETED: 'Completed'
};

export default function SupervisorTraining() {
  const [assignments, setAssignments] = useState([]);
  const [learners, setLearners] = useState([]);
  const [modules, setModules] = useState([]);
  const [form, setForm] = useState({ learnerId: '', moduleId: '' });
  const [reviewNotes, setReviewNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [assignmentData, userData, moduleData] = await Promise.all([
        api('/training'),
        api('/users'),
        api('/modules')
      ]);
      const learnerItems = (userData || []).filter((user) => user.role === 'LEARNER');
      setAssignments(assignmentData || []);
      setLearners(learnerItems);
      setModules(moduleData || []);
      setForm((current) => ({
        learnerId: current.learnerId || learnerItems[0]?.id || '',
        moduleId: current.moduleId || moduleData?.[0]?.id || ''
      }));
      setReviewNotes(Object.fromEntries((assignmentData || []).map((item) => [item.id, item.reviewNotes || ''])));
    } catch {
      setError('Failed to load required training');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const pendingReview = useMemo(() => assignments.filter((item) => item.status === 'PENDING_REVIEW'), [assignments]);
  const activeAssignments = useMemo(() => assignments.filter((item) => item.status !== 'COMPLETED'), [assignments]);

  async function assignTraining(event) {
    event.preventDefault();
    if (!form.learnerId || !form.moduleId) return;
    setSaving(true);
    setError('');
    try {
      await api('/training', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      await load();
    } catch {
      setError('Failed to assign training');
    } finally {
      setSaving(false);
    }
  }

  async function reviewTraining(id) {
    setBusyId(id);
    setError('');
    try {
      await api(`/training/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ reviewNotes: reviewNotes[id] || '' })
      });
      await load();
    } catch {
      setError('Failed to review required training');
    } finally {
      setBusyId('');
    }
  }

  return (
    <div className="grid">
      <div className="card">
        <div className="h1">Required Training</div>
        <p className="small">Assign modules to learners, then review completed work and award competencies when approved.</p>
        {error && <p style={{ color: 'var(--bad)', marginTop: 12 }}>{error}</p>}
      </div>

      <div className="grid two">
        <div className="card">
          <div className="h2">Assign module</div>
          <form className="grid" onSubmit={assignTraining}>
            <div>
              <label className="small">Learner</label>
              <select className="input" value={form.learnerId} onChange={(event) => setForm((current) => ({ ...current, learnerId: event.target.value }))}>
                <option value="" disabled>Select learner</option>
                {learners.map((learner) => (
                  <option key={learner.id} value={learner.id}>{learner.name} ({learner.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="small">Module</label>
              <select className="input" value={form.moduleId} onChange={(event) => setForm((current) => ({ ...current, moduleId: event.target.value }))}>
                <option value="" disabled>Select module</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>{module.title}</option>
                ))}
              </select>
            </div>
            <button className="btn" disabled={saving || !form.learnerId || !form.moduleId}>
              {saving ? 'Assigning...' : 'Assign required training'}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="h2">Review queue</div>
          <p className="small">{pendingReview.length} assignment(s) waiting for supervisor review.</p>
          {!pendingReview.length && <p className="small" style={{ marginTop: 12 }}>Nothing is waiting for review right now.</p>}
        </div>
      </div>

      {loading ? <div className="card"><p>Loading...</p></div> : pendingReview.map((item) => (
        <div key={item.id} className="card">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="h2">{item.learner.name} - {item.module.title}</div>
              <p className="small">Submitted {item.submittedAt ? new Date(item.submittedAt).toLocaleString() : 'recently'}</p>
              {item.learnerNotes && <p className="small" style={{ marginTop: 8 }}>Learner notes: {item.learnerNotes}</p>}
            </div>
            <span className="badge">{statusText[item.status] || item.status}</span>
          </div>

          <div style={{ marginTop: 14 }}>
            <label className="small">Supervisor review notes</label>
            <textarea
              className="input"
              rows={3}
              value={reviewNotes[item.id] || ''}
              onChange={(event) => setReviewNotes((current) => ({ ...current, [item.id]: event.target.value }))}
            />
          </div>

          <div className="grid" style={{ gap: 10, marginTop: 14 }}>
            <div className="small">Competencies to award on approval</div>
            {(item.module.competencies || []).map((mapping) => (
              <div key={mapping.id} className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{mapping.competency.code} - {mapping.competency.title}</span>
                <span className="badge">{mapping.evidenceType}</span>
              </div>
            ))}
          </div>

          <div className="row" style={{ marginTop: 16, justifyContent: 'flex-end' }}>
            <button className="btn" disabled={busyId === item.id} onClick={() => reviewTraining(item.id)}>
              {busyId === item.id ? 'Reviewing...' : 'Approve and award competencies'}
            </button>
          </div>
        </div>
      ))}

      <div className="card">
        <div className="h2">Assigned training</div>
        {!activeAssignments.length ? <p className="small">No active assignments.</p> : (
          <div className="grid" style={{ gap: 10 }}>
            {activeAssignments.map((item) => (
              <div key={item.id} className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{item.learner.name} - {item.module.title}</div>
                  <div className="small">Assigned {new Date(item.assignedAt).toLocaleDateString()}</div>
                </div>
                <span className="badge">{statusText[item.status] || item.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
