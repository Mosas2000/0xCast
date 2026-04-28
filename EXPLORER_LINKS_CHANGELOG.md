# Explorer Links Fix Changelog

## [Unreleased] - 2024

### Fixed
- Explorer links now respect the selected network (mainnet/testnet)
- Transaction links no longer hardcoded to mainnet
- Address links now point to correct chain
- Contract links now point to correct chain

### Added
- `explorerLinks.ts` utility module with network-aware functions
- `getTransactionExplorerUrl()` function
- `getAddressExplorerUrl()` function
- `getContractExplorerUrl()` function
- `getExplorerChain()` helper in network configuration
- Comprehensive test suite for explorer links
- JSDoc documentation for all explorer link functions
- Migration guide for updating existing code

### Changed
- `TransactionHistory` component now uses network context
- `TransactionToast` component now uses network context
- `transactions.ts` utility now delegates to `explorerLinks.ts`
- Network configuration updated with consistent chain parameters

### Technical Details
- All explorer URL functions accept optional `network` parameter
- Functions default to active network when parameter not provided
- Components use `useNetwork()` hook to get current network
- Test coverage includes edge cases and special characters

### Impact
- Users on testnet can now properly view transactions
- No more 404 errors on explorer links
- Consistent behavior across all components
- Better developer experience with reusable utilities

### Breaking Changes
None. All changes are backward compatible.

### Migration Required
No migration required. Existing code continues to work, but developers are encouraged to use the new utilities for consistency.
