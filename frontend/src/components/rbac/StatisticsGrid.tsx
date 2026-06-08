
interface StatisticsGridProps {
  totalRoles: number;
  totalPermissions: number;
  recentAuditLogs: number;
}

export function StatisticsGrid({ totalRoles, totalPermissions, recentAuditLogs }: StatisticsGridProps) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Total Roles</h3>
        <p className="stat-value">{totalRoles}</p>
        <span className="stat-label">Defined in system</span>
      </div>

      <div className="stat-card">
        <h3>Total Permissions</h3>
        <p className="stat-value">{totalPermissions}</p>
        <span className="stat-label">Available permissions</span>
      </div>

      <div className="stat-card">
        <h3>Audit Logs</h3>
        <p className="stat-value">{recentAuditLogs}</p>
        <span className="stat-label">Recent records</span>
      </div>

      <div className="stat-card">
        <h3>System Status</h3>
        <p className="stat-value status-active">Active</p>
        <span className="stat-label">All systems operational</span>
      </div>
    </div>
  );
}
