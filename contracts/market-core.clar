;; market-core.clar
;; 0xCast - Decentralized Prediction Market Protocol
;; Core contract for creating and managing prediction markets

;; ============================================
;; Constants
;; ============================================

;; Market Status Constants
(define-constant MARKET-STATUS-ACTIVE u0)
(define-constant MARKET-STATUS-RESOLVED u1)

;; Market Outcome Constants
(define-constant OUTCOME-NONE u0)
(define-constant OUTCOME-YES u1)
(define-constant OUTCOME-NO u2)

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
    end-date: uint,           ;; Block height when market closes for trading
    resolution-date: uint,    ;; Block height when market can be resolved
    total-yes-stake: uint,    ;; Total STX staked on YES outcome
    total-no-stake: uint,     ;; Total STX staked on NO outcome
    status: uint,             ;; MARKET-STATUS-ACTIVE or MARKET-STATUS-RESOLVED
    outcome: uint,            ;; OUTCOME-NONE, OUTCOME-YES, or OUTCOME-NO
    created-at: uint          ;; Block height when market was created
  }
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
(define-public (create-market (question (string-ascii 256)) (end-date uint) (resolution-date uint))
  (let
    (
      (current-block stacks-block-height)
      (new-market-id (increment-market-counter))
    )
    ;; Validate that end-date is in the future
    (asserts! (> end-date current-block) ERR-INVALID-DATES)
    
    ;; Validate that resolution-date is after end-date
    (asserts! (> resolution-date end-date) ERR-INVALID-DATES)
    
    ;; Create the new market
    (map-set markets
      { market-id: new-market-id }
      {
        question: question,
        creator: tx-sender,
        end-date: end-date,
        resolution-date: resolution-date,
        total-yes-stake: u0,
        total-no-stake: u0,
        status: MARKET-STATUS-ACTIVE,
        outcome: OUTCOME-NONE,
        created-at: current-block
      }
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
        outcome: outcome
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

