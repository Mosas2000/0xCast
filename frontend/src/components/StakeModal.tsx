import { Market } from '../types/market';
import { Modal } from './Modal';
import { StakeForm } from './StakeForm';

interface StakeModalProps {
    market: Market | null;
    isOpen: boolean;
    onClose: () => void;
}

export function StakeModal({ market, isOpen, onClose }: StakeModalProps) {
    if (!market) return null;

    const handleSuccess = () => {
        // Close modal after successful stake
        setTimeout(() => {
            onClose();
        }, 2000);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Stake on Market"
        >
            <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">Market Question</h3>
                <p className="text-slate-300">{market.question}</p>
            </div>

            <div className="border-t border-slate-700 pt-6">
                <StakeForm
                    market={market}
                    onSuccess={handleSuccess}
                    onCancel={onClose}
                />
            </div>
        </Modal>
    );
}
