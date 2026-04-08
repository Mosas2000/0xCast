import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorMessage } from '../ErrorMessage';

describe('ErrorMessage', () => {
  describe('rendering', () => {
    it('returns null when error is null', () => {
      const { container } = render(<ErrorMessage error={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('displays string error message', () => {
      render(<ErrorMessage error="Something went wrong" />);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('displays Error object message', () => {
      render(<ErrorMessage error={new Error('Network error')} />);
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  describe('inline variant (default)', () => {
    it('renders inline style by default', () => {
      const { container } = render(<ErrorMessage error="Test error" />);
      expect(container.firstChild).toHaveClass('rounded-xl');
    });

    it('shows dismiss button when onDismiss provided', () => {
      render(<ErrorMessage error="Test error" onDismiss={() => {}} />);
      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    });

    it('calls onDismiss when dismiss button clicked', () => {
      const handleDismiss = vi.fn();
      render(<ErrorMessage error="Test error" onDismiss={handleDismiss} />);
      
      fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });

    it('hides dismiss button when onDismiss not provided', () => {
      render(<ErrorMessage error="Test error" />);
      expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
    });
  });

  describe('banner variant', () => {
    it('renders banner style', () => {
      const { container } = render(
        <ErrorMessage error="Test error" variant="banner" />
      );
      expect(container.firstChild).toHaveClass('w-full', 'border-y');
    });

    it('shows dismiss button in banner variant', () => {
      render(
        <ErrorMessage error="Test error" variant="banner" onDismiss={() => {}} />
      );
      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    });
  });

  describe('toast variant', () => {
    it('renders toast style with fixed positioning', () => {
      const { container } = render(
        <ErrorMessage error="Test error" variant="toast" />
      );
      expect(container.firstChild).toHaveClass('fixed', 'bottom-4', 'right-4');
    });

    it('has high z-index for toast overlay', () => {
      const { container } = render(
        <ErrorMessage error="Test error" variant="toast" />
      );
      expect(container.firstChild).toHaveClass('z-50');
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <ErrorMessage error="Test error" className="custom-error-class" />
      );
      expect(container.firstChild).toHaveClass('custom-error-class');
    });

    it('contains error icon SVG', () => {
      render(<ErrorMessage error="Test error" />);
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('uses red color scheme for error styling', () => {
      const { container } = render(<ErrorMessage error="Test error" />);
      expect(container.firstChild).toHaveClass('bg-red-500/10');
    });
  });
});
