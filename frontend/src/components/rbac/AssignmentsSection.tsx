import React from 'react';
import { RoleAssignmentService } from '@/services/RoleAssignmentService';
import { RoleHierarchyManager } from '@/services/RoleHierarchyManager';
import { RoleAssignmentUI, BulkAssignmentUI } from '../RoleAssignmentUI';

interface AssignmentsSectionProps {
  assignmentService: RoleAssignmentService;
  hierarchyManager: RoleHierarchyManager;
  currentUserId: string;
  onAssignmentComplete: (userId: string, roleId: string) => void;
}

export function AssignmentsSection({
  assignmentService,
  hierarchyManager,
  currentUserId,
  onAssignmentComplete,
}: AssignmentsSectionProps) {
  return (
    <div className="assignments-section">
      <h2>Role Assignments</h2>
      <div className="assignments-grid">
        <div className="assignment-form-container">
          <RoleAssignmentUI
            assignmentService={assignmentService}
            hierarchyManager={hierarchyManager}
            currentUserId={currentUserId}
            onAssignmentComplete={onAssignmentComplete}
          />
        </div>

        <div className="bulk-assignment-container">
          <BulkAssignmentUI
            assignmentService={assignmentService}
            hierarchyManager={hierarchyManager}
            currentUserId={currentUserId}
          />
        </div>
      </div>
    </div>
  );
}
