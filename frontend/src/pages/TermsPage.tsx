import React from 'react';

/**
 * Terms of Service page for 0xCast users.
 */
export const TermsPage: React.FC = () => {
    return (
        <div className="container mx-auto px-6 py-12 max-w-3xl">
            <h1 className="text-4xl font-black text-white mb-8 font-display">Terms of Service</h1>

            <div className="glass-morphism rounded-3xl p-8 border border-white/10 space-y-6 text-slate-300">
                <section>
                    <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
                    <p className="leading-relaxed">
                        By accessing 0xCast, you agree to be bound by these terms. 0xCast is a decentralized platform and you are solely responsible for your interactions and trades.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-3">2. No Financial Advice</h2>
                    <p className="leading-relaxed">
                        The information provided on 0xCast does not constitute financial, investment, or trading advice. Prediction markets involved significant risk of loss.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-3">3. Risk Disclosure</h2>
                    <p className="leading-relaxed">
                        Users acknowledge that blockchain technology and smart contracts carry inherent risks. 0xCast is provided "as is" without warranties of any kind.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-3">4. Prohibited Jurisdictions</h2>
                    <p className="leading-relaxed">
                        Users are responsible for ensuring that their use of prediction markets is legal in their jurisdiction.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default TermsPage;
