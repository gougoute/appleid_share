const API =
  (typeof window !== 'undefined' && window.APP_CONFIG?.API_URL) ||
  '/api/aggregate';
const MIN_LOAD_MS = 1000;

const fields = [
  { key: 'email', label: '账号', copy: true, mono: true },
  { key: 'password', label: '密码', copy: true, mono: true },
  { key: 'status', label: '状态', copy: false },
  { key: 'checkTime', label: '检测时间', copy: false },
  { key: 'region', label: '地区', copy: false },
];

const cardEl = document.getElementById('accountCard');
const refreshBtn = document.getElementById('refreshBtn');
const toastEl = document.getElementById('toast');

const BTN_LABEL = '换一条账号';

let toastTimer = null;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2000);
}

function escapeHtml(s) {
  const el = document.createElement('span');
  el.textContent = String(s);
  return el.innerHTML;
}

async function copyText(text, btn) {
  if (!text || text === '--') {
    showToast('暂无可复制内容');
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  if (btn) {
    const orig = btn.textContent;
    btn.textContent = '已复制';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = orig;
      btn.classList.remove('copied');
    }, 1500);
  }
  showToast('已复制到剪贴板');
}

function setLoading(loading) {
  refreshBtn.disabled = loading;
  refreshBtn.classList.toggle('is-loading', loading);
  refreshBtn.textContent = loading ? '' : BTN_LABEL;
}

function renderSkeleton() {
  cardEl.classList.remove('is-fading-in');
  cardEl.classList.add('loading');
  cardEl.innerHTML = fields
    .map(
      (f) => `
    <div class="row">
      <span class="row-label">${f.label}</span>
      <span class="row-value${f.mono ? ' mono' : ''}">—</span>
    </div>`
    )
    .join('');
}

function renderCard(data) {
  cardEl.classList.remove('loading');
  cardEl.innerHTML = fields
    .map((f) => {
      const val = data[f.key] ?? '--';
      const copyBtn = f.copy
        ? `<button type="button" class="btn-copy">复制</button>`
        : '';
      return `
      <div class="row" data-field="${f.key}">
        <span class="row-label">${f.label}</span>
        <span class="row-value${f.mono ? ' mono' : ''}">${escapeHtml(val)}</span>
        ${copyBtn}
      </div>`;
    })
    .join('');

  cardEl.querySelectorAll('.row').forEach((row) => {
    const btn = row.querySelector('.btn-copy');
    if (!btn) return;
    const key = row.dataset.field;
    const text = data[key] ?? '--';
    btn.addEventListener('click', () => copyText(text, btn));
  });

  requestAnimationFrame(() => {
    cardEl.classList.add('is-fading-in');
  });
}

function renderError(message) {
  cardEl.classList.remove('loading', 'is-fading-in');
  cardEl.innerHTML = `<p class="error-msg">${escapeHtml(message)}</p>`;
}

async function loadAccount() {
  setLoading(true);
  renderSkeleton();

  try {
    const [res] = await Promise.all([fetch(API), delay(MIN_LOAD_MS)]);
    const json = await res.json();

    if (!json.success || !json.data) {
      renderError(json.message || '获取账号失败，请稍后重试');
      return;
    }
    renderCard(json.data);
  } catch {
    renderError(
      API.startsWith('http')
        ? '无法连接接口，请确认 API 地址与服务器 CORS 配置'
        : '网络异常，请检查连接后重试'
    );
  } finally {
    setLoading(false);
  }
}

refreshBtn.addEventListener('click', loadAccount);
loadAccount();
