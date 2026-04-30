# Python Examples

## Installation

```bash
pip install requests
```

## Configuration

```python
import requests
import json

NETWORK_URL = "https://api.testnet.hiro.so"
CONTRACT_ADDRESS = "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7"
CONTRACT_NAME = "oxcast"
```

## Read Market Data

```python
def get_market(market_id):
    url = f"{NETWORK_URL}/v2/contracts/call-read/{CONTRACT_ADDRESS}/{CONTRACT_NAME}/get-market"
    
    payload = {
        "sender": CONTRACT_ADDRESS,
        "arguments": [f"0x{market_id:032x}"]
    }
    
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Error: {response.status_code}")

market = get_market(1)
print("Market:", market)
```

## Get User Stake

```python
def get_user_stake(market_id, user_address):
    url = f"{NETWORK_URL}/v2/contracts/call-read/{CONTRACT_ADDRESS}/{CONTRACT_NAME}/get-user-stake"
    
    payload = {
        "sender": CONTRACT_ADDRESS,
        "arguments": [
            f"0x{market_id:032x}",
            f"0x{encode_principal(user_address)}"
        ]
    }
    
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Error: {response.status_code}")

def encode_principal(address):
    # Simplified encoding
    return address.encode().hex()

stake = get_user_stake(1, "SP2J6ZY...")
print("User stake:", stake)
```

## Monitor Transaction

```python
import time

def wait_for_transaction(tx_id, max_attempts=60):
    url = f"{NETWORK_URL}/extended/v1/tx/{tx_id}"
    
    for _ in range(max_attempts):
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            
            if data['tx_status'] == 'success':
                print("Transaction confirmed")
                return data
            elif data['tx_status'] == 'abort_by_response':
                raise Exception("Transaction failed")
        
        time.sleep(5)
    
    raise Exception("Transaction timeout")

result = wait_for_transaction("0x123...")
print("Transaction result:", result)
```

## Complete Client Class

```python
import requests
import time
from typing import Optional, Dict, Any

class OxCastClient:
    def __init__(self, network_url: str = "https://api.testnet.hiro.so"):
        self.network_url = network_url
        self.contract_address = "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7"
        self.contract_name = "oxcast"
    
    def get_market(self, market_id: int) -> Optional[Dict[str, Any]]:
        url = f"{self.network_url}/v2/contracts/call-read/{self.contract_address}/{self.contract_name}/get-market"
        
        payload = {
            "sender": self.contract_address,
            "arguments": [f"0x{market_id:032x}"]
        }
        
        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching market: {e}")
            return None
    
    def get_user_stake(self, market_id: int, user_address: str) -> Optional[Dict[str, Any]]:
        url = f"{self.network_url}/v2/contracts/call-read/{self.contract_address}/{self.contract_name}/get-user-stake"
        
        payload = {
            "sender": self.contract_address,
            "arguments": [
                f"0x{market_id:032x}",
                self._encode_principal(user_address)
            ]
        }
        
        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching user stake: {e}")
            return None
    
    def wait_for_transaction(self, tx_id: str, max_attempts: int = 60) -> Optional[Dict[str, Any]]:
        url = f"{self.network_url}/extended/v1/tx/{tx_id}"
        
        for _ in range(max_attempts):
            try:
                response = requests.get(url)
                response.raise_for_status()
                data = response.json()
                
                if data['tx_status'] == 'success':
                    return data
                elif data['tx_status'] == 'abort_by_response':
                    raise Exception("Transaction failed")
                
                time.sleep(5)
            except requests.exceptions.RequestException as e:
                print(f"Error checking transaction: {e}")
                time.sleep(5)
        
        raise Exception("Transaction timeout")
    
    def _encode_principal(self, address: str) -> str:
        return address.encode().hex()

client = OxCastClient()

market = client.get_market(1)
print("Market:", market)

stake = client.get_user_stake(1, "SP2J6ZY...")
print("User stake:", stake)
```

## Error Handling

```python
def safe_get_market(market_id):
    try:
        market = get_market(market_id)
        return market
    except Exception as e:
        if "ERR-MARKET-NOT-FOUND" in str(e):
            print("Market not found")
        elif "ERR-NOT-AUTHORIZED" in str(e):
            print("Not authorized")
        else:
            print(f"Error: {e}")
        return None

market = safe_get_market(1)
```

## Batch Operations

```python
def get_multiple_markets(market_ids):
    markets = []
    
    for market_id in market_ids:
        try:
            market = get_market(market_id)
            if market:
                markets.append(market)
        except Exception as e:
            print(f"Error fetching market {market_id}: {e}")
    
    return markets

market_ids = [1, 2, 3, 4, 5]
markets = get_multiple_markets(market_ids)
print(f"Fetched {len(markets)} markets")
```

## Async Operations

```python
import asyncio
import aiohttp

async def get_market_async(session, market_id):
    url = f"{NETWORK_URL}/v2/contracts/call-read/{CONTRACT_ADDRESS}/{CONTRACT_NAME}/get-market"
    
    payload = {
        "sender": CONTRACT_ADDRESS,
        "arguments": [f"0x{market_id:032x}"]
    }
    
    async with session.post(url, json=payload) as response:
        return await response.json()

async def get_multiple_markets_async(market_ids):
    async with aiohttp.ClientSession() as session:
        tasks = [get_market_async(session, mid) for mid in market_ids]
        return await asyncio.gather(*tasks)

market_ids = [1, 2, 3, 4, 5]
markets = asyncio.run(get_multiple_markets_async(market_ids))
print(f"Fetched {len(markets)} markets")
```
