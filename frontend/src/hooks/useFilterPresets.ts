import { useState, useEffect, useCallback } from 'react';
import { FilterPreset, MarketFilters } from '../types/filters';
import { GDPRComplianceService } from '../services/GDPRComplianceService';

const STORAGE_KEY = '0xcast_filter_presets';

const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'trending',
    name: 'Trending',
    filters: { sortOption: 'volume_high', timeRange: '7d' },
    icon: '🔥',
  },
  {
    id: 'new',
    name: 'New Markets',
    filters: { sortOption: 'newest', status: 'active' },
    icon: '✨',
  },
  {
    id: 'ending',
    name: 'Ending Soon',
    filters: { sortOption: 'ending_soon', status: 'active' },
    icon: '⏳',
  },
];

export function useFilterPresets() {
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch (e) {
        setPresets(DEFAULT_PRESETS);
      }
    } else {
      setPresets(DEFAULT_PRESETS);
    }
  }, []);

  const savePreset = useCallback((preset: Omit<FilterPreset, 'id'>) => {
    const newPreset: FilterPreset = {
      ...preset,
      id: Date.now().toString(),
    };

    const updated = [...presets, newPreset];
    setPresets(updated);
    if (GDPRComplianceService.isPersonalizationEnabled()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    return newPreset;
  }, [presets]);

  const deletePreset = useCallback((id: string) => {
    const updated = presets.filter(p => p.id !== id);
    setPresets(updated);
    if (GDPRComplianceService.isPersonalizationEnabled()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  }, [presets]);

  return {
    presets,
    activePresetId,
    setActivePresetId,
    savePreset,
    deletePreset,
  };
}
