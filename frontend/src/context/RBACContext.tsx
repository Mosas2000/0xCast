import React, { createContext, useContext, ReactNode } from 'react';
import { AccessControlService } from '@/services/AccessControlService';
import { RoleAssignmentService } from '@/services/RoleAssignmentService';
import { AuditLogger } from '@/services/AuditLogger';
import { RoleHierarchyManager } from '@/services/RoleHierarchyManager';
import { PermissionMatrixManager } from '@/services/PermissionMatrixManager';
import type { Role } from '@/types/rbac';
import { Permission } from '@/types/rbac';

interface RBACContextType {
  accessControl: AccessControlService;
  roleAssignment: RoleAssignmentService;
  auditLogger: AuditLogger;
  roleHierarchy: RoleHierarchyManager;
  permissionMatrix: PermissionMatrixManager;
  currentUserId: string | null;
  userRole: Role | null;
  userPermissions: Permission[];
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

interface RBACProviderProps {
  children: ReactNode;
  accessControl: AccessControlService;
  roleAssignment: RoleAssignmentService;
  auditLogger: AuditLogger;
  roleHierarchy: RoleHierarchyManager;
  permissionMatrix: PermissionMatrixManager;
  currentUserId?: string;
}

export function RBACProvider({
  children,
  accessControl,
  roleAssignment,
  auditLogger,
  roleHierarchy,
  permissionMatrix,
  currentUserId = null,
}: RBACProviderProps) {
  const userRole = currentUserId ? accessControl.getRoleForUser(currentUserId) : null;
  const userPermissions = currentUserId ? accessControl.getUserPermissions(currentUserId) : [];

  const value: RBACContextType = {
    accessControl,
    roleAssignment,
    auditLogger,
    roleHierarchy,
    permissionMatrix,
    currentUserId: currentUserId || null,
    userRole,
    userPermissions,
  };

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
}

export function useRBACContext(): RBACContextType {
  const context = useContext(RBACContext);

  if (!context) {
    throw new Error('useRBACContext must be used within RBACProvider');
  }

  return context;
}

export function withRBACContext<P extends object>(Component: React.ComponentType<P & RBACContextType>) {
  return function WrappedComponent(props: P) {
    const rbac = useRBACContext();
    return <Component {...props} {...rbac} />;
  };
}
