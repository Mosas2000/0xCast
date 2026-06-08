import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSwitcher } from '../LanguageSwitcher';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
}));

describe('LanguageSwitcher Accessibility', () => {
  it('has proper ARIA attributes on button', () => {
    render(<LanguageSwitcher />);
    const button = screen.getByRole('button', { name: /select language/i });
    
    expect(button).toHaveAttribute('aria-haspopup', 'listbox');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('updates aria-expanded when dropdown opens', () => {
    render(<LanguageSwitcher />);
    const button = screen.getByRole('button', { name: /select language/i });
    
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('has proper role on dropdown menu', () => {
    render(<LanguageSwitcher />);
    const button = screen.getByRole('button', { name: /select language/i });
    
    fireEvent.click(button);
    const listbox = screen.getByRole('listbox', { name: /language options/i });
    expect(listbox).toBeInTheDocument();
  });

  it('has proper role and aria-selected on options', () => {
    render(<LanguageSwitcher />);
    const button = screen.getByRole('button', { name: /select language/i });
    
    fireEvent.click(button);
    const options = screen.getAllByRole('option');
    
    expect(options.length).toBeGreaterThan(0);
    options.forEach(option => {
      expect(option).toHaveAttribute('aria-selected');
    });
  });

  it('closes dropdown on Escape key', () => {
    render(<LanguageSwitcher />);
    const button = screen.getByRole('button', { name: /select language/i });
    
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes dropdown when clicking outside', () => {
    render(<LanguageSwitcher />);
    const button = screen.getByRole('button', { name: /select language/i });
    
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    
    fireEvent.mouseDown(document.body);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});
