/* ============================================================
   Burns Depression Checklist
   Questionnaire from "Feeling Good" by David D. Burns.
   ============================================================ */

const CATEGORIES = [
  'Thoughts and Feelings',
  'Activities and Personal Relationships',
  'Physical Symptoms',
  'Suicidal Urges'
];

const QUESTIONS = [
  { category: 0, text: 'Feeling sad or down in the dumps' },
  { category: 0, text: 'Feeling unhappy or blue' },
  { category: 0, text: 'Crying spells or tearfulness' },
  { category: 0, text: 'Feeling discouraged' },
  { category: 0, text: 'Feeling hopeless' },
  { category: 0, text: 'Low self esteem' },
  { category: 0, text: 'Feeling worthless or inadequate' },
  { category: 0, text: 'Guilt or shame' },
  { category: 0, text: 'Criticizing yourself or blaming others' },
  { category: 0, text: 'Difficulty making decisions' },
  { category: 1, text: 'Loss of interest in family, friends or colleagues' },
  { category: 1, text: 'Loneliness' },
  { category: 1, text: 'Spending less time with family or friends' },
  { category: 1, text: 'Loss of motivation' },
  { category: 1, text: 'Loss of interest in work or other activities' },
  { category: 1, text: 'Avoiding work or other activities' },
  { category: 1, text: 'Loss of pleasure or satisfaction in life' },
  { category: 2, text: 'Feeling tired' },
  { category: 2, text: 'Difficulty sleeping or sleeping too much' },
  { category: 2, text: 'Decreased or increased appetite' },
  { category: 2, text: 'Loss of interest in sex' },
  { category: 2, text: 'Worrying about your health' },
  { category: 3, text: 'Do you have any suicidal thoughts?' },
  { category: 3, text: 'Would you like to end your life?' },
  { category: 3, text: 'Do you have a plan for harming yourself?' }
];

const OPTIONS = ['Not at all', 'Somewhat', 'Moderately', 'A lot', 'Extremely'];

const BANDS = [
  {
    min: 0, max: 5, label: 'No depression', weight: 6,
    blurb: 'Your answers do not point to depression at the moment. Scores drift over time, so it can be worth checking in again now and then.'
  },
  {
    min: 6, max: 10, label: 'Normal but unhappy', weight: 5,
    blurb: 'This sits in the range of ordinary unhappiness — real, but something most people move through. Sleep, movement and company tend to shift it.'
  },
  {
    min: 11, max: 25, label: 'Mild depression', weight: 15,
    blurb: 'Your answers point to mild depression. It is worth taking seriously and worth saying out loud to someone you trust.'
  },
  {
    min: 26, max: 50, label: 'Moderate depression', weight: 25,
    blurb: 'Your answers point to moderate depression. This is a good moment to speak with a doctor or a therapist rather than wait it out.'
  },
  {
    min: 51, max: 75, label: 'Severe depression', weight: 25,
    blurb: 'Your answers point to severe depression. Please do not carry this alone — professional support makes a real difference here.'
  },
  {
    min: 76, max: 100, label: 'Extreme depression', weight: 25,
    blurb: 'Your answers point to extreme depression. Please reach out to a professional or a helpline today.'
  }
];

const STORAGE_KEY = 'bdc.progress.v1';
const THEME_KEY = 'bdc.theme';
const SUICIDAL_CATEGORY = 3;
const ADVANCE_DELAY = 260;

const el = (id) => document.getElementById(id);
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const views = {
  intro: el('view-intro'),
  quiz: el('view-quiz'),
  results: el('view-results')
};

let answers = new Array(QUESTIONS.length).fill(null);
let current = 0;
let advanceTimer = null;
let skipAdvanceOnce = false;

/* ------------------------------------------------------------
   Theme
   ------------------------------------------------------------ */

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  el('theme-toggle-label').textContent =
    theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
}

function initTheme() {
  let stored = null;
  try {
    stored = localStorage.getItem(THEME_KEY);
  } catch (err) { /* storage unavailable */ }

  const system = matchMedia('(prefers-color-scheme: dark)');
  applyTheme(stored || (system.matches ? 'dark' : 'light'));

  system.addEventListener('change', (event) => {
    let hasPreference = false;
    try {
      hasPreference = Boolean(localStorage.getItem(THEME_KEY));
    } catch (err) { /* storage unavailable */ }
    if (!hasPreference) applyTheme(event.matches ? 'dark' : 'light');
  });

  el('theme-toggle').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (err) { /* storage unavailable */ }
  });
}

/* ------------------------------------------------------------
   Persistence
   ------------------------------------------------------------ */

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, current, savedAt: Date.now() }));
  } catch (err) { /* storage unavailable */ }
}

function clearSaved() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) { /* storage unavailable */ }
}

function loadSaved() {
  let raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (err) {
    return null;
  }
  if (!raw) return null;

  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data.answers) || data.answers.length !== QUESTIONS.length) return null;

    const cleaned = data.answers.map((value) =>
      Number.isInteger(value) && value >= 0 && value < OPTIONS.length ? value : null);
    if (!cleaned.some((value) => value !== null)) return null;

    const index = Number.isInteger(data.current)
      ? Math.min(Math.max(data.current, 0), QUESTIONS.length)
      : 0;
    return { answers: cleaned, current: index };
  } catch (err) {
    return null;
  }
}

/* ------------------------------------------------------------
   Views
   ------------------------------------------------------------ */

function showView(name) {
  Object.entries(views).forEach(([key, node]) => {
    node.hidden = key !== name;
  });
  if (name !== 'quiz') window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
}

/* ------------------------------------------------------------
   Quiz
   ------------------------------------------------------------ */

function buildOptions() {
  const container = el('options');
  container.innerHTML = '';

  OPTIONS.forEach((label, value) => {
    const option = document.createElement('label');
    option.className = 'option';

    const input = document.createElement('input');
    input.className = 'option__input';
    input.type = 'radio';
    input.name = 'answer';
    input.value = String(value);

    const key = document.createElement('span');
    key.className = 'option__key';
    key.setAttribute('aria-hidden', 'true');
    key.textContent = String(value + 1);

    const text = document.createElement('span');
    text.className = 'option__label';
    text.textContent = label;

    const score = document.createElement('span');
    score.className = 'option__score';
    score.setAttribute('aria-hidden', 'true');
    score.textContent = `${value} pt${value === 1 ? '' : 's'}`;

    option.append(input, key, text, score);
    container.append(option);
  });

  container.addEventListener('keydown', (event) => {
    if (event.key.startsWith('Arrow')) {
      skipAdvanceOnce = true;
      setTimeout(() => { skipAdvanceOnce = false; }, 0);
    }
  });

  container.addEventListener('change', (event) => {
    const value = Number(event.target.value);
    if (!Number.isInteger(value)) return;
    answer(value, !skipAdvanceOnce);
  });
}

function answer(value, advance) {
  answers[current] = value;
  save();
  renderOptions();
  el('btn-next').disabled = false;

  if (!advance) return;
  clearTimeout(advanceTimer);
  advanceTimer = setTimeout(goNext, reducedMotion() ? 0 : ADVANCE_DELAY);
}

function renderOptions() {
  const inputs = el('options').querySelectorAll('.option__input');
  inputs.forEach((input) => {
    input.checked = Number(input.value) === answers[current];
  });
}

function renderQuestion({ focus = true } = {}) {
  const question = QUESTIONS[current];
  const total = QUESTIONS.length;

  el('category').textContent = CATEGORIES[question.category];
  el('question-text').textContent = question.text;
  el('counter-current').textContent = String(current + 1);
  el('progress-fill').style.width = `${((current + 1) / total) * 100}%`;
  el('section-note').hidden = question.category !== SUICIDAL_CATEGORY;

  const progress = document.querySelector('.progress');
  progress.setAttribute('aria-valuenow', String(current + 1));
  progress.setAttribute('aria-valuetext', `Question ${current + 1} of ${total}`);

  renderOptions();
  el('btn-back').disabled = current === 0;
  el('btn-next').disabled = answers[current] === null;
  el('btn-next').textContent = current === total - 1 ? 'See my results' : 'Next';

  if (focus) el('question-text').focus({ preventScroll: true });
}

function goToQuestion(index, options) {
  clearTimeout(advanceTimer);
  current = Math.min(Math.max(index, 0), QUESTIONS.length - 1);
  save();
  showView('quiz');
  renderQuestion(options);
}

function goNext() {
  if (answers[current] === null) return;
  if (current === QUESTIONS.length - 1) {
    showResults();
    return;
  }
  goToQuestion(current + 1);
}

function goBack() {
  if (current === 0) return;
  goToQuestion(current - 1);
}

/* ------------------------------------------------------------
   Scoring
   ------------------------------------------------------------ */

const total = () => answers.reduce((sum, value) => sum + (value || 0), 0);
const answeredCount = () => answers.filter((value) => value !== null).length;
const bandFor = (score) => BANDS.find((band) => score >= band.min && score <= band.max);
const bandColor = (index) => `var(--band-${index})`;

function categoryTotals() {
  return CATEGORIES.map((name, index) => {
    const items = QUESTIONS.reduce((list, question, position) => {
      if (question.category === index) list.push(position);
      return list;
    }, []);
    return {
      name,
      score: items.reduce((sum, position) => sum + (answers[position] || 0), 0),
      max: items.length * (OPTIONS.length - 1)
    };
  });
}

/* ------------------------------------------------------------
   Results
   ------------------------------------------------------------ */

function buildBandsTable() {
  const body = el('bands-body');
  body.innerHTML = '';

  BANDS.forEach((band, index) => {
    const row = document.createElement('tr');
    row.dataset.band = String(index);
    row.style.setProperty('--band-color', bandColor(index));

    const level = document.createElement('td');
    const levelText = document.createElement('span');
    levelText.className = 'bands__level';
    levelText.textContent = band.label;
    level.append(levelText);

    const range = document.createElement('td');
    range.textContent = `${band.min}–${band.max}`;

    row.append(level, range);
    body.append(row);
  });
}

function buildGauge() {
  const track = el('gauge-track');
  track.innerHTML = '';

  BANDS.forEach((band, index) => {
    const segment = document.createElement('div');
    segment.className = 'gauge__segment';
    segment.style.flexGrow = String(band.weight);
    segment.style.setProperty('--seg-color', bandColor(index));
    segment.dataset.band = String(index);
    track.append(segment);
  });
}

function countUp(node, value) {
  if (reducedMotion() || value === 0) {
    node.textContent = String(value);
    return;
  }

  const duration = 700;
  const start = performance.now();

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    node.textContent = String(Math.round(value * eased));
    if (progress < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

function renderBreakdown() {
  const list = el('breakdown');
  list.innerHTML = '';

  categoryTotals().forEach((category) => {
    const item = document.createElement('li');

    const head = document.createElement('div');
    head.className = 'breakdown__head';

    const name = document.createElement('span');
    name.className = 'breakdown__name';
    name.textContent = category.name;

    const value = document.createElement('span');
    value.className = 'breakdown__value';
    value.textContent = `${category.score} / ${category.max}`;

    head.append(name, value);

    const track = document.createElement('div');
    track.className = 'breakdown__track';

    const fill = document.createElement('span');
    fill.className = 'breakdown__fill';
    fill.style.width = '0%';
    track.append(fill);

    item.append(head, track);
    list.append(item);

    requestAnimationFrame(() => {
      fill.style.width = `${(category.score / category.max) * 100}%`;
    });
  });
}

function showResults() {
  const score = total();
  const bandIndex = BANDS.indexOf(bandFor(score));
  const band = BANDS[bandIndex];

  current = QUESTIONS.length;
  save();

  views.results.style.setProperty('--band-color', bandColor(bandIndex));
  el('score-band').textContent = band.label;
  el('score-blurb').textContent = band.blurb;
  countUp(el('score-value'), score);

  el('gauge-marker').style.left = `${score}%`;
  el('gauge-track').querySelectorAll('.gauge__segment').forEach((segment) => {
    segment.dataset.active = String(Number(segment.dataset.band) <= bandIndex);
  });

  el('bands-body').querySelectorAll('tr').forEach((row) => {
    if (Number(row.dataset.band) === bandIndex) {
      row.setAttribute('aria-current', 'true');
    } else {
      row.removeAttribute('aria-current');
    }
  });

  renderBreakdown();

  const atRisk = QUESTIONS.some((question, index) =>
    question.category === SUICIDAL_CATEGORY && (answers[index] || 0) > 0);
  el('crisis').hidden = !atRisk;

  el('copy-status').textContent = '';
  showView('results');
}

function resultsAsText() {
  const score = total();
  const lines = [
    'Burns Depression Checklist',
    `Score: ${score} / 100 — ${bandFor(score).label}`,
    `Date: ${new Date().toLocaleDateString()}`,
    '',
    ...categoryTotals().map((category) => `${category.name}: ${category.score} / ${category.max}`),
    '',
    'A screening score, not a diagnosis.'
  ];
  return lines.join('\n');
}

async function copyResults() {
  const status = el('copy-status');
  const text = resultsAsText();

  try {
    await navigator.clipboard.writeText(text);
    status.textContent = 'Copied to your clipboard.';
  } catch (err) {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    const ok = document.execCommand && document.execCommand('copy');
    area.remove();
    status.textContent = ok ? 'Copied to your clipboard.' : 'Copying is blocked in this browser.';
  }
}

/* ------------------------------------------------------------
   Start up
   ------------------------------------------------------------ */

function restart() {
  answers = new Array(QUESTIONS.length).fill(null);
  clearSaved();
  goToQuestion(0);
}

function initIntro() {
  const saved = loadSaved();
  if (!saved) return;

  answers = saved.answers;
  current = Math.min(saved.current, QUESTIONS.length - 1);

  const resume = el('btn-resume');
  resume.hidden = false;
  el('resume-meta').textContent = `· ${answeredCount()} of ${QUESTIONS.length} answered`;
  resume.addEventListener('click', () => goToQuestion(current));

  el('btn-start').textContent = 'Start over';
  el('btn-start').classList.replace('button--primary', 'button--ghost');
  resume.classList.replace('button--ghost', 'button--primary');
}

function initKeyboard() {
  document.addEventListener('keydown', (event) => {
    if (views.quiz.hidden) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    const key = event.key;
    const target = event.target instanceof Element ? event.target : null;
    const inOptions = Boolean(target && target.classList.contains('option__input'));
    const onControl = Boolean(target && target.closest('button, a'));

    if (onControl && (key === 'Enter' || key === ' ')) return;

    if (key >= '1' && key <= String(OPTIONS.length)) {
      event.preventDefault();
      answer(Number(key) - 1, true);
      return;
    }

    if (key === 'Enter' || (key === 'ArrowRight' && !inOptions)) {
      event.preventDefault();
      goNext();
      return;
    }

    if (key === 'ArrowLeft' && !inOptions) {
      event.preventDefault();
      goBack();
    }
  });
}

function initServiceWorker() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline support is optional */ });
  });
}

function init() {
  initTheme();
  buildOptions();
  buildBandsTable();
  buildGauge();
  initIntro();
  initKeyboard();

  el('question-text').tabIndex = -1;

  el('btn-start').addEventListener('click', restart);
  el('btn-next').addEventListener('click', goNext);
  el('btn-back').addEventListener('click', goBack);
  el('btn-review').addEventListener('click', () => goToQuestion(0));
  el('btn-restart').addEventListener('click', restart);
  el('btn-copy').addEventListener('click', copyResults);

  initServiceWorker();
}

init();
