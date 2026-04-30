;; Rate Limiter Contract
;; Implements on-chain rate limiting for contract transactions

(define-constant ERR_RATE_LIMIT_EXCEEDED (err u1001))
(define-constant ERR_UNAUTHORIZED (err u1002))
(define-constant ERR_INVALID_ACTION (err u1003))

(define-constant CONTRACT_OWNER tx-sender)

(define-map rate-limits
  { user: principal, action: (string-ascii 32) }
  { 
    count: uint,
    window-start: uint,
    blocked-until: uint
  }
)

(define-map rate-limit-configs
  (string-ascii 32)
  {
    max-requests: uint,
    window-blocks: uint,
    cooldown-blocks: uint
  }
)

(define-data-var paused bool false)

(define-read-only (get-rate-limit (user principal) (action (string-ascii 32)))
  (default-to 
    { count: u0, window-start: block-height, blocked-until: u0 }
    (map-get? rate-limits { user: user, action: action })
  )
)

(define-read-only (get-config (action (string-ascii 32)))
  (map-get? rate-limit-configs action)
)

(define-read-only (is-blocked (user principal) (action (string-ascii 32)))
  (let (
    (limit-data (get-rate-limit user action))
  )
    (> (get blocked-until limit-data) block-height)
  )
)

(define-read-only (get-remaining (user principal) (action (string-ascii 32)))
  (let (
    (limit-data (get-rate-limit user action))
    (config (unwrap! (get-config action) (ok u0)))
    (window-start (get window-start limit-data))
    (count (get count limit-data))
  )
    (if (> (- block-height window-start) (get window-blocks config))
      (ok (get max-requests config))
      (ok (if (>= count (get max-requests config))
        u0
        (- (get max-requests config) count)
      ))
    )
  )
)

(define-public (check-and-record (action (string-ascii 32)))
  (let (
    (user tx-sender)
    (config (unwrap! (get-config action) ERR_INVALID_ACTION))
    (limit-data (get-rate-limit user action))
    (window-start (get window-start limit-data))
    (count (get count limit-data))
    (blocked-until (get blocked-until limit-data))
  )
    (asserts! (not (var-get paused)) ERR_UNAUTHORIZED)
    (asserts! (<= blocked-until block-height) ERR_RATE_LIMIT_EXCEEDED)
    
    (if (> (- block-height window-start) (get window-blocks config))
      (begin
        (map-set rate-limits
          { user: user, action: action }
          { 
            count: u1,
            window-start: block-height,
            blocked-until: u0
          }
        )
        (ok true)
      )
      (if (>= count (get max-requests config))
        (begin
          (map-set rate-limits
            { user: user, action: action }
            { 
              count: count,
              window-start: window-start,
              blocked-until: (+ block-height (get cooldown-blocks config))
            }
          )
          ERR_RATE_LIMIT_EXCEEDED
        )
        (begin
          (map-set rate-limits
            { user: user, action: action }
            { 
              count: (+ count u1),
              window-start: window-start,
              blocked-until: u0
            }
          )
          (ok true)
        )
      )
    )
  )
)

(define-public (set-config (action (string-ascii 32)) (max-requests uint) (window-blocks uint) (cooldown-blocks uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (ok (map-set rate-limit-configs action {
      max-requests: max-requests,
      window-blocks: window-blocks,
      cooldown-blocks: cooldown-blocks
    }))
  )
)

(define-public (reset-user-limit (user principal) (action (string-ascii 32)))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (ok (map-delete rate-limits { user: user, action: action }))
  )
)

(define-public (set-paused (new-paused bool))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (ok (var-set paused new-paused))
  )
)

(define-read-only (is-paused)
  (ok (var-get paused))
)

(map-set rate-limit-configs "stake" { max-requests: u10, window-blocks: u6, cooldown-blocks: u1 })
(map-set rate-limit-configs "create-market" { max-requests: u5, window-blocks: u30, cooldown-blocks: u6 })
(map-set rate-limit-configs "resolve-market" { max-requests: u3, window-blocks: u6, cooldown-blocks: u1 })
(map-set rate-limit-configs "add-liquidity" { max-requests: u10, window-blocks: u6, cooldown-blocks: u1 })
(map-set rate-limit-configs "remove-liquidity" { max-requests: u10, window-blocks: u6, cooldown-blocks: u1 })
(map-set rate-limit-configs "vote" { max-requests: u20, window-blocks: u6, cooldown-blocks: u1 })
(map-set rate-limit-configs "claim-rewards" { max-requests: u5, window-blocks: u30, cooldown-blocks: u3 })
(map-set rate-limit-configs "dispute" { max-requests: u2, window-blocks: u30, cooldown-blocks: u6 })
(map-set rate-limit-configs "trade" { max-requests: u20, window-blocks: u6, cooldown-blocks: u1 })
