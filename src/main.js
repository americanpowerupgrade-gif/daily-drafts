
const app = document.getElementById('app')

function todayStr() {
  // America/Denver date for Brian
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Denver', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

async function loadIndex() {
  const r = await fetch('/drafts/index.json', { cache: 'no-store' })
  if (!r.ok) return { dates: [], latest: null }
  return r.json()
}

async function loadDay(date) {
  const r = await fetch(`/drafts/${date}.json`, { cache: 'no-store' })
  if (!r.ok) return null
  const ct = r.headers.get('content-type') || ''
  if (ct.includes('text/html')) return null
  try { return await r.json() } catch { return null }
}

function badgeOcr(ocr) {
  const cls = String(ocr).toLowerCase().includes('strong') && !String(ocr).toLowerCase().includes('ok') ? 'strong' : 'ok'
  return `<span class="badge ${cls}">OCR ${ocr}</span>`
}

function renderHome(date, data, index) {
  const list = (data && data.drafts) ? data.drafts : []
  app.innerHTML = `
    <header>
      <h1>Daily Drafts</h1>
      <div class="sub">@UpgradeAmerican · rewrite in your voice before posting</div>
      <div class="banner"><strong>FRAMEWORK</strong> — these are outlines. Rewrite, then post yourself. ChatGPT for typos only.</div>
      <nav class="tabs">
        <button class="active" id="tab-drafts">Drafts</button>
        <button id="tab-how">How to use</button>
      </nav>
      <div class="date-row">
        <label for="date">Day</label>
        <input type="date" id="date" value="${date}" />
      </div>
    </header>
    <main id="main"></main>
  `
  const main = document.getElementById('main')
  if (!list.length) {
    main.innerHTML = `<div class="empty">No frameworks for this day.${index.latest ? ` <button id="jump">Jump to latest drafts</button>` : ''}</div>`
    document.getElementById('jump')?.addEventListener('click', () => route(index.latest))
  } else {
    main.innerHTML = list.map(d => `
      <article class="card">
        <h2>${escapeHtml(d.title)}</h2>
        <div class="meta">
          ${badgeOcr(d.ocr)}
          ${d.growth ? '<span class="badge growth">Growth bet</span>' : ''}
          <span class="badge framework">Framework</span>
        </div>
        <div class="meta">Window: ${escapeHtml(d.window || '')}</div>
        <div>${escapeHtml(d.angle || '')}</div>
        <button data-id="${d.id}">Open</button>
      </article>
    `).join('')
    main.querySelectorAll('button[data-id]').forEach(btn => {
      btn.addEventListener('click', () => route(date, btn.dataset.id))
    })
  }
  document.getElementById('date').addEventListener('change', (e) => route(e.target.value))
  document.getElementById('tab-how').addEventListener('click', () => renderHow(date))
}

function renderDetail(date, draft) {
  app.innerHTML = `
    <header>
      <button class="secondary" id="back">← Back</button>
      <h1 style="margin-top:12px">${escapeHtml(draft.title)}</h1>
      <div class="meta">
        ${badgeOcr(draft.ocr)}
        ${draft.growth ? '<span class="badge growth">Growth bet</span>' : ''}
        <span class="badge framework">Framework</span>
      </div>
      <div class="banner">Rewrite in your voice before posting. Do not paste blindly.</div>
    </header>
    <main>
      <h3>Angle</h3>
      <p>${escapeHtml(draft.angle || '')}</p>
      <h3>Facts</h3>
      <ul>${(draft.bullets || []).map(b => `<li>${escapeHtml(b)}</li>`).join('')}</ul>
      <h3>Framework draft</h3>
      <div class="draft-body" id="body">${escapeHtml((draft.body || '').replaceAll('\\n', '\n'))}</div>
      <button id="copy">Copy text</button>
      <h3>Links</h3>
      <ul>${(draft.links || []).map(l => `<li><a href="${l}" target="_blank" rel="noopener">${l}</a></li>`).join('')}</ul>
    </main>
  `
  document.getElementById('back').onclick = () => route(date)
  document.getElementById('copy').onclick = async () => {
    const text = (draft.body || '').replaceAll('\\n', '\n')
    await navigator.clipboard.writeText(text)
    const b = document.getElementById('copy')
    b.textContent = 'Copied'
    setTimeout(() => b.textContent = 'Copy text', 1200)
  }
}

function renderHow(date) {
  app.innerHTML = `
    <header>
      <h1>How to use</h1>
      <nav class="tabs">
        <button id="tab-drafts">Drafts</button>
        <button class="active" id="tab-how">How to use</button>
      </nav>
    </header>
    <main>
      <ol>
        <li>Open today’s frameworks.</li>
        <li>Rewrite the post in <strong>your</strong> voice (X filters AI writing for monetization).</li>
        <li>Optional: ChatGPT for typos only — don’t let it invent a new take.</li>
        <li>Post yourself in the X app. No auto-publish.</li>
      </ol>
      <p class="sub">Agents add new days as JSON under /drafts. Mac .md files remain a backup.</p>
      <button id="back">Back to drafts</button>
    </main>
  `
  document.getElementById('tab-drafts').onclick = () => route(date)
  document.getElementById('back').onclick = () => route(date)
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

async function route(date, id) {
  const index = await loadIndex()
  const d = date || index.latest || todayStr()
  const data = await loadDay(d)
  if (id && data) {
    const draft = data.drafts.find(x => String(x.id) === String(id))
    if (draft) return renderDetail(d, draft)
  }
  renderHome(d, data, index)
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

route(todayStr())
