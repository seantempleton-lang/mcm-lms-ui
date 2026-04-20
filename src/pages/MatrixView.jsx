import { useEffect, useState } from 'react';
import { api } from '../api';

export default function MatrixView() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    api('/matrix')
      .then(setData)
      .catch(() => setErr('Failed to load matrix'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card"><p>Loading matrix...</p></div>;
  if (err) return <div className="card"><p style={{ color: 'var(--bad)' }}>{err}</p></div>;
  if (!data) return null;

  const { competencies, users } = data;
  const totalCells = users.length * competencies.length;
  const awardedCells = users.reduce((sum, user) => (
    sum + competencies.filter((competency) => user.awards[competency.code] !== null).length
  ), 0);
  const pct = totalCells ? Math.round((awardedCells / totalCells) * 100) : 0;

  return (
    <div className="grid" onClick={() => setTooltip(null)}>
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="h1">Competency Matrix</div>
            <p className="small">{users.length} people | {competencies.length} competencies | {pct}% awarded</p>
          </div>
          <div className="row" style={{ gap: 16, alignItems: 'center' }}>
            <div className="row" style={{ gap: 6, alignItems: 'center' }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--good)', opacity: 0.85 }} />
              <span className="small">Awarded</span>
            </div>
            <div className="row" style={{ gap: 6, alignItems: 'center' }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--panel2)', border: '1px solid var(--line)' }} />
              <span className="small">Not awarded</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 600 }}>
          <thead>
            <tr>
              <th
                style={{
                  padding: '8px 12px',
                  textAlign: 'left',
                  borderBottom: '1px solid var(--line)',
                  color: 'var(--muted)',
                  fontSize: '0.85rem',
                  minWidth: 160
                }}
              >
                Person
              </th>
              {competencies.map((competency) => (
                <th
                  key={competency.id}
                  style={{
                    padding: '8px 10px',
                    textAlign: 'center',
                    borderBottom: '1px solid var(--line)',
                    color: 'var(--muted)',
                    fontSize: '0.8rem',
                    minWidth: 100
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--brand)' }}>{competency.code}</div>
                  <div
                    style={{
                      fontWeight: 400,
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: 100
                    }}
                  >
                    {competency.title}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const awarded = competencies.filter((competency) => user.awards[competency.code]).length;
              return (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 700 }}>{user.name}</div>
                    <div className="row" style={{ gap: 6, marginTop: 2 }}>
                      <span className="badge" style={{ fontSize: '0.75rem', padding: '2px 7px' }}>
                        {user.role}
                      </span>
                      <span className="small" style={{ fontSize: '0.78rem' }}>
                        {awarded}/{competencies.length}
                      </span>
                    </div>
                  </td>
                  {competencies.map((competency) => {
                    const award = user.awards[competency.code];
                    return (
                      <td key={competency.id} style={{ padding: '8px 10px', textAlign: 'center' }}>
                        <div
                          onClick={(event) => {
                            event.stopPropagation();
                            if (!award) return;
                            setTooltip({
                              x: event.clientX,
                              y: event.clientY,
                              content: {
                                user: user.name,
                                code: competency.code,
                                awardedAt: new Date(award.awardedAt).toLocaleDateString(),
                                awardedBy: award.awardedBy?.name,
                                session: award.session?.location,
                                evidenceType: award.evidenceType,
                                notes: award.notes
                              }
                            });
                          }}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            margin: '0 auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: award ? 'rgba(52,211,153,0.2)' : 'var(--panel2)',
                            border: `1px solid ${award ? 'rgba(52,211,153,0.5)' : 'var(--line)'}`,
                            cursor: award ? 'pointer' : 'default',
                            transition: 'transform 0.1s'
                          }}
                          title={award ? `Awarded ${new Date(award.awardedAt).toLocaleDateString()}` : 'Not awarded'}
                        >
                          {award
                            ? <span style={{ color: 'var(--good)', fontSize: '1rem' }}>OK</span>
                            : <span style={{ color: 'var(--line)', fontSize: '0.8rem' }}>-</span>}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {tooltip && (
        <div
          onClick={(event) => event.stopPropagation()}
          style={{
            position: 'fixed',
            top: Math.min(tooltip.y + 12, window.innerHeight - 200),
            left: Math.min(tooltip.x + 12, window.innerWidth - 280),
            zIndex: 200,
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 12,
            padding: 16,
            width: 260,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--brand)' }}>
            {tooltip.content.code}
          </div>
          <div className="grid" style={{ gap: 6 }}>
            {[
              ['Person', tooltip.content.user],
              ['Awarded', tooltip.content.awardedAt],
              ['Awarded by', tooltip.content.awardedBy],
              ['Session', tooltip.content.session],
              ['Evidence', tooltip.content.evidenceType],
              tooltip.content.notes && ['Notes', tooltip.content.notes]
            ].filter(Boolean).map(([label, value]) => value && (
              <div key={label} className="row" style={{ justifyContent: 'space-between', gap: 8 }}>
                <span className="small" style={{ color: 'var(--muted)' }}>{label}</span>
                <span className="small" style={{ textAlign: 'right', maxWidth: 160 }}>{value}</span>
              </div>
            ))}
          </div>
          <button className="btn ghost" style={{ width: '100%', marginTop: 12, padding: '6px' }} onClick={() => setTooltip(null)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}
