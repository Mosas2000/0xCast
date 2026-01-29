# Troubleshooting Guide: ERR-MARKET-NOT-FOUND (u101)

## 🔴 Error Explanation

**Error Code**: `u101`  
**Error Name**: `ERR-MARKET-NOT-FOUND`  
**Meaning**: You're trying to place a stake on a market that doesn't exist in the contract.

---

## 🔍 Root Cause Analysis

Based on the error screenshot, the issue occurs when calling `place-yes-stake` or `place-no-stake`. This happens when:

1. **The market hasn't been created yet** - The market creation transaction hasn't been confirmed
2. **Wrong market ID** - You're using an incorrect market ID
3. **Market counter mismatch** - The contract's market counter is different than expected

---

## ✅ Solution Steps

### Step 1: Verify Market Creation First

Before placing any stakes, **always verify the market was created successfully**:

```bash
# Check the transaction on Stacks Explorer
# Look for the market creation transaction and verify it succeeded
```

**Important**: Market creation transactions can take 10-30 minutes to confirm on mainnet!

### Step 2: Find the Correct Market ID

Markets are created with sequential IDs starting from 0:
- First market created = ID 0
- Second market created = ID 1
- Third market created = ID 2
- etc.

**To find your market ID:**
1. Go to Stacks Explorer: https://explorer.hiro.so/
2. Search for the market creation transaction
3. Look at the transaction result - it will show `(ok u0)` where `u0` is the market ID
4. Use this ID when placing stakes

### Step 3: Wait for Confirmation

**CRITICAL**: You MUST wait for the market creation transaction to confirm before placing stakes!

```bash
# Workflow:
1. Create market → Wait for confirmation (10-30 min)
2. Check Explorer to get market ID
3. THEN place stakes using that market ID
```

---

## 🛠️ How to Use the Scripts Correctly

### Option 1: Manual Workflow (Recommended for First Time)

```bash
# Step 1: Create ONE market first
npm run bulk-markets
# Select: 1 market, wait for confirmation

# Step 2: Check Stacks Explorer for the transaction
# Get the market ID from the transaction result

# Step 3: Trade on that market
npm run auto-trade
# Enter the market ID you got from Explorer
```

### Option 2: Use Market Lifecycle Script

This script handles the timing for you:

```bash
npm run lifecycle
# Select: "Full Lifecycle" mode
# It will prompt you to enter the market ID after creation
```

---

## 📋 Quick Checklist

Before placing stakes, verify:
- ✅ Market creation transaction is **confirmed** (not pending)
- ✅ You have the **correct market ID** from the transaction result
- ✅ The market **end date** hasn't passed yet
- ✅ You're using the **same wallet** that has STX

---

## 🔧 Debug Commands

### Check if a market exists:
Use the Stacks API to verify:
```bash
curl -X POST https://api.mainnet.hiro.so/v2/contracts/call-read/SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T/market-core/market-exists \
  -H 'Content-Type: application/json' \
  -d '{
    "sender": "SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T",
    "arguments": ["0x0100000000000000000000000000000000"]
  }'
```

Replace the last `00` with your market ID in hex.

---

## 💡 Common Mistakes

### ❌ Mistake 1: Not Waiting for Confirmation
```bash
# WRONG - This will fail!
npm run bulk-markets  # Creates market
npm run auto-trade    # Tries to trade immediately - FAILS!
```

### ✅ Correct Approach:
```bash
npm run bulk-markets  # Creates market
# WAIT 10-30 minutes for confirmation
# Check Explorer for market ID
npm run auto-trade    # Now trade with confirmed market ID
```

### ❌ Mistake 2: Using Wrong Market ID
```bash
# If only 1 market exists (ID 0), using ID 1 will fail
npm run auto-trade
# Enter market IDs: 1  ← WRONG! Should be 0
```

### ✅ Correct Approach:
```bash
# Check how many markets exist first
# If market counter = 1, only market ID 0 exists
npm run auto-trade
# Enter market IDs: 0  ← CORRECT!
```

---

## 🎯 Recommended Workflow for Testing

### For First-Time Users:

1. **Create a single market**:
   ```bash
   npm run bulk-markets
   # Select: 1 market, 7 days end, 10 days resolution
   ```

2. **Wait and verify**:
   - Wait 10-30 minutes
   - Check Stacks Explorer
   - Confirm transaction succeeded
   - Note the market ID (usually 0 if it's your first)

3. **Place test stakes**:
   ```bash
   npm run auto-trade
   # Enter market ID: 0
   # Select: 3 trades, small stakes, random strategy
   ```

4. **Verify stakes**:
   - Check Explorer again
   - Confirm stake transactions succeeded

---

## 📊 Understanding Market IDs

```
Market Counter = 0  →  No markets exist yet
Market Counter = 1  →  Market ID 0 exists
Market Counter = 2  →  Market IDs 0, 1 exist
Market Counter = 5  →  Market IDs 0, 1, 2, 3, 4 exist
```

**The market counter tells you the NEXT market ID that will be created!**

---

## 🚨 If You're Still Getting Errors

1. **Check the contract on Explorer**:
   https://explorer.hiro.so/address/SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T.market-core?chain=mainnet

2. **Look at recent transactions** to see:
   - How many markets have been created
   - What market IDs exist
   - If any transactions failed

3. **Start fresh** with a single market:
   - Create ONE market
   - Wait for full confirmation
   - Trade on that ONE market only

---

## 📞 Need Help?

If you're still experiencing issues:
1. Share the transaction ID from Explorer
2. Share which market ID you're trying to use
3. Share the current market counter value

This will help diagnose the exact issue!
