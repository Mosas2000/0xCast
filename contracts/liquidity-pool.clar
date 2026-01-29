;; Liquidity Pool Contract
;; Automated Market Maker (AMM) for 0xCast prediction markets

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u500))
(define-constant err-insufficient-liquidity (err u501))
(define-constant err-invalid-amount (err u502))
(define-constant err-pool-not-found (err u503))

;; Pool Configuration
(define-data-var platform-fee-basis-points uint u30) ;; 0.3%
(define-data-var lp-fee-basis-points uint u20) ;; 0.2%

;; Data Maps
(define-map liquidity-pools
  uint ;; market-id
  {
    stx-balance: uint,
    token-balances: (list 10 uint),
    total-shares: uint,
    active: bool
  })

(define-map lp-balances
  {market-id: uint, provider: principal}
  uint)

;; Read-Only Functions

(define-read-only (get-pool (market-id uint))
  (map-get? liquidity-pools market-id))

(define-read-only (get-lp-balance (market-id uint) (provider principal))
  (default-to u0 (map-get? lp-balances {market-id: market-id, provider: provider})))

;; Public Functions

(define-public (create-pool (market-id uint) (initial-stx uint))
  (begin
    (asserts! (> initial-stx u0) err-invalid-amount)
    ;; In production, transfer STX to contract
    (ok (map-set liquidity-pools market-id {
      stx-balance: initial-stx,
      token-balances: (list u0 u0), ;; Placeholder for outcome tokens
      total-shares: initial-stx,
      active: true
    }))))

(define-public (add-liquidity (market-id uint) (stx-amount uint))
  (let ((pool (unwrap! (map-get? liquidity-pools market-id) err-pool-not-found)))
    (asserts! (> stx-amount u0) err-invalid-amount)
    
    (let ((shares-to-mint (/ (* stx-amount (get total-shares pool)) (get stx-balance pool))))
      (map-set liquidity-pools market-id (merge pool {
        stx-balance: (+ (get stx-balance pool) stx-amount),
        total-shares: (+ (get total-shares pool) shares-to-mint)
      }))
      
      (let ((current-lp (get-lp-balance market-id tx-sender)))
        (map-set lp-balances {market-id: market-id, provider: tx-sender} (+ current-lp shares-to-mint)))
      
      (print {event: "liquidity-added", market-id: market-id, provider: tx-sender, stx: stx-amount, shares: shares-to-mint})
      (ok shares-to-mint))))

(define-public (remove-liquidity (market-id uint) (shares uint))
  (let ((pool (unwrap! (map-get? liquidity-pools market-id) err-pool-not-found))
        (lp-balance (get-lp-balance market-id tx-sender)))
    (asserts! (<= shares lp-balance) err-insufficient-liquidity)
    
    (let ((stx-to-return (/ (* shares (get stx-balance pool)) (get total-shares pool))))
      (map-set liquidity-pools market-id (merge pool {
        stx-balance: (- (get stx-balance pool) stx-to-return),
        total-shares: (- (get total-shares pool) shares)
      }))
      
      (map-set lp-balances {market-id: market-id, provider: tx-sender} (- lp-balance shares))
      
      (print {event: "liquidity-removed", market-id: market-id, provider: tx-sender, stx: stx-to-return, shares: shares})
      (ok stx-to-return))))

;; Pricing Engine (CPMM - Constant Product Market Maker)

(define-read-only (get-output-amount (input-amount uint) (input-reserve uint) (output-reserve uint))
  (let ((input-with-fee (* input-amount u997))) ;; 0.3% fee
    (let ((numerator (* input-with-fee output-reserve))
          (denominator (+ (* input-reserve u1000) input-with-fee)))
      (/ numerator denominator))))
