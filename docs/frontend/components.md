# Frontend Components Integration Notes

## Providers and app shell

- `WalletProvider`: wallet connect/disconnect state and persisted address handling.
- `NetworkProvider`: active network state used by hooks and contract config.
- `TransactionProvider`: transaction status pipeline used by transaction UI.
- `ThemeProvider`: color mode state.
- `ErrorBoundary` + `PageErrorBoundary`: runtime isolation by app/page scope.

## Routing

`App.tsx` exposes main routes:

- `/markets`, `/trade/:id`, `/create-market`
- `/multi-markets`, `/multi-trade/:id`, `/create-multi-market`
- `/portfolio`, `/staking`, `/liquidity`, `/governance`, `/analytics`, `/transactions`

## Core market components

- `MarketCard`: binary market list card with status, category, and odds.
- `RecentMarkets`, `TopMarketsTable`, `MarketFilter`: market discovery and sorting UI.
- `Header`, `Footer`, `MobileBottomNav`: navigation and app-level links.

## Transaction and feedback components

- `TransactionToast`, `TransactionHistory`, `ErrorMessage`, `Loading`.
- Used with hook `isLoading`, `error`, and `txId` states for wallet interactions.

## Oracle, governance, and liquidity components

- Governance: `ProposalCard`, `CreateProposalModal`
- Oracle: `OracleCard`, `OracleStatusBadge`, `ResolutionCard`, `DisputeCard`
- Liquidity: `LiquidityCard`, `LiquidityStats`, `PoolPositionRow`
