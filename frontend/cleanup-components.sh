#!/bin/bash

# Script to delete non-MVP components
# Keeping only essential components for basic prediction markets

cd "$(dirname "$0")/src/components"

echo "Deleting non-MVP components..."

# Delete entire component folders we don't need
rm -rf oracle/
rm -rf governance/
rm -rf liquidity/
rm -rf amm/
rm -rf rbac/
rm -rf charts/ 
rm -rf mobile/
rm -rf network/
rm -rf examples/

# Delete individual non-MVP components (keep .tsx, delete .tsx and .tsx.bak)
rm -f AccessibilityAnnouncer.tsx* \
      AdminAnalyticsDashboard.tsx* \
      AdminRBACDashboard.tsx* \
      AdvancedChart.tsx* \
      AnalyticsDashboard.tsx* \
      AuditLogViewer.tsx* \
      CacheDashboard.tsx* \
      CacheStatus.tsx* \
      ChartLegend.tsx* \
      CreateProposalModal.tsx* \
      DisputeCard.tsx* \
      DrawingToolsPanel.tsx* \
      EmergencyPauseBanner.tsx* \
      ErrorMonitoringDashboard.tsx* \
      ExportDialog.tsx* \
      ExportOptions.tsx* \
      ExportProgress.tsx* \
      FraudAlertPanel.tsx* \
      GDPRConsentBanner.tsx* \
      GDPRPrivacyDashboard.tsx* \
      IndicatorPanel.tsx* \
      KYCVerificationForm.tsx* \
      LeaderboardComponent.tsx* \
      LiquidityCard.tsx* \
      LiquidityMiningPage.tsx* \
      LiquidityRewardsCalculator.tsx* \
      LiquidityStats.tsx* \
      LogViewer.tsx* \
      MeasurementTools.tsx* \
      MigrationManager.tsx* \
      MobileAccordion.tsx* \
      MobileBadge.tsx* \
      MobileBottomNav.tsx* \
      MobileBottomSheet.tsx* \
      MobileButton.tsx* \
      MobileCard.tsx* \
      MobileChip.tsx* \
      MobileFormInput.tsx* \
      MobileGrid.tsx* \
      MobileHeader.tsx* \
      MobileModal.tsx* \
      MobileNavigation.tsx* \
      MobileResponsiveChart.tsx* \
      MobileSearch.tsx* \
      MobileSelect.tsx* \
      MobileSkeleton.tsx* \
      MobileTabs.tsx* \
      MobileTextarea.tsx* \
      MobileToast.tsx* \
      MonitoringDashboard.tsx* \
      NetworkBadge.tsx* \
      NetworkSelector.tsx* \
      NetworkSwitchDialog.tsx* \
      NotificationBadge.tsx* \
      NotificationBell.tsx* \
      NotificationCenter.tsx* \
      NotificationPreferences.tsx* \
      OracleCard.tsx* \
      OracleHealthDashboard.tsx* \
      OracleNetworkDashboard.tsx* \
      OracleNetworkStatus.tsx* \
      OracleProviderConfig.tsx* \
      OracleStatusBadge.tsx* \
      PerformanceDashboard.tsx* \
      PerformanceMonitor.tsx* \
      PermissionGuard.tsx* \
      PersonalStatsCard.tsx* \
      PoolPositionRow.tsx* \
      PriceAggregationCard.tsx* \
      PriceOverlay.tsx* \
      ProposalCard.tsx* \
      ProviderComparisonView.tsx* \
      PullToRefresh.tsx* \
      QuestionForm.tsx* \
      RateLimitAdminPanel.tsx* \
      RateLimitBanner.tsx* \
      RateLimitDashboard.tsx* \
      RateLimitMonitoringDashboard.tsx* \
      RateLimitNotification.tsx* \
      RateLimitProgressBar.tsx* \
      RateLimitStatus.tsx* \
      RealtimeMarketComponents.tsx* \
      RecentMarkets.tsx* \
      ReferralCard.tsx* \
      ReferralDashboard.tsx* \
      ReferralInvitation.tsx* \
      ReputationComponents.tsx* \
      ReputationDashboard.tsx* \
      ReputationExamples.tsx* \
      RequestIdProvider.tsx* \
      ResolutionCard.tsx* \
      ResourceAccessManager.tsx* \
      ResponsiveChart.tsx* \
      RewardHistory.tsx* \
      RewardHistoryChart.tsx* \
      RewardNotification.tsx* \
      RoleAssignmentUI.tsx* \
      RoleManagementDashboard.tsx* \
      ScheduledExportManager.tsx* \
      SwipeableCard.tsx* \
      SyncComponents.tsx* \
      TemplateHelp.tsx* \
      TemplateSelection.tsx* \
      TimeRangeSelector.tsx* \
      TimeframeSelector.tsx* \
      TopMarketsTable.tsx* \
      TransactionHistory.tsx* \
      TransactionIdProvider.tsx* \
      TransactionToast.tsx* \
      UpgradeManager.tsx* \
      UserIdProvider.tsx* \
      WizardProgress.tsx* \
      AMMComponents.tsx* \
      APYComparison.tsx*

echo "✅ Deleted non-MVP components"
echo "Kept MVP components:"
ls -1 *.tsx | grep -v ".bak"

cd ../..
echo "Done! Run 'npm run build' to check for errors"
