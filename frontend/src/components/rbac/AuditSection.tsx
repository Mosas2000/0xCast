import { AuditLogger } from '@/services/AuditLogger';
import { AuditLogViewer } from '../AuditLogViewer';

interface AuditSectionProps {
  auditLogger: AuditLogger;
}

export function AuditSection({ auditLogger }: AuditSectionProps) {
  return (
    <div className="audit-section">
      <h2>Audit Log Viewer</h2>
      <AuditLogViewer auditLogger={auditLogger} pageSize={20} />
    </div>
  );
}
