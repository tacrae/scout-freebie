import { REVENUE_FORMULAS } from "@/lib/viral_knowledge";

export interface RevenueEstimate {
  estimated_monthly_views: number;
  bio_link_clicks: number;
  comment_dm_clicks: number;
  story_link_clicks: number;
  total_link_clicks: number;
  estimated_revenue: number;
  revenue_range: { low: number; high: number };
  breakdown: string;
}

export interface CompetitorInput {
  handle: string;
  follower_count: number;
  product_price: number;
}

export function estimate_competitor_revenue(
  follower_count: number,
  product_price: number,
  _platform = "instagram",
  stories_per_month = REVENUE_FORMULAS.stories_per_month_default,
  has_dm_automation = true
): RevenueEstimate {
  const f = REVENUE_FORMULAS;
  const views = follower_count * f.followers_to_views_multiplier;
  const bio = views * f.views_to_bio_clicks;
  const dm = has_dm_automation ? views * f.views_to_comments * f.comments_to_dm_clicks : 0;
  const story = follower_count * f.story_view_rate * f.story_click_rate * stories_per_month;
  const total = bio + dm + story;
  const revenue = total * f.purchase_conversion_rate * product_price;

  return {
    estimated_monthly_views: views,
    bio_link_clicks: bio,
    comment_dm_clicks: dm,
    story_link_clicks: story,
    total_link_clicks: total,
    estimated_revenue: revenue,
    revenue_range: { low: revenue * 0.5, high: revenue * 1.5 },
    breakdown:
      `Views: ${views.toLocaleString()}\n` +
      `Bio clicks: ${bio.toLocaleString()}\n` +
      `DM clicks: ${dm.toLocaleString()}\n` +
      `Story clicks: ${story.toLocaleString()}\n` +
      `Revenue: $${revenue.toFixed(0)}/mo\n` +
      `Range: $${(revenue * 0.5).toFixed(0)} – $${(revenue * 1.5).toFixed(0)}`,
  };
}

export function rank_competitors(
  competitors: CompetitorInput[]
): Array<CompetitorInput & { revenue_estimate: RevenueEstimate }> {
  return competitors
    .map((c) => ({ ...c, revenue_estimate: estimate_competitor_revenue(c.follower_count, c.product_price) }))
    .sort((a, b) => b.revenue_estimate.estimated_revenue - a.revenue_estimate.estimated_revenue);
}
