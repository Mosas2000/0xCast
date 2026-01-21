import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { useWallet } from '../hooks/useWallet';
import { dateToBlockHeight, isFutureDate } from '../utils/blockHeight';
import { openContractCall } from '@stacks/connect';
import {
    stringAsciiCV,
    uintCV,
    PostConditionMode
} from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAME } from '../constants/contract';

export function CreateMarketForm() {
    const { isConnected } = useWallet();
    const [question, setQuestion] = useState('');
    const [endDate, setEndDate] = useState('');
    const [resolutionDate, setResolutionDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const validateDates = (): boolean => {
        if (!endDate || !resolutionDate) {
            setError('Please fill in all date fields');
            return false;
        }

        const end = new Date(endDate);
        const resolution = new Date(resolutionDate);

        if (!isFutureDate(end)) {
            setError('End date must be in the future');
            return false;
        }

        if (!isFutureDate(resolution)) {
            setError('Resolution date must be in the future');
            return false;
        }

        if (resolution <= end) {
            setError('Resolution date must be after end date');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!isConnected) {
            setError('Please connect your wallet first');
            return;
        }

        if (!question.trim()) {
            setError('Please enter a market question');
            return;
        }

        if (question.length > 256) {
            setError('Question must be 256 characters or less');
            return;
        }

        if (!validateDates()) {
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading('Creating market...');

        try {
            const endBlockHeight = dateToBlockHeight(new Date(endDate));
            const resolutionBlockHeight = dateToBlockHeight(new Date(resolutionDate));

            await openContractCall({
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'create-market',
                functionArgs: [
                    stringAsciiCV(question),
                    uintCV(endBlockHeight),
                    uintCV(resolutionBlockHeight),
                ],
                postConditionMode: PostConditionMode.Deny,
                onFinish: (data) => {
                    console.log('Transaction submitted:', data.txId);
                    toast.dismiss(loadingToast);
                    toast.success(`Market created! TX: ${data.txId.slice(0, 8)}...`);
                    setSuccess(`Market created! Transaction ID: ${data.txId}`);
                    setQuestion('');
                    setEndDate('');
                    setResolutionDate('');
                    setIsLoading(false);
                },
                onCancel: () => {
                    toast.dismiss(loadingToast);
                    toast.error('Transaction cancelled');
                    setError('Transaction cancelled');
                    setIsLoading(false);
                },
            });
        } catch (err) {
            console.error('Error creating market:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to create market';
            toast.dismiss(loadingToast);
            toast.error(`Failed to create market: ${errorMessage}`);
            setError(errorMessage);
            setIsLoading(false);
        }
    };

    if (!isConnected) {
        return (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 text-center">
                <p className="text-slate-400">Connect your wallet to create a market</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Create New Market</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Question Input */}
                <div>
                    <label htmlFor="question" className="block text-sm font-medium text-slate-300 mb-2">
                        Market Question
                    </label>
                    <input
                        type="text"
                        id="question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Will Bitcoin reach $100k by end of 2026?"
                        maxLength={256}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        disabled={isLoading}
                    />
                    <p className="text-xs text-slate-500 mt-1">{question.length}/256 characters</p>
                </div>

                {/* End Date Input */}
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-slate-300 mb-2">
                        Trading End Date
                    </label>
                    <input
                        type="datetime-local"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        disabled={isLoading}
                    />
                    <p className="text-xs text-slate-500 mt-1">When trading closes for this market</p>
                </div>

                {/* Resolution Date Input */}
                <div>
                    <label htmlFor="resolutionDate" className="block text-sm font-medium text-slate-300 mb-2">
                        Resolution Date
                    </label>
                    <input
                        type="datetime-local"
                        id="resolutionDate"
                        value={resolutionDate}
                        onChange={(e) => setResolutionDate(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        disabled={isLoading}
                    />
                    <p className="text-xs text-slate-500 mt-1">When the market outcome can be determined</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
                        <p className="text-green-400 text-sm">{success}</p>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Creating Market...' : 'Create Market'}
                </button>
            </form>
        </div>
    );
}
