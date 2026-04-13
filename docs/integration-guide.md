# Integration Guide

## 1) Connect wallet

1. Run frontend (`cd frontend && npm run dev`).
2. Click **Connect Wallet** in header.
3. Approve Stacks Connect prompt.
4. Confirm address appears in app header.

## 2) Place predictions (binary market)

1. Open `/markets` and choose a market card.
2. On `/trade/:id`, enter stake amount.
3. Submit **Yes** or **No** stake transaction.
4. Approve wallet prompt and wait for tx confirmation.

Notes:

- Staking uses STX post conditions with `PostConditionMode.Deny`.
- If emergency pause is enabled, staking is blocked in UI.

## 3) Create markets

### Binary

1. Open `/create-market`.
2. Enter question and duration.
3. Submit and approve wallet transaction.

### Multi-outcome

1. Open `/create-multi-market`.
2. Provide question, outcomes (3-10), end date, and resolution date.
3. Submit and approve wallet transaction.

## 4) Claim winnings

1. Wait for market resolution and finalization.
2. Use claim action on trade flow.
3. Approve wallet transaction for payout transfer.

## 5) Network behavior

- API base URLs and explorer links switch by selected network (`mainnet` or `testnet`).
- Contract addresses resolve dynamically via `frontend/src/config/contracts.ts`.
