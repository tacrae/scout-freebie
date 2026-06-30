export const HOOK_TYPES = {
  curiosity_gap: "Opens with an unresolved question or teaser that forces the viewer to stay",
  pattern_interrupt: "Visually or verbally breaks expectations in the first second",
  bold_claim: "States a provocative or counterintuitive claim with high conviction",
  relatability: "Mirrors the viewer's exact frustration, situation, or desire",
  social_proof: "Leads with a result, transformation, or credibility signal",
  how_to: "Promises a clear skill or outcome in exchange for watch time",
  controversy: "Takes a polarizing stance that triggers strong agree/disagree response",
  story_open: "Drops into the middle of a story already in progress",
} as const;

export const PSYCHOLOGICAL_TRIGGERS = {
  curiosity_gap: {
    description: "Creates an information void the brain is compelled to fill",
    detection_signals: ["but here's what nobody tells you", "the real reason", "what I discovered", "you won't believe"],
  },
  mirror_neurons: {
    description: "Activates empathy by mirroring the viewer's own experience back at them",
    detection_signals: ["if you're like me", "I used to think", "you've probably felt this", "does this sound familiar"],
  },
  social_proof: {
    description: "Leverages numbers, testimonials, or authority to reduce perceived risk",
    detection_signals: ["X people", "everyone is", "most creators", "studies show", "I went from"],
  },
  loss_aversion: {
    description: "Frames inaction as losing something rather than failing to gain",
    detection_signals: ["you're leaving money on the table", "stop wasting", "every day you wait", "you're losing"],
  },
  identity: {
    description: "Speaks to who the viewer wants to become, not just what they want to have",
    detection_signals: ["people like us", "if you're serious about", "real creators", "the type of person who"],
  },
  authority: {
    description: "Establishes credibility that makes the viewer trust the information",
    detection_signals: ["after X years", "I've tested", "I've built", "here's what actually works"],
  },
  pattern_recognition: {
    description: "Shows the viewer a system or framework that explains confusing results",
    detection_signals: ["the formula", "the system", "here's the pattern", "three things every", "this is why"],
  },
} as const;

export const VIRALITY_FACTORS = {
  hook_pillar: {
    description: "First 1–2 seconds. Determines whether the algorithm gets a chance to distribute.",
    scoring_factors: ["clarity of the pattern interrupt", "specificity of the promise", "emotional charge", "visual contrast"],
  },
  retention_pillar: {
    description: "Seconds 2 through end. Determines rewatch rate and completion rate.",
    scoring_factors: ["information density", "pacing variation", "open loops", "payoff delivery"],
  },
  shareability_pillar: {
    description: "The 'send this to someone' factor. Drives organic distribution.",
    scoring_factors: ["relatability to a specific person", "saves-worthy insight", "shareworthy controversy", "identity alignment"],
  },
} as const;

export const REVENUE_FORMULAS = {
  followers_to_views_multiplier: 100,
  views_to_bio_clicks: 0.001,
  views_to_comments: 0.01,
  comments_to_dm_clicks: 0.5,
  story_view_rate: 0.05,
  story_click_rate: 0.2,
  purchase_conversion_rate: 0.03,
  stories_per_month_default: 15,
} as const;

export const HOOK_SCORING_RUBRIC = {
  "1-3": "Weak — no clear hook, viewer has no reason to stay",
  "4-5": "Below average — some intrigue but easy to scroll past",
  "6-7": "Average — holds attention but won't drive above-average retention",
  "8-9": "Viral-ready — strong pattern interrupt, specific promise, emotional charge",
  "10": "Elite — stops the scroll instantly, impossible to ignore, immediately shareable",
} as const;

export const PLATFORM_BEHAVIOR = {
  instagram: {
    algo_rewards: ["saves", "shares to DMs", "comments", "profile visits after watch", "rewatches"],
    cta_style: "DM-first — drive to DMs or story link, not link-in-bio",
  },
  tiktok: {
    algo_rewards: ["completion rate", "shares", "stitches/duets", "follows from video", "comments with questions"],
    cta_style: "Follow + comment — drive to follow and comment for algo push",
  },
} as const;
