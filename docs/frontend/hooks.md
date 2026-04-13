# Frontend Hooks Reference

This file documents the primary hook interfaces used for contract integration, data fetching, and transaction flows.

## Market data hooks

### `useMarkets()`
Fetches binary markets from `market-core` and auto-refreshes on an interval.

Returns:

- `markets: Market[]`
- `isLoading: boolean`
- `error: string | null`
- `refetch: () => Promise<void>`

### `useMultiMarkets()`
Fetches multi-outcome markets from `market-multi`.

Returns:

- `markets: MultiMarket[]`
- `isLoading: boolean`
- `error: string | null`
- `refetch: () => Promise<void>`

## Transaction hooks

### `useStake()`
Submits binary staking transactions (`place-yes-stake`, `place-no-stake`).

Returns:

- `placeYesStake(marketId, amount, onSuccess?)`
- `placeNoStake(marketId, amount, onSuccess?)`
- `isLoading`, `error`, `txId`
- `isContractPaused`
- `reset()`

### `useMultiStake()`
Submits multi-outcome staking transactions (`stake-on-outcome`).

Returns:

- `placeOutcomeStake(marketId, outcomeIndex, amount, onSuccess?)`
- `isLoading`, `error`, `txId`
- `isContractPaused`
- `reset()`

### `useMarketCreation()`
Creates binary markets via `useContract().createMarket()`.

Returns:

- `createMarket({ question, durationBlocks })`
- `state: { isCreating, error, txId, success }`
- `isContractPaused`
- `resetState()`

### `useMultiMarketCreation()`
Creates multi-outcome markets (`create-multi-market`) with input checks.

Returns:

- `createMultiMarket({ question, outcomes, endDate, resolutionDate })`
- `state: { isCreating, error, success, txId }`
- `isContractPaused`
- `resetState()`

## Utility and network hooks

### `useContractPause()`
Reads `is-contract-paused` from `market-core`.

Returns:

- `isPaused: boolean`
- `isLoading: boolean`
- `error: string | null`
- `refetch(): Promise<void>`

### `useApi()`
Returns network-aware endpoints.

Returns:

- `baseUrl` (Hiro API)
- `nodeUrl` (Stacks Node API)
- `explorerTx`, `explorerAddress`, `explorerContract`

### `useNetworkFetch()`
Wrapper around `fetch` that automatically prefixes non-absolute endpoints with current `baseUrl`.

### `useExplorerUrl()`
Returns helper functions for explorer URLs.
