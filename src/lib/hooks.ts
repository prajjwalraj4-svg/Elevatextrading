import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Market, SocialLink } from '@/types';

export function useMarkets() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('markets')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        setMarkets((data ?? []) as Market[]);
        setLoading(false);
      });
  }, []);

  return { markets, loading };
}

export function useSocialLinks() {
  const [links, setLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    supabase
      .from('social_links')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => setLinks((data ?? []) as SocialLink[]));
  }, []);

  return links;
}

export function useMarket(symbol: string) {
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('markets')
      .select('*')
      .eq('symbol', symbol.toUpperCase())
      .maybeSingle()
      .then(({ data }) => {
        setMarket((data as Market) ?? null);
        setLoading(false);
      });
  }, [symbol]);

  return { market, loading };
}
