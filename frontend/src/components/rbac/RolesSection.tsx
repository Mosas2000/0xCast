import { RoleHierarchyManager } from '@/services/RoleHierarchyManager';
import { PermissionMatrixManager } from '@/services/PermissionMatrixManager';
import { RoleManagementDashboard } from '../RoleManagementDashboard';

interface RolesSectionProps {
  hierarchyManager: RoleHierarchyManager;
  permissionManager: PermissionMatrixManager;
  onRoleUpdate: (role: any) => void;
  onRoleDelete: (roleId: string) => void;
}

export function RolesSection({
  hierarchyManager,
  permissionManager,
  onRoleUpdate,
  onRoleDelete,
}: RolesSectionProps) {
  return (
    <RoleManagementDashboard
      hierarchyManager={hierarchyManager}
      permissionManager={permissionManager}
      onRoleUpdate={onRoleUpdate}
      onRoleDelete={onRoleDelete}
    />
  );
}
