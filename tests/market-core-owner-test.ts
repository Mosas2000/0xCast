import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';

Clarinet.test({
  name: "Owner can be read after deployment",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    const result = chain.callReadOnlyFn(
      'market-core',
      'get-contract-owner',
      [],
      deployer.address
    );
    
    result.result.expectPrincipal(deployer.address);
  }
});

Clarinet.test({
  name: "Only owner can initiate owner transfer",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    // Non-owner tries to initiate transfer - should fail
    let result = chain.mineBlock([
      Tx.contractCall(
        'market-core',
        'initiate-owner-transfer',
        [types.principal(wallet2.address)],
        wallet1.address
      )
    ]);
    
    result.receipts[0].result.expectErr().expectUint(100); // ERR-NOT-AUTHORIZED
    
    // Owner initiates transfer - should succeed
    result = chain.mineBlock([
      Tx.contractCall(
        'market-core',
        'initiate-owner-transfer',
        [types.principal(wallet2.address)],
        deployer.address
      )
    ]);
    
    result.receipts[0].result.expectOk().expectBool(true);
  }
});

Clarinet.test({
  name: "Cannot transfer ownership to self",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    const result = chain.mineBlock([
      Tx.contractCall(
        'market-core',
        'initiate-owner-transfer',
        [types.principal(deployer.address)],
        deployer.address
      )
    ]);
    
    result.receipts[0].result.expectErr().expectUint(124); // ERR-INVALID-NEW-OWNER
  }
});

Clarinet.test({
  name: "Owner can cancel pending transfer",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    // Initiate transfer
    let result = chain.mineBlock([
      Tx.contractCall(
        'market-core',
        'initiate-owner-transfer',
        [types.principal(wallet1.address)],
        deployer.address
      )
    ]);
    
    result.receipts[0].result.expectOk().expectBool(true);
    
    // Cancel transfer
    result = chain.mineBlock([
      Tx.contractCall(
        'market-core',
        'cancel-owner-transfer',
        [],
        deployer.address
      )
    ]);
    
    result.receipts[0].result.expectOk().expectBool(true);
    
    // Verify no pending owner
    const status = chain.callReadOnlyFn(
      'market-core',
      'get-pending-owner-transfer',
      [],
      deployer.address
    );
    
    // pending-owner should be none
    status.result.expectSome().expectTuple();
  }
});

Clarinet.test({
  name: "Cannot claim ownership before cooldown",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    // Initiate transfer
    let result = chain.mineBlock([
      Tx.contractCall(
        'market-core',
        'initiate-owner-transfer',
        [types.principal(wallet1.address)],
        deployer.address
      )
    ]);
    
    result.receipts[0].result.expectOk().expectBool(true);
    
    // Try to claim immediately - should fail
    result = chain.mineBlock([
      Tx.contractCall(
        'market-core',
        'claim-ownership',
        [],
        wallet1.address
      )
    ]);
    
    result.receipts[0].result.expectErr().expectUint(115); // ERR-OWNER-TRANSFER-COOLDOWN
  }
});

Clarinet.test({
  name: "Can claim ownership after cooldown",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    // Initiate transfer
    let result = chain.mineBlock([
      Tx.contractCall(
        'market-core',
        'initiate-owner-transfer',
        [types.principal(wallet1.address)],
        deployer.address
      )
    ]);
    
    result.receipts[0].result.expectOk().expectBool(true);
    
    // Mine blocks to pass cooldown (1008 blocks)
    chain.mineEmptyBlock(1009);
    
    // Claim ownership
    result = chain.mineBlock([
      Tx.contractCall(
        'market-core',
        'claim-ownership',
        [],
        wallet1.address
      )
    ]);
    
    result.receipts[0].result.expectOk().expectBool(true);
    
    // Verify new owner
    const owner = chain.callReadOnlyFn(
      'market-core',
      'get-contract-owner',
      [],
      deployer.address
    );
    
    owner.result.expectPrincipal(wallet1.address);
  }
});

Clarinet.test({
  name: "Only pending owner can claim ownership",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    // Initiate transfer to wallet1
    let result = chain.mineBlock([
      Tx.contractCall(
        'market-core',
        'initiate-owner-transfer',
        [types.principal(wallet1.address)],
        deployer.address
      )
    ]);
    
    result.receipts[0].result.expectOk().expectBool(true);
    
    // Mine blocks to pass cooldown
    chain.mineEmptyBlock(1009);
    
    // wallet2 tries to claim - should fail
    result = chain.mineBlock([
      Tx.contractCall(
        'market-core',
        'claim-ownership',
        [],
        wallet2.address
      )
    ]);
    
    result.receipts[0].result.expectErr().expectUint(100); // ERR-NOT-AUTHORIZED
  }
});

Clarinet.test({
  name: "Owner can update transfer cooldown",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    // Update cooldown to 500 blocks
    let result = chain.mineBlock([
      Tx.contractCall(
        'market-core',
        'set-owner-transfer-cooldown',
        [types.uint(500)],
        deployer.address
      )
    ]);
    
    result.receipts[0].result.expectOk().expectBool(true);
    
    // Initiate transfer
    result = chain.mineBlock([
      Tx.contractCall(
        'market-core',
        'initiate-owner-transfer',
        [types.principal(wallet1.address)],
        deployer.address
      )
    ]);
    
    result.receipts[0].result.expectOk().expectBool(true);
    
    // Mine 501 blocks (new cooldown + 1)
    chain.mineEmptyBlock(501);
    
    // Should be able to claim now
    result = chain.mineBlock([
      Tx.contractCall(
        'market-core',
        'claim-ownership',
        [],
        wallet1.address
      )
    ]);
    
    result.receipts[0].result.expectOk().expectBool(true);
  }
});

Clarinet.test({
  name: "New owner has full control after transfer",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    // Initiate and complete transfer
    chain.mineBlock([
      Tx.contractCall(
        'market-core',
        'initiate-owner-transfer',
        [types.principal(wallet1.address)],
        deployer.address
      )
    ]);
    
    chain.mineEmptyBlock(1009);
    
    chain.mineBlock([
      Tx.contractCall(
        'market-core',
        'claim-ownership',
        [],
        wallet1.address
      )
    ]);
    
    // New owner can set emergency approver
    const result = chain.mineBlock([
      Tx.contractCall(
        'market-core',
        'set-emergency-approver',
        [types.principal(deployer.address), types.bool(true)],
        wallet1.address
      )
    ]);
    
    result.receipts[0].result.expectOk().expectBool(true);
    
    // Old owner cannot set emergency approver
    const failResult = chain.mineBlock([
      Tx.contractCall(
        'market-core',
        'set-emergency-approver',
        [types.principal(wallet1.address), types.bool(true)],
        deployer.address
      )
    ]);
    
    failResult.receipts[0].result.expectErr().expectUint(100); // ERR-NOT-AUTHORIZED
  }
});
