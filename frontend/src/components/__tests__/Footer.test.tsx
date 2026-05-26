import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Footer } from '../Footer';

vi.mock('../../contexts/NetworkContext', () => ({
  useNetwork: () => ({
    network: 'testnet',
    contractAddress: 'STTESTCONTRACT',
  }),
}));

describe('Footer', () => {
  it('renders footer links correctly and hides contract link', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'Markets' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Portfolio' })).toBeInTheDocument();
    
    // Verify Contract link is not present (hidden)
    const contractLink = screen.queryByRole('link', { name: 'Contract' });
    expect(contractLink).toBeNull();
  });
});
