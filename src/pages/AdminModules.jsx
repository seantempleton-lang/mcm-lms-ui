import { useEffect, useState } from 'react';
import { api } from '../api';

const emptyForm = {
  title: '',
  mode: 'INDIVIDUAL',
  category: 'GEOTECH',
  description: '',
  learningObjectives: '',
  estimatedMinutes: '',
  contentUrl: '',
  contentBody: ''
};

const CATEGORY_OPTIONS = [
  { value: 'HSE', label: 'Health, Safety & Environment' },
  { value: 'GEOTECH', label: 'Geotechnical Drilling' },
  { value: 'WATER', label: 'Water Drilling' },
  { value: 'PLANT', label: 'Plant & Equipment' },
  { value: 'ADMIN', label: 'Administration & Compliance' },
];

function categoryLabel(category) {
  return CATEGORY_OPTIONS.find((option) => option.value === category)?.label || category || 'Uncategorised';
}

export default function AdminModules() {
  const [modules, setModules] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await api('/modules');
      setModules(data || []);
    } catch {
      setError('Failed to load modules');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function selectModule(id) {
    setSelectedId(id);
    const item = modules.find((module) => module.id === id);
    if (!item) {
      setForm(emptyForm);
      return;
    }
    setForm({
      title: item.title || '',
      mode: item.mode || 'INDIVIDUAL',
      category: item.category || 'GEOTECH',
      description: item.description || '',
      learningObjectives: item.learningObjectives || '',
      estimatedMinutes: item.estimatedMinutes ? String(item.estimatedMinutes) : '',
      contentUrl: item.contentUrl || '',
      contentBody: item.contentBody || ''
    });
  }

  async function saveModule(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        category: form.category || undefined,
        estimatedMinutes: form.estimatedMinutes ? Number(form.estimatedMinutes) : undefined,
        description: form.description || undefined,
        learningObjectives: form.learningObjectives || undefined,
        contentUrl: form.contentUrl || undefined,
        contentBody: form.contentBody || undefined,
      };

      if (selectedId) {
        await api(`/modules/${selectedId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
      } else {
        await api('/modules', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      await load();
      if (!selectedId) {
        setForm(emptyForm);
      }
    } catch {
      setError('Failed to save module');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid">
      <div className="card">
        <div className="h1">Module Management</div>
        <p className="small">Create and maintain self-paced module content for learner assignments.</p>
        {error && <p style={{ color: 'var(--bad)', marginTop: 12 }}>{error}</p>}
      </div>

      <div className="grid two">
        <div className="card">
          <div className="h2">Existing modules</div>
          {loading ? <p className="small">Loading...</p> : (
            <div className="grid" style={{ gap: 10 }}>
              <button className={`btn ghost ${!selectedId ? 'active' : ''}`} onClick={() => { setSelectedId(''); setForm(emptyForm); }}>
                New module
              </button>
              {modules.map((module) => (
                <button
                  key={module.id}
                  className="btn ghost"
                  style={{ justifyContent: 'space-between', textAlign: 'left' }}
                  onClick={() => selectModule(module.id)}
                >
                  <span>{module.title}</span>
                  <div className="row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <span className="badge">{categoryLabel(module.category)}</span>
                    <span className="badge">{module.mode}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="h2">{selectedId ? 'Edit module' : 'New module'}</div>
          <form className="grid" onSubmit={saveModule}>
            <div>
              <label className="small">Title</label>
              <input className="input" required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            </div>
            <div>
              <label className="small">Mode</label>
              <select className="input" value={form.mode} onChange={(event) => setForm((current) => ({ ...current, mode: event.target.value }))}>
                {['INDIVIDUAL', 'FACILITATED', 'HYBRID'].map((mode) => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="small">Category</label>
              <select className="input" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="small">Description</label>
              <textarea className="input" rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            </div>
            <div>
              <label className="small">Learning objectives</label>
              <textarea className="input" rows={4} value={form.learningObjectives} onChange={(event) => setForm((current) => ({ ...current, learningObjectives: event.target.value }))} />
            </div>
            <div>
              <label className="small">Estimated minutes</label>
              <input className="input" type="number" min="1" value={form.estimatedMinutes} onChange={(event) => setForm((current) => ({ ...current, estimatedMinutes: event.target.value }))} />
            </div>
            <div>
              <label className="small">Content URL</label>
              <input className="input" type="url" value={form.contentUrl} onChange={(event) => setForm((current) => ({ ...current, contentUrl: event.target.value }))} />
            </div>
            <div>
              <label className="small">Inline content</label>
              <textarea className="input" rows={8} value={form.contentBody} onChange={(event) => setForm((current) => ({ ...current, contentBody: event.target.value }))} />
            </div>
            <button className="btn" disabled={saving}>{saving ? 'Saving...' : selectedId ? 'Save module' : 'Create module'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
