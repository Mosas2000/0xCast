import React, { useState, useEffect } from 'react';
import { AccessControlService } from '@/services/AccessControlService';
import { RoleAssignmentService } from '@/services/RoleAssignmentService';
import { AuditLogger } from '@/services/AuditLogger';
import { RoleHierarchyManager } from '@/services/RoleHierarchyManager';
import { PermissionMatrixManager } from '@/services/PermissionMatrixManager';
import { RoleManagementDashboard } from './RoleManagementDashboard';
import { AuditLogViewer } from './AuditLogViewer';
import { RoleAssignmentUI, BulkAssignmentUI } from './RoleAssignmentUI';
import { ResourceAccessManager, AccessMatrix } from './ResourceAccessManager';

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
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    totalRoles: 7,
    totalPermissions: 20,
    recentAuditLogs: 0,
  });

  useEffect(() => {
    const logs = auditLogger.getLogs();
    setStatistics(prev => ({
      ...prev,
      recentAuditLogs: logs.length,
    }));
  }, [auditLogger]);

  return (
    <div className="admin-rbac-dashboard">
      <div className="dashboard-header">
        <h1>RBAC Administration Dashboard</h1>
        <p className="subtitle">Manage roles, permissions, and access control</p>
      </div>

      <nav className="dashboard-nav">
        <button
          className={`nav-btn ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSection('overview')}
        >
          Overview
        </button>
        <button
          className={`nav-btn ${activeSection === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveSection('roles')}
        >
          Roles
        </button>
        <button
          className={`nav-btn ${activeSection === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveSection('assignments')}
        >
          Assignments
        </button>
        <button
          className={`nav-btn ${activeSection === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveSection('resources')}
        >
          Resources
        </button>
        <button
          className={`nav-btn ${activeSection === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveSection('audit')}
        >
          Audit
        </button>
      </nav>

      <div className="dashboard-content">
        {activeSection === 'overview' && (
          <div className="overview-section">
            <h2>System Overview</h2>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Roles</h3>
                <p className="stat-value">{statistics.totalRoles}</p>
                <span className="stat-label">Defined in system</span>
              </div>

              <div className="stat-card">
                <h3>Total Permissions</h3>
                <p className="stat-value">{statistics.totalPermissions}</p>
                <span className="stat-label">Available permissions</span>
              </div>

              <div className="stat-card">
                <h3>Audit Logs</h3>
                <p className="stat-value">{statistics.recentAuditLogs}</p>
                <span className="stat-label">Recent records</span>
              </div>

              <div className="stat-card">
                <h3>System Status</h3>
                <p className="stat-value status-active">Active</p>
                <span className="stat-label">All systems operational</span>
              </div>
            </div>

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-grid">
                <button
                  className="action-btn"
                  onClick={() => setActiveSection('assignments')}
                >
                  Assign Role
                </button>
                <button
                  className="action-btn"
                  onClick={() => setActiveSection('roles')}
                >
                  Manage Roles
                </button>
                <button
                  className="action-btn"
                  onClick={() => setActiveSection('resources')}
                >
                  Control Resources
                </button>
                <button
                  className="action-btn"
                  onClick={() => setActiveSection('audit')}
                >
                  View Audit Log
                </button>
              </div>
            </div>

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
          </div>
        )}

        {activeSection === 'roles' && (
          <RoleManagementDashboard
            hierarchyManager={roleHierarchy}
            permissionManager={permissionMatrix}
            onRoleUpdate={(role) => {
              auditLogger.logAction(
                currentUserId,
                'role_update',
                'role',
                role.id,
                'success'
              );
            }}
            onRoleDelete={(roleId) => {
              auditLogger.logAction(
                currentUserId,
                'role_delete',
                'role',
                roleId,
                'success'
              );
            }}
          />
        )}

        {activeSection === 'assignments' && (
          <div className="assignments-section">
            <h2>Role Assignments</h2>
            <div className="assignments-grid">
              <div className="assignment-form-container">
                <RoleAssignmentUI
                  assignmentService={roleAssignment}
                  hierarchyManager={roleHierarchy}
                  currentUserId={currentUserId}
                  onAssignmentComplete={(userId, roleId) => {
                    auditLogger.logAction(
                      currentUserId,
                      'role_assigned',
                      'user',
                      userId,
                      'success'
                    );
                  }}
                />
              </div>

              <div className="bulk-assignment-container">
                <BulkAssignmentUI
                  assignmentService={roleAssignment}
                  hierarchyManager={roleHierarchy}
                  currentUserId={currentUserId}
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'resources' && (
          <div className="resources-section">
            <h2>Resource Access Control</h2>
            <ResourceAccessManager
              accessControl={accessControl}
              onAccessChange={(userId, resourceId, accessType, granted) => {
                auditLogger.logAction(
                  currentUserId,
                  granted ? 'resource_access_granted' : 'resource_access_revoked',
                  'resource',
                  resourceId,
                  'success'
                );
              }}
            />

            <div className="access-matrix-section">
              <AccessMatrix
                accessControl={accessControl}
                userIds={['user1', 'user2', 'user3']}
                resourceIds={['resource1', 'resource2', 'resource3']}
              />
            </div>
          </div>
        )}

        {activeSection === 'audit' && (
          <div className="audit-section">
            <h2>Audit Log Viewer</h2>
            <AuditLogViewer auditLogger={auditLogger} pageSize={20} />
          </div>
        )}
      </div>

      <div className="dashboard-footer">
        <p>Logged in as: {currentUserId}</p>
        <p>RBAC System v1.0</p>
      </div>
    </div>
  );
}
