import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
const read = path => JSON.parse(readFileSync(path, 'utf8'))
const index = read('public/drafts/index.json')
const date = process.argv[2] || index.latest
assert.match(date, /^\d{4}-\d{2}-\d{2}$/)
assert(index.dates.includes(date), 'Day must be listed in index')
const day = read(`public/drafts/${date}.json`)
assert.equal(day.date, date)
assert.equal(new Set(day.drafts.map(d => d.id)).size, day.drafts.length, 'Unique IDs required')
const ready = day.drafts.filter(d => d.status === 'ready')
assert(ready.length >= 3, 'Publish at least three complete ready posts')
for (const draft of ready) {
  assert(draft.body?.trim(), 'Post body required')
  assert(!/\[[^\]]*\]|___|\.\.\./.test(draft.body), 'No placeholders or unfinished copy')
  assert([...draft.body].length <= 280, 'Keep each post within 280 characters; manually check X weighting for URLs/emoji')
  assert(draft.links?.length && draft.links.every(l => /^https:\/\//.test(l)), 'Source links required')
  assert.match(draft.checkedAt || '', /^\d{4}-\d{2}-\d{2}$/)
  assert(draft.bullets?.length, 'Fact-check notes required')
}
console.log(`${date}: ${ready.length} complete posts validated`)
