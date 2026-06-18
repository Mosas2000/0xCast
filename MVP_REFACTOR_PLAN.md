# 0xCast MVP Refactoring Plan

**Date:** June 8, 2026  
**Branch:** mvp-refactor-clean  
**Goal:** Working MVP with ZERO TypeScript errors

---

## ✅ What We're Keeping

### Smart Contract
- **oxcast.clar** only (already deployed to mainnet)
  - Address: `SP1W6XQZ6XVYGTVW32SJW2ZG48ZJBW9BATRD19N60`
  - Features: Binary markets, betting, resolution, OXC token, staking

### Frontend Pages (4 total)
1. **Landing** - Home page with hero, features
2. **Markets** - Browse/list all markets
3. **Trade** - Single market view, place bets
4. **Create** - Create new market form

### Core Features
- ✅ Connect Stacks wallet
- ✅ Browse markets
- ✅ Create market (question + duration)
- ✅ Place prediction (YES/NO with STX)
- ✅ View odds (dynamic based on pool)
- ✅ Claim winnings (after resolution)

---

## ❌ What We're Removing

### Pages to Delete
- GovernancePage
- OraclePage  
- LiquidityPage
- MultiMarketsPage
- MultiTradePage
- CreateMultiMarketPage
- StakingPage
- TokenPage
- PortfolioPage (complex, not MVP)
- LeaderboardPage
- AnalyticsPage
- TransactionHistoryPage
- WatchlistPage
- RecentlyViewedPage

### Components to Delete
All components related to:
- Governance/voting
- Oracle integration
- Liquidity pools/AMM
- Multi-outcome markets
- Staking UI
- Referrals
- RBAC/permissions
- Fraud detection
- GDPR
- Advanced analytics
- Charting
- Export features

### Services/Hooks to Delete
- Oracle services
- Liquidity services
- Governance services
- AMM services
- Advanced analytics
- Export services
- Notification services (keep simple toast)
- And ~100 more unused files

---

## 🏗️ Phase 1: Frontend Cleanup (3-4 hours)

### Step 1: Delete Unused Pages
```bash
cd frontend/src/pages
rm GovernancePage.tsx OraclePage.tsx LiquidityPage.tsx \
   MultiMarketsPage.tsx MultiTradePage.tsx CreateMultiMarketPage.tsx \
   StakingPage.tsx TokenPage.tsx PortfolioPage.tsx \
   LeaderboardPage.tsx AnalyticsPage.tsx TransactionHistoryPage.tsx \
   WatchlistPage.tsx RecentlyViewedPage.tsx
```

### Step 2: Simplify App.tsx Routes
Keep only:
- `/` → Landing
- `/markets` → Markets list
- `/market/:id` → Trade page
- `/create` → Create market

### Step 3: Keep Essential Components
- Header (wallet connect, network)
- Footer (simple)
- MarketCard (display in list)
- WalletProvider (Stacks connect)
- NetworkContext (mainnet/testnet)

### Step 4: Delete Component Folders
- `components/oracle/` - Delete entire folder
- `components/governance/` - Delete
- `components/liquidity/` - Delete
- `components/amm/` - Delete
- `components/rbac/` - Delete
- `components/charts/` - Delete (keep simple if needed)
- `components/mobile/` - Delete (use responsive instead)

### Step 5: Simplify Types
Keep only:
- `types/market.ts` - Market, MarketStatus
- `types/network.ts` - Network config
- Delete: oracle, governance, liquidity, AMM, etc.

### Step 6: Create Simple Hooks
```typescript
// hooks/useMarkets.ts - Fetch from contract
// hooks/useCreateMarket.ts - Create market tx
// hooks/usePlaceBet.ts - Place prediction tx
// hooks/useClaimWinnings.ts - Claim after resolution
// hooks/useWallet.ts - Wallet connection
```

### Step 7: Clean Dependencies
Remove unused packages from package.json

---

## 🔧 Phase 2: Contract Integration (1 hour)

### Verify Contract State
```clarity
;; Check owner
(contract-call? .oxcast get-contract-owner)

;; Check if any markets exist
(contract-call? .oxcast get-market-count)
```

### Create Helper Functions
```typescript
// utils/contractCalls.ts
export async function createMarket(question: string, duration: number)
export async function placeBet(marketId: number, outcome: 1 | 2, amount: number)
export async function claimWinnings(marketId: number)
export async function getMarket(marketId: number)
export async function getMarketCount()
export async function getPosition(marketId: number, user: string)
```

### Test Flows
1. Create test market
2. Place YES bet
3. Place NO bet
4. Resolve market (as owner)
5. Claim winnings

---

## 🚀 Phase 3: Deploy & Test (30 min)

### Build Check
```bash
cd frontend
npm run build
# Should have ZERO errors
```

### Deploy
```bash
# Using Vercel
vercel --prod
```

### Test End-to-End
1. Connect wallet
2. Create market
3. View market list
4. Place bet
5. Wait for resolution
6. Claim winnings

---

## 📊 Success Metrics

✅ **Zero TypeScript errors**  
✅ **4 pages working**  
✅ **Can create market**  
✅ **Can place bet**  
✅ **Can claim winnings**  
✅ **Frontend builds successfully**  
✅ **Deployed to production**

---

## 🎯 Post-MVP Roadmap

### Phase 2 (Add Backend)
- Market indexing
- Real-time updates
- Search & filters
- Analytics

### Phase 3 (Add AI)
- Market suggestions
- Fraud detection
- Auto-resolution helper

### Phase 4 (Add Features)
- Multi-outcome markets
- Liquidity pools
- Governance
- Oracle integration

---

## ⚠️ Important Notes

1. **Backup created** on branch `mvp-refactor-backup`
2. **Working on** branch `mvp-refactor-clean`
3. **Contract deployed** - don't touch mainnet contract
4. **Delete carefully** - check imports before deleting
5. **Test frequently** - build after each major deletion

---

## 📝 File Deletion List

### Pages (14 files)
- [ ] GovernancePage.tsx + .bak
- [ ] OraclePage.tsx + .bak
- [ ] LiquidityPage.tsx + .bak
- [ ] MultiMarketsPage.tsx + .bak
- [ ] MultiTradePage.tsx + .bak
- [ ] CreateMultiMarketPage.tsx + .bak
- [ ] StakingPage.tsx + .bak
- [ ] TokenPage.tsx + .bak
- [ ] PortfolioPage.tsx + .bak
- [ ] LeaderboardPage.tsx + .bak
- [ ] AnalyticsPage.tsx + .bak
- [ ] TransactionHistoryPage.tsx + .bak
- [ ] WatchlistPage.tsx + .bak
- [ ] RecentlyViewedPage.tsx + .bak

### Component Folders (Entire directories)
- [ ] components/oracle/
- [ ] components/governance/
- [ ] components/liquidity/
- [ ] components/amm/
- [ ] components/rbac/
- [ ] components/charts/ (if complex)
- [ ] components/mobile/ (if separate)

### Services (~50 files)
- [ ] Oracle*.ts
- [ ] Governance*.ts
- [ ] Liquidity*.ts
- [ ] AMM*.ts
- [ ] RBAC*.ts
- [ ] Referral*.ts
- [ ] Fraud*.ts
- [ ] GDPR*.ts
- [ ] Export*.ts

### Hooks (~30 files)
- [ ] useOracle*.ts
- [ ] useGovernance*.ts
- [ ] useLiquidity*.ts
- [ ] useAMM*.ts
- [ ] useRBAC*.ts
- [ ] useReferral*.ts

### Types (~10 files)
- [ ] oracle.ts
- [ ] governance.ts
- [ ] liquidity.ts
- [ ] amm.ts
- [ ] rbac.ts
- [ ] referral.ts

---

**Ready to execute! Starting Phase 1...**
