(define-constant ERR-NOT-AUTHORIZED (err u2000))
(define-constant ERR-MIGRATION-EXISTS (err u2001))
(define-constant ERR-MIGRATION-NOT-FOUND (err u2002))
(define-constant ERR-MIGRATION-FAILED (err u2003))
(define-constant ERR-INVALID-VERSION (err u2004))
(define-constant ERR-ALREADY-EXECUTED (err u2005))

(define-data-var contract-owner principal tx-sender)
(define-data-var current-version uint u1)

(define-map migrations
  uint
  {
    version: uint,
    description: (string-utf8 256),
    executed: bool,
    executed-at: (optional uint),
    executed-by: (optional principal),
    rollback-available: bool
  }
)

(define-map migration-data
  uint
  {
    data-hash: (buff 32),
    data-size: uint
  }
)

(define-data-var migration-count uint u0)

(define-read-only (get-current-version)
  (ok (var-get current-version))
)

(define-read-only (get-migration (migration-id uint))
  (ok (map-get? migrations migration-id))
)

(define-read-only (get-migration-data (migration-id uint))
  (ok (map-get? migration-data migration-id))
)

(define-read-only (get-migration-count)
  (ok (var-get migration-count))
)

(define-read-only (is-migration-executed (migration-id uint))
  (match (map-get? migrations migration-id)
    migration (ok (get executed migration))
    (ok false)
  )
)

(define-public (register-migration 
  (version uint)
  (description (string-utf8 256))
  (data-hash (buff 32))
  (data-size uint)
  (rollback-available bool)
)
  (let
    (
      (migration-id (var-get migration-count))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    (asserts! (> version (var-get current-version)) ERR-INVALID-VERSION)
    (asserts! (is-none (map-get? migrations migration-id)) ERR-MIGRATION-EXISTS)
    
    (map-set migrations migration-id {
      version: version,
      description: description,
      executed: false,
      executed-at: none,
      executed-by: none,
      rollback-available: rollback-available
    })
    
    (map-set migration-data migration-id {
      data-hash: data-hash,
      data-size: data-size
    })
    
    (var-set migration-count (+ migration-id u1))
    
    (ok migration-id)
  )
)

(define-public (execute-migration (migration-id uint))
  (let
    (
      (migration (unwrap! (map-get? migrations migration-id) ERR-MIGRATION-NOT-FOUND))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    (asserts! (not (get executed migration)) ERR-ALREADY-EXECUTED)
    
    (map-set migrations migration-id (merge migration {
      executed: true,
      executed-at: (some block-height),
      executed-by: (some tx-sender)
    }))
    
    (var-set current-version (get version migration))
    
    (ok true)
  )
)

(define-public (rollback-migration (migration-id uint) (target-version uint))
  (let
    (
      (migration (unwrap! (map-get? migrations migration-id) ERR-MIGRATION-NOT-FOUND))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    (asserts! (get executed migration) ERR-MIGRATION-NOT-FOUND)
    (asserts! (get rollback-available migration) ERR-MIGRATION-FAILED)
    (asserts! (< target-version (var-get current-version)) ERR-INVALID-VERSION)
    
    (var-set current-version target-version)
    
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
