# SCOUT — Competitor Intelligence Tool

Analyze up to 5 competitor Instagram or TikTok videos at once. SCOUT extracts the hook patterns, caption structures, CTAs, posting times, and psychological triggers driving their engagement — then builds you a recommended brief to out-perform them.

---

## What You Get

- **Hook scoring** — every video scored 1–10 against a virality rubric
- **Trigger detection** — identifies which of 7 psychological triggers each video uses
- **Pattern intelligence** — cross-video patterns in hooks, captions, CTAs, and hashtags
- **Revenue estimation** — optional: enter competitor follower count + product price to estimate their monthly revenue
- **Recommended brief** — hook, visual style, format, caption structure, and CTA synthesized from the analysis

---

## Deploy in 5 Minutes (Vercel)

### 1. Get an Anthropic API key

Sign up at [console.anthropic.com](https://console.anthropic.com) and create an API key. You'll pay per use — a typical SCOUT analysis costs less than $0.05.

### 2. Deploy to Vercel

Click the button below or follow the manual steps:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tacrae/scout-freebie)

**Or manually:**

1. Push this folder to a new GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. In **Environment Variables**, add:
   ```
   ANTHROPIC_API_KEY = sk-ant-your-key-here
   ```
4. Click Deploy

### 3. Run locally (optional)

```bash
npm install
cp .env.local.example .env.local
# Add your API key to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How to Use

1. **Fill in Your Setup** — enter your niche, your CTA keyword (e.g. "BLUEPRINT"), and your hashtag stack. These are saved in your browser so you only do this once.
2. **Add competitor videos** — paste the URL, the hook text (what they said in the first 2 seconds), the caption, and any engagement metrics you have. You can add up to 5 videos per analysis.
3. **Optional: Revenue estimation** — expand the revenue section on any video and enter the competitor's follower count and product price. SCOUT will estimate their monthly revenue.
4. **Hit Analyze** — Claude processes the videos and returns pattern intelligence, scored results, and a recommended brief.

---

## Tech Stack

- **Next.js 14** — App Router
- **Claude (claude-sonnet-4-6)** — analysis engine
- **Tailwind CSS** — styling
- TypeScript throughout, no database required

---

## API Cost Reference

Each SCOUT analysis call uses approximately:
- Input: ~1,500–2,500 tokens (scales with number of videos)
- Output: ~800–1,200 tokens

At Claude Sonnet pricing, a 5-video analysis costs roughly **$0.03–$0.07**.

---

## Customization

All scoring frameworks are in `lib/viral_knowledge.ts`. You can:
- Add or rename hook types
- Add new psychological triggers
- Change the platform behavior rules for Instagram vs TikTok
- Adjust the revenue formula multipliers in `REVENUE_FORMULAS`

The API route is in `app/api/analyze/route.ts`. The full UI is in `app/page.tsx`.

---

Built with Claude by NoFaceOs.
