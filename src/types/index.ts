export type MarketCategory = 'crypto' | 'forex' | 'indices' | 'commodities' | 'metals';
export type Trend = 'bullish' | 'bearish' | 'neutral';
export type AnalysisType = 'daily' | 'weekly' | 'monthly';
export type UserRole = 'admin' | 'analyst' | 'user';
export type Plan = 'free' | 'pro' | 'vip';

export interface Market {
  id: string;
  symbol: string;
  name: string;
  category: MarketCategory;
  logo_url: string;
  live_price: number;
  price_change: number;
  price_change_pct: number;
  daily_trend: Trend;
  weekly_trend: Trend;
  monthly_trend: Trend;
  market_bias: Trend;
  institutional_bias: Trend;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Analysis {
  id: string;
  market_id: string;
  title: string;
  analysis_type: AnalysisType;
  content: string;
  institutional_view: string;
  trade_setup: string;
  risk_warning: string;
  targets: string;
  support_levels: string;
  resistance_levels: string;
  support_zone: string;
  resistance_zone: string;
  supply_zone: string;
  demand_zone: string;
  liquidity_zone: string;
  entry_zone: string;
  stop_loss: string;
  take_profit_1: string;
  take_profit_2: string;
  take_profit_3: string;
  risk_reward_ratio: string;
  market_structure: string;
  smc_analysis: string;
  analyst_name: string;
  confidence_score: number;
  market_sentiment: string;
  buy_probability: number;
  sell_probability: number;
  expected_direction: string;
  estimated_volatility: string;
  is_pinned: boolean;
  status: 'draft' | 'published' | 'scheduled';
  published_at: string;
  created_at: string;
  updated_at: string;
  market?: Market;
}

export interface Chart {
  id: string;
  analysis_id: string | null;
  market_id: string | null;
  image_url: string;
  title: string;
  description: string;
  category: string;
  video_url: string;
  chart_date: string;
  chart_time: string | null;
  timeframe: string;
  bias: 'buy' | 'sell' | 'neutral';
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  image_url: string;
  author: string;
  status: 'draft' | 'published';
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface PremiumAnalysis {
  id: string;
  market_id: string | null;
  title: string;
  content: string;
  excerpt: string;
  analysis_type: string;
  is_premium: boolean;
  status: 'draft' | 'published';
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface PdfReport {
  id: string;
  market_id: string | null;
  title: string;
  description: string;
  file_url: string;
  file_name: string;
  report_type: 'daily' | 'weekly' | 'monthly' | 'special';
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author: string;
  status: 'draft' | 'published';
  views: number;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface JournalTrade {
  id: string;
  user_id: string;
  pair: string;
  direction: 'long' | 'short';
  entry_price: number;
  exit_price: number;
  stop_loss: number;
  take_profit: number;
  screenshot_url: string;
  notes: string;
  result: 'open' | 'win' | 'loss' | 'breakeven';
  profit: number;
  risk_reward: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label: string;
  sort_order: number;
  is_active: boolean;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  role: UserRole;
  plan: Plan;
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved' | 'closed';
  created_at: string;
}
