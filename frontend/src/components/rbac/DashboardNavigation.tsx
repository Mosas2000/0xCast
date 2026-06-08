
type Section = 'overview' | 'roles' | 'assignments' | 'resources' | 'audit';

interface DashboardNavigationProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
}

export function DashboardNavigation({ activeSection, onSectionChange }: DashboardNavigationProps) {
  const sections: { id: Section; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'roles', label: 'Roles' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'resources', label: 'Resources' },
    { id: 'audit', label: 'Audit' },
  ];

  return (
    <nav className="dashboard-nav">
      {sections.map(section => (
        <button
          key={section.id}
          className={`nav-btn ${activeSection === section.id ? 'active' : ''}`}
          onClick={() => onSectionChange(section.id)}
        >
          {section.label}
        </button>
      ))}
    </nav>
  );
}
