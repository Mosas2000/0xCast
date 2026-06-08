
type Section = 'overview' | 'roles' | 'assignments' | 'resources' | 'audit';

interface QuickActionsProps {
  onNavigate: (section: Section) => void;
}

export function QuickActions({ onNavigate }: QuickActionsProps) {
  return (
    <div className="quick-actions">
      <h3>Quick Actions</h3>
      <div className="action-grid">
        <button className="action-btn" onClick={() => onNavigate('assignments')}>
          Assign Role
        </button>
        <button className="action-btn" onClick={() => onNavigate('roles')}>
          Manage Roles
        </button>
        <button className="action-btn" onClick={() => onNavigate('resources')}>
          Control Resources
        </button>
        <button className="action-btn" onClick={() => onNavigate('audit')}>
          View Audit Log
        </button>
      </div>
    </div>
  );
}
