import { useEffect, useMemo, useState } from 'react';
import { resolveApiUrl } from '../api';

const CATEGORY_META = {
  HSE: { accent: '#D0202E', surface: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)' },
  GEOTECH: { accent: '#0f4c81', surface: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' },
  WATER: { accent: '#0284c7', surface: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)' },
  PLANT: { accent: '#a16207', surface: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' },
  ADMIN: { accent: '#475569', surface: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }
};

function safeJsonParse(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normaliseObjectives(value) {
  if (!value) return [];
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getModuleSummary(module) {
  const parsedDescription = safeJsonParse(module.description);
  if (parsedDescription?.overview) return parsedDescription.overview;

  const parsedBody = safeJsonParse(module.contentBody);
  if (parsedBody?.subtitle) return parsedBody.subtitle;

  return module.description || '';
}

function parseLegacyDeck(module) {
  const descriptionJson = safeJsonParse(module.description);
  if (descriptionJson?.sections?.length) {
    const slides = [
      {
        id: 'overview',
        type: 'hero',
        eyebrow: module.category || 'Module',
        title: module.title,
        body: descriptionJson.overview || module.description,
        meta: normaliseObjectives(module.learningObjectives)
      },
      ...descriptionJson.sections.map((section, index) => ({
        id: section.id || `section-${index + 1}`,
        type: Array.isArray(section.content) ? 'bullets' : 'content',
        eyebrow: section.type || `Section ${index + 1}`,
        title: section.title,
        body: Array.isArray(section.content) ? '' : section.content,
        bullets: Array.isArray(section.content) ? section.content : [],
      }))
    ];

    const quiz = descriptionJson.sections
      .flatMap((section) => (section.stopAndCheck || []).map((question, index) => ({
        id: `${section.id || section.title}-check-${index + 1}`,
        question,
        type: 'reflection'
      })));

    return { slides, quiz, title: module.title, subtitle: descriptionJson.overview || getModuleSummary(module) };
  }

  const body = module.contentBody || '';
  const blocks = body
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (!blocks.length) {
    return {
      slides: [{
        id: 'module-intro',
        type: 'hero',
        eyebrow: module.category || 'Module',
        title: module.title,
        body: module.description || 'Open this module to review the learning content.',
        meta: normaliseObjectives(module.learningObjectives)
      }],
      quiz: [],
      title: module.title,
      subtitle: getModuleSummary(module)
    };
  }

  const slides = [{
    id: 'module-intro',
    type: 'hero',
    eyebrow: module.category || 'Module',
    title: module.title,
    body: module.description || blocks[0],
    meta: normaliseObjectives(module.learningObjectives)
  }];

  const quiz = [];

  blocks.forEach((block, index) => {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
    if (!lines.length) return;

    const title = lines[0];
    const rest = lines.slice(1);
    const joined = rest.join('\n');

    if (/^quiz section/i.test(title)) {
      rest
        .filter((line) => /^\d+\./.test(line))
        .forEach((line, questionIndex) => {
          quiz.push({
            id: `quiz-${index + 1}-${questionIndex + 1}`,
            type: 'reflection',
            question: line.replace(/^\d+\.\s*/, '')
          });
        });
      return;
    }

    const bullets = rest.filter((line) => /^[-\d]/.test(line)).map((line) => line.replace(/^[-\d.]+\s*/, ''));
    slides.push({
      id: `slide-${index + 1}`,
      type: bullets.length >= 2 ? 'bullets' : 'content',
      eyebrow: `Slide ${slides.length}`,
      title,
      body: bullets.length >= 2 ? '' : joined,
      bullets
    });
  });

  return { slides, quiz, title: module.title, subtitle: getModuleSummary(module) };
}

function normaliseStructuredDeck(module, parsed) {
  return {
    title: parsed.title || module.title,
    subtitle: parsed.subtitle || module.description || '',
    slides: (parsed.slides || []).map((slide, index) => ({
      id: slide.id || `slide-${index + 1}`,
      type: slide.type || 'content',
      eyebrow: slide.eyebrow || `Slide ${index + 1}`,
      title: slide.title || '',
      body: slide.body || '',
      bullets: slide.bullets || [],
      checklist: slide.checklist || [],
      meta: slide.meta || [],
      tone: slide.tone || 'default',
      fact: slide.fact || '',
      links: slide.links || [],
      imageUrl: slide.imageUrl || '',
      imageAlt: slide.imageAlt || '',
      imageCaption: slide.imageCaption || '',
      videoUrl: slide.videoUrl || '',
      layout: slide.layout || 'stacked'
    })),
    quiz: parsed.quiz || []
  };
}

function normaliseVideoUrl(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url, window.location.origin);

    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname === '/watch') {
        const videoId = parsed.searchParams.get('v');
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      }

      if (parsed.pathname.startsWith('/embed/')) {
        return url;
      }
    }

    if (parsed.hostname === 'youtu.be') {
      const videoId = parsed.pathname.replace('/', '');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    if (parsed.hostname.includes('vimeo.com') && !parsed.hostname.includes('player.vimeo.com')) {
      const videoId = parsed.pathname.split('/').filter(Boolean)[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }

    return url;
  } catch {
    return url;
  }
}

function isEmbeddableVideo(url) {
  if (!url) return false;
  return /youtube\.com|youtu\.be|vimeo\.com|player\.vimeo\.com/i.test(url);
}

function isDirectVideoFile(url) {
  if (!url) return false;
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

function SlideMedia({ slide }) {
  const embedUrl = normaliseVideoUrl(slide.videoUrl);
  const hasImage = Boolean(slide.imageUrl);
  const hasVideo = Boolean(embedUrl);

  if (!hasImage && !hasVideo) return null;

  return (
    <div className="module-media-stack">
      {hasImage && (
        <div className="module-media-card">
          <img className="module-slide-image" src={resolveApiUrl(slide.imageUrl)} alt={slide.imageAlt || slide.title || 'Module image'} />
          {slide.imageCaption && <div className="module-media-caption">{slide.imageCaption}</div>}
        </div>
      )}

      {hasVideo && (
        <div className="module-media-card">
          {isEmbeddableVideo(embedUrl) ? (
            <div className="module-video-frame">
              <iframe
                src={resolveApiUrl(embedUrl)}
                title={slide.title || 'Module video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : isDirectVideoFile(embedUrl) ? (
            <video className="module-slide-video" controls src={resolveApiUrl(embedUrl)}>
              Your browser does not support embedded video playback.
            </video>
          ) : (
            <a className="module-slide-link" href={resolveApiUrl(embedUrl)} target="_blank" rel="noreferrer">
              Open video
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function SlideLinks({ links = [] }) {
  if (!links.length) return null;

  return (
    <div className="module-slide-links">
      {links.map((link, index) => (
        <a
          key={`${link.url}-${index}`}
          className="module-slide-link"
          href={resolveApiUrl(link.url)}
          target="_blank"
          rel="noreferrer"
        >
          {link.label || 'Open document'}
        </a>
      ))}
    </div>
  );
}

function getDeck(module) {
  const parsedBody = safeJsonParse(module.contentBody);
  if (parsedBody?.slides?.length) return normaliseStructuredDeck(module, parsedBody);
  return parseLegacyDeck(module);
}

function SlideContent({ slide, includeMedia = true }) {
  if (slide.type === 'checklist') {
    return (
      <>
        {includeMedia && <SlideMedia slide={slide} />}
        <div className="module-slide-grid">
          {slide.checklist.map((item, index) => (
            <div key={`${item}-${index}`} className="module-check-item">
              <span className="module-check-icon">+</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
        <SlideLinks links={slide.links} />
      </>
    );
  }

  if (slide.type === 'bullets') {
    return (
      <>
        {includeMedia && <SlideMedia slide={slide} />}
        <div className="module-slide-grid">
          {slide.bullets.map((item, index) => (
            <div key={`${item}-${index}`} className="module-bullet">
              <span className="module-bullet-index">{String(index + 1).padStart(2, '0')}</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
        <SlideLinks links={slide.links} />
      </>
    );
  }

  return (
    <>
      {includeMedia && <SlideMedia slide={slide} />}
      <p className="module-body-copy">{slide.body}</p>
      <SlideLinks links={slide.links} />
    </>
  );
}

function QuizView({ quiz, answers, setAnswers, submitted, setSubmitted, onGrade, attempts }) {
  const total = quiz.filter((item) => Array.isArray(item.options) && typeof item.correctIndex === 'number').length;
  const score = quiz.reduce((sum, item) => {
    if (!Array.isArray(item.options) || typeof item.correctIndex !== 'number') return sum;
    return sum + (answers[item.id] === item.correctIndex ? 1 : 0);
  }, 0);

  return (
    <div className="module-player-shell quiz-mode">
      <div className="module-player-chrome">
        <div>
          <div className="module-eyebrow">Interactive Quiz</div>
          <div className="h1" style={{ marginBottom: 4 }}>Check your understanding</div>
          <p className="small">Work through the questions below. You can retry before submitting the module for review.</p>
        </div>
        {submitted && total > 0 && (
          <div className="module-score-pill">
            Score {score}/{total} | Attempt {attempts}
          </div>
        )}
      </div>

      <div className="grid" style={{ gap: 14 }}>
        {quiz.map((item, index) => (
          <div key={item.id || index} className="module-quiz-card">
            <div className="module-quiz-number">Question {index + 1}</div>
            <div className="module-quiz-question">{item.question}</div>

            {Array.isArray(item.options) ? (
              <div className="module-quiz-options">
                {item.options.map((option, optionIndex) => {
                  const selected = answers[item.id] === optionIndex;
                  const correct = submitted && optionIndex === item.correctIndex;
                  const wrong = submitted && selected && optionIndex !== item.correctIndex;

                  return (
                    <button
                      key={`${item.id}-${optionIndex}`}
                      type="button"
                      className={`module-quiz-option ${selected ? 'selected' : ''} ${correct ? 'correct' : ''} ${wrong ? 'wrong' : ''}`}
                      onClick={() => {
                        setSubmitted(false);
                        setAnswers((current) => ({ ...current, [item.id]: optionIndex }));
                      }}
                    >
                      <span className="module-quiz-option-mark">{String.fromCharCode(65 + optionIndex)}</span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="module-reflection-box">
                <div className="small">Reflection prompt</div>
                <p>Use your learner notes to record your response before submitting the assignment for review.</p>
              </div>
            )}

            {submitted && item.explanation && (
              <div className="module-quiz-feedback">
                {item.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {!!total && (
        <div className="module-quiz-actions">
          <button type="button" className="btn secondary" onClick={() => setAnswers({})}>
            Reset answers
          </button>
          <button type="button" className="btn" onClick={() => onGrade(score, total)}>
            Grade quiz
          </button>
        </div>
      )}
    </div>
  );
}

export default function ModulePlayer({ module, onAssessmentChange, initialAssessmentSummary = null }) {
  const deck = useMemo(() => getDeck(module), [module]);
  const meta = CATEGORY_META[module.category] || CATEGORY_META.GEOTECH;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(Boolean(initialAssessmentSummary));
  const [attempts, setAttempts] = useState(initialAssessmentSummary?.attempts || 0);
  const [assessmentSummary, setAssessmentSummary] = useState(initialAssessmentSummary);
  const [quizStartedAt, setQuizStartedAt] = useState(null);

  const slideCount = deck.slides.length;
  const hasQuiz = deck.quiz.length > 0;
  const onQuiz = hasQuiz && step === slideCount;
  const progressTotal = slideCount + (hasQuiz ? 1 : 0);
  const progress = ((step + 1) / Math.max(progressTotal, 1)) * 100;
  const slide = deck.slides[Math.min(step, slideCount - 1)];
  const useTwoColumnMedia = slide?.layout === 'two-column' && (slide?.imageUrl || slide?.videoUrl);

  useEffect(() => {
    if (onQuiz && !quizStartedAt) {
      setQuizStartedAt(Date.now());
    }
  }, [onQuiz, quizStartedAt]);

  useEffect(() => {
    if (onAssessmentChange && assessmentSummary) {
      onAssessmentChange(assessmentSummary);
    }
  }, [assessmentSummary, onAssessmentChange]);

  function handleGrade(score, totalQuestions) {
    const nextAttempts = attempts + 1;
    const durationSeconds = quizStartedAt ? Math.max(0, Math.round((Date.now() - quizStartedAt) / 1000)) : 0;
    const nextSummary = {
      score,
      totalQuestions,
      attempts: nextAttempts,
      durationSeconds
    };

    setAttempts(nextAttempts);
    setSubmitted(true);
    setAssessmentSummary(nextSummary);
  }

  return (
    <div className="module-player" style={{ '--module-accent': meta.accent, '--module-surface': meta.surface }}>
      <div className="module-player-header">
        <div>
          <div className="module-eyebrow">{module.category || 'Module'} learning path</div>
          <div className="module-title">{deck.title}</div>
          <p className="module-subtitle">{deck.subtitle}</p>
        </div>
        <div className="module-progress-cluster">
          <div className="module-progress-label">
            {onQuiz ? 'Quiz' : `Slide ${step + 1} of ${slideCount}`}
          </div>
          <div className="module-progress-rail">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {onQuiz ? (
        <QuizView
          quiz={deck.quiz}
          answers={answers}
          setAnswers={setAnswers}
          submitted={submitted}
          setSubmitted={setSubmitted}
          onGrade={handleGrade}
          attempts={attempts}
        />
      ) : (
        <div className={`module-player-shell ${slide?.tone === 'warning' ? 'tone-warning' : ''}`}>
          <div className={`module-slide-frame ${slide?.layout === 'two-column' ? 'media-two-column' : ''}`}>
            <div className="module-slide-copy">
              <div className="module-eyebrow">{slide?.eyebrow}</div>
              <div className="module-slide-title">{slide?.title}</div>
              {slide?.fact && <div className="module-fact-pill">{slide.fact}</div>}
              <SlideContent slide={slide} includeMedia={!useTwoColumnMedia} />
            </div>

            <div className="module-slide-side">
              {useTwoColumnMedia && (
                <div className="module-side-card module-side-media">
                  <SlideMedia slide={slide} />
                </div>
              )}

              <div className="module-side-card">
                <div className="small">Estimated duration</div>
                <div className="module-side-value">{module.estimatedMinutes ? `${module.estimatedMinutes} min` : 'Self-paced'}</div>
              </div>

              {slide?.meta?.length > 0 && (
                <div className="module-side-card">
                  <div className="small">Learning focus</div>
                  <div className="module-focus-list">
                    {slide.meta.map((item, index) => (
                      <div key={`${item}-${index}`} className="module-focus-item">{item}</div>
                    ))}
                  </div>
                </div>
              )}

              {!slide?.meta?.length && module.learningObjectives && (
                <div className="module-side-card">
                  <div className="small">Learning objectives</div>
                  <div className="module-focus-list">
                    {normaliseObjectives(module.learningObjectives).map((item, index) => (
                      <div key={`${item}-${index}`} className="module-focus-item">{item}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="module-nav">
        <button type="button" className="btn ghost" disabled={step === 0} onClick={() => setStep((current) => Math.max(current - 1, 0))}>
          Previous
        </button>
        <div className="module-nav-hint">
          {hasQuiz ? 'Slides first, quiz last' : 'Continue through the lesson'}
        </div>
        <button
          type="button"
          className="btn"
          onClick={() => setStep((current) => Math.min(current + 1, progressTotal - 1))}
          disabled={step >= progressTotal - 1}
        >
          {step === slideCount - 1 && hasQuiz ? 'Start quiz' : step >= progressTotal - 1 ? 'Finished' : 'Next'}
        </button>
      </div>
    </div>
  );
}
