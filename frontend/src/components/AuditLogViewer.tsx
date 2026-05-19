import React, { useState, useEffect } from 'react';
import { AuditLog } from '@/types/rbac';
import { AuditLogger } from '@/services/AuditLogger';

interface AuditLogViewerProps {
  auditLogger: AuditLogger;
  pageSize?: number;
}

export function AuditLogViewer({ auditLogger, pageSize = 20 }: AuditLogViewerProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterUserId, setFilterUserId] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState<'timestamp' | 'action' | 'status'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const allLogs = auditLogger.getLogs();
    setLogs(allLogs);
    applyFilters(allLogs);
  }, [auditLogger]);

  const applyFilters = (logsToFilter: AuditLog[]) => {
    let result = [...logsToFilter];

    if (filterUserId) {
      result = result.filter(log => log.userId.includes(filterUserId));
    }

    if (filterAction) {
      result = result.filter(log => log.action === filterAction);
    }

    if (filterStatus) {
      result = result.filter(log => log.status === filterStatus);
    }

    result.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'timestamp') {
        comparison = a.timestamp - b.timestamp;
      } else if (sortBy === 'action') {
        comparison = a.action.localeCompare(b.action);
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredLogs(result);
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    applyFilters(logs);
  };

  const handleSort = (field: 'timestamp' | 'action' | 'status') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleExport = (format: 'json' | 'csv') => {
    const data = auditLogger.exportLogs(filteredLogs, format);

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(data)}`);
    element.setAttribute('download', `audit-logs.${format}`);
    element.style.display = 'none';

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));
  const uniqueStatuses = Array.from(new Set(logs.map(log => log.status)));

  return (
    <div className="audit-log-viewer">
      <div className="audit-header">
        <h2>Audit Log</h2>
        <div className="export-actions">
          <button onClick={() => handleExport('json')} className="export-btn">
            Export JSON
          </button>
          <button onClick={() => handleExport('csv')} className="export-btn">
            Export CSV
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="filter-user">User ID</label>
          <input
            id="filter-user"
            type="text"
            placeholder="Filter by user ID"
            value={filterUserId}
            onChange={e => setFilterUserId(e.target.value)}
            onBlur={handleFilterChange}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="filter-action">Action</label>
          <select
            id="filter-action"
            value={filterAction}
            onChange={e => {
              setFilterAction(e.target.value);
              handleFilterChange();
            }}
          >
            <option value="">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-status">Status</label>
          <select
            id="filter-status"
            value={filterStatus}
            onChange={e => {
              setFilterStatus(e.target.value);
              handleFilterChange();
            }}
          >
            <option value="">All Statuses</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <button
          className="clear-filters-btn"
          onClick={() => {
            setFilterUserId('');
            setFilterAction('');
            setFilterStatus('');
            applyFilters(logs);
          }}
        >
          Clear Filters
        </button>
      </div>

      <div className="logs-table-section">
        <table className="logs-table">
          <thead>
            <tr>
              <th
                onClick={() => handleSort('timestamp')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('timestamp'); } }}
                className="sortable"
                tabIndex={0}
                role="columnheader"
                aria-sort={sortBy === 'timestamp' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Timestamp {sortBy === 'timestamp' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>User ID</th>
              <th
                onClick={() => handleSort('action')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('action'); } }}
                className="sortable"
                tabIndex={0}
                role="columnheader"
                aria-sort={sortBy === 'action' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Action {sortBy === 'action' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Resource</th>
              <th>Resource ID</th>
              <th
                onClick={() => handleSort('status')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort('status'); } }}
                className="sortable"
                tabIndex={0}
                role="columnheader"
                aria-sort={sortBy === 'status' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.map((log, index) => (
              <tr key={`${log.timestamp}-${index}`}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.userId}</td>
                <td className="action-cell">{log.action}</td>
                <td>{log.resource}</td>
                <td className="resource-id">{log.resourceId}</td>
                <td className={`status-cell status-${log.status}`}>{log.status}</td>
                <td className="details-cell">
                  {log.oldValue && <span className="detail-badge">old: {log.oldValue}</span>}
                  {log.newValue && <span className="detail-badge">new: {log.newValue}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedLogs.length === 0 && (
          <div className="no-logs">
            <p>No audit logs found matching the filters</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      <div className="logs-info">
        <p>
          Showing {paginatedLogs.length} of {filteredLogs.length} logs (Total: {logs.length})
        </p>
      </div>
    </div>
  );
}
