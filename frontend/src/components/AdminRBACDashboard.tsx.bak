import React, { useState, useCallback } from 'react';
import { AccessControlService } from '@/services/AccessControlService';
import { RoleAssignmentService } from '@/services/RoleAssignmentService';
import { AuditLogger } from '@/services/AuditLogger';
import { RoleHierarchyManager } from '@/services/RoleHierarchyManager';
import { PermissionMatrixManager } from '@/services/PermissionMatrixManager';
import { useRBACStatistics } from '@/hooks/useRBACStatistics';
import { DashboardHeader } from './rbac/DashboardHeader';
import { DashboardNavigation } from './rbac/DashboardNavigation';
import { OverviewSection } from './rbac/OverviewSection';
import { RolesSection } from './rbac/RolesSection';
import { AssignmentsSection } from './rbac/AssignmentsSection';
import { ResourcesSection } from './rbac/ResourcesSection';
import { AuditSection } from './rbac/AuditSection';
import { DashboardFooter } from './rbac/DashboardFooter';

interface AdminRBACSectionProps {
  accessControl: AccessControlService;
  roleAssignment: RoleAssignmentService;
  auditLogger: AuditLogger;
  roleHierarchy: RoleHierarchyManager;
  permissionMatrix: PermissionMatrixManager;
  currentUserId: string;
}

type Section = 'overview' | 'roles' | 'assignments' | 'resources' | 'audit';

export function AdminRBACDashboard({
  accessControl,
  roleAssignment,
  auditLogger,
  roleHierarchy,
  permissionMatrix,
  currentUserId,
}: AdminRBACSectionProps) {
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const statistics = useRBACStatistics(auditLogger);

  const handleRoleUpdate = useCallback((role: any) => {
    auditLogger.logAction(currentUserId, 'role_update', 'role', role.id, 'success');
  }, [auditLogger, currentUserId]);

  const handleRoleDelete = useCallback((roleId: string) => {
    auditLogger.logAction(currentUserId, 'role_delete', 'role', roleId, 'success');
  }, [auditLogger, currentUserId]);

  const handleAssignmentComplete = useCallback((userId: string, roleId: string) => {
    auditLogger.logAction(currentUserId, 'role_assigned', 'user', userId, 'success');
  }, [auditLogger, currentUserId]);

  const handleAccessChange = useCallback((userId: string, resourceId: string, accessType: string, granted: boolean) => {
    auditLogger.logAction(
      currentUserId,
      granted ? 'resource_access_granted' : 'resource_access_revoked',
      'resource',
      resourceId,
      'success'
    );
  }, [auditLogger, currentUserId]);

  return (
    <div className="admin-rbac-dashboard">
      <DashboardHeader />
      <DashboardNavigation activeSection={activeSection} onSectionChange={setActiveSection} />

      <div className="dashboard-content">
        {activeSection === 'overview' && (
          <OverviewSection statistics={statistics} onNavigate={setActiveSection} />
        )}

        {activeSection === 'roles' && (
          <RolesSection
            hierarchyManager={roleHierarchy}
            permissionManager={permissionMatrix}
            onRoleUpdate={handleRoleUpdate}
            onRoleDelete={handleRoleDelete}
          />
        )}

        {activeSection === 'assignments' && (
          <AssignmentsSection
            assignmentService={roleAssignment}
            hierarchyManager={roleHierarchy}
            currentUserId={currentUserId}
            onAssignmentComplete={handleAssignmentComplete}
          />
        )}

        {activeSection === 'resources' && (
          <ResourcesSection accessControl={accessControl} onAccessChange={handleAccessChange} />
        )}

        {activeSection === 'audit' && <AuditSection auditLogger={auditLogger} />}
      </div>

      <DashboardFooter currentUserId={currentUserId} />
    </div>
  );
}
