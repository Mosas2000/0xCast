import React, { useState } from 'react';
import { AccessControlService } from '@/services/AccessControlService';

interface ResourceAccessManagerProps {
  accessControl: AccessControlService;
  onAccessChange?: (userId: string, resourceId: string, accessType: string, granted: boolean) => void;
}

export function ResourceAccessManager({ accessControl, onAccessChange }: ResourceAccessManagerProps) {
  const [userId, setUserId] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [accessType, setAccessType] = useState<'read' | 'write' | 'delete' | 'admin'>('read');
  const [resourceAccesses, setResourceAccesses] = useState<Map<string, Set<string>>>(new Map());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const accessTypes: Array<'read' | 'write' | 'delete' | 'admin'> = ['read', 'write', 'delete', 'admin'];

  const handleGrantAccess = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!userId.trim() || !resourceId.trim()) {
        setError('User ID and Resource ID are required');
        return;
      }

      accessControl.grantResourceAccess(userId, resourceId, accessType);

      const key = `${userId}:${resourceId}`;
      const updatedAccess = new Map(resourceAccesses);
      const userResourceAccess = updatedAccess.get(key) || new Set<string>();
      userResourceAccess.add(accessType);
      updatedAccess.set(key, userResourceAccess);
      setResourceAccesses(updatedAccess);

      setSuccess(`${accessType} access granted to ${userId} for resource ${resourceId}`);
      setUserId('');
      setResourceId('');
      setAccessType('read');

      if (onAccessChange) {
        onAccessChange(userId, resourceId, accessType, true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to grant access');
    }
  };

  const handleRevokeAccess = (userId: string, resourceId: string, type: string) => {
    try {
      accessControl.revokeResourceAccess(userId, resourceId, type as 'read' | 'write' | 'delete' | 'admin');

      const key = `${userId}:${resourceId}`;
      const updatedAccess = new Map(resourceAccesses);
      const userResourceAccess = updatedAccess.get(key);
      if (userResourceAccess) {
        userResourceAccess.delete(type);
        if (userResourceAccess.size === 0) {
          updatedAccess.delete(key);
        }
      }
      setResourceAccesses(updatedAccess);

      setSuccess(`${type} access revoked from ${userId} for resource ${resourceId}`);

      if (onAccessChange) {
        onAccessChange(userId, resourceId, type, false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke access');
    }
  };

  const handleCheckAccess = () => {
    if (!userId.trim() || !resourceId.trim()) {
      setError('User ID and Resource ID are required');
      return;
    }

    const hasAccess = accessControl.checkResourceAccess(userId, resourceId, accessType);
    setSuccess(
      hasAccess
        ? `${userId} has ${accessType} access to ${resourceId}`
        : `${userId} does not have ${accessType} access to ${resourceId}`
    );
  };

  return (
    <div className="resource-access-manager">
      <div className="access-form-section">
        <h3>Manage Resource Access</h3>

        <form onSubmit={handleGrantAccess} className="access-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="userId">User ID</label>
              <input
                id="userId"
                type="text"
                value={userId}
                onChange={e => setUserId(e.target.value)}
                placeholder="Enter user ID"
              />
            </div>

            <div className="form-group">
              <label htmlFor="resourceId">Resource ID</label>
              <input
                id="resourceId"
                type="text"
                value={resourceId}
                onChange={e => setResourceId(e.target.value)}
                placeholder="Enter resource ID"
              />
            </div>

            <div className="form-group">
              <label htmlFor="accessType">Access Type</label>
              <select
                id="accessType"
                value={accessType}
                onChange={e => setAccessType(e.target.value as 'read' | 'write' | 'delete' | 'admin')}
              >
                {accessTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="grant-btn">
              Grant Access
            </button>
            <button type="button" onClick={handleCheckAccess} className="check-btn">
              Check Access
            </button>
          </div>
        </form>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </div>

      {resourceAccesses.size > 0 && (
        <div className="access-list-section">
          <h3>Current Access Assignments</h3>

          <div className="access-list">
            {Array.from(resourceAccesses.entries()).map(([key, accessSet]) => {
              const [user, resource] = key.split(':');
              return (
                <div key={key} className="access-item">
                  <div className="access-header">
                    <span className="user-label">User: {user}</span>
                    <span className="resource-label">Resource: {resource}</span>
                  </div>

                  <div className="access-types">
                    {accessTypes.map(type => (
                      <div key={type} className="access-type-item">
                        <span className={`access-badge ${accessSet.has(type) ? 'granted' : 'revoked'}`}>
                          {type}
                        </span>
                        {accessSet.has(type) && (
                          <button
                            className="revoke-btn"
                            onClick={() => handleRevokeAccess(user, resource, type)}
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface AccessMatrixProps {
  accessControl: AccessControlService;
  userIds: string[];
  resourceIds: string[];
}

export function AccessMatrix({ accessControl, userIds, resourceIds }: AccessMatrixProps) {
  const accessTypes: Array<'read' | 'write' | 'delete' | 'admin'> = ['read', 'write', 'delete', 'admin'];

  return (
    <div className="access-matrix">
      <h3>Resource Access Matrix</h3>

      <div className="matrix-container">
        <table className="access-matrix-table">
          <thead>
            <tr>
              <th>User / Resource</th>
              {resourceIds.map(resourceId => (
                <th key={resourceId} className="resource-header">
                  {resourceId}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {userIds.map(userId => (
              <tr key={userId}>
                <td className="user-row-header">{userId}</td>
                {resourceIds.map(resourceId => {
                  const hasReadAccess = accessControl.checkResourceAccess(userId, resourceId, 'read');
                  const hasWriteAccess = accessControl.checkResourceAccess(userId, resourceId, 'write');
                  const hasDeleteAccess = accessControl.checkResourceAccess(userId, resourceId, 'delete');
                  const hasAdminAccess = accessControl.checkResourceAccess(userId, resourceId, 'admin');

                  return (
                    <td key={`${userId}-${resourceId}`} className="matrix-cell">
                      <div className="access-indicators">
                        <span className={`indicator ${hasReadAccess ? 'granted' : 'denied'}`} title="Read">
                          R
                        </span>
                        <span className={`indicator ${hasWriteAccess ? 'granted' : 'denied'}`} title="Write">
                          W
                        </span>
                        <span className={`indicator ${hasDeleteAccess ? 'granted' : 'denied'}`} title="Delete">
                          D
                        </span>
                        <span className={`indicator ${hasAdminAccess ? 'granted' : 'denied'}`} title="Admin">
                          A
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="legend">
        <span>R = Read</span>
        <span>W = Write</span>
        <span>D = Delete</span>
        <span>A = Admin</span>
      </div>
    </div>
  );
}
