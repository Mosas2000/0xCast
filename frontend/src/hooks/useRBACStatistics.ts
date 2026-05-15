import { useState, useEffect } from 'react';
import { AuditLogger } from '@/services/AuditLogger';

interface RBACStatistics {
  totalUsers: number;
  totalRoles: number;
  totalPermissions: number;
  recentAuditLogs: number;
}

export function useRBACStatistics(auditLogger: AuditLogger) {
  const [statistics, setStatistics] = useState<RBACStatistics>({
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

  return statistics;
}
