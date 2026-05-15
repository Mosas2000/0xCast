import React, { useState } from 'react';
import { RoleType } from '@/types/rbac';
import { RoleAssignmentService } from '@/services/RoleAssignmentService';
import { RoleHierarchyManager } from '@/services/RoleHierarchyManager';

interface RoleAssignmentUIProps {
  assignmentService: RoleAssignmentService;
  hierarchyManager: RoleHierarchyManager;
  currentUserId: string;
  onAssignmentComplete?: (userId: string, roleId: string) => void;
}

export function RoleAssignmentUI({
  assignmentService,
  hierarchyManager,
  currentUserId,
  onAssignmentComplete,
}: RoleAssignmentUIProps) {
  const [userId, setUserId] = useState('');
  const [roleId, setRoleId] = useState('');
  const [reason, setReason] = useState('');
  const [hasExpiration, setHasExpiration] = useState(false);
  const [expirationDays, setExpirationDays] = useState(30);
  const [assignmentHistory, setAssignmentHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const availableRoles = Array.from(hierarchyManager.getRoleHierarchy().values()).sort(
    (a, b) => a.level - b.level
  );

  const handleAssignRole = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const expiresAt = hasExpiration ? Date.now() + expirationDays * 24 * 60 * 60 * 1000 : undefined;

      const assignment = assignmentService.assignRole(userId, roleId, currentUserId, reason, expiresAt);

      setAssignmentHistory([assignment, ...assignmentHistory]);
      setSuccess(`Role assigned to ${userId} successfully`);
      setUserId('');
      setRoleId('');
      setReason('');
      setHasExpiration(false);
      setExpirationDays(30);

      if (onAssignmentComplete) {
        onAssignmentComplete(userId, roleId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeRole = (userId: string, roleId: string) => {
    try {
      assignmentService.revokeRole(userId, roleId, 'Revoked by administrator');
      setSuccess(`Role revoked from ${userId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke role');
    }
  };

  const handleBulkAssign = (userIds: string[]) => {
    if (!roleId) {
      setError('Please select a role');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = assignmentService.bulkAssignRole(userIds, roleId, currentUserId, reason);
      setSuccess(`Assigned to ${result.successful.length} users, ${result.failed.length} failed`);

      if (result.failed.length > 0) {
        setError(`Failed users: ${result.failed.join(', ')}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk assign roles');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleLabel = (roleId: string): string => {
    const role = availableRoles.find(r => r.id === roleId);
    return role ? `${role.name} (Level ${role.level})` : roleId;
  };

  return (
    <div className="role-assignment-container">
      <div className="assignment-form-section">
        <h3>Assign Role</h3>

        <form onSubmit={handleAssignRole} className="assignment-form">
          <div className="form-group">
            <label htmlFor="userId">User ID</label>
            <input
              id="userId"
              type="text"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              placeholder="Enter user ID"
              required
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'assignment-error' : undefined}
            />
          </div>

          <div className="form-group">
            <label htmlFor="roleId">Role</label>
            <select
              id="roleId"
              value={roleId}
              onChange={e => setRoleId(e.target.value)}
              required
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'assignment-error' : undefined}
            >
              <option value="">Select a role</option>
              {availableRoles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name} (Level {role.level})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason</label>
            <textarea
              id="reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Reason for assignment"
              rows={3}
            />
          </div>

          <div className="form-group checkbox">
            <input
              id="hasExpiration"
              type="checkbox"
              checked={hasExpiration}
              onChange={e => setHasExpiration(e.target.checked)}
            />
            <label htmlFor="hasExpiration">Set expiration date</label>
          </div>

          {hasExpiration && (
            <div className="form-group">
              <label htmlFor="expirationDays">Expiration (days)</label>
              <input
                id="expirationDays"
                type="number"
                value={expirationDays}
                onChange={e => setExpirationDays(parseInt(e.target.value))}
                min="1"
              />
            </div>
          )}

          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? 'Assigning...' : 'Assign Role'}
          </button>
        </form>

        {error && (
          <div id="assignment-error" className="error-message" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="success-message" role="status">
            {success}
          </div>
        )}
      </div>

      {assignmentHistory.length > 0 && (
        <div className="history-section">
          <h3>Recent Assignments</h3>
          <div className="history-list">
            {assignmentHistory.slice(0, 10).map((assignment, index) => (
              <div key={`${assignment.userId}-${index}`} className="history-item">
                <div className="item-header">
                  <span className="user-id">{assignment.userId}</span>
                  <span className="role-badge">{getRoleLabel(assignment.roleId)}</span>
                  <span className={`status-badge status-${assignment.status}`}>
                    {assignment.status}
                  </span>
                </div>

                {assignment.reason && <p className="item-reason">{assignment.reason}</p>}

                <div className="item-details">
                  <span className="assigned-at">
                    {new Date(assignment.assignedAt).toLocaleString()}
                  </span>
                  {assignment.expiresAt && (
                    <span className="expires-at">
                      Expires: {new Date(assignment.expiresAt).toLocaleString()}
                    </span>
                  )}
                </div>

                {assignment.status === 'active' && (
                  <button
                    className="revoke-btn"
                    onClick={() => handleRevokeRole(assignment.userId, assignment.roleId)}
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface BulkAssignmentUIProps {
  assignmentService: RoleAssignmentService;
  hierarchyManager: RoleHierarchyManager;
  currentUserId: string;
}

export function BulkAssignmentUI({
  assignmentService,
  hierarchyManager,
  currentUserId,
}: BulkAssignmentUIProps) {
  const [userIds, setUserIds] = useState('');
  const [roleId, setRoleId] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ successful: string[]; failed: string[] } | null>(null);

  const availableRoles = Array.from(hierarchyManager.getRoleHierarchy().values()).sort(
    (a, b) => a.level - b.level
  );

  const handleBulkAssign = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const ids = userIds.split(',').map(id => id.trim());
      const bulkResult = assignmentService.bulkAssignRole(ids, roleId, currentUserId, reason);
      setResult(bulkResult);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to bulk assign roles');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bulk-assignment-container">
      <h3>Bulk Role Assignment</h3>

      <form onSubmit={handleBulkAssign} className="bulk-form">
        <div className="form-group">
          <label htmlFor="userIds">User IDs (comma-separated)</label>
          <textarea
            id="userIds"
            value={userIds}
            onChange={e => setUserIds(e.target.value)}
            placeholder="user1, user2, user3"
            rows={4}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="roleId">Role</label>
          <select
            id="roleId"
            value={roleId}
            onChange={e => setRoleId(e.target.value)}
            required
          >
            <option value="">Select a role</option>
            {availableRoles.map(role => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="reason">Reason</label>
          <input
            id="reason"
            type="text"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Reason for bulk assignment"
          />
        </div>

        <button type="submit" disabled={isLoading} className="submit-btn">
          {isLoading ? 'Processing...' : 'Assign to All'}
        </button>
      </form>

      {result && (
        <div className="bulk-result">
          <div className="result-stats">
            <div className="stat successful">
              <span className="count">{result.successful.length}</span>
              <span className="label">Successful</span>
            </div>
            <div className="stat failed">
              <span className="count">{result.failed.length}</span>
              <span className="label">Failed</span>
            </div>
          </div>

          {result.failed.length > 0 && (
            <div className="failed-list">
              <h4>Failed Users</h4>
              <ul>
                {result.failed.map(userId => (
                  <li key={userId}>{userId}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
