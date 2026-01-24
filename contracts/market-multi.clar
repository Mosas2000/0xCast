;; ========================================
;; Multi-Outcome Prediction Market Contract
;; ========================================
;; Enables markets with 3-10 possible outcomes
;; Users can stake on specific outcomes
;; Proportional payout to winners based on pool distribution

;; ========================================
;; Error Constants
;; ========================================
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-MARKET-NOT-FOUND (err u101))
(define-constant ERR-INVALID-OUTCOME (err u102))
(define-constant ERR-MARKET-ENDED (err u103))
(define-constant ERR-INSUFFICIENT-OUTCOMES (err u104))
(define-constant ERR-TOO-MANY-OUTCOMES (err u105))

;; ========================================
;; Configuration Constants
;; ========================================
(define-constant MIN-OUTCOMES u3)
(define-constant MAX-OUTCOMES u10)

;; ========================================
;; Data Variables
;; ========================================
;; Counter for market IDs
(define-data-var market-counter uint u0)

;; ========================================
;; Data Maps
;; ========================================
;; Multi-outcome market storage
(define-map multi-markets
  { market-id: uint }
  {
    question: (string-utf8 256),
    creator: principal,
    outcome-names: (list 10 (string-utf8 100)),
    outcome-stakes: (list 10 uint),
    outcome-count: uint,
    end-date: uint,
    resolution-date: uint,
    status: uint,
    winning-outcome: (optional uint),
    created-at: uint
  }
)

;; User positions in multi-outcome markets
(define-map user-multi-positions
  { market-id: uint, user: principal, outcome-index: uint }
  {
    stake: uint,
    claimed: bool
  }
)

;; ========================================
;; Helper Functions
;; ========================================
;; Helper: Initialize empty outcome names list
(define-private (get-empty-list)
  (list "" "" "" "" "" "" "" "" "" "")
)

;; Helper: Initialize empty stakes list
(define-private (get-empty-stakes)
  (list u0 u0 u0 u0 u0 u0 u0 u0 u0 u0)
)

;; Helper: Update stake at specific index
(define-private (update-stake-at-index
  (current-stakes (list 10 uint))
  (target-index uint)
  (additional-amount uint))
  
  (map + current-stakes
    (list
      (if (is-eq target-index u0) additional-amount u0)
      (if (is-eq target-index u1) additional-amount u0)
      (if (is-eq target-index u2) additional-amount u0)
      (if (is-eq target-index u3) additional-amount u0)
      (if (is-eq target-index u4) additional-amount u0)
      (if (is-eq target-index u5) additional-amount u0)
      (if (is-eq target-index u6) additional-amount u0)
      (if (is-eq target-index u7) additional-amount u0)
      (if (is-eq target-index u8) additional-amount u0)
      (if (is-eq target-index u9) additional-amount u0)
    )
  )
)

;; Helper: Get total pool size
(define-private (calculate-total-pool (stakes (list 10 uint)))
  (fold + stakes u0)
)

;; Helper: Get stake at specific index
(define-private (get-stake-at-index
  (stakes (list 10 uint))
  (index uint))
  
  (default-to u0 (element-at stakes index))
)

;; Helper: Calculate payout for winner
(define-private (calculate-payout
  (user-stake uint)
  (winning-outcome-total uint)
  (total-pool uint))
  
  (if (is-eq winning-outcome-total u0)
    u0
    (/ (* user-stake total-pool) winning-outcome-total)
  )
)

;; ========================================
;; Public Functions
;; ========================================
;; Create multi-outcome market
(define-public (create-multi-market 
  (question (string-utf8 256))
  (outcomes (list 10 (string-utf8 100)))
  (end-date uint)
  (resolution-date uint))
  
  (let
    (
      (new-id (+ (var-get market-counter) u1))
      (outcome-count (len outcomes))
    )
    
    ;; Validations
    (asserts! (>= outcome-count MIN-OUTCOMES) ERR-INSUFFICIENT-OUTCOMES)
    (asserts! (<= outcome-count MAX-OUTCOMES) ERR-TOO-MANY-OUTCOMES)
    (asserts! (< end-date resolution-date) (err u106))
    (asserts! (> end-date stacks-block-height) (err u107))
    
    ;; Create market
    (map-set multi-markets
      { market-id: new-id }
      {
        question: question,
        creator: tx-sender,
        outcome-names: outcomes,
        outcome-stakes: (get-empty-stakes),
        outcome-count: outcome-count,
        end-date: end-date,
        resolution-date: resolution-date,
        status: u0,
        winning-outcome: none,
        created-at: stacks-block-height
      }
    )
    
    ;; Increment counter
    (var-set market-counter new-id)
    
    (ok new-id)
  )
)

;; Stake on specific outcome
(define-public (stake-on-outcome
  (market-id uint)
  (outcome-index uint)
  (amount uint))
  
  (let
    (
      (market (unwrap! (map-get? multi-markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
      (current-stakes (get outcome-stakes market))
      (user-position (default-to { stake: u0, claimed: false }
        (map-get? user-multi-positions 
          { market-id: market-id, user: tx-sender, outcome-index: outcome-index })))
      (updated-stakes (update-stake-at-index current-stakes outcome-index amount))
    )
    
    ;; Validations
    (asserts! (< outcome-index (get outcome-count market)) ERR-INVALID-OUTCOME)
    (asserts! (< stacks-block-height (get end-date market)) ERR-MARKET-ENDED)
    (asserts! (is-eq (get status market) u0) (err u108))
    (asserts! (> amount u0) (err u109))
    
    ;; Transfer STX from user to contract
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    
    ;; Update market stakes
    (map-set multi-markets
      { market-id: market-id }
      (merge market { outcome-stakes: updated-stakes })
    )
    
    ;; Update user position
    (map-set user-multi-positions
      { market-id: market-id, user: tx-sender, outcome-index: outcome-index }
      {
        stake: (+ (get stake user-position) amount),
        claimed: false
      }
    )
    
    (ok true)
  )
)

;; Resolve market with winning outcome
(define-public (resolve-multi-market
  (market-id uint)
  (winning-outcome-index uint))
  
  (let
    (
      (market (unwrap! (map-get? multi-markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
    )
    
    ;; Validations
    (asserts! (is-eq tx-sender (get creator market)) ERR-NOT-AUTHORIZED)
    (asserts! (< winning-outcome-index (get outcome-count market)) ERR-INVALID-OUTCOME)
    (asserts! (>= stacks-block-height (get resolution-date market)) (err u110))
    (asserts! (is-eq (get status market) u0) (err u111))
    
    ;; Update market status
    (map-set multi-markets
      { market-id: market-id }
      (merge market {
        status: u1,
        winning-outcome: (some winning-outcome-index)
      })
    )
    
    (ok true)
  )
)

;; Claim winnings for resolved market
(define-public (claim-multi-winnings
  (market-id uint)
  (outcome-index uint))
  
  (let
    (
      (market (unwrap! (map-get? multi-markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
      (user-position (unwrap! 
        (map-get? user-multi-positions 
          { market-id: market-id, user: tx-sender, outcome-index: outcome-index })
        (err u112)))
      (winning-outcome (unwrap! (get winning-outcome market) (err u113)))
      (all-stakes (get outcome-stakes market))
      (total-pool (calculate-total-pool all-stakes))
      (winning-stake (get-stake-at-index all-stakes winning-outcome))
      (user-stake (get stake user-position))
    )
    
    ;; Validations
    (asserts! (is-eq (get status market) u1) (err u114))
    (asserts! (is-eq outcome-index winning-outcome) (err u115))
    (asserts! (not (get claimed user-position)) (err u116))
    (asserts! (> user-stake u0) (err u117))
    
    ;; Calculate payout
    (let
      (
        (payout (calculate-payout user-stake winning-stake total-pool))
      )
      
      ;; Transfer winnings
      (try! (as-contract (stx-transfer? payout tx-sender tx-sender)))
      
      ;; Mark as claimed
      (map-set user-multi-positions
        { market-id: market-id, user: tx-sender, outcome-index: outcome-index }
        (merge user-position { claimed: true })
      )
      
      (ok payout)
    )
  )
)

;; ========================================
;; Read-Only Functions
;; ========================================
;; Read-only: Get market details
(define-read-only (get-multi-market (market-id uint))
  (map-get? multi-markets { market-id: market-id })
)

;; Read-only: Get user position
(define-read-only (get-user-multi-position 
  (market-id uint) 
  (user principal) 
  (outcome-index uint))
  (map-get? user-multi-positions 
    { market-id: market-id, user: user, outcome-index: outcome-index })
)

;; Read-only: Get market counter
(define-read-only (get-multi-market-counter)
  (ok (var-get market-counter))
)

;; Read-only: Get outcome odds
(define-read-only (get-outcome-odds 
  (market-id uint) 
  (outcome-index uint))
  (match (map-get? multi-markets { market-id: market-id })
    market
      (let
        (
          (stakes (get outcome-stakes market))
          (total (calculate-total-pool stakes))
          (outcome-stake (get-stake-at-index stakes outcome-index))
        )
        (if (is-eq total u0)
          (ok u0)
          (ok (/ (* outcome-stake u10000) total)) ;; Return as basis points (0-10000)
        )
      )
    ERR-MARKET-NOT-FOUND
  )
)
