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
  it('links the contract to the active network explorer', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    const contractLink = screen.getByRole('link', { name: 'Contract' });
    expect(contractLink).toHaveAttribute(
      'href',
      'https://explorer.hiro.so/address/STTESTCONTRACT?chain=testnet'
    );
  });
});
