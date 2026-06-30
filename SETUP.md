# SCOUT — Setup & User Guide

SCOUT is a competitor intelligence tool for Instagram creators. Paste in competitor Reel data, get back hook scores, trigger analysis, virality breakdown, and a ready-to-use content brief. No coding experience required to set it up.

---

## What you need before you start

- A computer with a browser (Mac, Windows, or Linux)
- A free [Vercel](https://vercel.com) account (the platform that hosts the app)
- A free [GitHub](https://github.com) account (to hold your copy of the code)
- An [Anthropic API key](https://console.anthropic.com) (the AI engine that powers the analysis)

**Cost to run:** Anthropic charges per analysis. A typical SCOUT run (3–5 videos) costs roughly **$0.01–$0.03**. You get $5 in free credits when you sign up — that's 150–500 analyses before you pay anything.

---

## Step 1 — Get your Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com) and create a free account
2. Click **API Keys** in the left sidebar
3. Click **Create Key**, give it any name (e.g. "SCOUT"), and copy it
4. Paste it somewhere safe — you'll need it in Step 4. It starts with `sk-ant-`

---

## Step 2 — Get your own copy of SCOUT on GitHub

1. Go to the SCOUT GitHub repo (the link is in the product page where you downloaded this)
2. Click the **Fork** button in the top right
3. GitHub creates a copy of the repo under your own account — that's yours to keep

If you received SCOUT as a zip file instead:
1. Unzip it
2. Go to [github.com](https://github.com) → click **New** to create a new repository
3. Name it `scout` and make it **Private**
4. Upload the unzipped files by dragging them into the repo

---

## Step 3 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New → Project**
3. Click **Import** next to your `scout` GitHub repository
4. Leave all settings as default — Vercel detects Next.js automatically
5. Click **Deploy**

Vercel builds and hosts the app. This takes about 60 seconds. You'll see a green checkmark when it's done.

---

## Step 4 — Add your API key

This step is what connects SCOUT to the AI. Without it, the app will deploy but analysis won't work.

1. In your Vercel project, click **Settings** (top nav)
2. Click **Environment Variables** in the left sidebar
3. Click **Add New**
4. Set:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** your `sk-ant-...` key from Step 1
5. Click **Save**
6. Go back to the **Deployments** tab and click **Redeploy** on your latest deployment

Your app is now live. Vercel gives you a free URL that looks like `your-scout.vercel.app` — bookmark it.

---

## Step 5 — Set up your brand profile

Before you run your first analysis, tell SCOUT about your brand so the output is tailored to you.

1. Open your live SCOUT URL
2. Click **Edit Brand** (top of the page)
3. Fill in:
   - **Niche** — what your content is about (e.g. "digital income for beginners")
   - **Voice** — your tone (e.g. "direct, no fluff, no hype")
   - **Audience** — who you're talking to (e.g. "adults 35+ building income online")
   - **CTA keyword** — the word you use to trigger your DM automation (e.g. "GUIDE")
4. Save — this gets injected into every analysis automatically

---

## How to run an analysis

### What to gather from a competitor Reel

Before you paste anything into SCOUT, open the competitor Reel and collect:

| Field | Where to find it |
|-------|-----------------|
| **URL** | Copy from browser address bar or share button |
| **Hook** | The first 1–3 seconds of spoken or on-screen text |
| **Caption** | The full caption under the video |
| **CTA** | What they ask the viewer to do at the end |
| **Hashtags** | Listed in the caption |
| **Views / Likes / Comments** | Shown under the video (if visible) |
| **Posting time** | Shown as a timestamp on the post |

You don't need all fields — URL + hook + caption is enough for a solid analysis.

### Running the analysis

1. Click **Add Video** and paste in the data for each competitor Reel
2. Add up to 5 videos per run (more = better pattern detection)
3. Hit **Analyze**
4. Wait 15–30 seconds for results

---

## Reading your results

### Hook Score (1–10)
Rates how strong the video's opening hook is. A score below 7 means the creator lost most viewers in the first 3 seconds — note what they did wrong so you don't repeat it.

| Score | What it means |
|-------|--------------|
| 1–3 | Weak — no pattern interrupt, no reason to keep watching |
| 4–5 | Below average — some attempt at a hook but it doesn't land |
| 6–7 | Average — functional but forgettable |
| 8–9 | Viral-ready — strong pattern interrupt, creates immediate curiosity |
| 10 | Elite — stops the scroll cold, near-perfect execution |

### Psychological Triggers
SCOUT detects 7 psychological triggers in each video:

- **Curiosity gap** — creates a question the viewer must answer
- **Mirror neurons** — viewer sees themselves in the situation
- **Social proof** — uses numbers, results, or others' validation
- **Loss aversion** — frames inaction as painful
- **Identity threat** — challenges the viewer's self-image
- **Authority** — signals expertise or credibility
- **Transformation** — before/after or journey arc

Videos that hit 3+ triggers consistently outperform those that hit 1.

### Virality Pillars
Three scores (0–10 each) that break down why a video spreads:

- **Hook pillar** — did it stop the scroll?
- **Retention pillar** — did it keep people watching?
- **Shareability pillar** — did it make people want to send it to someone?

### Pattern Intelligence
Across all videos you submitted, SCOUT surfaces:
- Hook patterns that appear on multiple high-performing videos
- Caption structures worth stealing
- CTAs that convert
- Best posting times
- Hashtags that show up on high-conversion content

### Recommended Brief
The bottom of every analysis gives you a ready-to-use content brief synthesized from everything above — hook, visual style, format, caption template, CTA, and posting time. This is what you hand off to your script generator or video tool.

### Revenue Estimate (optional)
If you enter a competitor's follower count and estimated product price, SCOUT calculates their estimated monthly revenue using a conversion model. This is a directional estimate — useful for spotting which competitors are monetizing most effectively, not for exact figures.

---

## Troubleshooting

**"Analysis failed" or blank results**
- Check that your `ANTHROPIC_API_KEY` is set correctly in Vercel (Settings → Environment Variables)
- Make sure you redeployed after adding the key
- Check your Anthropic account at console.anthropic.com — you may have run out of free credits

**"Invalid JSON" error**
- This is rare. Hit Analyze again — it usually resolves on retry

**The app won't load at all**
- Check your Vercel deployment logs (Deployments tab → click the latest → View Logs)
- A red error usually points to a missing environment variable or a build error

**Analysis feels generic / not relevant to my niche**
- Make sure you filled in your brand profile (Step 5). The niche, voice, and audience fields are what make the output specific to you.

---

## Staying updated

If SCOUT releases an update:
1. Go to your fork on GitHub
2. Click **Sync fork** → **Update branch**
3. Vercel automatically redeploys when your repo updates

---

## Questions?

Reach out via the same channel where you got SCOUT. Include a screenshot of any error message and I can help you sort it out fast.
