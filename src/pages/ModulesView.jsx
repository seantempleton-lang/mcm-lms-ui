import { useEffect, useState } from 'react';
import { api } from '../api';

const CATEGORY_LABELS = {
  HSE:     { label: 'Health, Safety & Environment', colour: 'var(--mcm-red)' },
  GEOTECH: { label: 'Geotechnical Drilling',        colour: 'var(--mcm-blue)' },
  WATER:   { label: 'Water Drilling',               colour: '#0284c7' },
  PLANT:   { label: 'Plant & Equipment',            colour: '#7c3aed' },
  ADMIN:   { label: 'Administration & Compliance',  colour: 'var(--mcm-grey)' },
};

function categoryMeta(cat) {
  return CATEGORY_LABELS[cat] || { label: cat, colour: 'var(--mcm-grey)' };
}

const MODE_LABELS = {
  INDIVIDUAL:  'Individual',
  FACILITATED: 'Facilitated',
  HYBRID:      'Hybrid',
};

export default function ModulesView() {
  const [modules, setModules] = useState([]);
  const [err, setErr]         = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/modules')
      .then(data => {
        // Sort by category then title
        const sorted = (data || []).sort((a, b) =>
          (a.category || '').localeCompare(b.category || '') ||
          a.title.localeCompare(b.title)
        );
        setModules(sorted);
      })
      .catch(() => setErr('Failed to load modules'))
      .finally(() => setLoading(false));
  }, []);

  // Group by category
  const grouped = modules.reduce((acc, mod) => {
    const cat = mod.category || 'OTHER';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(mod);
    return acc;
  }, {});

  if (loading) return <div className="card"><p>Loading modules...</p></div>;

  return (
    <div className="grid">
      <div className="card" style={{ borderTop: '3px solid var(--mcm-red)' }}>
        <div className="h1">Training Modules</div>
        <p className="small">
          {modules.length} module{modules.length !== 1 ? 's' : ''} across {Object.keys(grouped).length} categor{Object.keys(grouped).length !== 1 ? 'ies' : 'y'}
        </p>
        {err && <p style={{ color: 'var(--bad)', marginTop: 8 }}>{err}</p>}
      </div>

      {Object.entries(grouped).map(([cat, items]) => {
        const meta = categoryMeta(cat);
        return (
          <div key={cat} className="card">
            {/* Category header */}
            <div className="row" style={{ alignItems: 'center', marginBottom: 16, gap: 10 }}>
              <div style={{
                width: 4, height: 32, borderRadius: 2,
                background: meta.colour, flexShrink: 0
              }} />
              <div>
                <div className="h2" style={{ margin: 0, color: meta.colour }}>
                  {meta.label}
                </div>
                <div className="small">{items.length} module{items.length !== 1 ? 's' : ''}</div>
              </div>
            </div>

            {/* Module cards */}
            <div className="grid" style={{ gap: 10 }}>
              {items.map(mod => {
                const content = (() => {
                  try { return JSON.parse(mod.description || '{}'); }
                  catch { return {}; }
                })();
                const sectionCount = content.sections?.length || 0;

                return (
                  <div key={mod.id} className="card" style={{
                    background: 'var(--panel2)',
                    borderLeft: `3px solid ${meta.colour}`,
                  }}>
                    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>{mod.title}</div>
                        {content.overview && (
                          <p className="small" style={{ marginBottom: 8, lineHeight: 1.5 }}>
                            {content.overview.length > 120
                              ? content.overview.slice(0, 120) + '…'
                              : content.overview}
                          </p>
                        )}
                        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                          <span className="badge">{MODE_LABELS[mod.mode] || mod.mode}</span>
                          {sectionCount > 0 && (
                            <span className="badge">{sectionCount} sections</span>
                          )}
                          {mod.competencies?.map(mc => (
                            <span key={mc.competency.id} className="badge" style={{
                              color: meta.colour,
                              borderColor: meta.colour + '55',
                            }}>
                              {mc.competency.code}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {modules.length === 0 && !err && (
        <div className="card">
          <p className="small">No modules yet.</p>
        </div>
      )}
    </div>
  );
}