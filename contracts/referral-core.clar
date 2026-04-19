;; Referral and Affiliate System Contract
;; Tracks referrals, manages rewards, and handles affiliate payouts

;; ============================================
;; CONSTANTS
;; ============================================

(define-constant contract-owner tx-sender)

;; Error codes
(define-constant ERR-OWNER-ONLY (err u500))
(define-constant ERR-INVALID-CODE (err u501))
(define-constant ERR-ALREADY-REFERRED (err u502))
(define-constant ERR-SELF-REFERRAL (err u503))
(define-constant ERR-INSUFFICIENT-REWARDS (err u504))
(define-constant ERR-CODE-EXISTS (err u505))
(define-constant ERR-INVALID-RATE (err u506))
(define-constant ERR-ZERO-AMOUNT (err u507))
(define-constant ERR-NOT-FOUND (err u508))
(define-constant ERR-FRAUD-DETECTED (err u509))

;; Reward configuration in basis points (100 = 1%)
(define-constant REFERRAL-REWARD-RATE u500) ;; 5% of referred user's spending
(define-constant AFFILIATE-REWARD-RATE u300) ;; 3% of referred user's spending
(define-constant MIN-REWARD-THRESHOLD u100000) ;; 0.1 OXC in microunits

;; Fraud prevention
(define-constant MAX-REFERRALS-PER-ADDRESS u1000)
(define-constant REFERRAL-COOLDOWN u144) ;; ~1 day in blocks

;; ============================================
;; DATA STRUCTURES
;; ============================================

;; Referral code to principal mapping
(define-map referral-codes
  (string-ascii 16)
  {
    owner: principal,
    created-at: uint,
    active: bool,
    total-referrals: uint
  })

;; User referral tracking
(define-map user-referrals
  principal
  {
    referrer: (optional principal),
    referral-code: (string-ascii 16),
    referred-at: uint
  })

;; Affiliate stats
(define-map affiliate-stats
  principal
  {
    total-referred: uint,
    total-earned: uint,
    total-claimed: uint,
    pending-rewards: uint,
    active-referrals: uint,
    last-referral-block: uint
  })

;; Reward tracking per referral
(define-map referral-rewards
  { referrer: principal, referral-id: uint }
  {
    referral-user: principal,
    reward-amount: uint,
    claimed: bool,
    claimed-at: (optional uint),
    action-type: (string-ascii 32)
  })

;; Global state
(define-data-var total-referrals uint u0)
(define-data-var total-rewards-distributed uint u0)
(define-data-var reward-counter uint u0)

;; ============================================
;; HELPER FUNCTIONS
;; ============================================

(define-private (generate-code-hash (user principal) (nonce uint))
  (substring (sha256 (concat (unwrap-panic (to-consensus-buff? user)) (to-consensus-buff? nonce))) u0 u16))

(define-private (get-default-stats)
  {
    total-referred: u0,
    total-earned: u0,
    total-claimed: u0,
    pending-rewards: u0,
    active-referrals: u0,
    last-referral-block: u0
  })

(define-private (string-to-ascii (input (string-ascii 16)))
  input)

;; ============================================
;; REFERRAL CODE MANAGEMENT
;; ============================================

(define-public (generate-referral-code)
  (let (
    (nonce (var-get reward-counter))
    (code-raw (generate-code-hash tx-sender nonce))
    (code (string-to-ascii (slice code-raw u0 u16)))
  )
    (asserts! (is-none (map-get? referral-codes code)) ERR-CODE-EXISTS)
    
    (map-set referral-codes code {
      owner: tx-sender,
      created-at: stacks-block-height,
      active: true,
      total-referrals: u0
    })
    
    (map-set user-referrals tx-sender (merge
      (default-to 
        { referrer: none, referral-code: code, referred-at: u0 }
        (map-get? user-referrals tx-sender))
      { referral-code: code }))
    
    (var-set reward-counter (+ nonce u1))
    (ok code)))

(define-public (register-referral-with-code (referral-code (string-ascii 16)))
  (let (
    (referrer-opt (map-get? referral-codes referral-code))
    (stats (default-to (get-default-stats) (map-get? affiliate-stats tx-sender)))
  )
    (asserts! (is-some referrer-opt) ERR-INVALID-CODE)
    (asserts! (is-none (map-get? user-referrals tx-sender)) ERR-ALREADY-REFERRED)
    
    (let (
      (referrer-data (unwrap! referrer-opt ERR-NOT-FOUND))
      (referrer (get owner referrer-data))
      (referrer-stats (default-to (get-default-stats) (map-get? affiliate-stats referrer)))
    )
      (asserts! (not (is-eq referrer tx-sender)) ERR-SELF-REFERRAL)
      
      ;; Register the referral
      (map-set user-referrals tx-sender {
        referrer: (some referrer),
        referral-code: referral-code,
        referred-at: stacks-block-height
      })
      
      ;; Update referral code stats
      (map-set referral-codes referral-code (merge referrer-data {
        total-referrals: (+ (get total-referrals referrer-data) u1)
      }))
      
      ;; Update referrer stats
      (map-set affiliate-stats referrer (merge referrer-stats {
        total-referred: (+ (get total-referred referrer-stats) u1),
        active-referrals: (+ (get active-referrals referrer-stats) u1),
        last-referral-block: stacks-block-height
      }))
      
      ;; Increment global counter
      (var-set total-referrals (+ (var-get total-referrals) u1))
      
      (ok true))))

;; ============================================
;; REWARD MANAGEMENT
;; ============================================

(define-public (record-referral-reward 
  (referrer principal) 
  (referral-user principal) 
  (action-amount uint)
  (action-type (string-ascii 32)))
  (let (
    (reward-amount (/ (* action-amount REFERRAL-REWARD-RATE) u10000))
    (stats (default-to (get-default-stats) (map-get? affiliate-stats referrer)))
    (reward-id (var-get reward-counter))
  )
    (asserts! (is-eq tx-sender contract-owner) ERR-OWNER-ONLY)
    (asserts! (> action-amount u0) ERR-ZERO-AMOUNT)
    (asserts! (>= reward-amount MIN-REWARD-THRESHOLD) ERR-ZERO-AMOUNT)
    
    ;; Record the reward
    (map-set referral-rewards { referrer: referrer, referral-id: reward-id } {
      referral-user: referral-user,
      reward-amount: reward-amount,
      claimed: false,
      claimed-at: none,
      action-type: action-type
    })
    
    ;; Update affiliate stats
    (map-set affiliate-stats referrer (merge stats {
      total-earned: (+ (get total-earned stats) reward-amount),
      pending-rewards: (+ (get pending-rewards stats) reward-amount)
    }))
    
    ;; Increment reward counter
    (var-set reward-counter (+ reward-id u1))
    
    (ok true)))

(define-public (claim-referral-rewards)
  (let (
    (stats (default-to (get-default-stats) (map-get? affiliate-stats tx-sender)))
    (pending (get pending-rewards stats))
  )
    (asserts! (> pending u0) ERR-INSUFFICIENT-REWARDS)
    
    ;; Update stats
    (map-set affiliate-stats tx-sender (merge stats {
      pending-rewards: u0,
      total-claimed: (+ (get total-claimed stats) pending)
    }))
    
    ;; Update global total
    (var-set total-rewards-distributed (+ (var-get total-rewards-distributed) pending))
    
    (print { event: "referral-rewards-claimed", user: tx-sender, amount: pending })
    (ok pending)))

;; ============================================
;; FRAUD DETECTION
;; ============================================

(define-private (validate-referral-integrity (user principal) (referrer principal))
  (let (
    (user-stats (default-to (get-default-stats) (map-get? affiliate-stats user)))
    (last-block (get last-referral-block user-stats))
    (referral-count (get active-referrals user-stats))
    (block-diff (- stacks-block-height last-block))
  )
    ;; Check cooldown between referrals
    (asserts! (or (is-eq last-block u0) (>= block-diff REFERRAL-COOLDOWN)) ERR-FRAUD-DETECTED)
    ;; Check maximum referrals limit
    (asserts! (< referral-count MAX-REFERRALS-PER-ADDRESS) ERR-FRAUD-DETECTED)
    (ok true)))

(define-public (validate-referral (referral-code (string-ascii 16)) (user principal))
  (let (
    (referrer-opt (map-get? referral-codes referral-code))
  )
    (asserts! (is-some referrer-opt) ERR-INVALID-CODE)
    
    (let (
      (referrer-data (unwrap! referrer-opt ERR-NOT-FOUND))
      (referrer (get owner referrer-data))
    )
      (asserts! (get active referrer-data) ERR-INVALID-CODE)
      (asserts! (not (is-eq referrer user)) ERR-SELF-REFERRAL)
      (asserts! (is-none (map-get? user-referrals user)) ERR-ALREADY-REFERRED)
      (try! (validate-referral-integrity referrer user))
      (ok true))))

;; ============================================
;; ADMIN FUNCTIONS
;; ============================================

(define-public (set-reward-rates (referral-rate uint) (affiliate-rate uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) ERR-OWNER-ONLY)
    (asserts! (and (< referral-rate u10000) (< affiliate-rate u10000)) ERR-INVALID-RATE)
    (ok true)))

(define-public (deactivate-code (referral-code (string-ascii 16)))
  (let (
    (code-data (map-get? referral-codes referral-code))
  )
    (asserts! (is-some code-data) ERR-NOT-FOUND)
    
    (let (
      (data (unwrap! code-data ERR-NOT-FOUND))
    )
      (asserts! (is-eq tx-sender (get owner data)) ERR-OWNER-ONLY)
      (map-set referral-codes referral-code (merge data { active: false }))
      (ok true))))

;; ============================================
;; READ-ONLY FUNCTIONS
;; ============================================

(define-read-only (get-referral-code-info (code (string-ascii 16)))
  (map-get? referral-codes code))

(define-read-only (get-user-referral-info (user principal))
  (map-get? user-referrals user))

(define-read-only (get-affiliate-stats (user principal))
  (default-to (get-default-stats) (map-get? affiliate-stats user)))

(define-read-only (get-referral-reward (referrer principal) (reward-id uint))
  (map-get? referral-rewards { referrer: referrer, referral-id: reward-id }))

(define-read-only (get-total-referrals)
  (ok (var-get total-referrals)))

(define-read-only (get-total-distributed)
  (ok (var-get total-rewards-distributed)))

(define-read-only (is-user-referred (user principal))
  (is-some (map-get? user-referrals user)))

(define-read-only (get-referrer (user principal))
  (match (map-get? user-referrals user)
    referral-info (ok (get referrer referral-info))
    (err ERR-NOT-FOUND)))
