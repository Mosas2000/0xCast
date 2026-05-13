# Scripts Changelog

## [2.0.0] - 2026-05-12

### Breaking Changes
- Removed hardcoded block heights from all scripts
- Scripts now require network connectivity to fetch current block heights

### Added
- Dynamic block height fetching with retry logic and caching
- Comprehensive block height validation system
- Time-to-block and block-to-time conversion utilities
- Automated validation script to detect hardcoded values
- Extensive documentation and migration guides
- Usage examples for block height utilities
- Test coverage for block height configuration

### Changed
- `interact-contract.ts` now uses dynamic block height calculation
- All market creation scripts use centralized configuration
- Improved error messages with actionable guidance
- Enhanced logging for block height operations

### Fixed
- Issue #64: Scripts no longer fail with "block height in the past" errors
- Scripts remain functional regardless of when they're run
- No manual updates required for block heights

### Documentation
- Added `BLOCK_HEIGHT_GUIDE.md` - Complete usage guide
- Added `MIGRATION_GUIDE.md` - Migration instructions
- Updated `README.md` with dynamic block height documentation
- Added `ISSUE_64_RESOLUTION.md` - Detailed resolution documentation

### Technical Details
- Block heights are fetched from Hiro API with 3 retry attempts
- 60-second caching reduces API calls
- Manual fallback available for offline scenarios
- Validation ensures markets are created with valid timestamps
- Configuration constants centralize all timing parameters

## [1.0.0] - 2026-01-22

### Initial Release
- Bulk market creation script
- Automated trading script
- Market lifecycle simulation
- Stress testing capabilities
- Analytics reporting
- Transaction helpers and utilities
