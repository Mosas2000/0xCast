import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NetworkSelector } from '../NetworkSelector';
import { NetworkProvider } from '../../contexts/NetworkContext';

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <NetworkProvider>
      {component}
    </NetworkProvider>
  );
};

describe('NetworkSelector Accessibility', () => {
  it('has proper ARIA attributes on dropdown button', () => {
    renderWithProvider(<NetworkSelector variant="dropdown" />);
    const button = screen.getByRole('button', { name: /select network/i });
    
    expect(button).toHaveAttribute('aria-haspopup', 'listbox');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('updates aria-expanded when dropdown opens', () => {
    renderWithProvider(<NetworkSelector variant="dropdown" />);
    const button = screen.getByRole('button', { name: /select network/i });
    
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('has proper role on dropdown menu', () => {
    renderWithProvider(<NetworkSelector variant="dropdown" />);
    const button = screen.getByRole('button', { name: /select network/i });
    
    fireEvent.click(button);
    const listbox = screen.getByRole('listbox', { name: /network options/i });
    expect(listbox).toBeInTheDocument();
  });

  it('has proper role and aria-selected on network options', () => {
    renderWithProvider(<NetworkSelector variant="dropdown" />);
    const button = screen.getByRole('button', { name: /select network/i });
    
    fireEvent.click(button);
    const options = screen.getAllByRole('option');
    
    expect(options.length).toBeGreaterThan(0);
    options.forEach(option => {
      expect(option).toHaveAttribute('aria-selected');
    });
  });

  it('closes dropdown on Escape key', () => {
    renderWithProvider(<NetworkSelector variant="dropdown" />);
    const button = screen.getByRole('button', { name: /select network/i });
    
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not render dropdown for toggle variant', () => {
    renderWithProvider(<NetworkSelector variant="toggle" />);
    const button = screen.getByRole('button');
    
    expect(button).not.toHaveAttribute('aria-haspopup');
    expect(button).not.toHaveAttribute('aria-expanded');
  });

  it('does not render dropdown for compact variant', () => {
    renderWithProvider(<NetworkSelector variant="compact" />);
    const button = screen.getByRole('button');
    
    expect(button).not.toHaveAttribute('aria-haspopup');
    expect(button).not.toHaveAttribute('aria-expanded');
  });
});
