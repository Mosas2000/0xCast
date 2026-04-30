# Frequently Asked Questions

## General

### What is 0xCast?
0xCast is a decentralized prediction market platform built on Stacks blockchain.

### Which networks are supported?
Mainnet and Testnet are both supported.

### Do I need STX tokens?
Yes, STX tokens are required for transaction fees and staking.

## Technical

### How do I get started?
Follow the [Quick Start Guide](./quickstart.md).

### What programming languages are supported?
JavaScript/TypeScript and Python examples are provided. Any language with HTTP support can interact with the API.

### How long do transactions take?
Transactions typically confirm within 10-30 minutes on mainnet.

### Can I cancel a transaction?
No, transactions cannot be canceled once broadcast.

### How do I monitor transaction status?
Use the transaction monitoring endpoint or wait for webhook events.

## Staking

### What is the minimum stake?
Minimum stake is 1000 microSTX (0.001 STX).

### Can I stake on both outcomes?
Yes, you can stake on both YES and NO.

### When can I claim winnings?
After the market is resolved in your favor.

### What happens if I lose?
Your stake is distributed to winning participants.

## Errors

### Why did my transaction fail?
Check the error code in the transaction result. Common causes include insufficient balance, market ended, or invalid parameters.

### How do I handle rate limits?
Implement exponential backoff and respect rate limit headers.

### What if the API is down?
Check status page and implement retry logic with backoff.

## Security

### How do I keep my private key safe?
Never expose private keys in code. Use environment variables and secure storage.

### Are transactions reversible?
No, blockchain transactions are irreversible.

### How do I verify contract authenticity?
Check the contract address matches the official deployment.
