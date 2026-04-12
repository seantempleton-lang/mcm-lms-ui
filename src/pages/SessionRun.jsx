import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'

function outcomePill(outcome){
  if (outcome === 'COMPETENT') return <span className="pill good">✅ Competent</span>
  if (outcome === 'NEEDS_FOLLOWUP') return <span className="pill warn">⚠ Needs follow-up</span>
  return <span className="pill">—</span>
}

export default function SessionRun() {
  const { id } = useParams()
  const [session, setSession] = useState(null)
  const [module, setModule] = useState(null)
  const [err, setErr] = useState('')

  const [attendance, setAttendance] = useState({})
  const [assessments, setAssessments] = useState({})

  // NEW: user lookup
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [adding, setAdding] = useState(false)

  const [savingAtt, setSavingAtt] = useState(false)
  const [savingAss, setSavingAss] = useState(false)
  const [awarding, setAwarding] = useState(false)

  async function load(){
    setErr('')
    try{
      const s = await api(`/sessions/${id}`)
      setSession(s)
      const mods = await api('/modules')
      const m = (mods || []).find(x => x.id === s.moduleId)
      setModule(m || null)

      const att = {}
      ;(s.attendance || []).forEach(a => { att[a.userId] = a.attended })
      setAttendance(att)

      const ass = {}
      ;(s.assessments || []).forEach(a => {
        ass[`${a.userId}|${a.competencyId}`] = { outcome: a.outcome, notes: a.notes || '' }
      })
      setAssessments(ass)
    } catch(e){
      setErr('Failed to load session')
    }
  }

  useEffect(()=>{ load() }, [id])

  const competencies = useMemo(()=> (module?.competencies || []).map(mc => mc.competency), [module])

  const attendees = useMemo(()=>{
    return (session?.attendance || []).map(a => ({
      userId: a.userId,
      name: a.user?.name || a.userId,
      email: a.user?.email,
      attended: attendance[a.userId] ?? a.attended ?? true
    }))
  }, [session, attendance])

  function setAtt(userId, val){
    setAttendance(prev => ({ ...prev, [userId]: val }))
  }

  function setAss(userId, competencyId, patch){
    const key = `${userId}|${competencyId}`
    setAssessments(prev => ({
      ...prev,
      [key]: { outcome: prev[key]?.outcome || '', notes: prev[key]?.notes || '', ...patch }
    }))
  }

  async function searchUsers(){
    try{
      const data = await api(`/users?q=${encodeURIComponent(q)}`)
      setResults(data || [])
    } catch {
      setResults([])
    }
  }

  async function addAttendee(user){
    if (!session) return
    setAdding(true)
    setErr('')
    try{
      // create attendance row via attendance endpoint
      await api(`/sessions/${session.id}/attendance`, {
        method:'POST',
        body: JSON.stringify({ attendees: [{ userId: user.id, attended: true }] })
      })
      await load()
      setQ('')
      setResults([])
    } catch {
      setErr('Failed to add attendee')
    } finally {
      setAdding(false)
    }
  }

  async function saveAttendance(){
    if (!session) return
    setSavingAtt(true)
    setErr('')
    try{
      const payload = { attendees: attendees.map(a => ({ userId: a.userId, attended: attendance[a.userId] ?? true })) }
      await api(`/sessions/${session.id}/attendance`, { method:'POST', body: JSON.stringify(payload) })
      await load()
    } catch{
      setErr('Failed to save attendance')
    } finally {
      setSavingAtt(false)
    }
  }

  async function saveAssessments(){
    if (!session) return
    setSavingAss(true)
    setErr('')
    try{
      const list = []
      attendees.forEach(a => {
        competencies.forEach(c => {
          const key = `${a.userId}|${c.id}`
          const v = assessments[key]
          if (v?.outcome) list.push({ userId: a.userId, competencyId: c.id, outcome: v.outcome, notes: v.notes || '' })
        })
      })
      if (!list.length) throw new Error('No assessments')
      await api(`/sessions/${session.id}/assessments`, { method:'POST', body: JSON.stringify({ assessments: list }) })
      await load()
    } catch {
      setErr('Failed to save assessments')
    } finally {
      setSavingAss(false)
    }
  }

  async function awardCompetencies(){
    if (!session) return
    setAwarding(true)
    setErr('')
    try{
      const awards = []
      attendees.forEach(a => {
        competencies.forEach(c => {
          const key = `${a.userId}|${c.id}`
          const v = assessments[key]
          if (v?.outcome === 'COMPETENT') awards.push({ userId: a.userId, competencyId: c.id, notes: v.notes || '' })
        })
      })
      if (!awards.length) throw new Error('No competent outcomes')
      for (const aw of awards) {
        await api(`/competencies/${aw.competencyId}/award`, {
          method:'POST',
          body: JSON.stringify({ userId: aw.userId, evidenceType: 'SESSION', sessionId: session.id, notes: aw.notes })
        })
      }
      await load()
    } catch {
      setErr('Awarding failed (possible duplicates)')
    } finally {
      setAwarding(false)
    }
  }

  if (!session) return <div className="card"><p>Loading…</p></div>

  return (
    <div className="grid">
      <div className="card">
        <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <div className="h1">Run session</div>
            <div style={{fontWeight:700}}>{session.module?.title}</div>
            <div className="small">{new Date(session.date).toLocaleString()} · Facilitator: {session.facilitator?.name || '—'}</div>
          </div>
          <Link className="btn ghost" to="/supervisor/sessions">Back</Link>
        </div>
        {err && <p style={{color:'var(--bad)'}}>{err}</p>}
      </div>

      <div className="card">
        <div className="h2">Add attendee</div>
        <p className="small">Search by name or email, then Add.</p>
        <div className="row" style={{alignItems:'center'}}>
          <input className="input" style={{flex:1}} value={q} onChange={e=>setQ(e.target.value)} placeholder="Search users…" />
          <button className="btn secondary" onClick={searchUsers} disabled={!q}>Search</button>
        </div>
        {!!results.length && (
          <div className="grid" style={{marginTop:10, gap:10}}>
            {results.map(u => (
              <div key={u.id} className="card" style={{background:'var(--panel2)'}}>
                <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:700}}>{u.name} <span className="badge">{u.role}</span></div>
                    <div className="small">{u.email}</div>
                  </div>
                  <button className="btn" disabled={adding} onClick={()=>addAttendee(u)}>Add</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid two">
        <div className="card">
          <div className="h2">Attendance</div>
          <div className="grid" style={{gap:10}}>
            {attendees.map(a => (
              <div key={a.userId} className="card" style={{background:'var(--panel2)'}}>
                <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:700}}>{a.name}</div>
                    <div className="small">{a.email || a.userId}</div>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" checked={attendance[a.userId] ?? true} onChange={e=>setAtt(a.userId, e.target.checked)} />
                    <span className="small">Present</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="h2">Competencies to assess</div>
          <div className="grid" style={{gap:10}}>
            {competencies.map(c => (
              <div key={c.id} className="card" style={{background:'var(--panel2)'}}>
                <div style={{fontWeight:700}}>{c.code} — {c.title}</div>
                <div className="small">{c.category}</div>
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
          <div className="grid" style={{gap:12}}>
            {attendees.map(a => (
              <div key={a.userId} className="card" style={{background:'var(--panel2)'}}>
                <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
                  <div style={{fontWeight:800}}>{a.name}</div>
                  <span className="badge">{attendance[a.userId] === false ? 'Not present' : 'Present'}</span>
                </div>
                <div className="grid" style={{gap:10, marginTop:10}}>
                  {competencies.map(c => {
                    const key = `${a.userId}|${c.id}`
                    const v = assessments[key] || { outcome:'', notes:'' }
                    return (
                      <div key={c.id} className="card" style={{background:'rgba(18,27,48,.7)'}}>
                        <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
                          <div>
                            <div style={{fontWeight:700}}>{c.code} — {c.title}</div>
                            <div className="small">{c.category}</div>
                          </div>
                          <div>{outcomePill(v.outcome)}</div>
                        </div>
                        <div className="row" style={{marginTop:10}}>
                          <label className="toggle"><input type="radio" name={`o-${key}`} checked={v.outcome==='COMPETENT'} onChange={()=>setAss(a.userId,c.id,{outcome:'COMPETENT'})} /><span className="small">Competent</span></label>
                          <label className="toggle"><input type="radio" name={`o-${key}`} checked={v.outcome==='NEEDS_FOLLOWUP'} onChange={()=>setAss(a.userId,c.id,{outcome:'NEEDS_FOLLOWUP'})} /><span className="small">Needs follow-up</span></label>
                          <button className="btn ghost" onClick={()=>setAss(a.userId,c.id,{outcome:'',notes:''})}>Clear</button>
                        </div>
                        <div style={{marginTop:10}}>
                          <label className="small">Notes (optional)</label>
                          <textarea className="input" rows={2} value={v.notes} onChange={e=>setAss(a.userId,c.id,{notes:e.target.value})} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sticky-actions"><div className="inner">
        <button className="btn secondary" disabled={savingAtt || !attendees.length} onClick={saveAttendance}>{savingAtt?'Saving…':'Save attendance'}</button>
        <button className="btn secondary" disabled={savingAss || !attendees.length || !competencies.length} onClick={saveAssessments}>{savingAss?'Saving…':'Save assessments'}</button>
        <button className="btn" disabled={awarding || !attendees.length || !competencies.length} onClick={awardCompetencies}>{awarding?'Awarding…':'Award competent'}</button>
      </div></div>
    </div>
  )
}
