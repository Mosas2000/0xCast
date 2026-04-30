# Node.js Examples

## Server Setup

```javascript
const express = require('express');
const { fetchCallReadOnlyFunction, uintCV } = require('@stacks/transactions');
const { StacksTestnet } = require('@stacks/network');

const app = express();
const network = new StacksTestnet();

app.get('/market/:id', async (req, res) => {
  try {
    const marketId = parseInt(req.params.id);
    
    const result = await fetchCallReadOnlyFunction({
      network,
      contractAddress: 'SP2J6ZY...',
      contractName: 'oxcast',
      functionName: 'get-market',
      functionArgs: [uintCV(marketId)],
      senderAddress: 'SP2J6ZY...',
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Webhook Handler

```javascript
const crypto = require('crypto');

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  
  const hmac = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET);
  const digest = hmac.update(payload).digest('hex');
  
  if (signature !== digest) {
    return res.status(401).send('Invalid signature');
  }
  
  console.log('Webhook event:', req.body.event);
  res.status(200).send('OK');
});
```
