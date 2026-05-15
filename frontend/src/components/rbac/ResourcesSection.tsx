import React from 'react';
import { AccessControlService } from '@/services/AccessControlService';
import { ResourceAccessManager, AccessMatrix } from '../ResourceAccessManager';

interface ResourcesSectionProps {
  accessControl: AccessControlService;
  onAccessChange: (userId: string, resourceId: string, accessType: string, granted: boolean) => void;
}

export function ResourcesSection({ accessControl, onAccessChange }: ResourcesSectionProps) {
  return (
    <div className="resources-section">
      <h2>Resource Access Control</h2>
      <ResourceAccessManager accessControl={accessControl} onAccessChange={onAccessChange} />

      <div className="access-matrix-section">
        <AccessMatrix
          accessControl={accessControl}
          userIds={['user1', 'user2', 'user3']}
          resourceIds={['resource1', 'resource2', 'resource3']}
        />
      </div>
    </div>
  );
}
