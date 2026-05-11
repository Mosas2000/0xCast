(define-constant ERR-NOT-AUTHORIZED (err u3000))
(define-constant ERR-SNAPSHOT-EXISTS (err u3001))
(define-constant ERR-SNAPSHOT-NOT-FOUND (err u3002))
(define-constant ERR-INVALID-SNAPSHOT (err u3003))

(define-data-var contract-owner principal tx-sender)

(define-map snapshots
  uint
  {
    created-at: uint,
    created-by: principal,
    state-hash: (buff 32),
    data-size: uint,
    description: (string-utf8 256),
    verified: bool
  }
)

(define-data-var snapshot-count uint u0)

(define-read-only (get-snapshot (snapshot-id uint))
  (ok (map-get? snapshots snapshot-id))
)

(define-read-only (get-snapshot-count)
  (ok (var-get snapshot-count))
)

(define-public (create-snapshot 
  (state-hash (buff 32))
  (data-size uint)
  (description (string-utf8 256))
)
  (let
    (
      (snapshot-id (var-get snapshot-count))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    
    (map-set snapshots snapshot-id {
      created-at: block-height,
      created-by: tx-sender,
      state-hash: state-hash,
      data-size: data-size,
      description: description,
      verified: false
    })
    
    (var-set snapshot-count (+ snapshot-id u1))
    
    (ok snapshot-id)
  )
)

(define-public (verify-snapshot (snapshot-id uint))
  (let
    (
      (snapshot (unwrap! (map-get? snapshots snapshot-id) ERR-SNAPSHOT-NOT-FOUND))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    
    (map-set snapshots snapshot-id (merge snapshot {
      verified: true
    }))
    
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
