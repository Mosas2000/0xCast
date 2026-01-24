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
