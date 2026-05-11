(define-constant ERR-NOT-AUTHORIZED (err u1000))
(define-constant ERR-INVALID-IMPLEMENTATION (err u1001))
(define-constant ERR-UPGRADE-IN-PROGRESS (err u1002))
(define-constant ERR-NO-UPGRADE-PENDING (err u1003))
(define-constant ERR-TIMELOCK-NOT-EXPIRED (err u1004))

(define-data-var contract-owner principal tx-sender)
(define-data-var implementation-address principal tx-sender)
(define-data-var pending-implementation (optional principal) none)
(define-data-var upgrade-timelock uint u144)
(define-data-var upgrade-initiated-at (optional uint) none)

(define-map upgrade-history
  uint
  {
    from-implementation: principal,
    to-implementation: principal,
    upgraded-at: uint,
    upgraded-by: principal
  }
)

(define-data-var upgrade-count uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-implementation)
  (ok (var-get implementation-address))
)

(define-read-only (get-pending-implementation)
  (ok (var-get pending-implementation))
)

(define-read-only (get-upgrade-timelock)
  (ok (var-get upgrade-timelock))
)

(define-read-only (get-upgrade-history (upgrade-id uint))
  (ok (map-get? upgrade-history upgrade-id))
)

(define-read-only (get-upgrade-count)
  (ok (var-get upgrade-count))
)

(define-public (propose-upgrade (new-implementation principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    (asserts! (is-none (var-get pending-implementation)) ERR-UPGRADE-IN-PROGRESS)
    (asserts! (not (is-eq new-implementation (var-get implementation-address))) ERR-INVALID-IMPLEMENTATION)
    
    (var-set pending-implementation (some new-implementation))
    (var-set upgrade-initiated-at (some block-height))
    
    (ok true)
  )
)

(define-public (execute-upgrade)
  (let
    (
      (pending (var-get pending-implementation))
      (initiated-at (var-get upgrade-initiated-at))
      (current-impl (var-get implementation-address))
      (count (var-get upgrade-count))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    (asserts! (is-some pending) ERR-NO-UPGRADE-PENDING)
    (asserts! (is-some initiated-at) ERR-NO-UPGRADE-PENDING)
    
    (asserts! 
      (>= block-height (+ (unwrap-panic initiated-at) (var-get upgrade-timelock)))
      ERR-TIMELOCK-NOT-EXPIRED
    )
    
    (map-set upgrade-history count {
      from-implementation: current-impl,
      to-implementation: (unwrap-panic pending),
      upgraded-at: block-height,
      upgraded-by: tx-sender
    })
    
    (var-set implementation-address (unwrap-panic pending))
    (var-set pending-implementation none)
    (var-set upgrade-initiated-at none)
    (var-set upgrade-count (+ count u1))
    
    (ok true)
  )
)

(define-public (cancel-upgrade)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    (asserts! (is-some (var-get pending-implementation)) ERR-NO-UPGRADE-PENDING)
    
    (var-set pending-implementation none)
    (var-set upgrade-initiated-at none)
    
    (ok true)
  )
)

(define-public (set-upgrade-timelock (new-timelock uint))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    (var-set upgrade-timelock new-timelock)
    (ok true)
  )
)

(define-public (transfer-ownership (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    (var-set contract-owner new-owner)
    (ok true)
  )
)
