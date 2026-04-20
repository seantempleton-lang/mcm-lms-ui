import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import ModulePlayer from '../components/ModulePlayer.jsx';

const emptyForm = {
  title: '',
  mode: 'INDIVIDUAL',
  category: 'GEOTECH',
  description: '',
  learningObjectives: '',
  estimatedMinutes: '',
  contentUrl: '',
};

const CATEGORY_OPTIONS = [
  { value: 'HSE', label: 'Health, Safety & Environment' },
  { value: 'GEOTECH', label: 'Geotechnical Drilling' },
  { value: 'WATER', label: 'Water Drilling' },
  { value: 'PLANT', label: 'Plant & Equipment' },
  { value: 'ADMIN', label: 'Administration & Compliance' },
];

const EVIDENCE_TYPE_OPTIONS = [
  { value: 'COMPLETION', label: 'Completion' },
  { value: 'QUIZ', label: 'Quiz' },
  { value: 'SESSION', label: 'Session' },
  { value: 'SIGNOFF', label: 'Sign-off' },
];

const SLIDE_TYPES = [
  { value: 'hero', label: 'Hero' },
  { value: 'content', label: 'Content' },
  { value: 'bullets', label: 'Bullet list' },
  { value: 'checklist', label: 'Checklist' },
];

function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createEmptySlide(type = 'content') {
  return {
    id: createId('slide'),
    type,
    eyebrow: type === 'hero' ? 'New module' : '',
    title: '',
    body: '',
    bullets: [],
    checklist: [],
    meta: [],
    fact: '',
    tone: 'default'
  };
}

function createEmptyQuizQuestion() {
  return {
    id: createId('quiz'),
    question: '',
    options: ['', ''],
    correctIndex: 0,
    explanation: ''
  };
}

function createEmptyBuilder() {
  return {
    slides: [createEmptySlide('hero')],
    quiz: [createEmptyQuizQuestion()]
  };
}

function createEmptyCompetencyDraft(category = 'GEOTECH') {
  return {
    code: '',
    title: '',
    category,
    description: '',
    evidenceType: 'COMPLETION'
  };
}

function categoryLabel(category) {
  return CATEGORY_OPTIONS.find((option) => option.value === category)?.label || category || 'Uncategorised';
}

function safeJsonParse(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normaliseLineList(value) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinLineList(items) {
  return (items || []).join('\n');
}

function getDescriptionState(value) {
  const parsed = safeJsonParse(value);
  if (parsed?.overview) {
    return {
      text: parsed.overview,
      mode: 'structured',
      raw: parsed
    };
  }

  return {
    text: value || '',
    mode: 'plain',
    raw: null
  };
}

function normaliseSlide(slide, index) {
  return {
    id: slide.id || createId('slide'),
    type: slide.type || 'content',
    eyebrow: slide.eyebrow || (index === 0 ? 'Module intro' : `Slide ${index + 1}`),
    title: slide.title || '',
    body: slide.body || '',
    bullets: slide.bullets || [],
    checklist: slide.checklist || [],
    meta: slide.meta || [],
    fact: slide.fact || '',
    tone: slide.tone || 'default'
  };
}

function normaliseQuizQuestion(question) {
  const options = Array.isArray(question.options) && question.options.length ? question.options : ['', ''];
  return {
    id: question.id || createId('quiz'),
    question: question.question || '',
    options,
    correctIndex: typeof question.correctIndex === 'number' ? question.correctIndex : 0,
    explanation: question.explanation || ''
  };
}

function deriveBuilderFromModule(module) {
  const structuredBody = safeJsonParse(module.contentBody);
  if (structuredBody?.slides?.length) {
    return {
      slides: structuredBody.slides.map(normaliseSlide),
      quiz: (structuredBody.quiz || []).map(normaliseQuizQuestion)
    };
  }

  const legacyDescription = safeJsonParse(module.description);
  if (legacyDescription?.sections?.length) {
    return {
      slides: [
        normaliseSlide({
          type: 'hero',
          eyebrow: module.category || 'Module',
          title: module.title,
          body: legacyDescription.overview || ''
        }, 0),
        ...legacyDescription.sections.map((section, index) => normaliseSlide({
          type: Array.isArray(section.content) ? 'bullets' : 'content',
          eyebrow: section.type || `Section ${index + 1}`,
          title: section.title,
          body: Array.isArray(section.content) ? '' : section.content,
          bullets: Array.isArray(section.content) ? section.content : [],
        }, index + 1))
      ],
      quiz: []
    };
  }

  if (module.contentBody?.trim()) {
    return {
      slides: [
        normaliseSlide({
          type: 'hero',
          eyebrow: module.category || 'Module',
          title: module.title,
          body: module.description || ''
        }, 0),
        normaliseSlide({
          type: 'content',
          eyebrow: 'Content',
          title: 'Module content',
          body: module.contentBody
        }, 1)
      ],
      quiz: []
    };
  }

  return createEmptyBuilder();
}

function buildStructuredContent(form, builder) {
  const slides = builder.slides.map((slide, index) => ({
    id: slide.id || createId('slide'),
    type: slide.type,
    eyebrow: slide.eyebrow || (index === 0 ? form.category : `Slide ${index + 1}`),
    title: slide.title || '',
    body: slide.type === 'bullets' || slide.type === 'checklist' ? '' : slide.body || '',
    bullets: slide.type === 'bullets' ? slide.bullets.filter(Boolean) : [],
    checklist: slide.type === 'checklist' ? slide.checklist.filter(Boolean) : [],
    meta: (slide.meta || []).filter(Boolean),
    fact: slide.fact || '',
    tone: slide.tone || 'default'
  }));

  const quiz = builder.quiz
    .map((question) => ({
      id: question.id || createId('quiz'),
      question: question.question.trim(),
      options: question.options.map((option) => option.trim()).filter(Boolean),
      correctIndex: Number(question.correctIndex) || 0,
      explanation: question.explanation.trim()
    }))
    .filter((question) => question.question && question.options.length >= 2);

  return JSON.stringify({
    title: form.title,
    subtitle: form.description || '',
    slides,
    quiz
  });
}

export default function AdminModules() {
  const [modules, setModules] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [builder, setBuilder] = useState(createEmptyBuilder());
  const [moduleCompetencies, setModuleCompetencies] = useState([]);
  const [competencyDraft, setCompetencyDraft] = useState(createEmptyCompetencyDraft());
  const [descriptionMeta, setDescriptionMeta] = useState({ mode: 'plain', raw: null });
  const [selectedId, setSelectedId] = useState('');
  const [previewModuleId, setPreviewModuleId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [moduleData, competencyData] = await Promise.all([
        api('/modules'),
        api('/competencies')
      ]);
      setModules(moduleData || []);
      setCompetencies(competencyData || []);
    } catch {
      setError('Failed to load modules');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function resetBuilder() {
    setSelectedId('');
    setForm(emptyForm);
    setBuilder(createEmptyBuilder());
    setModuleCompetencies([]);
    setCompetencyDraft(createEmptyCompetencyDraft());
    setDescriptionMeta({ mode: 'plain', raw: null });
  }

  function selectModule(id) {
    setSelectedId(id);
    const item = modules.find((module) => module.id === id);
    if (!item) {
      resetBuilder();
      return;
    }

    const descriptionState = getDescriptionState(item.description);
    setForm({
      title: item.title || '',
      mode: item.mode || 'INDIVIDUAL',
      category: item.category || 'GEOTECH',
      description: descriptionState.text,
      learningObjectives: item.learningObjectives || '',
      estimatedMinutes: item.estimatedMinutes ? String(item.estimatedMinutes) : '',
      contentUrl: item.contentUrl || ''
    });
    setBuilder(deriveBuilderFromModule(item));
    setModuleCompetencies((item.competencies || []).map((mapping) => ({
      competencyId: mapping.competencyId || mapping.competency?.id,
      evidenceType: mapping.evidenceType || 'COMPLETION'
    })));
    setCompetencyDraft(createEmptyCompetencyDraft(item.category || 'GEOTECH'));
    setDescriptionMeta({ mode: descriptionState.mode, raw: descriptionState.raw });
  }

  function toggleModuleCompetency(competencyId) {
    setModuleCompetencies((current) => {
      const exists = current.some((item) => item.competencyId === competencyId);
      if (exists) return current.filter((item) => item.competencyId !== competencyId);
      return [...current, { competencyId, evidenceType: 'COMPLETION' }];
    });
  }

  function updateModuleCompetency(competencyId, patch) {
    setModuleCompetencies((current) => current.map((item) => item.competencyId === competencyId ? { ...item, ...patch } : item));
  }

  async function createAndAssignCompetency() {
    setError('');
    try {
      const competency = await api('/competencies', {
        method: 'POST',
        body: JSON.stringify({
          code: competencyDraft.code,
          title: competencyDraft.title,
          category: competencyDraft.category,
          description: competencyDraft.description || undefined
        })
      });

      setCompetencies((current) => [...current, competency].sort((a, b) =>
        (a.category || '').localeCompare(b.category || '') ||
        (a.code || '').localeCompare(b.code || '')
      ));
      setModuleCompetencies((current) => [
        ...current,
        { competencyId: competency.id, evidenceType: competencyDraft.evidenceType }
      ]);
      setCompetencyDraft(createEmptyCompetencyDraft(form.category));
    } catch {
      setError('Failed to create competency');
    }
  }

  function updateSlide(slideId, patch) {
    setBuilder((current) => ({
      ...current,
      slides: current.slides.map((slide) => slide.id === slideId ? { ...slide, ...patch } : slide)
    }));
  }

  function moveSlide(slideId, direction) {
    setBuilder((current) => {
      const index = current.slides.findIndex((slide) => slide.id === slideId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.slides.length) return current;
      const slides = [...current.slides];
      [slides[index], slides[target]] = [slides[target], slides[index]];
      return { ...current, slides };
    });
  }

  function duplicateSlide(slideId) {
    setBuilder((current) => {
      const index = current.slides.findIndex((slide) => slide.id === slideId);
      if (index < 0) return current;
      const original = current.slides[index];
      const clone = {
        ...original,
        id: createId('slide'),
        title: original.title ? `${original.title} (Copy)` : ''
      };
      const slides = [...current.slides];
      slides.splice(index + 1, 0, clone);
      return { ...current, slides };
    });
  }

  function removeSlide(slideId) {
    setBuilder((current) => ({
      ...current,
      slides: current.slides.length === 1 ? current.slides : current.slides.filter((slide) => slide.id !== slideId)
    }));
  }

  function addSlide(type) {
    setBuilder((current) => ({
      ...current,
      slides: [...current.slides, createEmptySlide(type)]
    }));
  }

  function updateQuizQuestion(questionId, patch) {
    setBuilder((current) => ({
      ...current,
      quiz: current.quiz.map((question) => question.id === questionId ? { ...question, ...patch } : question)
    }));
  }

  function moveQuizQuestion(questionId, direction) {
    setBuilder((current) => {
      const index = current.quiz.findIndex((question) => question.id === questionId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.quiz.length) return current;
      const quiz = [...current.quiz];
      [quiz[index], quiz[target]] = [quiz[target], quiz[index]];
      return { ...current, quiz };
    });
  }

  function duplicateQuizQuestion(questionId) {
    setBuilder((current) => {
      const index = current.quiz.findIndex((question) => question.id === questionId);
      if (index < 0) return current;
      const original = current.quiz[index];
      const clone = {
        ...original,
        id: createId('quiz'),
        question: original.question ? `${original.question} (Copy)` : ''
      };
      const quiz = [...current.quiz];
      quiz.splice(index + 1, 0, clone);
      return { ...current, quiz };
    });
  }

  function removeQuizQuestion(questionId) {
    setBuilder((current) => ({
      ...current,
      quiz: current.quiz.length === 1 ? current.quiz : current.quiz.filter((question) => question.id !== questionId)
    }));
  }

  async function saveModule(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      let nextDescription = form.description || undefined;
      if (descriptionMeta.mode === 'structured' && descriptionMeta.raw) {
        nextDescription = JSON.stringify({
          ...descriptionMeta.raw,
          overview: form.description || ''
        });
      }

      const payload = {
        title: form.title,
        mode: form.mode || undefined,
        category: form.category || undefined,
        description: nextDescription,
        learningObjectives: form.learningObjectives || undefined,
        estimatedMinutes: form.estimatedMinutes ? Number(form.estimatedMinutes) : undefined,
        contentUrl: form.contentUrl || undefined,
        contentBody: buildStructuredContent(form, builder)
      };

      if (selectedId) {
        await api(`/modules/${selectedId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        await api(`/modules/${selectedId}/competencies`, {
          method: 'PUT',
          body: JSON.stringify({ items: moduleCompetencies })
        });
      } else {
        const createdModule = await api('/modules', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        await api(`/modules/${createdModule.id}/competencies`, {
          method: 'PUT',
          body: JSON.stringify({ items: moduleCompetencies })
        });
      }

      await load();
      if (!selectedId) resetBuilder();
    } catch {
      setError('Failed to save module');
    } finally {
      setSaving(false);
    }
  }

  const previewModule = useMemo(() => ({
    title: form.title || 'Untitled module',
    category: form.category,
    description: form.description,
    learningObjectives: form.learningObjectives,
    estimatedMinutes: form.estimatedMinutes ? Number(form.estimatedMinutes) : undefined,
    contentBody: buildStructuredContent(form, builder)
  }), [form, builder]);

  const selectedPreviewModule = useMemo(() => {
    if (!previewModuleId) return null;
    if (previewModuleId === '__draft__') return previewModule;
    return modules.find((module) => module.id === previewModuleId) || null;
  }, [modules, previewModule, previewModuleId]);

  const assignedCompetencyIds = useMemo(() => new Set(moduleCompetencies.map((item) => item.competencyId)), [moduleCompetencies]);

  return (
    <div className="grid">
      <div className="card">
        <div className="h1">Module Management</div>
        <p className="small">Build new slide-based learning modules and interactive quizzes for learners.</p>
        {error && <p style={{ color: 'var(--bad)', marginTop: 12 }}>{error}</p>}
      </div>

      <div className="module-builder-layout">
        <div className="card module-builder-sidebar">
          <div className="h2">Existing modules</div>
          {loading ? <p className="small">Loading...</p> : (
            <div className="grid" style={{ gap: 10 }}>
              <button
                className={`btn ghost ${!selectedId ? 'active' : ''}`}
                onClick={() => {
                  resetBuilder();
                  setPreviewModuleId('__draft__');
                }}
              >
                New module
              </button>
              {modules.map((module) => (
                <div key={module.id} className="module-list-item">
                  <button
                    className="btn ghost module-list-select"
                    style={{ justifyContent: 'space-between', textAlign: 'left' }}
                    onClick={() => selectModule(module.id)}
                  >
                    <span>{module.title}</span>
                    <div className="row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <span className="badge">{categoryLabel(module.category)}</span>
                      <span className="badge">{module.mode}</span>
                    </div>
                  </button>
                  <div className="module-list-actions">
                    <button type="button" className="btn ghost" onClick={() => selectModule(module.id)}>
                      Edit
                    </button>
                    <button type="button" className="btn ghost" onClick={() => setPreviewModuleId(module.id)}>
                      Preview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid module-builder-main" style={{ gap: 18 }}>
          <div className="card">
            <div className="h2">{selectedId ? 'Edit module' : 'New module'}</div>
            <form className="grid" onSubmit={saveModule}>
              <div className="grid two">
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
              </div>

              <div className="grid two">
                <div>
                  <label className="small">Category</label>
                  <select className="input" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="small">Estimated minutes</label>
                  <input className="input" type="number" min="1" value={form.estimatedMinutes} onChange={(event) => setForm((current) => ({ ...current, estimatedMinutes: event.target.value }))} />
                </div>
              </div>

              <div>
                <label className="small">Module summary</label>
                <textarea className="input" rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
                {descriptionMeta.mode === 'structured' && (
                  <p className="small" style={{ marginTop: 8 }}>
                    This module uses structured legacy content. Editing this field updates the learner-facing overview.
                  </p>
                )}
              </div>

              <div>
                <label className="small">Learning objectives</label>
                <textarea className="input" rows={4} value={form.learningObjectives} onChange={(event) => setForm((current) => ({ ...current, learningObjectives: event.target.value }))} />
              </div>

              <div>
                <label className="small">Content URL</label>
                <input className="input" type="url" value={form.contentUrl} onChange={(event) => setForm((current) => ({ ...current, contentUrl: event.target.value }))} />
              </div>

              <div className="module-builder-panel">
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="h2" style={{ marginBottom: 4 }}>Competencies</div>
                    <p className="small">Create new competencies and assign existing ones to this module with the right evidence type.</p>
                  </div>
                </div>

                <div className="grid two">
                  <div className="module-builder-item">
                    <div className="module-builder-item-title">Create and assign new competency</div>
                    <div className="grid" style={{ gap: 12, marginTop: 12 }}>
                      <div className="grid two">
                        <div>
                          <label className="small">Code</label>
                          <input className="input" value={competencyDraft.code} onChange={(event) => setCompetencyDraft((current) => ({ ...current, code: event.target.value }))} />
                        </div>
                        <div>
                          <label className="small">Category</label>
                          <input className="input" value={competencyDraft.category} onChange={(event) => setCompetencyDraft((current) => ({ ...current, category: event.target.value }))} />
                        </div>
                      </div>
                      <div>
                        <label className="small">Title</label>
                        <input className="input" value={competencyDraft.title} onChange={(event) => setCompetencyDraft((current) => ({ ...current, title: event.target.value }))} />
                      </div>
                      <div>
                        <label className="small">Description</label>
                        <textarea className="input" rows={3} value={competencyDraft.description} onChange={(event) => setCompetencyDraft((current) => ({ ...current, description: event.target.value }))} />
                      </div>
                      <div>
                        <label className="small">Evidence type</label>
                        <select className="input" value={competencyDraft.evidenceType} onChange={(event) => setCompetencyDraft((current) => ({ ...current, evidenceType: event.target.value }))}>
                          {EVIDENCE_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        className="btn"
                        onClick={createAndAssignCompetency}
                        disabled={!competencyDraft.code.trim() || !competencyDraft.title.trim() || !competencyDraft.category.trim()}
                      >
                        Create and assign competency
                      </button>
                    </div>
                  </div>

                  <div className="module-builder-item">
                    <div className="module-builder-item-title">Assign existing competencies</div>
                    <div className="grid" style={{ gap: 10, marginTop: 12, maxHeight: 440, overflow: 'auto' }}>
                      {competencies.map((competency) => {
                        const assigned = assignedCompetencyIds.has(competency.id);
                        const mapping = moduleCompetencies.find((item) => item.competencyId === competency.id);
                        return (
                          <div key={competency.id} className="module-competency-row">
                            <label className="module-competency-toggle">
                              <input type="checkbox" checked={assigned} onChange={() => toggleModuleCompetency(competency.id)} />
                              <span>
                                <strong>{competency.code}</strong> - {competency.title}
                                <span className="small" style={{ display: 'block' }}>{competency.category}</span>
                              </span>
                            </label>
                            {assigned && (
                              <select
                                className="input"
                                style={{ maxWidth: 150 }}
                                value={mapping?.evidenceType || 'COMPLETION'}
                                onChange={(event) => updateModuleCompetency(competency.id, { evidenceType: event.target.value })}
                              >
                                {EVIDENCE_TYPE_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="module-builder-panel">
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="h2" style={{ marginBottom: 4 }}>Slide builder</div>
                    <p className="small">Create the lesson one visual slide at a time.</p>
                  </div>
                  <div className="row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {SLIDE_TYPES.map((type) => (
                      <button key={type.value} type="button" className="btn ghost" onClick={() => addSlide(type.value)}>
                        Add {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid" style={{ gap: 14, marginTop: 16 }}>
                  {builder.slides.map((slide, index) => (
                    <div key={slide.id} className="module-builder-item">
                      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="module-builder-item-title">Slide {index + 1}</div>
                        <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                          <select className="input" style={{ minWidth: 150 }} value={slide.type} onChange={(event) => updateSlide(slide.id, { type: event.target.value })}>
                            {SLIDE_TYPES.map((type) => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                          <button type="button" className="btn ghost" onClick={() => moveSlide(slide.id, -1)} disabled={index === 0}>Up</button>
                          <button type="button" className="btn ghost" onClick={() => moveSlide(slide.id, 1)} disabled={index === builder.slides.length - 1}>Down</button>
                          <button type="button" className="btn ghost" onClick={() => duplicateSlide(slide.id)}>Duplicate</button>
                          <button type="button" className="btn ghost" onClick={() => removeSlide(slide.id)}>Remove</button>
                        </div>
                      </div>

                      <div className="grid two" style={{ marginTop: 12 }}>
                        <div>
                          <label className="small">Eyebrow</label>
                          <input className="input" value={slide.eyebrow} onChange={(event) => updateSlide(slide.id, { eyebrow: event.target.value })} />
                        </div>
                        <div>
                          <label className="small">Fact pill</label>
                          <input className="input" value={slide.fact} onChange={(event) => updateSlide(slide.id, { fact: event.target.value })} />
                        </div>
                      </div>

                      <div className="grid two" style={{ marginTop: 12 }}>
                        <div>
                          <label className="small">Tone</label>
                          <select className="input" value={slide.tone} onChange={(event) => updateSlide(slide.id, { tone: event.target.value })}>
                            <option value="default">Default</option>
                            <option value="warning">Warning</option>
                          </select>
                        </div>
                        <div>
                          <label className="small">Learning focus</label>
                          <textarea
                            className="input"
                            rows={3}
                            value={joinLineList(slide.meta)}
                            onChange={(event) => updateSlide(slide.id, { meta: normaliseLineList(event.target.value) })}
                          />
                        </div>
                      </div>

                      <div style={{ marginTop: 12 }}>
                        <label className="small">Slide title</label>
                        <input className="input" value={slide.title} onChange={(event) => updateSlide(slide.id, { title: event.target.value })} />
                      </div>

                      {(slide.type === 'content' || slide.type === 'hero') && (
                        <div style={{ marginTop: 12 }}>
                          <label className="small">Body</label>
                          <textarea className="input" rows={5} value={slide.body} onChange={(event) => updateSlide(slide.id, { body: event.target.value })} />
                        </div>
                      )}

                      {slide.type === 'bullets' && (
                        <div style={{ marginTop: 12 }}>
                          <label className="small">Bullet points</label>
                          <textarea
                            className="input"
                            rows={6}
                            value={joinLineList(slide.bullets)}
                            onChange={(event) => updateSlide(slide.id, { bullets: normaliseLineList(event.target.value) })}
                          />
                          <p className="small" style={{ marginTop: 8 }}>One bullet per line.</p>
                        </div>
                      )}

                      {slide.type === 'checklist' && (
                        <div style={{ marginTop: 12 }}>
                          <label className="small">Checklist items</label>
                          <textarea
                            className="input"
                            rows={6}
                            value={joinLineList(slide.checklist)}
                            onChange={(event) => updateSlide(slide.id, { checklist: normaliseLineList(event.target.value) })}
                          />
                          <p className="small" style={{ marginTop: 8 }}>One checklist item per line.</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="module-builder-panel">
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="h2" style={{ marginBottom: 4 }}>Quiz builder</div>
                    <p className="small">Add the scored questions learners answer at the end of the module.</p>
                  </div>
                  <button type="button" className="btn ghost" onClick={() => setBuilder((current) => ({ ...current, quiz: [...current.quiz, createEmptyQuizQuestion()] }))}>
                    Add question
                  </button>
                </div>

                <div className="grid" style={{ gap: 14, marginTop: 16 }}>
                  {builder.quiz.map((question, index) => (
                    <div key={question.id} className="module-builder-item">
                      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="module-builder-item-title">Question {index + 1}</div>
                        <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                          <button type="button" className="btn ghost" onClick={() => moveQuizQuestion(question.id, -1)} disabled={index === 0}>Up</button>
                          <button type="button" className="btn ghost" onClick={() => moveQuizQuestion(question.id, 1)} disabled={index === builder.quiz.length - 1}>Down</button>
                          <button type="button" className="btn ghost" onClick={() => duplicateQuizQuestion(question.id)}>Duplicate</button>
                          <button type="button" className="btn ghost" onClick={() => removeQuizQuestion(question.id)}>Remove</button>
                        </div>
                      </div>

                      <div style={{ marginTop: 12 }}>
                        <label className="small">Question</label>
                        <textarea className="input" rows={3} value={question.question} onChange={(event) => updateQuizQuestion(question.id, { question: event.target.value })} />
                      </div>

                      <div style={{ marginTop: 12 }}>
                        <label className="small">Answer options</label>
                        <textarea
                          className="input"
                          rows={5}
                          value={joinLineList(question.options)}
                          onChange={(event) => {
                            const options = normaliseLineList(event.target.value);
                            updateQuizQuestion(question.id, {
                              options: options.length >= 2 ? options : [...options, '', ''].slice(0, 2)
                            });
                          }}
                        />
                        <p className="small" style={{ marginTop: 8 }}>One option per line. Two or more options required.</p>
                      </div>

                      <div className="grid two" style={{ marginTop: 12 }}>
                        <div>
                          <label className="small">Correct option</label>
                          <select
                            className="input"
                            value={question.correctIndex}
                            onChange={(event) => updateQuizQuestion(question.id, { correctIndex: Number(event.target.value) })}
                          >
                            {(question.options || []).map((option, optionIndex) => (
                              <option key={`${question.id}-${optionIndex}`} value={optionIndex}>
                                {option || `Option ${optionIndex + 1}`}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="small">Explanation</label>
                          <input className="input" value={question.explanation} onChange={(event) => updateQuizQuestion(question.id, { explanation: event.target.value })} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="btn" disabled={saving}>{saving ? 'Saving...' : selectedId ? 'Save module' : 'Create module'}</button>
            </form>
          </div>
        </div>
      </div>

      {selectedPreviewModule && (
        <div className="module-preview-overlay" onClick={() => setPreviewModuleId('')}>
          <div className="module-preview-dialog" onClick={(event) => event.stopPropagation()}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <div className="h2" style={{ marginBottom: 4 }}>Learner preview</div>
                <p className="small">This is how the module will appear when launched by a learner.</p>
              </div>
              <button type="button" className="btn ghost" onClick={() => setPreviewModuleId('')}>
                Close
              </button>
            </div>
            <ModulePlayer module={selectedPreviewModule} />
          </div>
        </div>
      )}
    </div>
  );
}
