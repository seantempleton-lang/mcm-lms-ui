import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import ModulePlayer from '../components/ModulePlayer.jsx';

const statusText = {
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In progress',
  PENDING_REVIEW: 'Pending review',
  COMPLETED: 'Completed'
};

export default function LearnerTraining() {
  const [items, setItems] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState({});
  const [busyId, setBusyId] = useState('');
  const [openModuleId, setOpenModuleId] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [assignmentData, reportData] = await Promise.all([
        api('/training/my'),
        api('/training/my/report')
      ]);
      setItems(assignmentData || []);
      setReport(reportData);
      setNotes(Object.fromEntries((assignmentData || []).map((item) => [item.id, item.learnerNotes || ''])));
    } catch {
      setError('Failed to load your required training');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const activeItems = useMemo(() => items.filter((item) => item.status !== 'COMPLETED'), [items]);
  const completedItems = useMemo(() => items.filter((item) => item.status === 'COMPLETED'), [items]);

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
        <p className="small">Work through your assigned modules, submit them for supervisor review, and track your completed learning history.</p>
        {error && <p style={{ color: 'var(--bad)', marginTop: 12 }}>{error}</p>}
      </div>

      {report && (
        <div className="grid two">
          <div className="card">
            <div className="h2">Learner report</div>
            <div className="grid" style={{ gap: 8 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}><span>Assigned modules</span><span className="badge">{report.summary.assigned}</span></div>
              <div className="row" style={{ justifyContent: 'space-between' }}><span>In progress</span><span className="badge">{report.summary.inProgress}</span></div>
              <div className="row" style={{ justifyContent: 'space-between' }}><span>Pending review</span><span className="badge">{report.summary.pendingReview}</span></div>
              <div className="row" style={{ justifyContent: 'space-between' }}><span>Completed modules</span><span className="badge">{report.summary.completed}</span></div>
              <div className="row" style={{ justifyContent: 'space-between' }}><span>Competencies awarded</span><span className="badge">{report.summary.competenciesAwarded}</span></div>
            </div>
          </div>
          <div className="card">
            <div className="h2">Recent awards</div>
            {report.recentAwards?.length ? report.recentAwards.map((award) => (
              <div key={award.id} className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                <span>{award.competency.code} - {award.competency.title}</span>
                <span className="small">{new Date(award.awardedAt).toLocaleDateString()}</span>
              </div>
            )) : <p className="small">No competencies awarded yet.</p>}
          </div>
        </div>
      )}

      {loading ? <div className="card"><p>Loading...</p></div> : activeItems.length ? activeItems.map((item) => (
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
              {item.module.estimatedMinutes && <p className="small">Estimated duration: {item.module.estimatedMinutes} minutes</p>}
            </div>
            <button
              className={`btn ${openModuleId === item.id ? 'secondary' : ''}`}
              onClick={() => setOpenModuleId((current) => current === item.id ? '' : item.id)}
            >
              {openModuleId === item.id ? 'Hide module' : 'Launch module'}
            </button>
          </div>

          {(item.module.description || item.module.learningObjectives || item.module.contentUrl || item.module.contentBody) && (
            <div className="grid" style={{ gap: 10, marginTop: 14 }}>
              {item.module.description && <p>{item.module.description}</p>}
              {item.module.learningObjectives && (
                <div>
                  <div className="small">Learning objectives</div>
                  <p>{item.module.learningObjectives}</p>
                </div>
              )}
              {item.module.contentUrl && (
                <a className="btn secondary" href={item.module.contentUrl} target="_blank" rel="noreferrer">
                  Open learning material
                </a>
              )}
              {openModuleId === item.id && (
                <div className="grid" style={{ gap: 8 }}>
                  <div className="small">Interactive module</div>
                  <ModulePlayer module={item.module} />
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: 14 }}>
            <label className="small">Learner notes</label>
            <textarea
              className="input"
              rows={3}
              value={notes[item.id] || ''}
              disabled={busyId === item.id}
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
            {item.status !== 'PENDING_REVIEW' && (
              <button className="btn secondary" disabled={busyId === item.id} onClick={() => updateAssignment(item.id, 'start')}>
                {busyId === item.id ? 'Saving...' : item.status === 'ASSIGNED' ? 'Start module' : 'Update progress'}
              </button>
            )}
            <button className="btn" disabled={busyId === item.id} onClick={() => updateAssignment(item.id, 'submit')}>
              {busyId === item.id ? 'Submitting...' : item.status === 'PENDING_REVIEW' ? 'Re-submit for review' : 'Mark complete and request review'}
            </button>
          </div>
        </div>
      )) : (
        <div className="card"><p className="small">No active required training right now.</p></div>
      )}

      <div className="card">
        <div className="h2">Completed assignments</div>
        {completedItems.length ? (
          <div className="grid" style={{ gap: 12 }}>
            {completedItems.map((item) => (
              <div key={item.id} className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{item.module.title}</div>
                  <div className="small">Completed {item.reviewedAt ? new Date(item.reviewedAt).toLocaleDateString() : 'recently'}</div>
                  {item.reviewNotes && <div className="small">Supervisor notes: {item.reviewNotes}</div>}
                </div>
                <span className="badge">{statusText[item.status] || item.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="small">You have not completed any assigned modules yet.</p>
        )}
      </div>
    </div>
  );
}
