import { useState, useEffect, useCallback } from 'react';
import { FilterPreset, MarketFilters } from '../types/filters';
import { GDPRComplianceService } from '../services/GDPRComplianceService';
import { SecureStorageV2Service } from '../services/SecureStorageV2Service';

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
    const loadPresets = async () => {
      const secure = await SecureStorageV2Service.getItem<FilterPreset[]>(STORAGE_KEY);
      if (secure) {
        setPresets(secure);
        return;
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setPresets(JSON.parse(saved));
        } catch {
          setPresets(DEFAULT_PRESETS);
        }
      } else {
        setPresets(DEFAULT_PRESETS);
      }
    };

    loadPresets();
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

      SecureStorageV2Service.setItem(STORAGE_KEY, updated, {
        encrypt: true,
        category: 'personalization',
        expiresIn: 90 * 24 * 60 * 60 * 1000,
      }).catch(error => {
        console.warn('Failed to store filter presets in secure storage:', error);
      });
    }

    return newPreset;
  }, [presets]);

  const deletePreset = useCallback((id: string) => {
    const updated = presets.filter(p => p.id !== id);
    setPresets(updated);

    if (GDPRComplianceService.isPersonalizationEnabled()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      SecureStorageV2Service.setItem(STORAGE_KEY, updated, {
        encrypt: true,
        category: 'personalization',
        expiresIn: 90 * 24 * 60 * 60 * 1000,
      }).catch(error => {
        console.warn('Failed to update filter presets in secure storage:', error);
      });
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
