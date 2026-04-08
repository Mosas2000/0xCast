import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner, LoadingState, SkeletonCard } from '../Loading';

describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    render(<LoadingSpinner />);
    const spinner = document.querySelector('div');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('renders with small size', () => {
    render(<LoadingSpinner size="sm" />);
    const spinner = document.querySelector('div');
    expect(spinner).toHaveClass('w-4', 'h-4');
  });

  it('renders with large size', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = document.querySelector('div');
    expect(spinner).toHaveClass('w-12', 'h-12');
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="text-red-500" />);
    const spinner = document.querySelector('div');
    expect(spinner).toHaveClass('text-red-500');
  });

  it('contains animated SVG', () => {
    render(<LoadingSpinner />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('animate-spin');
  });
});

describe('LoadingState', () => {
  it('renders with default message', () => {
    render(<LoadingState />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingState message="Fetching markets..." />);
    expect(screen.getByText('Fetching markets...')).toBeInTheDocument();
  });

  it('contains a loading spinner', () => {
    render(<LoadingState />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has centered layout', () => {
    render(<LoadingState />);
    const container = document.querySelector('div');
    expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
  });
});

describe('SkeletonCard', () => {
  it('renders skeleton elements', () => {
    render(<SkeletonCard />);
    const skeletons = document.querySelectorAll('.skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('has card container', () => {
    render(<SkeletonCard />);
    const card = document.querySelector('.card');
    expect(card).toBeInTheDocument();
  });

  it('renders multiple skeleton placeholders', () => {
    render(<SkeletonCard />);
    const skeletons = document.querySelectorAll('.skeleton');
    // Should have multiple skeleton elements for different parts
    expect(skeletons.length).toBeGreaterThanOrEqual(5);
  });
});
