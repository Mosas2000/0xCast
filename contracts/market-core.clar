;; market-core.clar
;; 0xCast - Decentralized Prediction Market Protocol
;; Core contract for creating and managing prediction markets

;; ============================================
;; Constants
;; ============================================

;; Market Status Constants
(define-constant MARKET-STATUS-ACTIVE u0)
(define-constant MARKET-STATUS-RESOLVED u1)
(define-constant MARKET-STATUS-DISPUTED u2)
(define-constant MARKET-STATUS-REFUNDED u3)

;; Market Outcome Constants
(define-constant OUTCOME-NONE u0)
(define-constant OUTCOME-YES u1)
(define-constant OUTCOME-NO u2)

;; Category Constants
(define-constant CATEGORY-CRYPTO u1)
(define-constant CATEGORY-SPORTS u2)
(define-constant CATEGORY-POLITICS u3)
(define-constant CATEGORY-ECONOMICS u4)
(define-constant CATEGORY-OTHER u5)

;; Error Constants
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-MARKET-NOT-FOUND (err u101))
(define-constant ERR-MARKET-ALREADY-RESOLVED (err u102))
(define-constant ERR-MARKET-NOT-ENDED (err u103))
(define-constant ERR-INVALID-OUTCOME (err u104))
(define-constant ERR-MARKET-STILL-ACTIVE (err u105))
(define-constant ERR-INVALID-DATES (err u106))
(define-constant ERR-MARKET-ENDED (err u107))
(define-constant ERR-ALREADY-CLAIMED (err u108))
(define-constant ERR-NO-WINNINGS (err u109))
(define-constant ERR-MARKET-NOT-RESOLVED (err u110))
(define-constant ERR-INVALID-CATEGORY (err u111))
(define-constant ERR-MARKET-ABANDONED (err u112))
(define-constant ERR-ALREADY-REFUNDED (err u113))
(define-constant ERR-MARKET-IN-DISPUTE (err u114))
(define-constant ERR-REFUND-NOT-ALLOWED (err u115))

;; Auto-resolve fallback: blocks after resolution-date before auto-resolve kicks in
;; ~7 days in blocks (7 * 144 = 1008)
(define-data-var abandonment-period uint u1008)

;; ============================================
;; Data Variables
;; ============================================

;; Counter to track total number of markets created
(define-data-var market-counter uint u0)

;; ============================================
;; Data Maps
;; ============================================

;; Main market data structure
;; Maps market-id to market details
(define-map markets
  { market-id: uint }
  {
    question: (string-ascii 256),
    creator: principal,
    category: uint,
    end-date: uint,
    resolution-date: uint,
    total-yes-stake: uint,
    total-no-stake: uint,
    status: uint,
    outcome: uint,
    created-at: uint,
    resolved-by: (optional principal),
    resolution-source: (string-ascii 20)
  }
)

;; Index map for category-based market lookups
(define-map market-categories
  { category: uint, index: uint }
  { market-id: uint }
)

;; Counter for markets per category
(define-map category-counters
  { category: uint }
  { count: uint }
)

;; User positions in markets
;; Maps (market-id, user) to their position
(define-map user-positions
  { market-id: uint, user: principal }
  {
    yes-stake: uint,          ;; Amount staked on YES
    no-stake: uint,           ;; Amount staked on NO
    claimed: bool             ;; Whether winnings have been claimed
  }
)

;; ============================================
;; Read-Only Functions
;; ============================================

;; Get the current market counter
(define-read-only (get-market-counter)
  (var-get market-counter)
)

;; Get market details by ID
(define-read-only (get-market (market-id uint))
  (map-get? markets { market-id: market-id })
)

;; Get user position in a specific market
(define-read-only (get-user-position (market-id uint) (user principal))
  (map-get? user-positions { market-id: market-id, user: user })
)

;; Check if a market exists
(define-read-only (market-exists (market-id uint))
  (is-some (map-get? markets { market-id: market-id }))
)

;; Get total pool size for a market
(define-read-only (get-market-pool-size (market-id uint))
  (match (map-get? markets { market-id: market-id })
    market (ok (+ (get total-yes-stake market) (get total-no-stake market)))
    (err ERR-MARKET-NOT-FOUND)
  )
)

;; Get count of markets in a category
(define-read-only (get-market-category-count (category uint))
  (default-to u0 (get count (map-get? category-counters { category: category })))
)

;; Get market-id by category and index
(define-read-only (get-market-by-category (category uint) (index uint))
  (map-get? market-categories { category: category, index: index })
)

;; ============================================
;; Private Functions
;; ============================================

;; Increment market counter and return new ID
(define-private (increment-market-counter)
  (let ((current-counter (var-get market-counter)))
    (var-set market-counter (+ current-counter u1))
    current-counter
  )
)

;; ============================================
;; Public Functions
;; ============================================

;; Create a new prediction market
;; @param question: The market question (max 256 characters)
;; @param end-date: Block height when trading closes
;; @param resolution-date: Block height when market can be resolved
;; @returns: (ok market-id) on success, error code on failure
(define-public (create-market (question (string-ascii 256)) (end-date uint) (resolution-date uint) (category uint))
  (let
    (
      (current-block stacks-block-height)
      (new-market-id (increment-market-counter))
      (cat-count (get-market-category-count category))
    )
    ;; Validate that end-date is in the future
    (asserts! (> end-date current-block) ERR-INVALID-DATES)
    
    ;; Validate that resolution-date is after end-date
    (asserts! (> resolution-date end-date) ERR-INVALID-DATES)
    
    ;; Validate category is within allowed range (1-5)
    (asserts! (and (>= category u1) (<= category u5)) ERR-INVALID-CATEGORY)
    
    ;; Create the new market
    (map-set markets
      { market-id: new-market-id }
      {
        question: question,
        creator: tx-sender,
        category: category,
        end-date: end-date,
        resolution-date: resolution-date,
        total-yes-stake: u0,
        total-no-stake: u0,
        status: MARKET-STATUS-ACTIVE,
        outcome: OUTCOME-NONE,
        created-at: current-block,
        resolved-by: none,
        resolution-source: ""
      }
    )
    
    ;; Index market under its category
    (map-set market-categories
      { category: category, index: cat-count }
      { market-id: new-market-id }
    )
    (map-set category-counters
      { category: category }
      { count: (+ cat-count u1) }
    )
    
    ;; Return the new market ID
    (ok new-market-id)
  )
)

;; Place a stake on YES outcome
;; @param market-id: The ID of the market to stake on
;; @param amount: Amount of STX to stake
;; @returns: (ok true) on success, error code on failure
(define-public (place-yes-stake (market-id uint) (amount uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
      (current-block stacks-block-height)
      (current-position (default-to 
        { yes-stake: u0, no-stake: u0, claimed: false }
        (map-get? user-positions { market-id: market-id, user: tx-sender })
      ))
    )
    ;; Validate market is still active
    (asserts! (is-eq (get status market) MARKET-STATUS-ACTIVE) ERR-MARKET-ALREADY-RESOLVED)
    
    ;; Validate market hasn't ended
    (asserts! (< current-block (get end-date market)) ERR-MARKET-ENDED)
    
    ;; Transfer STX from user to contract
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    
    ;; Update market's total YES stake
    (map-set markets
      { market-id: market-id }
      (merge market { total-yes-stake: (+ (get total-yes-stake market) amount) })
    )
    
    ;; Update user's position
    (map-set user-positions
      { market-id: market-id, user: tx-sender }
      (merge current-position { yes-stake: (+ (get yes-stake current-position) amount) })
    )
    
    (ok true)
  )
)

;; Place a stake on NO outcome
;; @param market-id: The ID of the market to stake on
;; @param amount: Amount of STX to stake
;; @returns: (ok true) on success, error code on failure
(define-public (place-no-stake (market-id uint) (amount uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
      (current-block stacks-block-height)
      (current-position (default-to 
        { yes-stake: u0, no-stake: u0, claimed: false }
        (map-get? user-positions { market-id: market-id, user: tx-sender })
      ))
    )
    ;; Validate market is still active
    (asserts! (is-eq (get status market) MARKET-STATUS-ACTIVE) ERR-MARKET-ALREADY-RESOLVED)
    
    ;; Validate market hasn't ended
    (asserts! (< current-block (get end-date market)) ERR-MARKET-ENDED)
    
    ;; Transfer STX from user to contract
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    
    ;; Update market's total NO stake
    (map-set markets
      { market-id: market-id }
      (merge market { total-no-stake: (+ (get total-no-stake market) amount) })
    )
    
    ;; Update user's position
    (map-set user-positions
      { market-id: market-id, user: tx-sender }
      (merge current-position { no-stake: (+ (get no-stake current-position) amount) })
    )
    
    (ok true)
  )
)

;; Resolve a market with the final outcome
;; @param market-id: The ID of the market to resolve
;; @param outcome: The final outcome (OUTCOME-YES or OUTCOME-NO)
;; @returns: (ok true) on success, error code on failure
(define-public (resolve-market (market-id uint) (outcome uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
      (current-block stacks-block-height)
    )
    ;; Validate only creator can resolve
    (asserts! (is-eq tx-sender (get creator market)) ERR-NOT-AUTHORIZED)
    
    ;; Validate market is still active
    (asserts! (is-eq (get status market) MARKET-STATUS-ACTIVE) ERR-MARKET-ALREADY-RESOLVED)
    
    ;; Validate resolution date has passed
    (asserts! (>= current-block (get resolution-date market)) ERR-MARKET-NOT-ENDED)
    
    ;; Validate outcome is valid (YES or NO)
    (asserts! (or (is-eq outcome OUTCOME-YES) (is-eq outcome OUTCOME-NO)) ERR-INVALID-OUTCOME)
    
    ;; Update market status and outcome
    (map-set markets
      { market-id: market-id }
      (merge market {
        status: MARKET-STATUS-RESOLVED,
        outcome: outcome,
        resolved-by: (some tx-sender),
        resolution-source: "creator"
      })
    )
    
    (ok true)
  )
)

;; Claim winnings from a resolved market
;; @param market-id: The ID of the market to claim from
;; @returns: (ok payout-amount) on success, error code on failure
(define-public (claim-winnings (market-id uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
      (position (unwrap! (map-get? user-positions { market-id: market-id, user: tx-sender }) ERR-NO-WINNINGS))
      (total-pool (+ (get total-yes-stake market) (get total-no-stake market)))
      (outcome (get outcome market))
    )
    ;; Validate market is resolved
    (asserts! (is-eq (get status market) MARKET-STATUS-RESOLVED) ERR-MARKET-NOT-RESOLVED)
    
    ;; Validate user hasn't already claimed
    (asserts! (not (get claimed position)) ERR-ALREADY-CLAIMED)
    
    ;; Calculate payout based on outcome
    (let
      (
        (payout (if (is-eq outcome OUTCOME-YES)
          ;; YES won: calculate proportional share of total pool
          (if (> (get total-yes-stake market) u0)
            (/ (* (get yes-stake position) total-pool) (get total-yes-stake market))
            u0
          )
          ;; NO won: calculate proportional share of total pool
          (if (> (get total-no-stake market) u0)
            (/ (* (get no-stake position) total-pool) (get total-no-stake market))
            u0
          )
        ))
      )
      ;; Validate user has winnings to claim
      (asserts! (> payout u0) ERR-NO-WINNINGS)
      
      ;; Transfer payout from contract to user
      (try! (as-contract (stx-transfer? payout tx-sender contract-caller)))
      
      ;; Mark position as claimed
      (map-set user-positions
        { market-id: market-id, user: tx-sender }
        (merge position { claimed: true })
      )
      
      (ok payout)
    )
  )
)

;; Resolve a market via oracle data
(define-public (oracle-resolve (market-id uint) (outcome uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
      (current-block stacks-block-height)
    )
    (asserts! (is-eq (get status market) MARKET-STATUS-ACTIVE) ERR-MARKET-ALREADY-RESOLVED)
    (asserts! (>= current-block (get resolution-date market)) ERR-MARKET-NOT-ENDED)
    (asserts! (or (is-eq outcome OUTCOME-YES) (is-eq outcome OUTCOME-NO)) ERR-INVALID-OUTCOME)
    (map-set markets
      { market-id: market-id }
      (merge market {
        status: MARKET-STATUS-RESOLVED,
        outcome: outcome,
        resolved-by: (some tx-sender),
        resolution-source: "oracle"
      })
    )
    (ok true)
  )
)

;; Mark a market as disputed (called when dispute is filed)
(define-public (mark-disputed (market-id uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
    )
    (asserts! (is-eq (get status market) MARKET-STATUS-RESOLVED) ERR-MARKET-NOT-RESOLVED)
    (map-set markets
      { market-id: market-id }
      (merge market { status: MARKET-STATUS-DISPUTED })
    )
    (ok true)
  )
)

;; Re-resolve after dispute is settled
(define-public (resolve-after-dispute (market-id uint) (outcome uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
    )
    (asserts! (is-eq (get status market) MARKET-STATUS-DISPUTED) ERR-MARKET-IN-DISPUTE)
    (asserts! (or (is-eq outcome OUTCOME-YES) (is-eq outcome OUTCOME-NO)) ERR-INVALID-OUTCOME)
    (map-set markets
      { market-id: market-id }
      (merge market {
        status: MARKET-STATUS-RESOLVED,
        outcome: outcome,
        resolved-by: (some tx-sender),
        resolution-source: "dispute"
      })
    )
    (ok true)
  )
)

;; Emergency refund for abandoned or irresolvable markets
(define-public (emergency-refund (market-id uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
      (position (unwrap! (map-get? user-positions { market-id: market-id, user: tx-sender }) ERR-NO-WINNINGS))
      (current-block stacks-block-height)
      (user-total (+ (get yes-stake position) (get no-stake position)))
    )
    (asserts! (is-eq (get status market) MARKET-STATUS-ACTIVE) ERR-REFUND-NOT-ALLOWED)
    (asserts! (>= current-block (+ (get resolution-date market) (var-get abandonment-period))) ERR-REFUND-NOT-ALLOWED)
    (asserts! (not (get claimed position)) ERR-ALREADY-CLAIMED)
    (asserts! (> user-total u0) ERR-NO-WINNINGS)
    (try! (as-contract (stx-transfer? user-total tx-sender contract-caller)))
    (map-set user-positions
      { market-id: market-id, user: tx-sender }
      (merge position { claimed: true })
    )
    (ok user-total)
  )
)

;; Admin: force refund status on a market
(define-public (admin-force-refund (market-id uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
    )
    (asserts! (is-eq tx-sender (get creator market)) ERR-NOT-AUTHORIZED)
    (map-set markets
      { market-id: market-id }
      (merge market {
        status: MARKET-STATUS-REFUNDED,
        resolution-source: "refund"
      })
    )
    (ok true)
  )
)

;; Claim refund from a market that was force-refunded
(define-public (claim-refund (market-id uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
      (position (unwrap! (map-get? user-positions { market-id: market-id, user: tx-sender }) ERR-NO-WINNINGS))
      (user-total (+ (get yes-stake position) (get no-stake position)))
    )
    (asserts! (is-eq (get status market) MARKET-STATUS-REFUNDED) ERR-REFUND-NOT-ALLOWED)
    (asserts! (not (get claimed position)) ERR-ALREADY-CLAIMED)
    (asserts! (> user-total u0) ERR-NO-WINNINGS)
    (try! (as-contract (stx-transfer? user-total tx-sender contract-caller)))
    (map-set user-positions
      { market-id: market-id, user: tx-sender }
      (merge position { claimed: true })
    )
    (ok user-total)
  )
)

(define-read-only (get-abandonment-period)
  (var-get abandonment-period))

(define-read-only (is-market-abandoned (market-id uint))
  (match (map-get? markets { market-id: market-id })
    market (and
      (is-eq (get status market) MARKET-STATUS-ACTIVE)
      (>= stacks-block-height (+ (get resolution-date market) (var-get abandonment-period))))
    false))

