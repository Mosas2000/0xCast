;; Referral System Integration Module
;; Integrates referral rewards with market operations

(define-constant contract-owner tx-sender)

;; Error codes
(define-constant ERR-OWNER-ONLY (err u600))
(define-constant ERR-NOT-FOUND (err u601))
(define-constant ERR-INVALID-AMOUNT (err u602))

;; Referral contract address
(define-data-var referral-contract-address principal)

;; Track market to referrer mapping
(define-map market-referrals
  { market-id: uint, user: principal }
  { referrer: (optional principal), reward-triggered: bool })

;; ============================================
;; INITIALIZATION
;; ============================================

(define-public (set-referral-contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) ERR-OWNER-ONLY)
    (var-set referral-contract-address contract)
    (ok true)))

;; ============================================
;; REFERRAL INTEGRATION
;; ============================================

(define-public (trigger-referral-reward 
  (market-id uint)
  (user principal)
  (action-amount uint)
  (action-type (string-ascii 32)))
  (let (
    (referral-contract (var-get referral-contract-address))
  )
    (asserts! (> action-amount u0) ERR-INVALID-AMOUNT)
    
    ;; Call referral contract to record reward
    ;; This will be implemented when integrating with actual referral contract
    (print { 
      event: "referral-reward-triggered",
      market-id: market-id,
      user: user,
      action-amount: action-amount,
      action-type: action-type
    })
    (ok true)))

(define-public (on-market-created (market-id uint) (creator principal) (question (string-ascii 256)))
  (begin
    (print { event: "market-created-referral-tracked", market-id: market-id, creator: creator })
    (ok true)))

(define-public (on-prediction-placed (market-id uint) (user principal) (amount uint))
  (let (
    (existing-record (map-get? market-referrals { market-id: market-id, user: user }))
  )
    (if (is-none existing-record)
      (begin
        (map-set market-referrals { market-id: market-id, user: user } {
          referrer: none,
          reward-triggered: false
        })
        (ok true))
      (ok true))))

(define-read-only (get-market-referral-status (market-id uint) (user principal))
  (map-get? market-referrals { market-id: market-id, user: user }))
