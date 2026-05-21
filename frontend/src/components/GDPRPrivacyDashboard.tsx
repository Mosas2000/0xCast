import React, { useState, useEffect } from 'react';
import { GDPRComplianceService, DataProcessingActivity } from '@/services/GDPRComplianceService';
import { DataExportService } from '@/services/DataExportService';
import { DataDeletionService } from '@/services/DataDeletionService';
import { DataRetentionService } from '@/services/DataRetentionService';

interface GDPRPrivacyDashboardProps {
  userId: string;
  onConsentChange?: () => void;
}

type ActiveTab = 'overview' | 'consent' | 'data' | 'activities' | 'deletion';

export function GDPRPrivacyDashboard({ userId, onConsentChange }: GDPRPrivacyDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [status, setStatus] = useState(GDPRComplianceService.getComplianceStatus());
  const [activities] = useState<DataProcessingActivity[]>(
    GDPRComplianceService.getDataProcessingActivities()
  );
  const [exportLoading, setExportLoading] = useState(false);
  const [deletionLoading, setDeletionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setStatus(GDPRComplianceService.getComplianceStatus());
  }, []);

  const handleConsentUpdate = (
    key: 'analytics' | 'marketing' | 'personalization',
    value: boolean
  ) => {
    GDPRComplianceService.updateConsent({ [key]: value });
    setStatus(GDPRComplianceService.getComplianceStatus());
    onConsentChange?.();
  };

  const handleAcceptAll = () => {
    GDPRComplianceService.acceptAll();
    setStatus(GDPRComplianceService.getComplianceStatus());
    onConsentChange?.();
  };

  const handleRejectAll = () => {
    GDPRComplianceService.rejectAll();
    setStatus(GDPRComplianceService.getComplianceStatus());
    onConsentChange?.();
  };

  const handleExportData = async (format: 'json' | 'csv') => {
    setExportLoading(true);
    setMessage(null);

    try {
      const result = await DataExportService.exportUserData({
        userId,
        format: { type: format, includeMetadata: true, includePII: true },
      });

      if (result.success) {
        DataExportService.downloadExport(result);
        setMessage({ type: 'success', text: 'Data exported successfully.' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Export failed.' });
      }
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteData = async (scope: 'pii' | 'analytics' | 'preferences') => {
    setDeletionLoading(true);
    setMessage(null);

    try {
      const result = await DataDeletionService.deleteUserData({ userId, scope });

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Deleted ${result.deletedKeys.length} data items.`,
        });
        setStatus(GDPRComplianceService.getComplianceStatus());
      } else {
        setMessage({
          type: 'error',
          text: `Deletion completed with ${result.errors.length} errors.`,
        });
      }
    } finally {
      setDeletionLoading(false);
    }
  };

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'consent', label: 'Consent' },
    { id: 'data', label: 'My Data' },
    { id: 'activities', label: 'Processing' },
    { id: 'deletion', label: 'Deletion' },
  ];

  return (
    <div className="gdpr-privacy-dashboard">
      <div className="dashboard-header">
        <h2>Privacy & Data Settings</h2>
        <p className="subtitle">
          Manage your personal data and privacy preferences in accordance with GDPR.
        </p>
      </div>

      <nav className="tab-nav" role="tablist" aria-label="Privacy settings sections">
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {message && (
        <div
          id="dashboard-message"
          role="alert"
          className={`message ${message.type}`}
        >
          {message.text}
        </div>
      )}

      <div
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="tab-panel"
      >
        {activeTab === 'overview' && (
          <OverviewPanel status={status} />
        )}

        {activeTab === 'consent' && (
          <ConsentPanel
            status={status}
            onConsentUpdate={handleConsentUpdate}
            onAcceptAll={handleAcceptAll}
            onRejectAll={handleRejectAll}
          />
        )}

        {activeTab === 'data' && (
          <DataPanel
            onExport={handleExportData}
            exportLoading={exportLoading}
          />
        )}

        {activeTab === 'activities' && (
          <ActivitiesPanel activities={activities} />
        )}

        {activeTab === 'deletion' && (
          <DeletionPanel
            onDelete={handleDeleteData}
            deletionLoading={deletionLoading}
          />
        )}
      </div>
    </div>
  );
}

interface OverviewPanelProps {
  status: ReturnType<typeof GDPRComplianceService.getComplianceStatus>;
}

function OverviewPanel({ status }: OverviewPanelProps) {
  const retentionPolicies = DataRetentionService.getAllPolicies();

  return (
    <div className="overview-panel">
      <h3>Compliance Status</h3>

      <div className="status-grid">
        <div className="status-item">
          <span className="status-label">Consent Provided</span>
          <span className={`status-value ${status.consentProvided ? 'positive' : 'negative'}`}>
            {status.consentProvided ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Consent Up to Date</span>
          <span className={`status-value ${status.consentUpToDate ? 'positive' : 'negative'}`}>
            {status.consentUpToDate ? 'Yes' : 'Needs Update'}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Analytics</span>
          <span className={`status-value ${status.analyticsEnabled ? 'positive' : 'neutral'}`}>
            {status.analyticsEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Marketing</span>
          <span className={`status-value ${status.marketingEnabled ? 'positive' : 'neutral'}`}>
            {status.marketingEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Personalization</span>
          <span className={`status-value ${status.personalizationEnabled ? 'positive' : 'neutral'}`}>
            {status.personalizationEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        {status.consentTimestamp && (
          <div className="status-item">
            <span className="status-label">Last Updated</span>
            <span className="status-value">
              {new Date(status.consentTimestamp).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      <h3>Data Retention Policies</h3>
      <div className="retention-list">
        {retentionPolicies.map(policy => (
          <div key={policy.category} className="retention-item">
            <div className="retention-name">{policy.category.replace(/_/g, ' ')}</div>
            <div className="retention-days">{policy.retentionDays} days</div>
            <div className="retention-desc">{policy.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ConsentPanelProps {
  status: ReturnType<typeof GDPRComplianceService.getComplianceStatus>;
  onConsentUpdate: (key: 'analytics' | 'marketing' | 'personalization', value: boolean) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
}

function ConsentPanel({ status, onConsentUpdate, onAcceptAll, onRejectAll }: ConsentPanelProps) {
  const consentItems: Array<{
    key: 'analytics' | 'marketing' | 'personalization';
    label: string;
    description: string;
    required: boolean;
  }> = [
    {
      key: 'analytics',
      label: 'Analytics',
      description: 'Allow us to collect usage data to improve the application.',
      required: false,
    },
    {
      key: 'marketing',
      label: 'Marketing',
      description: 'Receive updates about new features and relevant content.',
      required: false,
    },
    {
      key: 'personalization',
      label: 'Personalization',
      description: 'Customize your experience based on your preferences.',
      required: false,
    },
  ];

  return (
    <div className="consent-panel">
      <h3>Consent Preferences</h3>
      <p>
        Necessary cookies are always enabled as they are required for the application to function.
        You can manage optional consent categories below.
      </p>

      <div className="consent-item required">
        <div className="consent-info">
          <span className="consent-label">Necessary</span>
          <span className="consent-desc">
            Required for core functionality. Cannot be disabled.
          </span>
        </div>
        <span className="consent-badge required">Always On</span>
      </div>

      {consentItems.map(item => (
        <div key={item.key} className="consent-item">
          <div className="consent-info">
            <label htmlFor={`consent-${item.key}`} className="consent-label">
              {item.label}
            </label>
            <span className="consent-desc">{item.description}</span>
          </div>
          <input
            id={`consent-${item.key}`}
            type="checkbox"
            checked={status[`${item.key}Enabled`]}
            onChange={e => onConsentUpdate(item.key, e.target.checked)}
            aria-describedby={`consent-${item.key}-desc`}
          />
        </div>
      ))}

      <div className="consent-actions">
        <button className="btn-accept-all" onClick={onAcceptAll}>
          Accept All
        </button>
        <button className="btn-reject-all" onClick={onRejectAll}>
          Reject Optional
        </button>
      </div>
    </div>
  );
}

interface DataPanelProps {
  onExport: (format: 'json' | 'csv') => void;
  exportLoading: boolean;
}

function DataPanel({ onExport, exportLoading }: DataPanelProps) {
  return (
    <div className="data-panel">
      <h3>Export Your Data</h3>
      <p>
        Under GDPR Article 20, you have the right to receive your personal data in a
        structured, commonly used, and machine-readable format.
      </p>

      <div className="export-actions">
        <button
          className="btn-export"
          onClick={() => onExport('json')}
          disabled={exportLoading}
          aria-busy={exportLoading}
        >
          {exportLoading ? 'Exporting...' : 'Export as JSON'}
        </button>
        <button
          className="btn-export"
          onClick={() => onExport('csv')}
          disabled={exportLoading}
          aria-busy={exportLoading}
        >
          {exportLoading ? 'Exporting...' : 'Export as CSV'}
        </button>
      </div>

      <div className="data-info">
        <h4>What is included in your export:</h4>
        <ul>
          <li>Consent preferences and history</li>
          <li>Transaction and stake history</li>
          <li>Application preferences</li>
          <li>Filter presets and saved searches</li>
          <li>Notification preferences</li>
        </ul>
      </div>
    </div>
  );
}

interface ActivitiesPanelProps {
  activities: DataProcessingActivity[];
}

function ActivitiesPanel({ activities }: ActivitiesPanelProps) {
  return (
    <div className="activities-panel">
      <h3>Data Processing Activities</h3>
      <p>
        The following activities describe how we process your personal data,
        the legal basis for processing, and how long we retain it.
      </p>

      <div className="activities-list">
        {activities.map(activity => (
          <div key={activity.name} className="activity-item">
            <h4>{activity.name}</h4>
            <dl className="activity-details">
              <dt>Purpose</dt>
              <dd>{activity.purpose}</dd>
              <dt>Legal Basis</dt>
              <dd>{activity.legalBasis.replace(/_/g, ' ')}</dd>
              <dt>Data Categories</dt>
              <dd>{activity.dataCategories.join(', ')}</dd>
              <dt>Retention Period</dt>
              <dd>{activity.retentionPeriod}</dd>
              {activity.thirdParties.length > 0 && (
                <>
                  <dt>Third Parties</dt>
                  <dd>{activity.thirdParties.join(', ')}</dd>
                </>
              )}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}

interface DeletionPanelProps {
  onDelete: (scope: 'pii' | 'analytics' | 'preferences') => void;
  deletionLoading: boolean;
}

function DeletionPanel({ onDelete, deletionLoading }: DeletionPanelProps) {
  const [confirmScope, setConfirmScope] = useState<string | null>(null);

  const deletionOptions: Array<{
    scope: 'pii' | 'analytics' | 'preferences';
    label: string;
    description: string;
    warning: string;
  }> = [
    {
      scope: 'pii',
      label: 'Delete Personal Information',
      description: 'Remove all personally identifiable information from local storage.',
      warning: 'This will remove your wallet address and profile data.',
    },
    {
      scope: 'analytics',
      label: 'Delete Analytics Data',
      description: 'Remove all analytics and usage tracking data.',
      warning: 'This will clear your search history and usage statistics.',
    },
    {
      scope: 'preferences',
      label: 'Delete Preferences',
      description: 'Remove all saved preferences and settings.',
      warning: 'This will reset your theme, filters, and notification settings.',
    },
  ];

  const handleConfirm = (scope: 'pii' | 'analytics' | 'preferences') => {
    setConfirmScope(null);
    onDelete(scope);
  };

  return (
    <div className="deletion-panel">
      <h3>Delete Your Data</h3>
      <p>
        Under GDPR Article 17, you have the right to request deletion of your personal data.
        Select the category of data you wish to delete.
      </p>

      <div className="deletion-options">
        {deletionOptions.map(option => (
          <div key={option.scope} className="deletion-option">
            <div className="option-info">
              <h4>{option.label}</h4>
              <p>{option.description}</p>
              <p className="option-warning">{option.warning}</p>
            </div>

            {confirmScope === option.scope ? (
              <div className="confirm-actions">
                <span>Are you sure?</span>
                <button
                  className="btn-confirm-delete"
                  onClick={() => handleConfirm(option.scope)}
                  disabled={deletionLoading}
                >
                  Confirm
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => setConfirmScope(null)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                className="btn-delete"
                onClick={() => setConfirmScope(option.scope)}
                disabled={deletionLoading}
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
