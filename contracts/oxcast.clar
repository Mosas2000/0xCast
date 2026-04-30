;; 0xCast MVP Contract
;; Consolidated prediction market with governance token
;; Deployed on Stacks mainnet

;; ============================================
;; CONSTANTS
;; ============================================

;; Contract owner (configurable, initialized to deploying principal)
(define-data-var contract-owner principal tx-sender)

;; Owner transfer configuration
(define-data-var owner-transfer-cooldown uint u1008)
(define-data-var pending-owner (optional principal) none)
(define-data-var owner-transfer-initiated-at uint u0)

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
(define-constant ERR-INVALID-NEW-OWNER (err u114))
(define-constant ERR-OWNER-TRANSFER-COOLDOWN (err u115))
(define-constant ERR-NOT-TOKEN-OWNER (err u109))
(define-constant ERR-INSUFFICIENT-BALANCE (err u110))
(define-constant ERR-STAKING-LOCKED (err u111))
(define-constant ERR-MIN-STAKE (err u112))
(define-constant ERR-RATE-LIMIT-EXCEEDED (err u113))

;; Configuration
(define-constant PLATFORM-FEE u200) ;; 2% in basis points
(define-constant MIN-STAKE u1000000) ;; 1 OXC minimum stake
(define-constant LOCK-PERIOD u1008) ;; ~7 days in blocks

;; Rate Limiting Configuration
(define-constant RATE-LIMIT-WINDOW u144) ;; ~24 hours in blocks
(define-constant MAX-PREDICTIONS-PER-WINDOW u20)
(define-constant MAX-MARKETS-PER-WINDOW u5)
(define-constant MAX-STAKES-PER-WINDOW u10)

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
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-OWNER-ONLY)
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

;; Rate limiting maps
(define-map rate-limit-predictions
  principal
  { count: uint, window-start: uint })

(define-map rate-limit-markets
  principal
  { count: uint, window-start: uint })

(define-map rate-limit-stakes
  principal
  { count: uint, window-start: uint })

(define-read-only (get-stake (staker principal))
  (default-to { amount: u0, locked-until: u0 } (map-get? stakes staker)))

(define-read-only (get-total-staked)
  (ok (var-get total-staked)))

(define-read-only (get-rate-limit-status (user principal) (action (string-ascii 20)))
  (if (is-eq action "predict")
    (ok (default-to { count: u0, window-start: u0 } (map-get? rate-limit-predictions user)))
    (if (is-eq action "market")
      (ok (default-to { count: u0, window-start: u0 } (map-get? rate-limit-markets user)))
      (if (is-eq action "stake")
        (ok (default-to { count: u0, window-start: u0 } (map-get? rate-limit-stakes user)))
        (err u999)
      )
    )
  )
)

(define-private (check-rate-limit (user principal) (action (string-ascii 20)) (max-count uint))
  (let (
    (current-block stacks-block-height)
    (limit-data (if (is-eq action "predict")
      (default-to { count: u0, window-start: u0 } (map-get? rate-limit-predictions user))
      (if (is-eq action "market")
        (default-to { count: u0, window-start: u0 } (map-get? rate-limit-markets user))
        (default-to { count: u0, window-start: u0 } (map-get? rate-limit-stakes user))
      )
    ))
    (window-start (get window-start limit-data))
    (count (get count limit-data))
  )
    (if (>= (- current-block window-start) RATE-LIMIT-WINDOW)
      (ok true)
      (if (< count max-count)
        (ok true)
        ERR-RATE-LIMIT-EXCEEDED
      )
    )
  )
)

(define-private (record-rate-limit (user principal) (action (string-ascii 20)))
  (let (
    (current-block stacks-block-height)
    (limit-data (if (is-eq action "predict")
      (default-to { count: u0, window-start: u0 } (map-get? rate-limit-predictions user))
      (if (is-eq action "market")
        (default-to { count: u0, window-start: u0 } (map-get? rate-limit-markets user))
        (default-to { count: u0, window-start: u0 } (map-get? rate-limit-stakes user))
      )
    ))
    (window-start (get window-start limit-data))
    (count (get count limit-data))
    (new-window (>= (- current-block window-start) RATE-LIMIT-WINDOW))
  )
    (if (is-eq action "predict")
      (map-set rate-limit-predictions user {
        count: (if new-window u1 (+ count u1)),
        window-start: (if new-window current-block window-start)
      })
      (if (is-eq action "market")
        (map-set rate-limit-markets user {
          count: (if new-window u1 (+ count u1)),
          window-start: (if new-window current-block window-start)
        })
        (map-set rate-limit-stakes user {
          count: (if new-window u1 (+ count u1)),
          window-start: (if new-window current-block window-start)
        })
      )
    )
    (ok true)
  )
)

(define-public (stake (amount uint))
  (let (
    (current-stake (get-stake tx-sender))
    (new-amount (+ (get amount current-stake) amount))
  )
    (asserts! (>= amount MIN-STAKE) ERR-MIN-STAKE)
    (try! (check-rate-limit tx-sender "stake" MAX-STAKES-PER-WINDOW))
    (try! (ft-transfer? oxc-token amount tx-sender (as-contract tx-sender)))
    (map-set stakes tx-sender {
      amount: new-amount,
      locked-until: (+ stacks-block-height LOCK-PERIOD)
    })
    (var-set total-staked (+ (var-get total-staked) amount))
    (try! (record-rate-limit tx-sender "stake"))
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
    (try! (check-rate-limit tx-sender "market" MAX-MARKETS-PER-WINDOW))
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
    (try! (record-rate-limit tx-sender "market"))
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
    (try! (check-rate-limit tx-sender "predict" MAX-PREDICTIONS-PER-WINDOW))
    
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    
    (var-set fee-pool (+ (var-get fee-pool) fee))
    
    (if (is-eq outcome OUTCOME-YES)
      (begin
        (map-set markets market-id (merge market { yes-pool: (+ (get yes-pool market) net-amount) }))
        (map-set positions { market-id: market-id, user: tx-sender }
          (merge current-position { yes-amount: (+ (get yes-amount current-position) net-amount) })))
      (begin
        (map-set markets market-id (merge market { no-pool: (+ (get no-pool market) net-amount) }))
        (map-set positions { market-id: market-id, user: tx-sender }
          (merge current-position { no-amount: (+ (get no-amount current-position) net-amount) }))))
    
    (try! (record-rate-limit tx-sender "predict"))
    (print { event: "prediction", market-id: market-id, user: tx-sender, outcome: outcome, amount: net-amount })
    (ok true)))

;; Resolve market (owner only for MVP)
(define-public (resolve-market (market-id uint) (outcome uint))
  (let (
    (market (unwrap! (get-market market-id) ERR-NOT-FOUND))
  )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-OWNER-ONLY)
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
    (let ((recipient tx-sender))
      (try! (as-contract (stx-transfer? payout tx-sender recipient))))
    
    (print { event: "claim", market-id: market-id, user: tx-sender, payout: payout })
    (ok payout)))

;; Cancel market (owner only)
(define-public (cancel-market (market-id uint))
  (let (
    (market (unwrap! (get-market market-id) ERR-NOT-FOUND))
  )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-OWNER-ONLY)
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
    
    (let ((recipient tx-sender))
      (try! (as-contract (stx-transfer? refund tx-sender recipient))))
    
    (print { event: "refund", market-id: market-id, user: tx-sender, amount: refund })
    (ok refund)))

;; Withdraw fees (owner only)
(define-public (withdraw-fees)
  (let (
    (fees (var-get fee-pool))
  )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-OWNER-ONLY)
    (asserts! (> fees u0) ERR-INVALID-AMOUNT)
    
    (var-set fee-pool u0)
    (try! (as-contract (stx-transfer? fees tx-sender (var-get contract-owner))))
    
    (print { event: "fees-withdrawn", amount: fees })
    (ok fees)))

;; ============================================
;; INITIALIZATION
;; ============================================

(begin
  ;; Mint initial OXC supply to owner
  (try! (ft-mint? oxc-token u100000000000000 (var-get contract-owner)))
  (print { event: "contract-deployed", owner: (var-get contract-owner), token-supply: u100000000000000 }))

;; ============================================
;; OWNER TRANSFER FUNCTIONS
;; ============================================

;; Get the current contract owner
(define-read-only (get-contract-owner)
  (var-get contract-owner)
)

;; Get pending owner transfer details
(define-read-only (get-pending-owner-transfer)
  {
    pending-owner: (var-get pending-owner),
    initiated-at: (var-get owner-transfer-initiated-at),
    cooldown: (var-get owner-transfer-cooldown)
  }
)

;; Initiate owner transfer with time-locked security period
(define-public (initiate-owner-transfer (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-OWNER-ONLY)
    (asserts! (not (is-eq new-owner (var-get contract-owner))) ERR-INVALID-NEW-OWNER)
    
    (var-set pending-owner (some new-owner))
    (var-set owner-transfer-initiated-at stacks-block-height)
    
    (ok true)
  )
)

;; Cancel a pending owner transfer
(define-public (cancel-owner-transfer)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-OWNER-ONLY)
    (asserts! (is-some (var-get pending-owner)) ERR-INVALID-NEW-OWNER)
    
    (var-set pending-owner none)
    (var-set owner-transfer-initiated-at u0)
    
    (ok true)
  )
)

;; Claim ownership after cooldown period
(define-public (claim-ownership)
  (let (
    (pending (var-get pending-owner))
    (initiated-at (var-get owner-transfer-initiated-at))
    (cooldown (var-get owner-transfer-cooldown))
    (current-block stacks-block-height)
  )
    (asserts! (is-some pending) ERR-INVALID-NEW-OWNER)
    (asserts! (is-eq tx-sender (unwrap! pending ERR-INVALID-NEW-OWNER)) ERR-OWNER-ONLY)
    (asserts! (>= current-block (+ initiated-at cooldown)) ERR-OWNER-TRANSFER-COOLDOWN)
    
    (var-set contract-owner tx-sender)
    (var-set pending-owner none)
    (var-set owner-transfer-initiated-at u0)
    
    (ok true)
  )
)

;; Update owner transfer cooldown
(define-public (set-owner-transfer-cooldown (new-cooldown uint))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-OWNER-ONLY)
    (asserts! (> new-cooldown u0) ERR-INVALID-AMOUNT)
    (ok (var-set owner-transfer-cooldown new-cooldown))
  )
)
