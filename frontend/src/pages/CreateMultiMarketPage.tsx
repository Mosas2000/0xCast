import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMultiMarketCreation } from '../hooks/useMultiMarketCreation';
import { validateMultiOutcomeInputs } from '../utils/validation';

function getCurrentBlockEstimate(): number {
  return Math.floor(Date.now() / 600000);
}

export function CreateMultiMarketPage() {
  const { createMultiMarket, state, isContractPaused } = useMultiMarketCreation();
  const [question, setQuestion] = useState('');
  const [outcomes, setOutcomes] = useState(['', '', '']);
  const [durationDays, setDurationDays] = useState(7);
  const [resolutionDelayDays, setResolutionDelayDays] = useState(2);

  const currentBlock = useMemo(() => getCurrentBlockEstimate(), []);
  const endDate = useMemo(() => currentBlock + durationDays * 144, [currentBlock, durationDays]);
  const resolutionDate = useMemo(
    () => endDate + resolutionDelayDays * 144,
    [endDate, resolutionDelayDays]
  );
  const inputValidation = useMemo(
    () => validateMultiOutcomeInputs(question, outcomes),
    [question, outcomes]
  );

  const canSubmit = useMemo(() => {
    return (
      inputValidation.isValid &&
      durationDays >= 1 &&
      resolutionDelayDays >= 1 &&
      endDate < resolutionDate
    );
  }, [durationDays, resolutionDelayDays, inputValidation.isValid, endDate, resolutionDate]);

  const updateOutcome = (index: number, value: string) => {
    setOutcomes((prev) => prev.map((item, idx) => (idx === index ? value : item)));
  };

  const addOutcome = () => {
    setOutcomes((prev) => (prev.length >= 10 ? prev : [...prev, '']));
  };

  const removeOutcome = (index: number) => {
    setOutcomes((prev) => {
      if (prev.length <= 3) return prev;
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const preparedOutcomes = outcomes.map((value) => value.trim()).filter(Boolean);
    await createMultiMarket({
      question: question.trim(),
      outcomes: preparedOutcomes,
      endDate,
      resolutionDate,
    });
  };

  return (
    <div className="pt-[72px] min-h-screen bg-white dark:bg-black">
      <div className="container max-w-4xl py-8 sm:py-12 lg:py-16 px-4 sm:px-6">
        <div className="mb-8">
          <Link to="/multi-markets" className="text-neutral-500 hover:text-black dark:hover:text-white">
            Back to Multi Markets
          </Link>
          <h1 className="text-3xl font-bold text-black dark:text-white mt-4">Create Multi-Outcome Market</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Define a market with 3 to 10 outcomes and publish it on-chain.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-4 sm:p-6 lg:p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-black dark:text-white mb-2" htmlFor="multi-question">
              Market Question
            </label>
            <textarea
              id="multi-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              className="input w-full min-h-[96px]"
              placeholder="Who will win the 2026 World Cup?"
              maxLength={256}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-black dark:text-white">Outcomes</label>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addOutcome}>
                Add Outcome
              </button>
            </div>
            <div className="space-y-3">
              {outcomes.map((outcome, index) => (
                <div key={`outcome-${index}`} className="flex gap-2">
                  <input
                    value={outcome}
                    onChange={(event) => updateOutcome(index, event.target.value)}
                    className="input w-full"
                    placeholder={`Outcome ${index + 1}`}
                    maxLength={100}
                  />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => removeOutcome(index)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-black dark:text-white mb-2">Market Duration (days)</label>
              <input
                type="number"
                min={1}
                max={180}
                value={durationDays}
                onChange={(event) => setDurationDays(Number(event.target.value))}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black dark:text-white mb-2">Resolution Delay (days)</label>
              <input
                type="number"
                min={1}
                max={30}
                value={resolutionDelayDays}
                onChange={(event) => setResolutionDelayDays(Number(event.target.value))}
                className="input w-full"
              />
            </div>
          </div>

          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            End block: {endDate.toLocaleString()} | Resolution block: {resolutionDate.toLocaleString()}
          </div>

          {!inputValidation.isValid && (
            <p className="text-sm text-red-500">
              {inputValidation.error}
            </p>
          )}

          {state.error && <p className="text-sm text-red-500">{state.error}</p>}
          {isContractPaused && (
            <p className="text-sm text-amber-500">
              Market creation is temporarily paused. Claim and refund operations remain available.
            </p>
          )}
          {state.success && (
            <p className="text-sm text-emerald-500">
              Multi-outcome market creation transaction submitted successfully.
            </p>
          )}
          {state.txId && <p className="text-xs text-neutral-500 break-all">Transaction: {state.txId}</p>}

          <button type="submit" className="btn btn-primary" disabled={!canSubmit || state.isCreating || isContractPaused}>
            {state.isCreating ? 'Creating Market...' : 'Create Multi-Outcome Market'}
          </button>
        </form>
      </div>
    </div>
  );
}
