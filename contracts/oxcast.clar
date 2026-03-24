;; 0xCast MVP Contract
;; Consolidated prediction market with governance token
;; Deployed on Stacks mainnet

;; ============================================
;; CONSTANTS
;; ============================================

(define-constant contract-owner tx-sender)

;; Market Status
(define-constant STATUS-ACTIVE u0)
(define-constant STATUS-RESOLVED u1)
(define-constant STATUS-CANCELLED u2)

;; Outcomes
(define-constant OUTCOME-NONE u0)
(define-constant OUTCOME-YES u1)
(define-constant OUTCOME-NO u2)

;; Errors
(define-constant ERR-OWNER-ONLY (err u100))
(define-constant ERR-NOT-FOUND (err u101))
(define-constant ERR-ALREADY-RESOLVED (err u102))
(define-constant ERR-MARKET-ENDED (err u103))
(define-constant ERR-MARKET-ACTIVE (err u104))
(define-constant ERR-INVALID-OUTCOME (err u105))
(define-constant ERR-INVALID-AMOUNT (err u106))
(define-constant ERR-NO-POSITION (err u107))
(define-constant ERR-ALREADY-CLAIMED (err u108))
(define-constant ERR-NOT-TOKEN-OWNER (err u109))
(define-constant ERR-INSUFFICIENT-BALANCE (err u110))
(define-constant ERR-STAKING-LOCKED (err u111))
(define-constant ERR-MIN-STAKE (err u112))

;; Configuration
(define-constant PLATFORM-FEE u200) ;; 2% in basis points
(define-constant MIN-STAKE u1000000) ;; 1 OXC minimum stake
(define-constant LOCK-PERIOD u1008) ;; ~7 days in blocks

;; ============================================
;; TOKEN (SIP-010 Compliant)
;; ============================================

(define-fungible-token oxc-token u100000000000000) ;; 100M with 6 decimals

(define-data-var token-uri (optional (string-utf8 256)) (some u"https://0xcast.vercel.app/token"))

;; SIP-010 Interface
(define-read-only (get-name)
  (ok "0xCast Token"))

(define-read-only (get-symbol)
  (ok "OXC"))

(define-read-only (get-decimals)
  (ok u6))

(define-read-only (get-balance (account principal))
  (ok (ft-get-balance oxc-token account)))

(define-read-only (get-total-supply)
  (ok (ft-get-supply oxc-token)))

(define-read-only (get-token-uri)
  (ok (var-get token-uri)))

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) ERR-NOT-TOKEN-OWNER)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (try! (ft-transfer? oxc-token amount sender recipient))
    (match memo m (print m) 0x)
    (ok true)))

(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) ERR-OWNER-ONLY)
    (ft-mint? oxc-token amount recipient)))

(define-public (burn (amount uint))
  (begin
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (ft-burn? oxc-token amount tx-sender)))

;; ============================================
;; STAKING
;; ============================================

(define-map stakes
  principal
  { amount: uint, locked-until: uint })

(define-data-var total-staked uint u0)

(define-read-only (get-stake (staker principal))
  (default-to { amount: u0, locked-until: u0 } (map-get? stakes staker)))

(define-read-only (get-total-staked)
  (ok (var-get total-staked)))

(define-public (stake (amount uint))
  (let (
    (current-stake (get-stake tx-sender))
    (new-amount (+ (get amount current-stake) amount))
  )
    (asserts! (>= amount MIN-STAKE) ERR-MIN-STAKE)
    (try! (ft-transfer? oxc-token amount tx-sender (as-contract tx-sender)))
    (map-set stakes tx-sender {
      amount: new-amount,
      locked-until: (+ stacks-block-height LOCK-PERIOD)
    })
    (var-set total-staked (+ (var-get total-staked) amount))
    (print { event: "stake", staker: tx-sender, amount: amount })
    (ok true)))

(define-public (unstake (amount uint))
  (let (
    (current-stake (get-stake tx-sender))
    (staked-amount (get amount current-stake))
    (locked-until (get locked-until current-stake))
  )
    (asserts! (>= staked-amount amount) ERR-INSUFFICIENT-BALANCE)
    (asserts! (>= stacks-block-height locked-until) ERR-STAKING-LOCKED)
    (try! (as-contract (ft-transfer? oxc-token amount tx-sender tx-sender)))
    (map-set stakes tx-sender {
      amount: (- staked-amount amount),
      locked-until: locked-until
    })
    (var-set total-staked (- (var-get total-staked) amount))
    (print { event: "unstake", staker: tx-sender, amount: amount })
    (ok true)))

;; ============================================
;; PREDICTION MARKETS
;; ============================================

(define-data-var market-counter uint u0)
(define-data-var fee-pool uint u0)

(define-map markets
  uint
  {
    question: (string-ascii 256),
    creator: principal,
    end-block: uint,
    yes-pool: uint,
    no-pool: uint,
    status: uint,
    outcome: uint,
    created-at: uint,
    resolved-at: uint
  })

(define-map positions
  { market-id: uint, user: principal }
  { yes-amount: uint, no-amount: uint, claimed: bool })

;; Read functions
(define-read-only (get-market (market-id uint))
  (map-get? markets market-id))

(define-read-only (get-market-count)
  (var-get market-counter))

(define-read-only (get-position (market-id uint) (user principal))
  (default-to 
    { yes-amount: u0, no-amount: u0, claimed: false }
    (map-get? positions { market-id: market-id, user: user })))

(define-read-only (get-fee-pool)
  (var-get fee-pool))

;; Create market
(define-public (create-market (question (string-ascii 256)) (duration-blocks uint))
  (let (
    (market-id (var-get market-counter))
    (end-block (+ stacks-block-height duration-blocks))
  )
    (map-set markets market-id {
      question: question,
      creator: tx-sender,
      end-block: end-block,
      yes-pool: u0,
      no-pool: u0,
      status: STATUS-ACTIVE,
      outcome: OUTCOME-NONE,
      created-at: stacks-block-height,
      resolved-at: u0
    })
    (var-set market-counter (+ market-id u1))
    (print { event: "market-created", id: market-id, question: question, creator: tx-sender })
    (ok market-id)))

;; Place prediction
(define-public (predict (market-id uint) (outcome uint) (amount uint))
  (let (
    (market (unwrap! (get-market market-id) ERR-NOT-FOUND))
    (current-position (get-position market-id tx-sender))
    (fee (/ (* amount PLATFORM-FEE) u10000))
    (net-amount (- amount fee))
  )
    (asserts! (is-eq (get status market) STATUS-ACTIVE) ERR-ALREADY-RESOLVED)
    (asserts! (< stacks-block-height (get end-block market)) ERR-MARKET-ENDED)
    (asserts! (or (is-eq outcome OUTCOME-YES) (is-eq outcome OUTCOME-NO)) ERR-INVALID-OUTCOME)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    
    ;; Transfer STX
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    
    ;; Update fee pool
    (var-set fee-pool (+ (var-get fee-pool) fee))
    
    ;; Update market pools
    (if (is-eq outcome OUTCOME-YES)
      (begin
        (map-set markets market-id (merge market { yes-pool: (+ (get yes-pool market) net-amount) }))
        (map-set positions { market-id: market-id, user: tx-sender }
          (merge current-position { yes-amount: (+ (get yes-amount current-position) net-amount) })))
      (begin
        (map-set markets market-id (merge market { no-pool: (+ (get no-pool market) net-amount) }))
        (map-set positions { market-id: market-id, user: tx-sender }
          (merge current-position { no-amount: (+ (get no-amount current-position) net-amount) }))))
    
    (print { event: "prediction", market-id: market-id, user: tx-sender, outcome: outcome, amount: net-amount })
    (ok true)))

;; Resolve market (owner only for MVP)
(define-public (resolve-market (market-id uint) (outcome uint))
  (let (
    (market (unwrap! (get-market market-id) ERR-NOT-FOUND))
  )
    (asserts! (is-eq tx-sender contract-owner) ERR-OWNER-ONLY)
    (asserts! (is-eq (get status market) STATUS-ACTIVE) ERR-ALREADY-RESOLVED)
    (asserts! (>= stacks-block-height (get end-block market)) ERR-MARKET-ACTIVE)
    (asserts! (or (is-eq outcome OUTCOME-YES) (is-eq outcome OUTCOME-NO)) ERR-INVALID-OUTCOME)
    
    (map-set markets market-id (merge market {
      status: STATUS-RESOLVED,
      outcome: outcome,
      resolved-at: stacks-block-height
    }))
    
    (print { event: "market-resolved", market-id: market-id, outcome: outcome })
    (ok true)))

;; Claim winnings
(define-public (claim-winnings (market-id uint))
  (let (
    (market (unwrap! (get-market market-id) ERR-NOT-FOUND))
    (position (get-position market-id tx-sender))
    (outcome (get outcome market))
    (yes-pool (get yes-pool market))
    (no-pool (get no-pool market))
    (total-pool (+ yes-pool no-pool))
    (user-stake (if (is-eq outcome OUTCOME-YES) (get yes-amount position) (get no-amount position)))
    (winning-pool (if (is-eq outcome OUTCOME-YES) yes-pool no-pool))
    (payout (if (> winning-pool u0) (/ (* user-stake total-pool) winning-pool) u0))
  )
    (asserts! (is-eq (get status market) STATUS-RESOLVED) ERR-MARKET-ACTIVE)
    (asserts! (not (get claimed position)) ERR-ALREADY-CLAIMED)
    (asserts! (> user-stake u0) ERR-NO-POSITION)
    
    ;; Mark as claimed
    (map-set positions { market-id: market-id, user: tx-sender }
      (merge position { claimed: true }))
    
    ;; Transfer winnings
    (try! (as-contract (stx-transfer? payout tx-sender tx-sender)))
    
    (print { event: "claim", market-id: market-id, user: tx-sender, payout: payout })
    (ok payout)))

;; Cancel market (owner only)
(define-public (cancel-market (market-id uint))
  (let (
    (market (unwrap! (get-market market-id) ERR-NOT-FOUND))
  )
    (asserts! (is-eq tx-sender contract-owner) ERR-OWNER-ONLY)
    (asserts! (is-eq (get status market) STATUS-ACTIVE) ERR-ALREADY-RESOLVED)
    
    (map-set markets market-id (merge market { status: STATUS-CANCELLED }))
    (print { event: "market-cancelled", market-id: market-id })
    (ok true)))

;; Claim refund (for cancelled markets)
(define-public (claim-refund (market-id uint))
  (let (
    (market (unwrap! (get-market market-id) ERR-NOT-FOUND))
    (position (get-position market-id tx-sender))
    (refund (+ (get yes-amount position) (get no-amount position)))
  )
    (asserts! (is-eq (get status market) STATUS-CANCELLED) ERR-MARKET-ACTIVE)
    (asserts! (not (get claimed position)) ERR-ALREADY-CLAIMED)
    (asserts! (> refund u0) ERR-NO-POSITION)
    
    (map-set positions { market-id: market-id, user: tx-sender }
      (merge position { claimed: true }))
    
    (try! (as-contract (stx-transfer? refund tx-sender tx-sender)))
    
    (print { event: "refund", market-id: market-id, user: tx-sender, amount: refund })
    (ok refund)))

;; Withdraw fees (owner only)
(define-public (withdraw-fees)
  (let (
    (fees (var-get fee-pool))
  )
    (asserts! (is-eq tx-sender contract-owner) ERR-OWNER-ONLY)
    (asserts! (> fees u0) ERR-INVALID-AMOUNT)
    
    (var-set fee-pool u0)
    (try! (as-contract (stx-transfer? fees tx-sender contract-owner)))
    
    (print { event: "fees-withdrawn", amount: fees })
    (ok fees)))

;; ============================================
;; INITIALIZATION
;; ============================================

(begin
  ;; Mint initial OXC supply to owner
  (try! (ft-mint? oxc-token u100000000000000 contract-owner))
  (print { event: "contract-deployed", owner: contract-owner, token-supply: u100000000000000 }))
