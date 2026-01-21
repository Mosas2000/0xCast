import { useState, useEffect, useCallback } from 'react';

interface UseDraftReturn<T> {
    draft: T | null;
    saveDraft: (data: T) => void;
    loadDraft: () => T | null;
    clearDraft: () => void;
    isSaving: boolean;
}

/**
 * Hook for managing drafts with auto-save
 * @param key - Storage key for the draft
 * @returns Draft state and management functions
 */
export function useDraft<T>(key: string): UseDraftReturn<T> {
    const [draft, setDraft] = useState<T | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const storageKey = `draft_${key}`;

    // Load draft on mount
    useEffect(() => {
        const loaded = loadDraft();
        if (loaded) {
            setDraft(loaded);
        }
    }, []);

    const saveDraft = useCallback((data: T) => {
        setIsSaving(true);
        try {
            localStorage.setItem(storageKey, JSON.stringify(data));
            setDraft(data);

            // Simulate save delay
            setTimeout(() => {
                setIsSaving(false);
            }, 500);
        } catch (error) {
            console.error('Error saving draft:', error);
            setIsSaving(false);
        }
    }, [storageKey]);

    const loadDraft = useCallback((): T | null => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                return JSON.parse(stored) as T;
            }
        } catch (error) {
            console.error('Error loading draft:', error);
        }
        return null;
    }, [storageKey]);

    const clearDraft = useCallback(() => {
        try {
            localStorage.removeItem(storageKey);
            setDraft(null);
        } catch (error) {
            console.error('Error clearing draft:', error);
        }
    }, [storageKey]);

    return {
        draft,
        saveDraft,
        loadDraft,
        clearDraft,
        isSaving,
    };
}
