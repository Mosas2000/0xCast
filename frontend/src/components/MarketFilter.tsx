/**
 * Market Filter Component
 * 
 * Provides category, status, and sort controls for market filtering.
 */
import { useState } from 'react';
import {
  MarketCategory,
  SortOption,
  CATEGORIES,
  SORT_OPTIONS,
} from '../utils/marketCategories';

interface MarketFilterProps {
  selectedCategory: MarketCategory;
  selectedSort: SortOption;
  selectedStatus: 'all' | 'active' | 'resolved';
  onCategoryChange: (category: MarketCategory) => void;
  onSortChange: (sort: SortOption) => void;
  onStatusChange: (status: 'all' | 'active' | 'resolved') => void;
  marketCounts?: {
    all: number;
    active: number;
    resolved: number;
  };
}

export function MarketFilter({
  selectedCategory,
  selectedSort,
  selectedStatus,
  onCategoryChange,
  onSortChange,
  onStatusChange,
  marketCounts,
}: MarketFilterProps) {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const selectedCategoryConfig = CATEGORIES.find(c => c.value === selectedCategory) || CATEGORIES[0];
  const selectedSortConfig = SORT_OPTIONS.find(s => s.value === selectedSort) || SORT_OPTIONS[0];

  const statusFilters = [
    { value: 'all' as const, label: 'All', count: marketCounts?.all },
    { value: 'active' as const, label: 'Active', count: marketCounts?.active },
    { value: 'resolved' as const, label: 'Resolved', count: marketCounts?.resolved },
  ];

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    alignItems: 'center',
  };

  const dropdownContainerStyle: React.CSSProperties = {
    position: 'relative',
  };

  const dropdownButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    backgroundColor: '#111111',
    border: '1px solid #262626',
    borderRadius: '10px',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    minWidth: '160px',
  };

  const dropdownMenuStyle = (isOpen: boolean): React.CSSProperties => ({
    position: 'absolute',
    top: '100%',
    left: '0',
    marginTop: '8px',
    backgroundColor: '#111111',
    border: '1px solid #262626',
    borderRadius: '12px',
    padding: '8px',
    minWidth: '200px',
    zIndex: 100,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    display: isOpen ? 'block' : 'none',
  });

  const dropdownItemStyle = (isSelected: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    backgroundColor: isSelected ? '#1F1F1F' : 'transparent',
    color: isSelected ? '#FFFFFF' : '#9CA3AF',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  });

  const statusTabsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    padding: '6px',
    borderRadius: '14px',
    backgroundColor: '#111111',
    border: '1px solid #262626',
  };

  const statusTabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '10px 16px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: isActive ? '#3B82F6' : 'transparent',
    color: isActive ? '#FFFFFF' : '#737373',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  });

  const countBadgeStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#1F1F1F',
    fontSize: '12px',
    fontWeight: '500',
  });

  const chevronStyle: React.CSSProperties = {
    width: '16px',
    height: '16px',
    marginLeft: 'auto',
  };

  return (
    <div style={containerStyle}>
      {/* Status Tabs */}
      <div style={statusTabsStyle}>
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => onStatusChange(f.value)}
            style={statusTabStyle(selectedStatus === f.value)}
          >
            {f.label}
            {f.count !== undefined && (
              <span style={countBadgeStyle(selectedStatus === f.value)}>
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Category Dropdown */}
      <div style={dropdownContainerStyle}>
        <button
          style={dropdownButtonStyle}
          onClick={() => {
            setShowCategoryDropdown(!showCategoryDropdown);
            setShowSortDropdown(false);
          }}
        >
          <span>{selectedCategoryConfig.icon}</span>
          <span>{selectedCategoryConfig.label}</span>
          <svg style={chevronStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div style={dropdownMenuStyle(showCategoryDropdown)}>
          {CATEGORIES.map((category) => (
            <div
              key={category.value}
              style={dropdownItemStyle(selectedCategory === category.value)}
              onClick={() => {
                onCategoryChange(category.value);
                setShowCategoryDropdown(false);
              }}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sort Dropdown */}
      <div style={dropdownContainerStyle}>
        <button
          style={dropdownButtonStyle}
          onClick={() => {
            setShowSortDropdown(!showSortDropdown);
            setShowCategoryDropdown(false);
          }}
        >
          <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
          <span>{selectedSortConfig.label}</span>
          <svg style={chevronStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div style={dropdownMenuStyle(showSortDropdown)}>
          {SORT_OPTIONS.map((option) => (
            <div
              key={option.value}
              style={dropdownItemStyle(selectedSort === option.value)}
              onClick={() => {
                onSortChange(option.value);
                setShowSortDropdown(false);
              }}
            >
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Click outside to close */}
      {(showCategoryDropdown || showSortDropdown) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99,
          }}
          onClick={() => {
            setShowCategoryDropdown(false);
            setShowSortDropdown(false);
          }}
        />
      )}
    </div>
  );
}
