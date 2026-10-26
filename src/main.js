const app = document.getElementById('app')
const esc = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const body = draft => (draft.body || '').replaceAll('\\n', '\n')
const ready = draft => draft.status === 'ready' && body(draft).trim() && !/\[[^\]]*\]|___|\.\.\./.test(body(draft))
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Denver', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
let request = 0
async function json(path) {
  const response = await fetch(path, { cache: 'no-store' })
  if (!response.ok) return null
  try { return await response.json() } catch { return null }
}
function sources(draft) {
  return (draft.links || []).filter(link => /^https?:\/\//.test(link)).map(link => `<li><a href="${esc(link)}" target="_blank" rel="noopener noreferrer">${esc(link)}</a></li>`).join('')
}
function card(draft, index) {
  const isReady = ready(draft)
  return `<article class="card">
    <h2>${esc(draft.title)}</h2>
    <div class="meta">${isReady ? 'Ready to copy' : 'Needs your input'}${draft.topic ? ` · ${esc(draft.topic)}` : ''}</div>
    <div class="draft-body" id="post-${index}" tabindex="0">${esc(body(draft))}</div>
    ${isReady ? `<button data-copy="${index}">Copy post</button>` : '<p class="sub">Complete and verify this draft before posting.</p>'}
    <details><summary>Sources and review notes</summary>
      ${draft.checkedAt ? `<p>Reviewed ${esc(draft.checkedAt)}</p>` : ''}
      <ul>${(draft.bullets || []).map(fact => `<li>${esc(fact)}</li>`).join('')}</ul>
      <ul>${sources(draft)}</ul>
    </details>
  </article>`
}
async function route(date = today()) {
  const current = ++request
  app.innerHTML = '<main role="status">Loading posts…</main>'
  try {
    const [index, data] = await Promise.all([json('/drafts/index.json'), json(`/drafts/${date}.json`)])
    if (current !== request) return
    const drafts = data?.drafts || []
    const complete = drafts.filter(ready)
    const incomplete = drafts.filter(draft => !ready(draft))
    app.innerHTML = `<header><h1>Daily Drafts</h1>
      <div class="sub">@UpgradeAmerican · Review, copy, post</div>
      <div class="date-row"><label for="date">Day</label><input type="date" id="date" value="${esc(date)}"></div>
      <p class="banner">${complete.length} ready-to-copy posts. Review sources, then post in X yourself.</p>
      <p id="copy-status" role="status" aria-live="polite"></p>
    </header><main>
      ${complete.length ? complete.map(card).join('') : '<p class="empty">No complete posts for this day.</p>'}
      ${index?.latest && index.latest !== date ? '<button id="latest">Open latest day</button>' : ''}
      ${incomplete.length ? `<details><summary>${incomplete.length} drafts need your input</summary>${incomplete.map(draft => card(draft, -1)).join('')}</details>` : ''}
      <details><summary>How to use</summary><p>Read a complete post and check its sources. Copy the post, then paste into X and publish yourself. Copy includes only the post text. Personal stories require your own confirmed details.</p><p>New days appear when the daily author adds a dated draft file. This app does not generate posts.</p></details>
    </main>`
    document.getElementById('date').onchange = event => route(event.target.value || today())
    document.getElementById('latest')?.addEventListener('click', () => route(index.latest))
    document.querySelectorAll('[data-copy]').forEach(button => {
      button.onclick = async () => {
        try {
          await navigator.clipboard.writeText(body(complete[Number(button.dataset.copy)]))
          button.textContent = 'Copied'
          document.getElementById('copy-status').textContent = 'Post copied. Paste into X when ready.'
        } catch {
          document.getElementById('copy-status').textContent = 'Copy unavailable. Select the post text and copy it manually.'
          const range = document.createRange()
          range.selectNodeContents(document.getElementById(`post-${button.dataset.copy}`))
          const selection = window.getSelection()
          selection.removeAllRanges()
          selection.addRange(range)
        }
      }
    })
  } catch {
    if (current !== request) return
    app.innerHTML = '<main><p>Could not load drafts. Check your connection.</p><button id="retry">Retry</button></main>'
    document.getElementById('retry').onclick = () => route(date)
  }
}
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
route()
