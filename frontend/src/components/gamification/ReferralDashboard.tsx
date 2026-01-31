import React from 'react';

export const ReferralDashboard: React.FC = () => {
    const referralCode = 'OXCAST123';
    const referrals = 5;
    const earnings = 250;

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Referral Program</h3>
            <div className="p-4 bg-blue-50 rounded-lg mb-4">
                <p className="text-sm text-gray-600 mb-2">Your Referral Code</p>
                <p className="text-2xl font-bold text-blue-600">{referralCode}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Referrals</p>
                    <p className="text-2xl font-bold">{referrals}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Earnings</p>
                    <p className="text-2xl font-bold text-green-600">{earnings} STX</p>
                </div>
            </div>
        </div>
    );
};
