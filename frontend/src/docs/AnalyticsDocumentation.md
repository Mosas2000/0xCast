# 0xCast Analytics Dashboard

## Overview
Enterprise-grade analytics system for the 0xCast prediction market platform.

## Features
- Real-time platform metrics tracking.
- Interactive time-series charts (Volume, TVL, Price).
- Detailed market-specific analytics and sentiment analysis.
- User portfolio performance and asset allocation.
- Competitive leaderboards with rank history.
- PDF/CSV data export.

## Technical Stack
- **React 19** with TypeScript.
- **Recharts** for high-performance data visualization.
- **Tailwind CSS** for premium, responsive UI.
- **Lucide-react** for iconography.
- Custom hooks for optimized data fetching and aggregation.

## Component Architecture
- `MetricCard`: Atomic component for key values.
- `BaseCharts`: Generic wrappers for Line, Bar, and Pie charts.
- `PageSections`: Higher-level dashboard segments.
- `DashboardLayout`: Persistent navigation and sidebar.

## Data Layer
Uses `useAnalytics` base hook with automatic loading and error states. Supports real-time updates via `useRealTimeData`.
