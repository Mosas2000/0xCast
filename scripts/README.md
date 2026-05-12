# 0xCast Transaction Scripts

Comprehensive suite of TypeScript scripts for generating economic transactions on the 0xCast prediction market platform.

## 📋 Available Scripts

### 1. Bulk Market Creation (`bulk-create-markets.ts`)
Create multiple prediction markets in a single run.

**Features:**
- Create 1-50 markets at once
- Choose from 7 categories (crypto, tech, sports, politics, entertainment, science, business)
- Configurable market timelines
- Adjustable transaction delays
- Progress tracking and reporting

**Usage:**
```bash
npm run bulk-markets
```

**Interactive Prompts:**
- Number of markets to create
- Market category selection
- Days until markets close
- Days until resolution
- Delay between transactions

---

### 2. Automated Trading (`automated-trading.ts`)
Automate trading activity across existing markets.

**Features:**
- Trade on multiple markets simultaneously
- Multiple trading strategies (random, bullish, bearish, alternating)
- Configurable stake sizes (small/medium/large/custom)
- Customizable number of trades per market
- Transaction tracking and analytics

**Usage:**
```bash
npm run auto-trade
```

**Interactive Prompts:**
- Market IDs to trade on
- Number of trades per market
- Stake size range
- Trading strategy
- Delay between transactions

**Trading Strategies:**
- **Random**: 50/50 split between YES and NO
- **Bullish**: 70% YES, 30% NO
- **Bearish**: 30% YES, 70% NO
- **Alternating**: YES, NO, YES, NO pattern

---

### 3. Market Lifecycle (`market-lifecycle.ts`)
Simulate complete market lifecycle from creation to resolution.

**Features:**
- Full lifecycle: Create → Trade → Resolve → Claim
- Individual operations (trade only, resolve only, claim only)
- Multiple stake placements
- Automated payout claiming

**Usage:**
```bash
npm run lifecycle
```

**Modes:**
- **Full Lifecycle**: Complete end-to-end demonstration
- **Trade on Existing Market**: Place stakes on active markets
- **Resolve Existing Market**: Resolve markets with outcomes
- **Claim Winnings**: Claim payouts from resolved markets

---

### 4. Stress Test (`stress-test.ts`)
Generate high-volume transaction activity with performance metrics.

**Features:**
- Market creation stress testing
- Trading stress testing
- Mixed operations
- Performance metrics tracking (response times, throughput, success rate)
- Configurable transaction rate

**Usage:**
```bash
npm run stress-test
```

**Test Types:**
- **Market Creation**: Rapid market creation
- **Trading**: High-volume stake placements
- **Mixed Operations**: Combined market creation and trading

**Metrics Tracked:**
- Total transactions
- Success/failure rate
- Average/min/max response times
- Throughput (transactions per second)

---

### 5. Analytics Report (`analytics-report.ts`)
Query and analyze on-chain contract activity.

**Features:**
- Fetch all markets from contract
- Calculate volume statistics
- Identify top markets by volume
- Export to JSON and CSV formats
- Comprehensive analytics dashboard

**Usage:**
```bash
npm run analytics
```

**Generated Reports:**
- Total markets (active/resolved)
- Volume statistics (total, YES, NO)
- Average market size
- Top 10 markets by volume
- Detailed market data export

---

## 🛠️ Utility Functions

### Block Height Management (`utils/block-height.ts`, `utils/block-height-config.ts`)
Dynamic block height calculation and validation:
- Automatic current block height fetching from Hiro API
- Retry logic with exponential backoff
- Block height caching (60-second TTL)
- Manual fallback for offline scenarios
- Comprehensive validation rules
- Time-to-block and block-to-time conversions

**Key Features:**
- No hardcoded block heights
- Always uses current blockchain state
- Validates market duration and resolution buffer
- Prevents creation of markets with past timestamps

See [Block Height Guide](./docs/BLOCK_HEIGHT_GUIDE.md) for detailed documentation.

### Transaction Helpers (`utils/transaction-helpers.ts`)
Shared utilities for all scripts:
- Private key management
- Transaction broadcasting with retry logic
- Block height calculations
- STX formatting and conversion
- Progress indicators
- Transaction tracking

### Market Questions (`config/market-questions.ts`)
Predefined market questions categorized by topic:
- **Crypto**: 10 questions about cryptocurrency markets
- **Tech**: 10 questions about technology trends
- **Sports**: 10 questions about sporting events
- **Politics**: 10 questions about political events
- **Entertainment**: 10 questions about media and entertainment
- **Science**: 10 questions about scientific breakthroughs
- **Business**: 10 questions about business and finance

Total: **70 predefined questions** ready to use

---

## 🚀 Getting Started

### Prerequisites
- Node.js and npm installed
- Stacks wallet with STX for transactions
- Mnemonic configured in `settings/Mainnet.toml`

### Installation
All dependencies are already included in the project's `package.json`.

### Configuration
Update your mnemonic in `settings/Mainnet.toml`:
```toml
[accounts.deployer]
mnemonic = "your twelve or twenty-four word mnemonic here"
```

### Running Scripts
Each script can be run using npm commands:
```bash
npm run bulk-markets    # Bulk market creation
npm run auto-trade      # Automated trading
npm run lifecycle       # Market lifecycle simulation
npm run stress-test     # Stress testing
npm run analytics       # Analytics report
```

---

## 📊 Output Files

All scripts generate transaction logs and reports:

### Transaction Logs (JSON)
- `bulk-markets-[timestamp].json`
- `automated-trades-[timestamp].json`
- `lifecycle-[mode]-[timestamp].json`
- `stress-test-transactions-[timestamp].json`

### Analytics Reports
- `analytics-report-[timestamp].json` - Detailed market data
- `analytics-report-[timestamp].csv` - Spreadsheet format

### Stress Test Metrics
- `stress-test-metrics-[timestamp].json` - Performance data

---

## 🎯 Use Cases

### Testing
- Verify contract functionality
- Test market creation and trading flows
- Validate resolution and payout mechanisms

### Demonstration
- Showcase platform capabilities
- Generate sample data for frontend
- Create realistic market scenarios

### Analytics
- Track platform usage
- Analyze market trends
- Monitor volume and participation

### Development
- Populate development/testnet environments
- Stress test contract performance
- Generate test data for UI development

---

## 🔧 Advanced Configuration

### Custom Stake Amounts
Modify stake ranges in scripts:
```typescript
const minStake = 0.1;  // Minimum STX
const maxStake = 5.0;  // Maximum STX
```

### Transaction Delays
Adjust delays to avoid nonce conflicts:
```typescript
const delayBetweenTx = 3000;  // milliseconds
```

### Block Heights
All scripts now use dynamic block height calculation:
```typescript
import { fetchCurrentBlockHeight } from './utils/block-height.js';
import { calculateMarketBlocks } from './utils/block-height-config.js';

const currentBlock = await fetchCurrentBlockHeight('mainnet');
const { endBlock, resolutionBlock } = calculateMarketBlocks(
    currentBlock,
    30,  // 30 days duration
    3    // 3 days resolution buffer
);
```

**No hardcoded values** - block heights are always calculated dynamically based on current blockchain state.

---

## 📝 Example Workflows

### Workflow 1: Create and Trade
```bash
# Step 1: Create 10 markets
npm run bulk-markets
# Select: 10 markets, crypto category, 30 days end, 35 days resolution

# Step 2: Trade on created markets
npm run auto-trade
# Enter market IDs: 0,1,2,3,4,5,6,7,8,9
# Select: 5 trades per market, medium stakes, random strategy
```

### Workflow 2: Full Lifecycle Demo
```bash
# Run complete lifecycle demonstration
npm run lifecycle
# Select: Full Lifecycle mode
# Follow prompts to create, trade, resolve, and claim
```

### Workflow 3: Analytics and Reporting
```bash
# Generate comprehensive analytics
npm run analytics
# Export to both JSON and CSV formats
```

---

## 🔍 Monitoring

### View Transactions
All scripts output Stacks Explorer links:
```
https://explorer.hiro.so/txid/[transaction-id]?chain=mainnet
```

### View Contract Activity
Monitor overall contract activity:
```
https://explorer.hiro.so/address/SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T.market-core?chain=mainnet
```

---

## ⚠️ Important Notes

1. **Transaction Fees**: Each transaction requires STX for fees. Ensure sufficient balance.

2. **Nonce Management**: Scripts include delays to prevent nonce conflicts. Adjust if needed.

3. **Block Heights**: Ensure end and resolution blocks are in the future when creating markets.

4. **Rate Limiting**: API calls include delays to avoid rate limiting.

5. **Network**: All scripts default to Stacks Mainnet. Modify for testnet/devnet as needed.

---

## 🐛 Troubleshooting

### "Nonce conflict" errors
- Increase delay between transactions
- Wait for pending transactions to confirm

### "Block height in the past" errors
- This should no longer occur as all scripts use dynamic block heights
- If it does occur, check your system clock and network connection
- The script will automatically fetch the latest block height
- Manual fallback is available if API is unreachable

### "Insufficient balance" errors
- Check STX balance in wallet
- Reduce stake amounts or number of transactions

### API errors
- Check network connectivity
- Verify contract address and name
- Ensure API endpoints are accessible

---

## 📚 Additional Resources

- [Stacks Documentation](https://docs.stacks.co/)
- [Clarity Language Reference](https://docs.stacks.co/clarity/overview)
- [Stacks Explorer](https://explorer.stacks.co/)
- [0xCast Main README](../README.md)

---

## 🤝 Contributing

Feel free to extend these scripts with additional functionality:
- New trading strategies
- Additional market categories
- Enhanced analytics
- Custom reporting formats

---

## 📄 License

MIT License - see LICENSE file for details
