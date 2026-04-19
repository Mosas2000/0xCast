import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExportDialog from './ExportDialog';

vi.mock('../hooks/useExport', () => ({
  useExport: () => ({
    isExporting: false,
    progress: { status: 'pending', progress: 0 },
    error: null,
    exportTransactions: vi.fn(),
    exportPositions: vi.fn(),
    exportPortfolio: vi.fn(),
    exportRewards: vi.fn(),
    exportTaxReport: vi.fn(),
    reset: vi.fn(),
  }),
}));

describe('ExportDialog', () => {
  const mockData = {
    transactions: [{ id: '1', amount: 100 }],
    positions: [{ marketId: 1, yesStake: 100 }],
    portfolio: { totalValue: 5000 },
    rewards: [{ id: '1', amount: 50 }],
  };

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <ExportDialog
        isOpen={false}
        onClose={vi.fn()}
        data={mockData}
      />
    );

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <ExportDialog
        isOpen={true}
        onClose={vi.fn()}
        data={mockData}
      />
    );

    expect(screen.getByText('Export Data')).toBeInTheDocument();
  });

  it('should display transaction export option', () => {
    render(
      <ExportDialog
        isOpen={true}
        onClose={vi.fn()}
        data={mockData}
      />
    );

    expect(screen.getByText('Transaction History')).toBeInTheDocument();
  });

  it('should display portfolio export option', () => {
    render(
      <ExportDialog
        isOpen={true}
        onClose={vi.fn()}
        data={mockData}
      />
    );

    expect(screen.getByText('Portfolio Summary')).toBeInTheDocument();
  });

  it('should display positions export option', () => {
    render(
      <ExportDialog
        isOpen={true}
        onClose={vi.fn()}
        data={mockData}
      />
    );

    expect(screen.getByText('Market Positions')).toBeInTheDocument();
  });

  it('should display rewards export option', () => {
    render(
      <ExportDialog
        isOpen={true}
        onClose={vi.fn()}
        data={mockData}
      />
    );

    expect(screen.getByText('Reward History')).toBeInTheDocument();
  });

  it('should display tax report export option', () => {
    render(
      <ExportDialog
        isOpen={true}
        onClose={vi.fn()}
        data={mockData}
      />
    );

    expect(screen.getByText('Tax Report')).toBeInTheDocument();
  });

  it('should show transaction count in option', () => {
    render(
      <ExportDialog
        isOpen={true}
        onClose={vi.fn()}
        data={mockData}
      />
    );

    expect(screen.getByText('1 transactions')).toBeInTheDocument();
  });

  it('should navigate to options step when export type selected', async () => {
    render(
      <ExportDialog
        isOpen={true}
        onClose={vi.fn()}
        data={mockData}
      />
    );

    const transactionButton = screen.getByText('Transaction History');
    fireEvent.click(transactionButton);

    await waitFor(() => {
      expect(screen.getByText('File Format')).toBeInTheDocument();
    });
  });

  it('should call onClose when close button clicked', () => {
    const mockOnClose = vi.fn();
    render(
      <ExportDialog
        isOpen={true}
        onClose={mockOnClose}
        data={mockData}
      />
    );

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should set default export type', () => {
    render(
      <ExportDialog
        isOpen={true}
        onClose={vi.fn()}
        data={mockData}
        defaultType="portfolio"
      />
    );

    expect(screen.getByText('Export Data')).toBeInTheDocument();
  });

  it('should not show empty export options', () => {
    render(
      <ExportDialog
        isOpen={true}
        onClose={vi.fn()}
        data={{}}
      />
    );

    expect(screen.queryByText('Transaction History')).not.toBeInTheDocument();
  });
});
