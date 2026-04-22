import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';

const CATEGORY_LABELS = {
  HSE: 'Health, Safety & Environment',
  GEOTECH: 'Geotechnical Drilling',
  WATER: 'Water Drilling',
  PLANT: 'Plant & Equipment',
  ADMIN: 'Administration & Compliance'
};

function moduleCategoryLabel(category) {
  return CATEGORY_LABELS[category] || category || 'Uncategorised';
}

const statusText = {
  ALL: 'All assignments',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In progress',
  PENDING_REVIEW: 'Pending review',
  COMPLETED: 'Completed'
};

function formatDuration(seconds) {
  if (seconds === null || seconds === undefined) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (!mins) return `${secs}s`;
  if (!secs) return `${mins}m`;
  return `${mins}m ${secs}s`;
}

function getAssessmentSummary(item) {
  if (item?.assessmentTotalQuestions === null || item?.assessmentTotalQuestions === undefined) return null;
  return `${item.assessmentScore}/${item.assessmentTotalQuestions} correct | ${item.assessmentAttempts} attempt${item.assessmentAttempts === 1 ? '' : 's'} | ${formatDuration(item.assessmentDurationSeconds)}`;
}

function getReportAssessmentSummary(summary) {
  if (!summary || summary.totalQuestions === null || summary.totalQuestions === undefined) return null;
  return `${summary.score}/${summary.totalQuestions} correct | ${summary.attempts} attempt${summary.attempts === 1 ? '' : 's'} | ${formatDuration(summary.durationSeconds)}`;
}

export default function SupervisorTraining() {
  const [assignments, setAssignments] = useState([]);
  const [learners, setLearners] = useState([]);
  const [modules, setModules] = useState([]);
  const [form, setForm] = useState({ learnerId: '', moduleId: '' });
  const [reviewNotes, setReviewNotes] = useState({});
  const [reports, setReports] = useState({});
  const [filter, setFilter] = useState('PENDING_REVIEW');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');

  async function load(nextFilter = filter) {
    setLoading(true);
    setError('');
    try {
      const statusQuery = nextFilter && nextFilter !== 'ALL' ? `?status=${encodeURIComponent(nextFilter)}` : '';
      const [assignmentData, userData, moduleData] = await Promise.all([
        api(`/training${statusQuery}`),
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

  useEffect(() => { load(filter); }, [filter]);

  const pendingReview = useMemo(() => assignments.filter((item) => item.status === 'PENDING_REVIEW'), [assignments]);

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
      await load(filter);
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
      await load(filter);
    } catch {
      setError('Failed to review required training');
    } finally {
      setBusyId('');
    }
  }

  async function fetchReport(learnerId) {
    if (reports[learnerId]) {
      setReports((current) => ({ ...current, [learnerId]: null }));
      return;
    }
    try {
      const report = await api(`/training/report/${learnerId}`);
      setReports((current) => ({ ...current, [learnerId]: report }));
    } catch {
      setError('Failed to load learner report');
    }
  }

  return (
    <div className="grid">
      <div className="card">
        <div className="h1">Required Training</div>
        <p className="small">Assign modules to learners, review completed work, and award competencies when approved.</p>
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
                  <option key={learner.id} value={learner.id}>{learner.name} ({learner.username})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="small">Module</label>
              <select className="input" value={form.moduleId} onChange={(event) => setForm((current) => ({ ...current, moduleId: event.target.value }))}>
                <option value="" disabled>Select module</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.title} ({moduleCategoryLabel(module.category)})
                  </option>
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
          <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            {Object.keys(statusText).map((value) => (
              <button
                key={value}
                className={`btn ${filter === value ? '' : 'ghost'}`}
                style={{ padding: '6px 12px' }}
                onClick={() => setFilter(value)}
              >
                {statusText[value]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? <div className="card"><p>Loading...</p></div> : assignments.length ? assignments.map((item) => (
        <div key={item.id} className="card">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="h2">{item.learner.name} - {item.module.title}</div>
              <p className="small">Status: <span className="badge">{statusText[item.status] || item.status}</span></p>
              <p className="small">Assigned {new Date(item.assignedAt).toLocaleDateString()}</p>
              {item.submittedAt && <p className="small">Submitted {new Date(item.submittedAt).toLocaleString()}</p>}
              {getAssessmentSummary(item) && <p className="small">Assessment result: {getAssessmentSummary(item)}</p>}
              {item.learnerNotes && <p className="small" style={{ marginTop: 8 }}>Learner notes: {item.learnerNotes}</p>}
            </div>
            <button className="btn ghost" onClick={() => fetchReport(item.learner.id)}>
              {reports[item.learner.id] ? 'Hide learner report' : 'View learner report'}
            </button>
          </div>

          {reports[item.learner.id] && (
            <div className="grid two" style={{ marginTop: 14 }}>
              <div className="card" style={{ background: 'var(--panel2)' }}>
                <div className="h2" style={{ marginBottom: 12 }}>{reports[item.learner.id].learner.name} report</div>
                <div className="grid" style={{ gap: 8 }}>
                  <div className="row" style={{ justifyContent: 'space-between' }}><span>Assigned</span><span className="badge">{reports[item.learner.id].summary.assigned}</span></div>
                  <div className="row" style={{ justifyContent: 'space-between' }}><span>Completed</span><span className="badge">{reports[item.learner.id].summary.completed}</span></div>
                  <div className="row" style={{ justifyContent: 'space-between' }}><span>Pending review</span><span className="badge">{reports[item.learner.id].summary.pendingReview}</span></div>
                  <div className="row" style={{ justifyContent: 'space-between' }}><span>Competencies awarded</span><span className="badge">{reports[item.learner.id].summary.competenciesAwarded}</span></div>
                </div>
              </div>
              <div className="card" style={{ background: 'var(--panel2)' }}>
                <div className="h2" style={{ marginBottom: 12 }}>Completed history</div>
                {reports[item.learner.id].completedAssignments.length ? reports[item.learner.id].completedAssignments.map((assignment) => (
                  <div key={assignment.id} className="small" style={{ marginBottom: 8 }}>
                    {assignment.moduleTitle} - {assignment.reviewedAt ? new Date(assignment.reviewedAt).toLocaleDateString() : 'Completed'}
                    {getReportAssessmentSummary(assignment.assessmentSummary) ? ` | ${getReportAssessmentSummary(assignment.assessmentSummary)}` : ''}
                  </div>
                )) : <p className="small">No completed assignments yet.</p>}
              </div>
            </div>
          )}

          <div className="grid" style={{ gap: 10, marginTop: 14 }}>
            <div className="small">Competencies to award on approval</div>
            {(item.module.competencies || []).map((mapping) => (
              <div key={mapping.id} className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{mapping.competency.code} - {mapping.competency.title}</span>
                <span className="badge">{mapping.evidenceType}</span>
              </div>
            ))}
          </div>

          {item.status === 'PENDING_REVIEW' && (
            <>
              <div style={{ marginTop: 14 }}>
                <label className="small">Supervisor review notes</label>
                <textarea
                  className="input"
                  rows={3}
                  value={reviewNotes[item.id] || ''}
                  onChange={(event) => setReviewNotes((current) => ({ ...current, [item.id]: event.target.value }))}
                />
              </div>
              <div className="row" style={{ marginTop: 16, justifyContent: 'flex-end' }}>
                <button className="btn" disabled={busyId === item.id} onClick={() => reviewTraining(item.id)}>
                  {busyId === item.id ? 'Reviewing...' : 'Approve and award competencies'}
                </button>
              </div>
            </>
          )}
        </div>
      )) : (
        <div className="card"><p className="small">No assignments match this filter.</p></div>
      )}
    </div>
  );
}
