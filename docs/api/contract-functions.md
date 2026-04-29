# Contract Functions Documentation

## Market Functions

### get-market

Retrieves market data by ID.

**Type:** Read-only

**Parameters:**
- `market-id` (uint): Market identifier

**Returns:** `(optional (tuple ...))`

**Example:**
```clarity
(contract-call? .oxcast get-market u1)
```

**Response:**
```clarity
(some {
  question: "Will Bitcoin reach $100k?",
  creator: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7,
  status: u0,
  outcome: u0,
  total-yes-stake: u1000,
  total-no-stake: u500,
  created-at: u1000,
  end-date: u2000
})
```

### create-market

Creates a new prediction market.

**Type:** Public

**Parameters:**
- `question` (string-utf8 500): Market question
- `end-date` (uint): Block height when market ends
- `category` (uint): Market category

**Returns:** `(response uint uint)`

**Example:**
```clarity
(contract-call? .oxcast create-market 
  u"Will Bitcoin reach $100k?" 
  u2000 
  u1)
```

### resolve-market

Resolves a market with outcome.

**Type:** Public (Oracle only)

**Parameters:**
- `market-id` (uint): Market identifier
- `outcome` (uint): Market outcome (1=yes, 2=no)

**Returns:** `(response bool uint)`

**Example:**
```clarity
(contract-call? .oxcast resolve-market u1 u1)
```

## Staking Functions

### stake-yes

Stakes tokens on YES outcome.

**Type:** Public

**Parameters:**
- `market-id` (uint): Market identifier
- `amount` (uint): Amount to stake in microSTX

**Returns:** `(response bool uint)`

**Example:**
```clarity
(contract-call? .oxcast stake-yes u1 u1000000)
```

### stake-no

Stakes tokens on NO outcome.

**Type:** Public

**Parameters:**
- `market-id` (uint): Market identifier
- `amount` (uint): Amount to stake in microSTX

**Returns:** `(response bool uint)`

**Example:**
```clarity
(contract-call? .oxcast stake-no u1 u1000000)
```

### claim-winnings

Claims winnings from resolved market.

**Type:** Public

**Parameters:**
- `market-id` (uint): Market identifier

**Returns:** `(response uint uint)`

**Example:**
```clarity
(contract-call? .oxcast claim-winnings u1)
```

### get-user-stake

Gets user's stake in a market.

**Type:** Read-only

**Parameters:**
- `market-id` (uint): Market identifier
- `user` (principal): User address

**Returns:** `(tuple (yes-stake uint) (no-stake uint))`

**Example:**
```clarity
(contract-call? .oxcast get-user-stake 
  u1 
  'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7)
```

## Governance Functions

### propose

Creates a governance proposal.

**Type:** Public

**Parameters:**
- `title` (string-utf8 200): Proposal title
- `description` (string-utf8 1000): Proposal description
- `action` (uint): Proposed action

**Returns:** `(response uint uint)`

**Example:**
```clarity
(contract-call? .governance propose 
  u"Update fee structure" 
  u"Proposal to reduce platform fees" 
  u1)
```

### vote

Votes on a proposal.

**Type:** Public

**Parameters:**
- `proposal-id` (uint): Proposal identifier
- `support` (bool): Vote (true=yes, false=no)

**Returns:** `(response bool uint)`

**Example:**
```clarity
(contract-call? .governance vote u1 true)
```

### execute-proposal

Executes an approved proposal.

**Type:** Public

**Parameters:**
- `proposal-id` (uint): Proposal identifier

**Returns:** `(response bool uint)`

**Example:**
```clarity
(contract-call? .governance execute-proposal u1)
```

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| 100 | ERR-NOT-AUTHORIZED | Caller not authorized |
| 101 | ERR-MARKET-NOT-FOUND | Market does not exist |
| 102 | ERR-MARKET-ENDED | Market has ended |
| 103 | ERR-MARKET-RESOLVED | Market already resolved |
| 104 | ERR-INVALID-AMOUNT | Invalid stake amount |
| 105 | ERR-INSUFFICIENT-BALANCE | Insufficient balance |
| 106 | ERR-NO-WINNINGS | No winnings to claim |
| 107 | ERR-ALREADY-CLAIMED | Winnings already claimed |
