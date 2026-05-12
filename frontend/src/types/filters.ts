/**
 * Market Filters Types
 * 
 * Type definitions for market filtering functionality.
 * Updated: 2026-05-12
 */

import { MarketCategory, SortOption } from '../utils/marketCategories';

export type TimeRange = 'all' | '24h' | '7d' | '30d' | 'custom';
export type VolumeRange = 'all' | 'low' | 'medium' | 'high';

export interface MarketFilters {
  category: MarketCategory;
  sortOption: SortOption;
  status: 'all' | 'active' | 'resolved';
  searchQuery: string;
  timeRange: TimeRange;
  volumeRange: VolumeRange;
  minLiquidity?: number;
  maxLiquidity?: number;
  startDate?: number; // timestamp
  endDate?: number; // timestamp
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: Partial<MarketFilters>;
  icon?: string;
}

export const VOLUME_THRESHOLDS = {
  low: 1000,
  medium: 10000,
  high: 50000,
};
