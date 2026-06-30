import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  HOOK_TYPES,
  PSYCHOLOGICAL_TRIGGERS,
  HOOK_SCORING_RUBRIC,
  PLATFORM_BEHAVIOR,
} from "@/lib/viral_knowledge";
import { estimate_competitor_revenue, rank_competitors } from "@/lib/revenue";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface VideoInput {
  url: string;
  handle?: string;
  hook?: string;
  caption?: string;
  cta_used?: string;
  hashtags?: string[];
  views?: number;
  likes?: number;
  comments?: number;
  posting_time?: string;
  follower_count?: number;
  product_price?: number;
}

interface AnalyzeRequest {
  niche: string;
  cta_keyword: string;
  platform: "instagram" | "tiktok";
  hashtags: string[];
  videos: VideoInput[];
}

function buildSystemPrompt(req: AnalyzeRequest): string {
  const hookTypesText = Object.entries(HOOK_TYPES)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join("\n");

  const triggersText = Object.entries(PSYCHOLOGICAL_TRIGGERS)
    .map(([k, v]) => `  ${k}: ${v.description}\n    Signals: ${v.detection_signals.join("; ")}`)
    .join("\n");

  const rubricText = Object.entries(HOOK_SCORING_RUBRIC)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join("\n");

  const platform = PLATFORM_BEHAVIOR[req.platform] ?? PLATFORM_BEHAVIOR.instagram;

  return `You are SCOUT — an Instagram/TikTok competitor intelligence analyst. You analyze short-form video content and extract the exact patterns driving engagement and conversions.

CREATOR CONTEXT:
- Niche: ${req.niche}
- CTA keyword: ${req.cta_keyword}
- Platform: ${req.platform}

PLATFORM ALGORITHM:
- Rewards: ${platform.algo_rewards.join(", ")}
- CTA style: ${platform.cta_style}

HOOK TYPES — identify which type(s) each video uses:
${hookTypesText}

HOOK SCORING RUBRIC (1–10):
${rubricText}

PSYCHOLOGICAL TRIGGERS — identify which trigger(s) each video activates:
${triggersText}

SCORING RUBRIC (conversion_score 0–100):
- 80–100: Strong hook in first 2s, clear problem/solution arc, explicit CTA, tight niche fit
- 60–79: Good hook, decent arc, weak CTA, partially relevant
- 40–59: Average hook, no clear arc, no CTA
- 0–39: No hook, no arc, no CTA, off-niche

OUTPUT SCHEMA — strict JSON only, no prose, no markdown fences:
{
  "patterns": {
    "top_hooks": ["string — common hook patterns driving engagement"],
    "top_caption_structures": ["string — caption formulas that appear repeatedly"],
    "top_ctas": ["string — CTA phrases and formats that work in this niche"],
    "best_posting_times": ["string — times/days when high-performing content was posted"],
    "cross_hashtag_winners": ["string — hashtags appearing on multiple high-conversion videos"]
  },
  "videos_scored": [
    {
      "url": "string",
      "conversion_score": 0,
      "hook_score": 0,
      "hook_types_used": ["hook type names"],
      "psychological_triggers": ["trigger names detected"],
      "why": "string — 1–2 sentences explaining the score"
    }
  ],
  "recommended_brief": {
    "hook": "string — exact hook text to open the video",
    "visual_style": "string — describe the visual approach",
    "format": "string — e.g. talking points, montage, single-message, tutorial",
    "duration_seconds": 0,
    "caption_structure": "string — template for the caption",
    "cta": "string — exact CTA text",
    "posting_time": "string — recommended day and time",
    "why_this_works": "string — 2–3 sentences explaining the synthesis"
  }
}`;
}

export async function POST(req: NextRequest) {
  let body: AnalyzeRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { niche, cta_keyword, platform, hashtags, videos } = body;

  if (!niche || !cta_keyword || !videos || videos.length === 0) {
    return NextResponse.json(
      { error: "niche, cta_keyword, and at least one video are required" },
      { status: 400 }
    );
  }

  const userMessage = `Analyze these ${videos.length} ${platform ?? "instagram"} videos for a creator in the "${niche}" niche.

Active hashtag stack: ${hashtags?.length > 0 ? hashtags.join(", ") : "none provided"}

VIDEOS TO ANALYZE:
${videos
  .map(
    (v, i) => `
Video ${i + 1}:
  URL: ${v.url || "not provided"}
  Handle: ${v.handle || "unknown"}
  Hook: ${v.hook || "not provided"}
  Caption: ${v.caption || "not provided"}
  CTA used: ${v.cta_used || "not provided"}
  Hashtags: ${v.hashtags?.join(", ") || "not provided"}
  Views: ${v.views ?? "unknown"}
  Likes: ${v.likes ?? "unknown"}
  Comments: ${v.comments ?? "unknown"}
  Posting time: ${v.posting_time || "unknown"}`
  )
  .join("\n")}

Return only the JSON object. No prose. No markdown fences.`;

  try {
    const stream = await client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: buildSystemPrompt(body),
      messages: [{ role: "user", content: userMessage }],
    });

    const message = await stream.finalMessage();
    const rawText = message.content[0].type === "text" ? message.content[0].text : "";

    let result: Record<string, unknown>;
    try {
      const cleaned = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
      result = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Claude returned invalid JSON", raw: rawText }, { status: 502 });
    }

    // Revenue enrichment — server-side math, not delegated to Claude
    const videoMap = new Map(videos.map((v) => [v.url, v]));
    if (Array.isArray(result.videos_scored)) {
      result.videos_scored = (result.videos_scored as Array<Record<string, unknown>>).map((scored) => {
        const input = videoMap.get(scored.url as string);
        if (input?.follower_count && input?.product_price) {
          scored.revenue_estimate = estimate_competitor_revenue(
            input.follower_count,
            input.product_price
          );
        }
        return scored;
      });
    }

    const competitorsWithRevenue = videos.filter((v) => v.follower_count && v.product_price);
    if (competitorsWithRevenue.length > 1) {
      result.revenue_intelligence = rank_competitors(
        competitorsWithRevenue.map((v) => ({
          handle: v.handle ?? v.url,
          follower_count: v.follower_count!,
          product_price: v.product_price!,
        }))
      );
    }

    return NextResponse.json({ success: true, result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
