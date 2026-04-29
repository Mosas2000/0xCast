# cURL Examples

## Read Market Data

```bash
curl -X POST https://api.testnet.hiro.so/v2/contracts/call-read/SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7/oxcast/get-market \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
    "arguments": ["0x0100000000000000000000000000000001"]
  }'
```

## Get User Stake

```bash
curl -X POST https://api.testnet.hiro.so/v2/contracts/call-read/SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7/oxcast/get-user-stake \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
    "arguments": [
      "0x0100000000000000000000000000000001",
      "0x0516..."
    ]
  }'
```

## Check Transaction Status

```bash
curl https://api.testnet.hiro.so/extended/v1/tx/0x123...
```
