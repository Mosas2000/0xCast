import React from 'react';

/**
 * Privacy Policy page for 0xCast users.
 */
export const PrivacyPage: React.FC = () => {
    return (
        <div className="container mx-auto px-6 py-12 max-w-3xl">
            <h1 className="text-4xl font-black text-white mb-8 font-display">Privacy Policy</h1>

            <div className="glass-morphism rounded-3xl p-8 border border-white/10 space-y-6 text-slate-300">
                <section>
                    <h2 className="text-xl font-bold text-white mb-3">1. Data Collection</h2>
                    <p className="leading-relaxed">
                        0xCast is a decentralized application. We do not collect or store your personal information, email, or IP address. Your interactions are secured by the Stacks blockchain and your self-custodial wallet.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-3">2. Blockchain Data</h2>
                    <p className="leading-relaxed">
                        Please be aware that any transaction conducted on the blockchain is public by nature. This includes market creation, staking, and resolution data.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-3">3. Local Storage</h2>
                    <p className="leading-relaxed">
                        We use browser local storage to save your application preferences, such as theme settings and local achievement progress. This data never leaves your device.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-3">4. Cookies</h2>
                    <p className="leading-relaxed">
                        We do not use tracking or advertising cookies. Any cookies used are strictly for application functionality.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPage;
