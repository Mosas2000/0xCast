import React from 'react';

export function SystemInformation() {
  return (
    <div className="system-info">
      <h3>System Information</h3>
      <dl className="info-list">
        <dt>Role Hierarchy Levels</dt>
        <dd>7 (SuperAdmin through Guest)</dd>
        <dt>Permission Types</dt>
        <dd>20 distinct permissions</dd>
        <dt>Access Control Model</dt>
        <dd>Role-based with resource-level granularity</dd>
        <dt>Audit Trail</dt>
        <dd>Comprehensive logging enabled</dd>
      </dl>
    </div>
  );
}
