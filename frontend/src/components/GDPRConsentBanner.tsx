/**
 * GDPR Consent Banner Component
 * 
 * Displays consent options for analytics and data collection
 */

import React, { useState, useEffect } from 'react';
import { GDPRComplianceService } from '../services/GDPRComplianceService';

interface GDPRConsentBannerProps {
  onConsent?: (consent: { analytics: boolean; marketing: boolean; personalization: boolean }) => void;
}

export function GDPRConsentBanner({ onConsent }: GDPRConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState({
    analytics: false,
    marketing: false,
    personalization: false,
  });

  useEffect(() => {
    const existingConsent = GDPRComplianceService.getUserConsent();
    if (!existingConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    GDPRComplianceService.acceptAll();
    setIsVisible(false);
    onConsent?.({
      analytics: true,
      marketing: true,
      personalization: true,
    });
  };

  const handleRejectAll = () => {
    GDPRComplianceService.rejectAll();
    setIsVisible(false);
    onConsent?.({
      analytics: false,
      marketing: false,
      personalization: false,
    });
  };

  const handleAcceptCustom = () => {
    GDPRComplianceService.setUserConsent(consent);
    setIsVisible(false);
    onConsent?.(consent);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-900 border-t border-neutral-800 shadow-2xl">
      <div className="container py-4 sm:py-6">
        {!showDetails ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white mb-1">Privacy & Cookies</h3>
              <p className="text-xs sm:text-sm text-neutral-400">
                We use cookies and analytics to improve your experience. Your data is protected under GDPR.
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setShowDetails(true)}
                className="px-3 py-2 text-xs sm:text-sm font-medium text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
              >
                Customize
              </button>
              <button
                onClick={handleRejectAll}
                className="px-3 py-2 text-xs sm:text-sm font-medium text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
              >
                Reject
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-3 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Privacy Preferences</h3>
              <p className="text-xs text-neutral-400 mb-4">
                Manage your privacy preferences. You can change these settings at any time.
              </p>
            </div>

            <div className="space-y-3">
              {/* Necessary - Always enabled */}
              <div className="flex items-start gap-3 p-3 bg-neutral-800/50 rounded-lg">
                <input
                  type="checkbox"
                  id="necessary"
                  checked={true}
                  disabled
                  className="mt-1 w-4 h-4 rounded cursor-not-allowed"
                />
                <div className="flex-1">
                  <label htmlFor="necessary" className="text-sm font-medium text-white cursor-not-allowed">
                    Necessary Cookies
                  </label>
                  <p className="text-xs text-neutral-500 mt-1">
                    Essential for site functionality. Cannot be disabled.
                  </p>
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-start gap-3 p-3 bg-neutral-800/50 rounded-lg">
                <input
                  type="checkbox"
                  id="analytics"
                  checked={consent.analytics}
                  onChange={(e) => setConsent({ ...consent, analytics: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded cursor-pointer"
                />
                <div className="flex-1">
                  <label htmlFor="analytics" className="text-sm font-medium text-white cursor-pointer">
                    Analytics
                  </label>
                  <p className="text-xs text-neutral-500 mt-1">
                    Help us understand how you use our platform to improve your experience.
                  </p>
                </div>
              </div>

              {/* Marketing */}
              <div className="flex items-start gap-3 p-3 bg-neutral-800/50 rounded-lg">
                <input
                  type="checkbox"
                  id="marketing"
                  checked={consent.marketing}
                  onChange={(e) => setConsent({ ...consent, marketing: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded cursor-pointer"
                />
                <div className="flex-1">
                  <label htmlFor="marketing" className="text-sm font-medium text-white cursor-pointer">
                    Marketing
                  </label>
                  <p className="text-xs text-neutral-500 mt-1">
                    Allow us to show you personalized content and offers.
                  </p>
                </div>
              </div>

              {/* Personalization */}
              <div className="flex items-start gap-3 p-3 bg-neutral-800/50 rounded-lg">
                <input
                  type="checkbox"
                  id="personalization"
                  checked={consent.personalization}
                  onChange={(e) => setConsent({ ...consent, personalization: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded cursor-pointer"
                />
                <div className="flex-1">
                  <label htmlFor="personalization" className="text-sm font-medium text-white cursor-pointer">
                    Personalization
                  </label>
                  <p className="text-xs text-neutral-500 mt-1">
                    Personalize your experience based on your preferences and behavior.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-neutral-800">
              <button
                onClick={() => setShowDetails(false)}
                className="flex-1 px-3 py-2 text-sm font-medium text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleRejectAll}
                className="flex-1 px-3 py-2 text-sm font-medium text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={handleAcceptCustom}
                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Save Preferences
              </button>
            </div>

            <p className="text-xs text-neutral-500 text-center">
              Read our{' '}
              <a href="/privacy" className="text-blue-400 hover:text-blue-300">
                Privacy Policy
              </a>
              {' '}and{' '}
              <a href="/terms" className="text-blue-400 hover:text-blue-300">
                Terms of Service
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
