import React from 'react';
import { ShareButton } from './ShareButton';

interface ShareModalProps {
    marketId: string;
    marketTitle: string;
    isOpen: boolean;
    onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
    marketId,
    marketTitle,
    isOpen,
    onClose,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <ShareButton marketId={marketId} marketTitle={marketTitle} />
            </div>
        </div>
    );
};
