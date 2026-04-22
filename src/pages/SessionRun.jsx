import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';

function outcomePill(outcome) {
  if (outcome === 'COMPETENT') return <span className="pill good">Competent</span>;
  if (outcome === 'NEEDS_FOLLOWUP') return <span className="pill warn">Needs follow-up</span>;
  return <span className="pill">-</span>;
}

function buildAssessmentMap(items) {
  const map = {};
  (items || []).forEach((item) => {
    map[`${item.userId}|${item.competencyId}`] = {
      outcome: item.outcome,
      notes: item.notes || ''
    };
  });
  return map;
}

function mapsMatch(left, right) {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const key of keys) {
    const leftValue = left[key] || { outcome: '', notes: '' };
    const rightValue = right[key] || { outcome: '', notes: '' };
    if (leftValue.outcome !== rightValue.outcome || leftValue.notes !== rightValue.notes) {
      return false;
    }
  }
  return true;
}

export default function SessionRun() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [module, setModule] = useState(null);
  const [err, setErr] = useState('');
  const [attendance, setAttendance] = useState({});
  const [assessments, setAssessments] = useState({});
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [adding, setAdding] = useState(false);
  const [savingAtt, setSavingAtt] = useState(false);
  const [savingAss, setSavingAss] = useState(false);
  const [awarding, setAwarding] = useState(false);

  async function load() {
    setErr('');
    try {
      const s = await api(`/sessions/${id}`);
      setSession(s);
      const mods = await api('/modules');
      const m = (mods || []).find((item) => item.id === s.moduleId);
      setModule(m || null);

      const nextAttendance = {};
      (s.attendance || []).forEach((item) => {
        nextAttendance[item.userId] = item.attended;
      });
      setAttendance(nextAttendance);
      setAssessments(buildAssessmentMap(s.assessments));
    } catch {
      setErr('Failed to load session');
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  const competencies = useMemo(() => {
    return (module?.competencies || []).map((item) => item.competency).filter(Boolean);
  }, [module]);

  const attendees = useMemo(() => {
    return (session?.attendance || []).map((item) => ({
      userId: item.userId,
      name: item.user?.name || item.userId,
      username: item.user?.username,
      attended: attendance[item.userId] ?? item.attended ?? true
    }));
  }, [session, attendance]);
  const presentAttendeeIds = useMemo(() => {
    return new Set(
      attendees
        .filter((attendee) => attendee.attended !== false)
        .map((attendee) => attendee.userId)
    );
  }, [attendees]);

  const persistedAssessments = useMemo(() => buildAssessmentMap(session?.assessments), [session]);
  const hasUnsavedAssessments = useMemo(() => !mapsMatch(assessments, persistedAssessments), [assessments, persistedAssessments]);
  const hasPersistedCompetentOutcomes = useMemo(() => {
    return (session?.assessments || []).some((item) => item.outcome === 'COMPETENT');
  }, [session]);

  function setAtt(userId, value) {
    setAttendance((current) => ({ ...current, [userId]: value }));
  }

  function setAss(userId, competencyId, patch) {
    const key = `${userId}|${competencyId}`;
    setAssessments((current) => ({
      ...current,
      [key]: { outcome: current[key]?.outcome || '', notes: current[key]?.notes || '', ...patch }
    }));
  }

  function resetAss(userId, competencyId) {
    const key = `${userId}|${competencyId}`;
    const persisted = persistedAssessments[key] || { outcome: '', notes: '' };
    setAssessments((current) => ({
      ...current,
      [key]: persisted
    }));
  }

  async function searchUsers() {
    try {
      const data = await api(`/users?q=${encodeURIComponent(q)}`);
      setResults(data || []);
    } catch {
      setResults([]);
    }
  }

  async function addAttendee(user) {
    if (!session) return;
    setAdding(true);
    setErr('');
    try {
      await api(`/sessions/${session.id}/attendance`, {
        method: 'POST',
        body: JSON.stringify({ attendees: [{ userId: user.id, attended: true }] })
      });
      await load();
      setQ('');
      setResults([]);
    } catch {
      setErr('Failed to add attendee');
    } finally {
      setAdding(false);
    }
  }

  async function saveAttendance() {
    if (!session) return;
    setSavingAtt(true);
    setErr('');
    try {
      const payload = {
        attendees: attendees.map((item) => ({
          userId: item.userId,
          attended: attendance[item.userId] ?? true
        }))
      };
      await api(`/sessions/${session.id}/attendance`, { method: 'POST', body: JSON.stringify(payload) });
      await load();
    } catch {
      setErr('Failed to save attendance');
    } finally {
      setSavingAtt(false);
    }
  }

  async function saveAssessments() {
    if (!session) return;
    setSavingAss(true);
    setErr('');
    try {
      const list = [];
      attendees.forEach((attendee) => {
        if (!presentAttendeeIds.has(attendee.userId)) return;
        competencies.forEach((competency) => {
          const key = `${attendee.userId}|${competency.id}`;
          const value = assessments[key];
          if (value?.outcome) {
            list.push({
              userId: attendee.userId,
              competencyId: competency.id,
              outcome: value.outcome,
              notes: value.notes || ''
            });
          }
        });
      });
      if (!list.length) throw new Error('No assessments');
      await api(`/sessions/${session.id}/assessments`, { method: 'POST', body: JSON.stringify({ assessments: list }) });
      await load();
    } catch {
      setErr('Failed to save assessments');
    } finally {
      setSavingAss(false);
    }
  }

  async function awardCompetencies() {
    if (!session) return;
    if (hasUnsavedAssessments) {
      setErr('Save assessments before awarding competencies');
      return;
    }

    setAwarding(true);
    setErr('');
    try {
      const awards = [];
      (session.assessments || []).forEach((item) => {
        if (item.outcome === 'COMPETENT' && presentAttendeeIds.has(item.userId)) {
          awards.push({
            userId: item.userId,
            competencyId: item.competencyId,
            notes: item.notes || ''
          });
        }
      });

      if (!awards.length) throw new Error('No competent outcomes');

      await api(`/sessions/${session.id}/awards`, {
        method: 'POST',
        body: JSON.stringify({ awards })
      });
      await load();
    } catch {
      setErr('Awarding failed');
    } finally {
      setAwarding(false);
    }
  }

  if (!session) return <div className="card"><p>Loading...</p></div>;

  return (
    <div className="grid">
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="h1">Run session</div>
            <div style={{ fontWeight: 700 }}>{session.module?.title}</div>
            <div className="small">
              {new Date(session.date).toLocaleString()} | Facilitator: {session.facilitator?.name || '-'}
            </div>
          </div>
          <Link className="btn ghost" to="/supervisor/sessions">Back</Link>
        </div>
        {err && <p style={{ color: 'var(--bad)' }}>{err}</p>}
        {hasUnsavedAssessments && (
          <p className="small">Assessments have changed locally. Save them before awarding competencies.</p>
        )}
      </div>

      <div className="card">
        <div className="h2">Add attendee</div>
        <p className="small">Search by name or username, then add them to this session.</p>
        <div className="row" style={{ alignItems: 'center' }}>
          <input
            className="input"
            style={{ flex: 1 }}
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search users..."
          />
          <button className="btn secondary" onClick={searchUsers} disabled={!q}>Search</button>
        </div>
        {!!results.length && (
          <div className="grid" style={{ marginTop: 10, gap: 10 }}>
            {results.map((user) => (
              <div key={user.id} className="card" style={{ background: 'var(--panel2)' }}>
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{user.name} <span className="badge">{user.role}</span></div>
                    <div className="small">{user.username}</div>
                  </div>
                  <button className="btn" disabled={adding} onClick={() => addAttendee(user)}>Add</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid two">
        <div className="card">
          <div className="h2">Attendance</div>
          <div className="grid" style={{ gap: 10 }}>
            {attendees.map((attendee) => (
              <div key={attendee.userId} className="card" style={{ background: 'var(--panel2)' }}>
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{attendee.name}</div>
                    <div className="small">{attendee.username || attendee.userId}</div>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={attendance[attendee.userId] ?? true}
                      onChange={(event) => setAtt(attendee.userId, event.target.checked)}
                    />
                    <span className="small">Present</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="h2">Competencies to assess</div>
          <div className="grid" style={{ gap: 10 }}>
            {competencies.map((competency) => (
              <div key={competency.id} className="card" style={{ background: 'var(--panel2)' }}>
                <div style={{ fontWeight: 700 }}>{competency.code} - {competency.title}</div>
                <div className="small">{competency.category}</div>
              </div>
            ))}
            {!competencies.length && <p className="small">No competencies mapped to this module yet.</p>}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="h2">Assessments</div>
        {!attendees.length || !competencies.length ? (
          <p className="small">Add attendees and map competencies to the module to use assessments.</p>
        ) : (
          <div className="grid" style={{ gap: 12 }}>
            {attendees.map((attendee) => (
              <div key={attendee.userId} className="card" style={{ background: 'var(--panel2)' }}>
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800 }}>{attendee.name}</div>
                  <span className="badge">{attendance[attendee.userId] === false ? 'Not present' : 'Present'}</span>
                </div>
                <div className="grid" style={{ gap: 10, marginTop: 10 }}>
                  {competencies.map((competency) => {
                    const key = `${attendee.userId}|${competency.id}`;
                    const value = assessments[key] || { outcome: '', notes: '' };
                    return (
                      <div key={competency.id} className="card" style={{ background: 'rgba(18,27,48,.7)' }}>
                        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 700 }}>{competency.code} - {competency.title}</div>
                            <div className="small">{competency.category}</div>
                          </div>
                          <div>{outcomePill(value.outcome)}</div>
                        </div>
                        <div className="row" style={{ marginTop: 10 }}>
                          <label className="toggle">
                            <input
                              type="radio"
                              name={`o-${key}`}
                              disabled={attendance[attendee.userId] === false}
                              checked={value.outcome === 'COMPETENT'}
                              onChange={() => setAss(attendee.userId, competency.id, { outcome: 'COMPETENT' })}
                            />
                            <span className="small">Competent</span>
                          </label>
                          <label className="toggle">
                            <input
                              type="radio"
                              name={`o-${key}`}
                              disabled={attendance[attendee.userId] === false}
                              checked={value.outcome === 'NEEDS_FOLLOWUP'}
                              onChange={() => setAss(attendee.userId, competency.id, { outcome: 'NEEDS_FOLLOWUP' })}
                            />
                            <span className="small">Needs follow-up</span>
                          </label>
                          <button className="btn ghost" onClick={() => resetAss(attendee.userId, competency.id)}>
                            Reset
                          </button>
                        </div>
                        <div style={{ marginTop: 10 }}>
                          <label className="small">Notes (optional)</label>
                          <textarea
                            className="input"
                            rows={2}
                            value={value.notes}
                            disabled={attendance[attendee.userId] === false}
                            onChange={(event) => setAss(attendee.userId, competency.id, { notes: event.target.value })}
                          />
                        </div>
                        {attendance[attendee.userId] === false && (
                          <p className="small" style={{ marginTop: 10 }}>
                            Absent attendees are excluded from saved assessments and competency awards.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sticky-actions"><div className="inner">
        <button className="btn secondary" disabled={savingAtt || !attendees.length} onClick={saveAttendance}>
          {savingAtt ? 'Saving...' : 'Save attendance'}
        </button>
        <button className="btn secondary" disabled={savingAss || !attendees.length || !competencies.length} onClick={saveAssessments}>
          {savingAss ? 'Saving...' : 'Save assessments'}
        </button>
        <button
          className="btn"
          disabled={awarding || hasUnsavedAssessments || !hasPersistedCompetentOutcomes}
          onClick={awardCompetencies}
        >
          {awarding ? 'Awarding...' : 'Award competent'}
        </button>
      </div></div>
    </div>
  );
}
