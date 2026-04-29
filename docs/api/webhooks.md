# Webhook Events Documentation

## Overview

Webhooks allow you to receive real-time notifications when events occur on the 0xCast platform.

## Setup

### Register Webhook

```typescript
POST /api/webhooks/register
Content-Type: application/json

{
  "url": "https://your-domain.com/webhook",
  "events": ["market.created", "market.resolved", "stake.placed"],
  "secret": "your-webhook-secret"
}
```

### Verify Webhook Signature

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return signature === digest;
}

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verifyWebhookSignature(payload, signature, webhookSecret)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook
  res.status(200).send('OK');
});
```

## Event Types

### market.created

Triggered when a new market is created.

**Payload:**
```json
{
  "event": "market.created",
  "timestamp": 1234567890,
  "data": {
    "marketId": 1,
    "question": "Will Bitcoin reach $100k?",
    "creator": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
    "endDate": 2000,
    "category": 1,
    "txId": "0x123..."
  }
}
```

### market.resolved

Triggered when a market is resolved.

**Payload:**
```json
{
  "event": "market.resolved",
  "timestamp": 1234567890,
  "data": {
    "marketId": 1,
    "outcome": "yes",
    "totalYesStake": 1000,
    "totalNoStake": 500,
    "txId": "0x456..."
  }
}
```

### stake.placed

Triggered when a stake is placed.

**Payload:**
```json
{
  "event": "stake.placed",
  "timestamp": 1234567890,
  "data": {
    "marketId": 1,
    "user": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
    "outcome": "yes",
    "amount": 1000000,
    "txId": "0x789..."
  }
}
```

### winnings.claimed

Triggered when winnings are claimed.

**Payload:**
```json
{
  "event": "winnings.claimed",
  "timestamp": 1234567890,
  "data": {
    "marketId": 1,
    "user": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
    "amount": 1500000,
    "txId": "0xabc..."
  }
}
```

### proposal.created

Triggered when a governance proposal is created.

**Payload:**
```json
{
  "event": "proposal.created",
  "timestamp": 1234567890,
  "data": {
    "proposalId": 1,
    "title": "Update fee structure",
    "proposer": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
    "txId": "0xdef..."
  }
}
```

### proposal.executed

Triggered when a proposal is executed.

**Payload:**
```json
{
  "event": "proposal.executed",
  "timestamp": 1234567890,
  "data": {
    "proposalId": 1,
    "executor": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
    "txId": "0xghi..."
  }
}
```

## Implementation Example

### Node.js/Express

```typescript
import express from 'express';
import crypto from 'crypto';

const app = express();
app.use(express.json());

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'] as string;
  const payload = JSON.stringify(req.body);
  
  if (!verifySignature(payload, signature)) {
    return res.status(401).send('Invalid signature');
  }
  
  const { event, data } = req.body;
  
  switch (event) {
    case 'market.created':
      handleMarketCreated(data);
      break;
    case 'market.resolved':
      handleMarketResolved(data);
      break;
    case 'stake.placed':
      handleStakePlaced(data);
      break;
    default:
      console.log('Unknown event:', event);
  }
  
  res.status(200).send('OK');
});

function verifySignature(payload: string, signature: string): boolean {
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = hmac.update(payload).digest('hex');
  return signature === digest;
}

function handleMarketCreated(data: any) {
  console.log('New market created:', data.marketId);
}

function handleMarketResolved(data: any) {
  console.log('Market resolved:', data.marketId, data.outcome);
}

function handleStakePlaced(data: any) {
  console.log('Stake placed:', data.user, data.amount);
}

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

### Python/Flask

```python
from flask import Flask, request, jsonify
import hmac
import hashlib
import json

app = Flask(__name__)
WEBHOOK_SECRET = 'your-webhook-secret'

@app.route('/webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Webhook-Signature')
    payload = request.get_data()
    
    if not verify_signature(payload, signature):
        return jsonify({'error': 'Invalid signature'}), 401
    
    data = request.json
    event = data.get('event')
    
    if event == 'market.created':
        handle_market_created(data['data'])
    elif event == 'market.resolved':
        handle_market_resolved(data['data'])
    elif event == 'stake.placed':
        handle_stake_placed(data['data'])
    
    return jsonify({'status': 'ok'}), 200

def verify_signature(payload, signature):
    mac = hmac.new(
        WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    )
    return mac.hexdigest() == signature

def handle_market_created(data):
    print(f"New market created: {data['marketId']}")

def handle_market_resolved(data):
    print(f"Market resolved: {data['marketId']} - {data['outcome']}")

def handle_stake_placed(data):
    print(f"Stake placed: {data['user']} - {data['amount']}")

if __name__ == '__main__':
    app.run(port=3000)
```

## Best Practices

1. Always verify webhook signatures
2. Respond quickly (within 5 seconds)
3. Process webhooks asynchronously
4. Implement retry logic for failed processing
5. Log all webhook events
6. Handle duplicate events (idempotency)
7. Use HTTPS for webhook URLs
8. Keep webhook secrets secure

## Retry Policy

If your webhook endpoint fails to respond or returns an error:
- First retry: after 1 minute
- Second retry: after 5 minutes
- Third retry: after 15 minutes
- Fourth retry: after 1 hour
- Fifth retry: after 6 hours

After 5 failed attempts, the webhook will be disabled.

## Testing

Use the webhook testing endpoint to simulate events:

```bash
curl -X POST https://api.0xcast.com/webhooks/test \
  -H "Content-Type: application/json" \
  -d '{
    "webhookId": "your-webhook-id",
    "event": "market.created"
  }'
```
