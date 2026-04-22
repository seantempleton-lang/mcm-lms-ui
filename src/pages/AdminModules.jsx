import { useEffect, useMemo, useRef, useState } from 'react';
import { api, resolveApiUrl } from '../api';
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

const WORKFLOW_STEPS = [
  { value: 'catalogue', label: 'Choose module' },
  { value: 'details', label: 'Module details' },
  { value: 'builder', label: 'Slide builder' },
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
    tone: 'default',
    imageUrl: '',
    imageAlt: '',
    imageCaption: '',
    videoUrl: '',
    layout: 'stacked',
    links: [],
  };
}

function createEmptyQuizQuestion() {
  return {
    id: createId('quiz'),
    question: '',
    options: ['', ''],
    correctIndex: 0,
    explanation: '',
  };
}

function createEmptyBuilder() {
  return {
    slides: [createEmptySlide('hero')],
    quiz: [createEmptyQuizQuestion()],
  };
}

function createEmptyCompetencyDraft(category = 'GEOTECH') {
  return {
    code: '',
    title: '',
    category,
    description: '',
    evidenceType: 'COMPLETION',
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
      raw: parsed,
    };
  }

  return {
    text: value || '',
    mode: 'plain',
    raw: null,
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
    tone: slide.tone || 'default',
    imageUrl: slide.imageUrl || '',
    imageAlt: slide.imageAlt || '',
    imageCaption: slide.imageCaption || '',
    videoUrl: slide.videoUrl || '',
    layout: slide.layout || 'stacked',
    links: slide.links || [],
  };
}

function normaliseQuizQuestion(question) {
  const options = Array.isArray(question.options) && question.options.length ? question.options : ['', ''];
  return {
    id: question.id || createId('quiz'),
    question: question.question || '',
    options,
    correctIndex: typeof question.correctIndex === 'number' ? question.correctIndex : 0,
    explanation: question.explanation || '',
  };
}

function deriveBuilderFromModule(module) {
  const structuredBody = safeJsonParse(module.contentBody);
  if (structuredBody?.slides?.length) {
    return {
      slides: structuredBody.slides.map(normaliseSlide),
      quiz: (structuredBody.quiz || []).map(normaliseQuizQuestion),
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
          body: legacyDescription.overview || '',
        }, 0),
        ...legacyDescription.sections.map((section, index) => normaliseSlide({
          type: Array.isArray(section.content) ? 'bullets' : 'content',
          eyebrow: section.type || `Section ${index + 1}`,
          title: section.title,
          body: Array.isArray(section.content) ? '' : section.content,
          bullets: Array.isArray(section.content) ? section.content : [],
        }, index + 1)),
      ],
      quiz: [],
    };
  }

  if (module.contentBody?.trim()) {
    return {
      slides: [
        normaliseSlide({
          type: 'hero',
          eyebrow: module.category || 'Module',
          title: module.title,
          body: module.description || '',
        }, 0),
        normaliseSlide({
          type: 'content',
          eyebrow: 'Content',
          title: 'Module content',
          body: module.contentBody,
        }, 1),
      ],
      quiz: [],
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
    tone: slide.tone || 'default',
    imageUrl: slide.imageUrl || '',
    imageAlt: slide.imageAlt || '',
    imageCaption: slide.imageCaption || '',
    videoUrl: slide.videoUrl || '',
    layout: slide.layout || 'stacked',
    links: (slide.links || []).filter((link) => link?.url).map((link) => ({
      label: link.label || '',
      url: link.url,
    })),
  }));

  const quiz = builder.quiz
    .map((question) => ({
      id: question.id || createId('quiz'),
      question: question.question.trim(),
      options: question.options.map((option) => option.trim()).filter(Boolean),
      correctIndex: Number(question.correctIndex) || 0,
      explanation: question.explanation.trim(),
    }))
    .filter((question) => question.question && question.options.length >= 2);

  return JSON.stringify({
    title: form.title,
    subtitle: form.description || '',
    slides,
    quiz,
  });
}

function clampIndex(value, max) {
  if (max <= 0) return 0;
  return Math.min(Math.max(value, 0), max - 1);
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
  const [moduleCategoryFilter, setModuleCategoryFilter] = useState('ALL');
  const [workflowStep, setWorkflowStep] = useState('catalogue');
  const [builderPage, setBuilderPage] = useState('slides');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResource, setUploadingResource] = useState(false);
  const [uploadingSlideMedia, setUploadingSlideMedia] = useState('');
  const [resourceUploadError, setResourceUploadError] = useState('');
  const [resourceCopied, setResourceCopied] = useState(false);
  const [error, setError] = useState('');
  const resourceInputRef = useRef(null);
  const slideMediaInputRef = useRef(null);
  const pendingSlideUploadRef = useRef(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [moduleData, competencyData] = await Promise.all([
        api('/modules'),
        api('/competencies'),
      ]);
      setModules(moduleData || []);
      setCompetencies(competencyData || []);
    } catch {
      setError('Failed to load modules');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setActiveSlideIndex((current) => clampIndex(current, builder.slides.length));
  }, [builder.slides.length]);

  function resetBuilder() {
    setSelectedId('');
    setForm(emptyForm);
    setBuilder(createEmptyBuilder());
    setModuleCompetencies([]);
    setCompetencyDraft(createEmptyCompetencyDraft());
    setDescriptionMeta({ mode: 'plain', raw: null });
    setBuilderPage('slides');
    setActiveSlideIndex(0);
  }

  function startNewModule() {
    resetBuilder();
    setWorkflowStep('details');
    setPreviewModuleId('');
    setResourceUploadError('');
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
      contentUrl: item.contentUrl || '',
    });
    setBuilder(deriveBuilderFromModule(item));
    setModuleCompetencies((item.competencies || []).map((mapping) => ({
      competencyId: mapping.competencyId || mapping.competency?.id,
      evidenceType: mapping.evidenceType || 'COMPLETION',
    })));
    setCompetencyDraft(createEmptyCompetencyDraft(item.category || 'GEOTECH'));
    setDescriptionMeta({ mode: descriptionState.mode, raw: descriptionState.raw });
    setBuilderPage('slides');
    setActiveSlideIndex(0);
    setResourceUploadError('');
  }

  function openModuleEditor(id) {
    selectModule(id);
    setWorkflowStep('details');
  }

  function toggleModuleCompetency(competencyId) {
    setModuleCompetencies((current) => {
      const exists = current.some((item) => item.competencyId === competencyId);
      if (exists) return current.filter((item) => item.competencyId !== competencyId);
      return [...current, { competencyId, evidenceType: 'COMPLETION' }];
    });
  }

  function updateModuleCompetency(competencyId, patch) {
    setModuleCompetencies((current) => current.map((item) => (
      item.competencyId === competencyId ? { ...item, ...patch } : item
    )));
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
          description: competencyDraft.description || undefined,
        }),
      });

      setCompetencies((current) => [...current, competency].sort((a, b) => (
        (a.category || '').localeCompare(b.category || '') ||
        (a.code || '').localeCompare(b.code || '')
      )));
      setModuleCompetencies((current) => [
        ...current,
        { competencyId: competency.id, evidenceType: competencyDraft.evidenceType },
      ]);
      setCompetencyDraft(createEmptyCompetencyDraft(form.category));
    } catch {
      setError('Failed to create competency');
    }
  }

  function updateSlide(slideId, patch) {
    setBuilder((current) => ({
      ...current,
      slides: current.slides.map((slide) => (slide.id === slideId ? { ...slide, ...patch } : slide)),
    }));
  }

  function updateSlideLink(slideId, linkIndex, patch) {
    setBuilder((current) => ({
      ...current,
      slides: current.slides.map((slide) => {
        if (slide.id !== slideId) return slide;
        const links = [...(slide.links || [])];
        links[linkIndex] = { ...links[linkIndex], ...patch };
        return { ...slide, links };
      }),
    }));
  }

  function addSlideLink(slideId) {
    setBuilder((current) => ({
      ...current,
      slides: current.slides.map((slide) => (
        slide.id === slideId
          ? { ...slide, links: [...(slide.links || []), { label: '', url: '' }] }
          : slide
      )),
    }));
  }

  function removeSlideLink(slideId, linkIndex) {
    setBuilder((current) => ({
      ...current,
      slides: current.slides.map((slide) => (
        slide.id === slideId
          ? { ...slide, links: (slide.links || []).filter((_, index) => index !== linkIndex) }
          : slide
      )),
    }));
  }

  function moveSlide(slideId, direction) {
    const index = builder.slides.findIndex((slide) => slide.id === slideId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= builder.slides.length) return;

    setBuilder((current) => {
      const slides = [...current.slides];
      [slides[index], slides[target]] = [slides[target], slides[index]];
      return { ...current, slides };
    });
    setActiveSlideIndex(target);
  }

  function duplicateSlide(slideId) {
    const index = builder.slides.findIndex((slide) => slide.id === slideId);
    if (index < 0) return;

    setBuilder((current) => {
      const original = current.slides[index];
      const clone = {
        ...original,
        id: createId('slide'),
        title: original.title ? `${original.title} (Copy)` : '',
      };
      const slides = [...current.slides];
      slides.splice(index + 1, 0, clone);
      return { ...current, slides };
    });
    setActiveSlideIndex(index + 1);
  }

  function removeSlide(slideId) {
    const index = builder.slides.findIndex((slide) => slide.id === slideId);
    if (index < 0 || builder.slides.length === 1) return;

    setBuilder((current) => ({
      ...current,
      slides: current.slides.filter((slide) => slide.id !== slideId),
    }));
    setActiveSlideIndex((current) => clampIndex(index === current ? current - 1 : current, builder.slides.length - 1));
  }

  function addSlide(type) {
    setBuilder((current) => ({
      ...current,
      slides: [...current.slides, createEmptySlide(type)],
    }));
    setBuilderPage('slides');
    setActiveSlideIndex(builder.slides.length);
  }

  function updateQuizQuestion(questionId, patch) {
    setBuilder((current) => ({
      ...current,
      quiz: current.quiz.map((question) => (
        question.id === questionId ? { ...question, ...patch } : question
      )),
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
        question: original.question ? `${original.question} (Copy)` : '',
      };
      const quiz = [...current.quiz];
      quiz.splice(index + 1, 0, clone);
      return { ...current, quiz };
    });
  }

  function removeQuizQuestion(questionId) {
    setBuilder((current) => ({
      ...current,
      quiz: current.quiz.length === 1 ? current.quiz : current.quiz.filter((question) => question.id !== questionId),
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
          overview: form.description || '',
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
        contentBody: buildStructuredContent(form, builder),
      };

      if (selectedId) {
        await api(`/modules/${selectedId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        await api(`/modules/${selectedId}/competencies`, {
          method: 'PUT',
          body: JSON.stringify({ items: moduleCompetencies }),
        });
      } else {
        const createdModule = await api('/modules', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        await api(`/modules/${createdModule.id}/competencies`, {
          method: 'PUT',
          body: JSON.stringify({ items: moduleCompetencies }),
        });
        setSelectedId(createdModule.id);
      }

      await load();
    } catch {
      setError('Failed to save module');
    } finally {
      setSaving(false);
    }
  }

  async function uploadResource(file) {
    if (!file) return;

    setUploadingResource(true);
    setResourceUploadError('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('resource', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/documents/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to upload resource');
      }

      setForm((current) => ({ ...current, contentUrl: payload.url || '' }));
    } catch (uploadError) {
      setResourceUploadError(uploadError.message || 'Failed to upload resource');
    } finally {
      setUploadingResource(false);
      if (resourceInputRef.current) {
        resourceInputRef.current.value = '';
      }
    }
  }

  async function copyResourceUrl() {
    if (!form.contentUrl) return;

    try {
      await navigator.clipboard.writeText(form.contentUrl);
      setResourceCopied(true);
      window.setTimeout(() => setResourceCopied(false), 1600);
    } catch {
      setResourceUploadError('Failed to copy resource URL');
    }
  }

  async function uploadSlideMedia(file) {
    const target = pendingSlideUploadRef.current;
    if (!file || !target?.slideId || !target?.field) return;

    setUploadingSlideMedia(`${target.slideId}:${target.field}`);
    setResourceUploadError('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('resource', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/documents/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to upload media');
      }

      updateSlide(target.slideId, { [target.field]: payload.url || '' });
    } catch (uploadError) {
      setResourceUploadError(uploadError.message || 'Failed to upload media');
    } finally {
      setUploadingSlideMedia('');
      pendingSlideUploadRef.current = null;
      if (slideMediaInputRef.current) {
        slideMediaInputRef.current.value = '';
      }
    }
  }

  function triggerSlideMediaUpload(slideId, field, accept) {
    pendingSlideUploadRef.current = { slideId, field };
    if (slideMediaInputRef.current) {
      slideMediaInputRef.current.accept = accept;
      slideMediaInputRef.current.click();
    }
  }

  const previewModule = useMemo(() => ({
    title: form.title || 'Untitled module',
    category: form.category,
    description: form.description,
    learningObjectives: form.learningObjectives,
    estimatedMinutes: form.estimatedMinutes ? Number(form.estimatedMinutes) : undefined,
    contentBody: buildStructuredContent(form, builder),
  }), [form, builder]);

  const selectedPreviewModule = useMemo(() => {
    if (!previewModuleId) return null;
    if (previewModuleId === '__draft__') return previewModule;
    return modules.find((module) => module.id === previewModuleId) || null;
  }, [modules, previewModule, previewModuleId]);

  const assignedCompetencyIds = useMemo(
    () => new Set(moduleCompetencies.map((item) => item.competencyId)),
    [moduleCompetencies],
  );

  const visibleModules = useMemo(() => {
    if (moduleCategoryFilter === 'ALL') return modules;
    return modules.filter((module) => module.category === moduleCategoryFilter);
  }, [modules, moduleCategoryFilter]);

  const activeSlide = builder.slides[activeSlideIndex] || builder.slides[0];
  const workflowStepIndex = WORKFLOW_STEPS.findIndex((step) => step.value === workflowStep);
  const selectedModuleTitle = form.title || (selectedId ? 'Untitled module' : 'New module');

  return (
    <div className="grid">
      <input
        ref={slideMediaInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={(event) => uploadSlideMedia(event.target.files?.[0])}
      />

      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <div className="h1">Module Management</div>
            <p className="small">Build new slide-based learning modules and interactive quizzes for learners.</p>
          </div>
          <div className="module-workflow-steps">
            {WORKFLOW_STEPS.map((step, index) => {
              const isActive = workflowStep === step.value;
              const isComplete = workflowStepIndex > index;
              return (
                <div
                  key={step.value}
                  className={`module-workflow-step${isActive ? ' active' : ''}${isComplete ? ' complete' : ''}`}
                >
                  <span>{index + 1}</span>
                  <strong>{step.label}</strong>
                </div>
              );
            })}
          </div>
        </div>
        {error && <p style={{ color: 'var(--bad)', marginTop: 12 }}>{error}</p>}
      </div>

      {workflowStep === 'catalogue' && (
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div className="h2" style={{ marginBottom: 4 }}>Choose a module</div>
              <p className="small">Start a new build or pick an existing module to edit or preview.</p>
            </div>
            <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 220 }}>
                <label className="small">Category filter</label>
                <select className="input" value={moduleCategoryFilter} onChange={(event) => setModuleCategoryFilter(event.target.value)}>
                  <option value="ALL">All categories</option>
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </div>
              <button type="button" className="btn" onClick={startNewModule}>
                New module
              </button>
            </div>
          </div>

          {loading ? (
            <p className="small" style={{ marginTop: 18 }}>Loading...</p>
          ) : (
            <div className="grid" style={{ gap: 12, marginTop: 18 }}>
              {visibleModules.map((module) => (
                <div key={module.id} className="module-list-item module-list-card">
                  <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <div>
                      <div className="module-builder-item-title">{module.title}</div>
                      <p className="small" style={{ marginTop: 6 }}>
                        {module.description || 'No summary added yet.'}
                      </p>
                    </div>
                    <div className="row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <span className="badge">{categoryLabel(module.category)}</span>
                      <span className="badge">{module.mode}</span>
                    </div>
                  </div>
                  <div className="module-list-actions">
                    <button type="button" className="btn ghost" onClick={() => openModuleEditor(module.id)}>
                      Edit
                    </button>
                    <button type="button" className="btn ghost" onClick={() => setPreviewModuleId(module.id)}>
                      Preview
                    </button>
                  </div>
                </div>
              ))}

              {!visibleModules.length && (
                <div className="module-builder-item">
                  <p className="small">No modules found for this category.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {workflowStep !== 'catalogue' && (
        <form className="grid" onSubmit={saveModule}>
          <div className="card">
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div className="h2" style={{ marginBottom: 4 }}>{selectedId ? 'Editing module' : 'Creating module'}</div>
                <p className="small">
                  {selectedModuleTitle}
                  {selectedId ? ` · ${categoryLabel(form.category)}` : ''}
                </p>
              </div>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button type="button" className="btn ghost" onClick={() => setWorkflowStep('catalogue')}>
                  Back to catalogue
                </button>
                <button type="button" className="btn ghost" onClick={() => setPreviewModuleId('__draft__')}>
                  Preview draft
                </button>
                <button className="btn" disabled={saving}>
                  {saving ? 'Saving...' : selectedId ? 'Save module' : 'Create module'}
                </button>
              </div>
            </div>
          </div>

          {workflowStep === 'details' && (
            <div className="grid" style={{ gap: 18 }}>
              <div className="card">
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div className="h2" style={{ marginBottom: 4 }}>Module details</div>
                    <p className="small">Set the core module information and attach any learner-facing resource link.</p>
                  </div>
                  <button type="button" className="btn secondary" onClick={() => setWorkflowStep('builder')}>
                    Continue to slide builder
                  </button>
                </div>

                <div className="grid" style={{ gap: 16, marginTop: 18 }}>
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
                    <input
                      className="input"
                      type="text"
                      placeholder="/documents/example.pdf or https://..."
                      value={form.contentUrl}
                      onChange={(event) => setForm((current) => ({ ...current, contentUrl: event.target.value }))}
                    />
                    <div className="row" style={{ marginTop: 10, flexWrap: 'wrap' }}>
                      <input
                        ref={resourceInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.webp,.gif,.svg,.mp4,.webm,.ogg"
                        style={{ display: 'none' }}
                        onChange={(event) => uploadResource(event.target.files?.[0])}
                      />
                      <button
                        type="button"
                        className="btn secondary"
                        disabled={uploadingResource}
                        onClick={() => resourceInputRef.current?.click()}
                      >
                        {uploadingResource ? 'Uploading...' : 'Upload resource'}
                      </button>
                      {form.contentUrl && (
                        <>
                          <a className="btn ghost" href={resolveApiUrl(form.contentUrl)} target="_blank" rel="noreferrer">
                            Open current resource
                          </a>
                          <button type="button" className="btn ghost" onClick={copyResourceUrl}>
                            {resourceCopied ? 'Copied' : 'Copy content URL'}
                          </button>
                        </>
                      )}
                    </div>
                    <p className="small" style={{ marginTop: 8 }}>
                      Uploaded files are stored in the core app persistent storage and returned as `/documents/...` links.
                    </p>
                    {resourceUploadError && (
                      <p style={{ color: 'var(--bad)', marginTop: 8 }}>{resourceUploadError}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="module-builder-panel">
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
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
            </div>
          )}

          {workflowStep === 'builder' && (
            <div className="grid" style={{ gap: 18 }}>
              <div className="card">
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div className="h2" style={{ marginBottom: 4 }}>Slide builder</div>
                    <p className="small">Work through the module one page at a time. Each slide now has its own editing page.</p>
                  </div>
                  <div className="row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn ghost" onClick={() => setWorkflowStep('details')}>
                      Back to details
                    </button>
                    <button type="button" className={`btn ghost${builderPage === 'slides' ? ' active' : ''}`} onClick={() => setBuilderPage('slides')}>
                      Slides
                    </button>
                    <button type="button" className={`btn ghost${builderPage === 'quiz' ? ' active' : ''}`} onClick={() => setBuilderPage('quiz')}>
                      Quiz
                    </button>
                  </div>
                </div>
              </div>

              {builderPage === 'slides' && activeSlide && (
                <>
                  <div className="module-builder-panel">
                    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                      <div>
                        <div className="h2" style={{ marginBottom: 4 }}>Slide pages</div>
                        <p className="small">Jump between slides or add a new one when you need another teaching moment.</p>
                      </div>
                      <div className="row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {SLIDE_TYPES.map((type) => (
                          <button key={type.value} type="button" className="btn ghost" onClick={() => addSlide(type.value)}>
                            Add {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="module-slide-tabs">
                      {builder.slides.map((slide, index) => (
                        <button
                          key={slide.id}
                          type="button"
                          className={`module-slide-tab${index === activeSlideIndex ? ' active' : ''}`}
                          onClick={() => setActiveSlideIndex(index)}
                        >
                          <span>Slide {index + 1}</span>
                          <strong>{slide.title || slide.eyebrow || 'Untitled'}</strong>
                        </button>
                      ))}
                      <button
                        type="button"
                        className={`module-slide-tab quiz-tab${builderPage === 'quiz' ? ' active' : ''}`}
                        onClick={() => setBuilderPage('quiz')}
                      >
                        <span>Final page</span>
                        <strong>Quiz</strong>
                      </button>
                    </div>
                  </div>

                  <div className="module-builder-panel">
                    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                      <div>
                        <div className="module-builder-item-title">Slide {activeSlideIndex + 1}</div>
                        <p className="small" style={{ marginTop: 4 }}>
                          {activeSlide.title || activeSlide.eyebrow || 'Build out this slide'}
                        </p>
                      </div>
                      <div className="row" style={{ gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <select className="input" style={{ minWidth: 150 }} value={activeSlide.type} onChange={(event) => updateSlide(activeSlide.id, { type: event.target.value })}>
                          {SLIDE_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                        <button type="button" className="btn ghost" onClick={() => moveSlide(activeSlide.id, -1)} disabled={activeSlideIndex === 0}>Move earlier</button>
                        <button type="button" className="btn ghost" onClick={() => moveSlide(activeSlide.id, 1)} disabled={activeSlideIndex === builder.slides.length - 1}>Move later</button>
                        <button type="button" className="btn ghost" onClick={() => duplicateSlide(activeSlide.id)}>Duplicate</button>
                        <button type="button" className="btn ghost" onClick={() => removeSlide(activeSlide.id)} disabled={builder.slides.length === 1}>Remove</button>
                      </div>
                    </div>

                    <div className="grid" style={{ gap: 16, marginTop: 16 }}>
                      <div className="grid two">
                        <div>
                          <label className="small">Eyebrow</label>
                          <input className="input" value={activeSlide.eyebrow} onChange={(event) => updateSlide(activeSlide.id, { eyebrow: event.target.value })} />
                        </div>
                        <div>
                          <label className="small">Fact pill</label>
                          <input className="input" value={activeSlide.fact} onChange={(event) => updateSlide(activeSlide.id, { fact: event.target.value })} />
                        </div>
                      </div>

                      <div className="grid two">
                        <div>
                          <label className="small">Tone</label>
                          <select className="input" value={activeSlide.tone} onChange={(event) => updateSlide(activeSlide.id, { tone: event.target.value })}>
                            <option value="default">Default</option>
                            <option value="warning">Warning</option>
                          </select>
                        </div>
                        <div>
                          <label className="small">Layout</label>
                          <select className="input" value={activeSlide.layout} onChange={(event) => updateSlide(activeSlide.id, { layout: event.target.value })}>
                            <option value="stacked">Stacked</option>
                            <option value="two-column">Two column</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="small">Learning focus</label>
                        <textarea
                          className="input"
                          rows={3}
                          value={joinLineList(activeSlide.meta)}
                          onChange={(event) => updateSlide(activeSlide.id, { meta: normaliseLineList(event.target.value) })}
                        />
                      </div>

                      <div>
                        <label className="small">Slide title</label>
                        <input className="input" value={activeSlide.title} onChange={(event) => updateSlide(activeSlide.id, { title: event.target.value })} />
                      </div>

                      <div className="grid two">
                        <div>
                          <label className="small">Image URL</label>
                          <div className="row" style={{ gap: 8 }}>
                            <input
                              className="input"
                              type="text"
                              placeholder="/documents/example.jpg or https://..."
                              value={activeSlide.imageUrl}
                              onChange={(event) => updateSlide(activeSlide.id, { imageUrl: event.target.value })}
                            />
                            <button
                              type="button"
                              className="btn ghost"
                              disabled={uploadingSlideMedia === `${activeSlide.id}:imageUrl`}
                              onClick={() => triggerSlideMediaUpload(activeSlide.id, 'imageUrl', '.png,.jpg,.jpeg,.webp,.gif,.svg')}
                            >
                              {uploadingSlideMedia === `${activeSlide.id}:imageUrl` ? 'Uploading...' : 'Upload'}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="small">Image alt text</label>
                          <input className="input" value={activeSlide.imageAlt} onChange={(event) => updateSlide(activeSlide.id, { imageAlt: event.target.value })} />
                        </div>
                      </div>

                      <div>
                        <label className="small">Image caption</label>
                        <input className="input" value={activeSlide.imageCaption} onChange={(event) => updateSlide(activeSlide.id, { imageCaption: event.target.value })} />
                      </div>

                      <div>
                        <label className="small">Video URL</label>
                        <div className="row" style={{ gap: 8 }}>
                          <input
                            className="input"
                            type="text"
                            placeholder="https://www.youtube.com/watch?v=... or direct video URL"
                            value={activeSlide.videoUrl}
                            onChange={(event) => updateSlide(activeSlide.id, { videoUrl: event.target.value })}
                          />
                          <button
                            type="button"
                            className="btn ghost"
                            disabled={uploadingSlideMedia === `${activeSlide.id}:videoUrl`}
                            onClick={() => triggerSlideMediaUpload(activeSlide.id, 'videoUrl', '.mp4,.webm,.ogg')}
                          >
                            {uploadingSlideMedia === `${activeSlide.id}:videoUrl` ? 'Uploading...' : 'Upload'}
                          </button>
                        </div>
                        <p className="small" style={{ marginTop: 8 }}>
                          Supports public video links such as YouTube, Vimeo, or direct `.mp4`/`.webm` files.
                        </p>
                      </div>

                      <div>
                        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                          <label className="small">Slide links</label>
                          <button type="button" className="btn ghost" onClick={() => addSlideLink(activeSlide.id)}>
                            Add link
                          </button>
                        </div>
                        <div className="grid" style={{ gap: 10, marginTop: 10 }}>
                          {(activeSlide.links || []).map((link, linkIndex) => (
                            <div key={`${activeSlide.id}-link-${linkIndex}`} className="grid two">
                              <input
                                className="input"
                                placeholder="Link label"
                                value={link.label || ''}
                                onChange={(event) => updateSlideLink(activeSlide.id, linkIndex, { label: event.target.value })}
                              />
                              <div className="row" style={{ gap: 8 }}>
                                <input
                                  className="input"
                                  placeholder="/documents/example.pdf or https://..."
                                  value={link.url || ''}
                                  onChange={(event) => updateSlideLink(activeSlide.id, linkIndex, { url: event.target.value })}
                                />
                                <button type="button" className="btn ghost" onClick={() => removeSlideLink(activeSlide.id, linkIndex)}>
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {(activeSlide.type === 'content' || activeSlide.type === 'hero') && (
                        <div>
                          <label className="small">Body</label>
                          <textarea className="input" rows={5} value={activeSlide.body} onChange={(event) => updateSlide(activeSlide.id, { body: event.target.value })} />
                        </div>
                      )}

                      {activeSlide.type === 'bullets' && (
                        <div>
                          <label className="small">Bullet points</label>
                          <textarea
                            className="input"
                            rows={6}
                            value={joinLineList(activeSlide.bullets)}
                            onChange={(event) => updateSlide(activeSlide.id, { bullets: normaliseLineList(event.target.value) })}
                          />
                          <p className="small" style={{ marginTop: 8 }}>One bullet per line.</p>
                        </div>
                      )}

                      {activeSlide.type === 'checklist' && (
                        <div>
                          <label className="small">Checklist items</label>
                          <textarea
                            className="input"
                            rows={6}
                            value={joinLineList(activeSlide.checklist)}
                            onChange={(event) => updateSlide(activeSlide.id, { checklist: normaliseLineList(event.target.value) })}
                          />
                          <p className="small" style={{ marginTop: 8 }}>One checklist item per line.</p>
                        </div>
                      )}
                    </div>

                    <div className="module-page-nav">
                      <button type="button" className="btn ghost" onClick={() => setActiveSlideIndex((current) => clampIndex(current - 1, builder.slides.length))} disabled={activeSlideIndex === 0}>
                        Previous slide
                      </button>
                      <p className="small">Page {activeSlideIndex + 1} of {builder.slides.length}</p>
                      {activeSlideIndex === builder.slides.length - 1 ? (
                        <button type="button" className="btn secondary" onClick={() => setBuilderPage('quiz')}>
                          Continue to quiz
                        </button>
                      ) : (
                        <button type="button" className="btn secondary" onClick={() => setActiveSlideIndex((current) => clampIndex(current + 1, builder.slides.length))}>
                          Next slide
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}

              {builderPage === 'quiz' && (
                <div className="module-builder-panel">
                  <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div>
                      <div className="h2" style={{ marginBottom: 4 }}>Quiz builder</div>
                      <p className="small">Finish the module with scored questions to confirm the learner has reviewed the material.</p>
                    </div>
                    <div className="row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button type="button" className="btn ghost" onClick={() => setBuilderPage('slides')}>
                        Back to slides
                      </button>
                      <button type="button" className="btn ghost" onClick={() => setBuilder((current) => ({ ...current, quiz: [...current.quiz, createEmptyQuizQuestion()] }))}>
                        Add question
                      </button>
                    </div>
                  </div>

                  <div className="grid" style={{ gap: 14, marginTop: 16 }}>
                    {builder.quiz.map((question, index) => (
                      <div key={question.id} className="module-builder-item">
                        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                          <div className="module-builder-item-title">Question {index + 1}</div>
                          <div className="row" style={{ gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn ghost" onClick={() => moveQuizQuestion(question.id, -1)} disabled={index === 0}>Move earlier</button>
                            <button type="button" className="btn ghost" onClick={() => moveQuizQuestion(question.id, 1)} disabled={index === builder.quiz.length - 1}>Move later</button>
                            <button type="button" className="btn ghost" onClick={() => duplicateQuizQuestion(question.id)}>Duplicate</button>
                            <button type="button" className="btn ghost" onClick={() => removeQuizQuestion(question.id)} disabled={builder.quiz.length === 1}>Remove</button>
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
                                options: options.length >= 2 ? options : [...options, '', ''].slice(0, 2),
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
              )}
            </div>
          )}
        </form>
      )}

      {selectedPreviewModule && (
        <div className="module-preview-overlay" onClick={() => setPreviewModuleId('')}>
          <div className="module-preview-dialog" onClick={(event) => event.stopPropagation()}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 16 }}>
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
