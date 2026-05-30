import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShareModal } from '../ShareModal';
import { MobileBottomSheet } from '../MobileBottomSheet';
import { NotificationCenter } from '../NotificationCenter';

describe('Accessibility - ARIA Labels', () => {
  describe('ShareModal', () => {
    it('should have aria-label on close button', () => {
      render(
        <ShareModal
          isOpen={true}
          onClose={() => {}}
          marketId={1}
        />
      );
      
      const closeButton = screen.getByLabelText('Close');
      expect(closeButton).toBeInTheDocument();
    });

    it('should have aria-labels on social share buttons', () => {
      render(
        <ShareModal
          isOpen={true}
          onClose={() => {}}
          marketId={1}
        />
      );
      
      expect(screen.getByLabelText('Share on Twitter')).toBeInTheDocument();
      expect(screen.getByLabelText('Share on Discord')).toBeInTheDocument();
      expect(screen.getByLabelText('Share on Telegram')).toBeInTheDocument();
      expect(screen.getByLabelText('Share on Reddit')).toBeInTheDocument();
    });
  });

  describe('MobileBottomSheet', () => {
    it('should have aria-label on close button', () => {
      render(
        <MobileBottomSheet
          isOpen={true}
          onClose={() => {}}
          title="Test Sheet"
        >
          <div>Content</div>
        </MobileBottomSheet>
      );
      
      const closeButton = screen.getByLabelText('Close');
      expect(closeButton).toBeInTheDocument();
    });

    it('should have aria-labels on snap point buttons', () => {
      render(
        <MobileBottomSheet
          isOpen={true}
          onClose={() => {}}
          snapPoints={[0.5, 0.9]}
        >
          <div>Content</div>
        </MobileBottomSheet>
      );
      
      expect(screen.getByLabelText('Snap to position 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Snap to position 2')).toBeInTheDocument();
    });
  });

  describe('NotificationCenter', () => {
    it('should have aria-label on close button', () => {
      render(
        <NotificationCenter
          userId="test-user"
          onClose={() => {}}
        />
      );
      
      const closeButton = screen.getByLabelText('Close notifications');
      expect(closeButton).toBeInTheDocument();
    });

    it('should have aria-labels on filter buttons', () => {
      render(
        <NotificationCenter
          userId="test-user"
        />
      );
      
      expect(screen.getByLabelText('Show all notifications')).toBeInTheDocument();
      expect(screen.getByLabelText('Show unread notifications')).toBeInTheDocument();
      expect(screen.getByLabelText('Show read notifications')).toBeInTheDocument();
    });

    it('should have aria-pressed on active filter button', () => {
      render(
        <NotificationCenter
          userId="test-user"
        />
      );
      
      const allButton = screen.getByLabelText('Show all notifications');
      expect(allButton).toHaveAttribute('aria-pressed', 'true');
    });
  });
});
