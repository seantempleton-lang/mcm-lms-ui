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
  const [form, setForm] = useState(emptyForm);
  const [builder, setBuilder] = useState(createEmptyBuilder());
  const [descriptionMeta, setDescriptionMeta] = useState({ mode: 'plain', raw: null });
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

  function resetBuilder() {
    setSelectedId('');
    setForm(emptyForm);
    setBuilder(createEmptyBuilder());
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
    setDescriptionMeta({ mode: descriptionState.mode, raw: descriptionState.raw });
  }

  function updateSlide(slideId, patch) {
    setBuilder((current) => ({
      ...current,
      slides: current.slides.map((slide) => slide.id === slideId ? { ...slide, ...patch } : slide)
    }));
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
      } else {
        await api('/modules', {
          method: 'POST',
          body: JSON.stringify(payload)
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

  return (
    <div className="grid">
      <div className="card">
        <div className="h1">Module Management</div>
        <p className="small">Build new slide-based learning modules and interactive quizzes for learners.</p>
        {error && <p style={{ color: 'var(--bad)', marginTop: 12 }}>{error}</p>}
      </div>

      <div className="grid two">
        <div className="card">
          <div className="h2">Existing modules</div>
          {loading ? <p className="small">Loading...</p> : (
            <div className="grid" style={{ gap: 10 }}>
              <button className={`btn ghost ${!selectedId ? 'active' : ''}`} onClick={resetBuilder}>
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

        <div className="grid" style={{ gap: 18 }}>
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
                        <button type="button" className="btn ghost" onClick={() => removeQuizQuestion(question.id)}>Remove</button>
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

          <div className="card">
            <div className="h2">Learner preview</div>
            <p className="small" style={{ marginBottom: 14 }}>This is how the structured module will appear when launched by a learner.</p>
            <ModulePlayer module={previewModule} />
          </div>
        </div>
      </div>
    </div>
  );
}
