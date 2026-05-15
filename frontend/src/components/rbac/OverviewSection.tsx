import React from 'react';
import { StatisticsGrid } from './StatisticsGrid';
import { QuickActions } from './QuickActions';
import { SystemInformation } from './SystemInformation';

type Section = 'overview' | 'roles' | 'assignments' | 'resources' | 'audit';

interface OverviewSectionProps {
  statistics: {
    totalRoles: number;
    totalPermissions: number;
    recentAuditLogs: number;
  };
  onNavigate: (section: Section) => void;
}

export function OverviewSection({ statistics, onNavigate }: OverviewSectionProps) {
  return (
    <div className="overview-section">
      <h2>System Overview</h2>
      <StatisticsGrid
        totalRoles={statistics.totalRoles}
        totalPermissions={statistics.totalPermissions}
        recentAuditLogs={statistics.recentAuditLogs}
      />
      <QuickActions onNavigate={onNavigate} />
      <SystemInformation />
    </div>
  );
}
