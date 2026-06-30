"use client";

import { useState, useEffect } from "react";
import { HOOK_SCORING_RUBRIC } from "@/lib/viral_knowledge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VideoInput {
  url: string;
  handle: string;
  hook: string;
  caption: string;
  cta_used: string;
  hashtags: string;
  views: string;
  likes: string;
  comments: string;
  posting_time: string;
  follower_count: string;
  product_price: string;
  showRevenue: boolean;
}

interface ScoredVideo {
  url: string;
  conversion_score: number;
  hook_score: number;
  hook_types_used: string[];
  psychological_triggers: string[];
  why: string;
  revenue_estimate?: {
    estimated_revenue: number;
    revenue_range: { low: number; high: number };
    total_link_clicks: number;
    breakdown: string;
  };
}

interface AnalysisResult {
  patterns: {
    top_hooks: string[];
    top_caption_structures: string[];
    top_ctas: string[];
    best_posting_times: string[];
    cross_hashtag_winners: string[];
  };
  videos_scored: ScoredVideo[];
  recommended_brief: {
    hook: string;
    visual_style: string;
    format: string;
    duration_seconds: number;
    caption_structure: string;
    cta: string;
    posting_time: string;
    why_this_works: string;
  };
  revenue_intelligence?: Array<{
    handle: string;
    follower_count: number;
    product_price: number;
    revenue_estimate: {
      estimated_revenue: number;
      revenue_range: { low: number; high: number };
    };
  }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function blankVideo(): VideoInput {
  return {
    url: "", handle: "", hook: "", caption: "", cta_used: "",
    hashtags: "", views: "", likes: "", comments: "",
    posting_time: "", follower_count: "", product_price: "", showRevenue: false,
  };
}

function hookRubricLabel(score: number): string {
  if (score <= 3) return HOOK_SCORING_RUBRIC["1-3"];
  if (score <= 5) return HOOK_SCORING_RUBRIC["4-5"];
  if (score <= 7) return HOOK_SCORING_RUBRIC["6-7"];
  if (score <= 9) return HOOK_SCORING_RUBRIC["8-9"];
  return HOOK_SCORING_RUBRIC["10"];
}

function fmt(n: number) {
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreBar({ score, max = 100 }: { score: number; max?: number }) {
  const pct = Math.round((score / max) * 100);
  const color =
    pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-yellow-500" : pct >= 40 ? "bg-orange-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-zinc-300 w-8 text-right">{score}</span>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${color}`}>{label}</span>
  );
}

function TagList({ items }: { items: string[] }) {
  if (!items?.length) return <p className="text-zinc-600 text-xs italic">None detected</p>;
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-zinc-300 flex gap-2">
          <span className="text-zinc-700">—</span>{item}
        </li>
      ))}
    </ul>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">{children}</h3>;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ScoutPage() {
  const [niche, setNiche] = useState("");
  const [ctaKeyword, setCtaKeyword] = useState("");
  const [platform, setPlatform] = useState<"instagram" | "tiktok">("instagram");
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [videos, setVideos] = useState<VideoInput[]>([blankVideo()]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Persist settings between sessions
  useEffect(() => {
    try {
      const saved = localStorage.getItem("scout_settings");
      if (saved) {
        const s = JSON.parse(saved);
        if (s.niche) setNiche(s.niche);
        if (s.ctaKeyword) setCtaKeyword(s.ctaKeyword);
        if (s.platform) setPlatform(s.platform);
        if (s.hashtags) setHashtags(s.hashtags);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("scout_settings", JSON.stringify({ niche, ctaKeyword, platform, hashtags }));
    } catch {}
  }, [niche, ctaKeyword, platform, hashtags]);

  function addHashtag() {
    const tag = hashtagInput.trim().replace(/^#/, "");
    if (tag && !hashtags.includes(`#${tag}`)) {
      setHashtags((prev) => [...prev, `#${tag}`]);
    }
    setHashtagInput("");
  }

  function removeHashtag(tag: string) {
    setHashtags((prev) => prev.filter((h) => h !== tag));
  }

  function updateVideo(i: number, field: keyof VideoInput, value: string | boolean) {
    setVideos((prev) => prev.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)));
  }

  function addVideo() {
    if (videos.length < 5) setVideos((prev) => [...prev, blankVideo()]);
  }

  function removeVideo(i: number) {
    setVideos((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleAnalyze() {
    if (!niche || !ctaKeyword || videos.every((v) => !v.url && !v.hook)) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const payload = {
      niche,
      cta_keyword: ctaKeyword,
      platform,
      hashtags,
      videos: videos
        .filter((v) => v.url || v.hook)
        .map((v) => ({
          url: v.url,
          handle: v.handle || undefined,
          hook: v.hook || undefined,
          caption: v.caption || undefined,
          cta_used: v.cta_used || undefined,
          hashtags: v.hashtags.split(/\s+/).map((h) => h.trim()).filter(Boolean),
          views: v.views ? parseInt(v.views) : undefined,
          likes: v.likes ? parseInt(v.likes) : undefined,
          comments: v.comments ? parseInt(v.comments) : undefined,
          posting_time: v.posting_time || undefined,
          follower_count: v.follower_count ? parseInt(v.follower_count) : undefined,
          product_price: v.product_price ? parseFloat(v.product_price) : undefined,
        })),
    };

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setResult(data.result as AnalysisResult);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const canAnalyze = niche && ctaKeyword && videos.some((v) => v.url || v.hook);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800/60 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-indigo-400 uppercase">SCOUT</span>
            <span className="text-zinc-700 text-xs">|</span>
            <span className="text-xs text-zinc-500">Competitor Intelligence</span>
          </div>
          <span className="text-xs text-zinc-600">Powered by Claude</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">

        {/* ── Setup ── */}
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Your Setup</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-500">Your niche</label>
                <input
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g. faceless content creation"
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 placeholder-zinc-600"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-500">CTA keyword</label>
                <input
                  value={ctaKeyword}
                  onChange={(e) => setCtaKeyword(e.target.value)}
                  placeholder="e.g. BLUEPRINT"
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 placeholder-zinc-600"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-500">Platform</label>
            <div className="flex gap-2">
              {(["instagram", "tiktok"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    platform === p
                      ? "bg-indigo-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-zinc-500">Hashtag stack</label>
            <div className="flex gap-2">
              <input
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHashtag())}
                placeholder="type a hashtag and press Enter"
                className="flex-1 bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 placeholder-zinc-600"
              />
              <button
                onClick={addHashtag}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 bg-indigo-900/40 border border-indigo-700/50 text-indigo-300 text-xs px-2 py-0.5 rounded-full"
                  >
                    {tag}
                    <button onClick={() => removeHashtag(tag)} className="text-indigo-500 hover:text-indigo-300 leading-none">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Videos ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              Videos to analyze ({videos.length}/5)
            </p>
            {videos.length < 5 && (
              <button
                onClick={addVideo}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                + Add video
              </button>
            )}
          </div>

          {videos.map((v, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-600">Video {i + 1}</span>
                {videos.length > 1 && (
                  <button
                    onClick={() => removeVideo(i)}
                    className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs text-zinc-600">URL</label>
                  <input
                    value={v.url}
                    onChange={(e) => updateVideo(i, "url", e.target.value)}
                    placeholder="https://instagram.com/reel/..."
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 placeholder-zinc-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-600">Handle</label>
                  <input
                    value={v.handle}
                    onChange={(e) => updateVideo(i, "handle", e.target.value)}
                    placeholder="@competitor"
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 placeholder-zinc-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-600">Posting time</label>
                  <input
                    value={v.posting_time}
                    onChange={(e) => updateVideo(i, "posting_time", e.target.value)}
                    placeholder="e.g. Tuesday 7pm EST"
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 placeholder-zinc-600"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs text-zinc-600">Hook (first line of video)</label>
                  <input
                    value={v.hook}
                    onChange={(e) => updateVideo(i, "hook", e.target.value)}
                    placeholder="What they said in the first 2 seconds"
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 placeholder-zinc-600"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs text-zinc-600">Caption</label>
                  <textarea
                    value={v.caption}
                    onChange={(e) => updateVideo(i, "caption", e.target.value)}
                    placeholder="Paste the caption"
                    rows={2}
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 placeholder-zinc-600 resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-600">CTA used</label>
                  <input
                    value={v.cta_used}
                    onChange={(e) => updateVideo(i, "cta_used", e.target.value)}
                    placeholder="e.g. Comment FREE"
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 placeholder-zinc-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-600">Hashtags</label>
                  <input
                    value={v.hashtags}
                    onChange={(e) => updateVideo(i, "hashtags", e.target.value)}
                    placeholder="#creator #niche #growth"
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 placeholder-zinc-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-600">Views</label>
                  <input
                    value={v.views}
                    onChange={(e) => updateVideo(i, "views", e.target.value)}
                    placeholder="125000"
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 placeholder-zinc-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-600">Likes</label>
                  <input
                    value={v.likes}
                    onChange={(e) => updateVideo(i, "likes", e.target.value)}
                    placeholder="4200"
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 placeholder-zinc-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-600">Comments</label>
                  <input
                    value={v.comments}
                    onChange={(e) => updateVideo(i, "comments", e.target.value)}
                    placeholder="380"
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 placeholder-zinc-600"
                  />
                </div>
              </div>

              {/* Revenue toggle */}
              <div className="border-t border-zinc-800 pt-3">
                <button
                  onClick={() => updateVideo(i, "showRevenue", !v.showRevenue)}
                  className="text-xs text-zinc-500 hover:text-indigo-400 transition-colors"
                >
                  {v.showRevenue ? "▾" : "▸"} Revenue estimation (optional)
                </button>
                {v.showRevenue && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="space-y-1">
                      <label className="text-xs text-zinc-600">Followers</label>
                      <input
                        value={v.follower_count}
                        onChange={(e) => updateVideo(i, "follower_count", e.target.value)}
                        placeholder="80000"
                        className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 placeholder-zinc-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-zinc-600">Product price ($)</label>
                      <input
                        value={v.product_price}
                        onChange={(e) => updateVideo(i, "product_price", e.target.value)}
                        placeholder="97"
                        className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 placeholder-zinc-600"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Analyze button ── */}
        <button
          onClick={handleAnalyze}
          disabled={loading || !canAnalyze}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading
            ? "Analyzing…"
            : `Analyze ${videos.filter((v) => v.url || v.hook).length} video${videos.filter((v) => v.url || v.hook).length !== 1 ? "s" : ""}`}
        </button>

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-300 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* ── Results ── */}
        {result && (
          <div className="space-y-10 pt-2">
            <div className="border-t border-zinc-800" />

            {/* Pattern Intelligence */}
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-zinc-100 tracking-wide uppercase">Pattern Intelligence</h2>
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <SectionLabel>Top hooks</SectionLabel>
                  <TagList items={result.patterns.top_hooks} />
                </div>
                <div>
                  <SectionLabel>Caption structures</SectionLabel>
                  <TagList items={result.patterns.top_caption_structures} />
                </div>
                <div>
                  <SectionLabel>Winning CTAs</SectionLabel>
                  <TagList items={result.patterns.top_ctas} />
                </div>
                <div>
                  <SectionLabel>Best posting times</SectionLabel>
                  <TagList items={result.patterns.best_posting_times} />
                </div>
                <div>
                  <SectionLabel>Cross-hashtag winners</SectionLabel>
                  {result.patterns.cross_hashtag_winners?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {result.patterns.cross_hashtag_winners.map((tag, i) => (
                        <span key={i} className="bg-indigo-900/40 border border-indigo-800 text-indigo-300 text-xs px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-600 text-xs italic">None detected</p>
                  )}
                </div>
              </div>
            </div>

            {/* Scored Videos */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-zinc-100 tracking-wide uppercase">Video Scores</h2>
              <div className="space-y-4">
                {result.videos_scored.map((v, i) => (
                  <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
                    {v.url && (
                      <a
                        href={v.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-400 hover:text-indigo-300 truncate block"
                      >
                        {v.url}
                      </a>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-zinc-600">Conversion score</p>
                        <ScoreBar score={v.conversion_score} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-zinc-600">Hook score</p>
                        <ScoreBar score={v.hook_score} max={10} />
                      </div>
                    </div>
                    {v.hook_score > 0 && (
                      <p className="text-xs text-zinc-500 italic">{hookRubricLabel(v.hook_score)}</p>
                    )}
                    {v.hook_types_used?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {v.hook_types_used.map((t, j) => (
                          <Badge key={j} label={t} color="bg-violet-900/40 border-violet-700 text-violet-300" />
                        ))}
                      </div>
                    )}
                    {v.psychological_triggers?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {v.psychological_triggers.map((t, j) => (
                          <Badge key={j} label={t} color="bg-indigo-900/40 border-indigo-700 text-indigo-300" />
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-zinc-400">{v.why}</p>

                    {v.revenue_estimate && (
                      <div className="border-t border-zinc-800 pt-3 space-y-1">
                        <p className="text-xs text-zinc-600 uppercase tracking-widest">Revenue estimate</p>
                        <p className="text-sm font-semibold text-emerald-400">
                          {fmt(v.revenue_estimate.estimated_revenue)}/mo
                        </p>
                        <p className="text-xs text-zinc-600">
                          Range: {fmt(v.revenue_estimate.revenue_range.low)} – {fmt(v.revenue_estimate.revenue_range.high)}
                        </p>
                        <p className="text-xs text-zinc-600">
                          {v.revenue_estimate.total_link_clicks.toLocaleString()} total link clicks
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Ranking */}
            {result.revenue_intelligence && result.revenue_intelligence.length > 1 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-zinc-100 tracking-wide uppercase">Revenue Intelligence</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left text-xs text-zinc-600 px-4 py-3 font-normal">Handle</th>
                        <th className="text-right text-xs text-zinc-600 px-4 py-3 font-normal">Followers</th>
                        <th className="text-right text-xs text-zinc-600 px-4 py-3 font-normal">Product</th>
                        <th className="text-right text-xs text-zinc-600 px-4 py-3 font-normal">Est. Revenue/mo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.revenue_intelligence.map((c, i) => (
                        <tr key={i} className={i < result.revenue_intelligence!.length - 1 ? "border-b border-zinc-800/60" : ""}>
                          <td className="px-4 py-3 text-zinc-300">{c.handle}</td>
                          <td className="px-4 py-3 text-right text-zinc-400">{c.follower_count.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-zinc-400">${c.product_price}</td>
                          <td className="px-4 py-3 text-right font-semibold text-emerald-400">
                            {fmt(c.revenue_estimate.estimated_revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recommended Brief */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-zinc-100 tracking-wide uppercase">Recommended Brief</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-5">
                <div>
                  <p className="text-xs text-zinc-600 mb-1">Hook</p>
                  <p className="text-zinc-100 font-medium">&ldquo;{result.recommended_brief.hook}&rdquo;</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-zinc-600 mb-1">Visual style</p>
                    <p className="text-sm text-zinc-300">{result.recommended_brief.visual_style}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600 mb-1">Format</p>
                    <p className="text-sm text-zinc-300">{result.recommended_brief.format}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600 mb-1">Duration</p>
                    <p className="text-sm text-zinc-300">{result.recommended_brief.duration_seconds}s</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600 mb-1">Post at</p>
                    <p className="text-sm text-zinc-300">{result.recommended_brief.posting_time}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-zinc-600 mb-1">Caption structure</p>
                  <p className="text-sm text-zinc-300 font-mono whitespace-pre-wrap bg-zinc-800 rounded-lg px-3 py-2">
                    {result.recommended_brief.caption_structure}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-600 mb-1">CTA</p>
                  <p className="text-sm text-zinc-100 font-semibold">{result.recommended_brief.cta}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-600 mb-1">Why this works</p>
                  <p className="text-sm text-zinc-300">{result.recommended_brief.why_this_works}</p>
                </div>
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={() => { setResult(null); setVideos([blankVideo()]); }}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              ← Start new analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
