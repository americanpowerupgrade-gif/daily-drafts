# Daily Drafts

Phone-friendly review and copy app for @UpgradeAmerican. Read the full post, open sources if needed, copy, and publish in X yourself.

## How daily content actually arrives

This is a static Vite app. It fetches `public/drafts/index.json` and the selected dated JSON. There is no model call, backend generator, cron configuration, or GitHub Actions workflow in this repository. Recent daily commits identify their author as `Crew Chief`; the external job, prompt and schedule are not stored here and cannot be determined from that name alone. UI changes do not update that external author. Whoever runs it must adopt the content contract below. No new scheduled generation is claimed by this change.

## Daily author instructions

1. Research and write at least three complete standalone X posts for each day. Prioritize practical family benefits: saving time with AI, fitting EV charging into daily life, and understanding household energy costs. Avoid hype and guaranteed savings.
2. Verify factual claims against primary sources. Include `links`, concise fact-check notes in `bullets`, and the review date in `checkedAt`. Recheck prices, policies and other changing facts on the publication day.
3. Write like a person talking to a neighbor: start with a concrete everyday situation, give one useful takeaway, and use an honest conversational question when it fits. Avoid generic motivational endings and brochure language. Personable does not mean inventing first-person experiences. Write natural finished copy in `body`, with `status: "ready"`, a unique `id`, `title`, and `topic`. Use at most 280 characters (check X weighting separately for emoji and URLs). Do not include instructions, blanks, screenshot requests, invented experiences, receipts or personal anecdotes. If Brian has not supplied a detail, choose a useful nonpersonal angle instead.
4. Use `status: "needs-input"` for optional unfinished ideas; they do not count toward the three posts and appear collapsed. Historical entries without a status also remain unfinished; they are never relabeled ready automatically.
5. Use `public/drafts/TEMPLATE.json` as the shape/example, replacing its example posts with fresh researched content. Save `YYYY-MM-DD.json`, add that date to `index.json`'s `dates`, and update `latest`. Never refresh only the date on old content.
6. Run `npm run check:drafts` (latest day) or `npm run check:drafts -- YYYY-MM-DD`, then `npm run build`. The build blocks publication of a latest day with fewer than three ready posts or obvious placeholders. This structural check does not replace editorial fact checking.

## Develop and deploy

`npm ci`, then `npm run dev`. `npm run build` makes the static Vercel build. Import this repository in Vercel. No API keys are required. Review and merge feature PRs to publish through the existing Git integration.
