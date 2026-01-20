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
