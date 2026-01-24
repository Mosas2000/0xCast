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
