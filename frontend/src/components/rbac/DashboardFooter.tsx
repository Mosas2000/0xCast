import React from 'react';

interface DashboardFooterProps {
  currentUserId: string;
}

export function DashboardFooter({ currentUserId }: DashboardFooterProps) {
  return (
    <div className="dashboard-footer">
      <p>Logged in as: {currentUserId}</p>
      <p>RBAC System v1.0</p>
    </div>
  );
}
