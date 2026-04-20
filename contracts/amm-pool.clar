(define-trait pool-trait
  (
    (swap (uint uint) (response uint uint))
    (add-liquidity (uint uint) (response uint uint))
    (remove-liquidity (uint) (response (tuple (a uint) (b uint)) uint))
  )
)

(define-constant ERR-INVALID-AMOUNT (err u1001))
(define-constant ERR-INSUFFICIENT-LIQUIDITY (err u1002))
(define-constant ERR-SLIPPAGE-EXCEEDED (err u1003))
(define-constant ERR-INVALID-POOL (err u1004))
(define-constant ERR-ZERO-DIVISION (err u1005))

(define-data-var pool-counter uint u0)

(define-map pools uint {
  id: uint,
  token-a: principal,
  token-b: principal,
  reserve-a: uint,
  reserve-b: uint,
  fee: uint,
  total-liquidity: uint,
  model: (string-ascii 20),
})

(define-map liquidity-positions {pool-id: uint, user: principal} uint)

(define-map swap-records {pool-id: uint, user: principal, index: uint} {
  amount-in: uint,
  amount-out: uint,
  timestamp: uint,
  fee: uint,
})

(define-read-only (get-pool (pool-id uint))
  (map-get? pools pool-id)
)

(define-read-only (get-user-liquidity (pool-id uint) (user principal))
  (default-to u0 (map-get? liquidity-positions {pool-id: pool-id, user: user}))
)

(define-private (calculate-constant-product-output (amount-in uint) (reserve-a uint) (reserve-b uint))
  (let (
    (invariant (* reserve-a reserve-b))
    (new-reserve-a (+ reserve-a amount-in))
    (new-reserve-b (if (> new-reserve-a u0) (/ invariant new-reserve-a) u0))
    (output (if (> reserve-b new-reserve-b)
      (- reserve-b new-reserve-b)
      u0
    ))
  )
    output
  )
)

(define-private (calculate-fee (amount-in uint) (fee-bps uint))
  (/ (* amount-in fee-bps) u100000)
)

(define-public (create-pool 
  (token-a principal)
  (token-b principal)
  (initial-reserve-a uint)
  (initial-reserve-b uint)
  (fee uint)
  (model (string-ascii 20))
)
  (let (
    (pool-id (+ (var-get pool-counter) u1))
    (initial-liquidity (if (> initial-reserve-a u0)
      (if (> initial-reserve-b u0)
        (let (
          (product (* initial-reserve-a initial-reserve-b))
        )
          (if (> product u0)
            (/ product (+ initial-reserve-a initial-reserve-b))
            u0
          )
        )
        u0
      )
      u0
    ))
  )
    (asserts! (and (> initial-reserve-a u0) (> initial-reserve-b u0)) (err u1))
    (asserts! (and (>= fee u0) (<= fee u100000)) (err u2))
    
    (map-set pools pool-id {
      id: pool-id,
      token-a: token-a,
      token-b: token-b,
      reserve-a: initial-reserve-a,
      reserve-b: initial-reserve-b,
      fee: fee,
      total-liquidity: initial-liquidity,
      model: model,
    })
    
    (var-set pool-counter pool-id)
    (ok pool-id)
  )
)

(define-public (quote-swap (pool-id uint) (amount-in uint) (token-a-to-b bool))
  (let (
    (pool (map-get? pools pool-id))
  )
    (match pool
      pool-data
      (let (
        (reserve-a (get reserve-a pool-data))
        (reserve-b (get reserve-b pool-data))
        (fee-amount (calculate-fee amount-in (get fee pool-data)))
        (amount-after-fee (- amount-in fee-amount))
        (output (if token-a-to-b
          (calculate-constant-product-output amount-after-fee reserve-a reserve-b)
          (calculate-constant-product-output amount-after-fee reserve-b reserve-a)
        ))
      )
        (ok {
          amount-in: amount-in,
          amount-out: output,
          fee: fee-amount,
        })
      )
      ERR-INVALID-POOL
    )
  )
)

(define-public (execute-swap 
  (pool-id uint)
  (amount-in uint)
  (min-output uint)
  (token-a-to-b bool)
)
  (let (
    (pool (map-get? pools pool-id))
    (quote-result (quote-swap pool-id amount-in token-a-to-b))
  )
    (match quote-result
      quote-data
      (match pool
        pool-data
        (let (
          (output (get amount-out quote-data))
          (fee (get fee quote-data))
          (new-reserve-a (if token-a-to-b
            (+ (get reserve-a pool-data) (- amount-in fee))
            (- (get reserve-a pool-data) output)
          ))
          (new-reserve-b (if token-a-to-b
            (- (get reserve-b pool-data) output)
            (+ (get reserve-b pool-data) (- amount-in fee))
          ))
        )
          (asserts! (>= output min-output) ERR-SLIPPAGE-EXCEEDED)
          
          (map-set pools pool-id (merge pool-data {
            reserve-a: new-reserve-a,
            reserve-b: new-reserve-b,
          }))
          
          (ok output)
        )
        ERR-INVALID-POOL
      )
      (err (get err quote-result))
    )
  )
)

(define-public (add-liquidity 
  (pool-id uint)
  (amount-a uint)
  (amount-b uint)
)
  (let (
    (pool (map-get? pools pool-id))
  )
    (match pool
      pool-data
      (let (
        (reserve-a (get reserve-a pool-data))
        (reserve-b (get reserve-b pool-data))
        (total-supply (get total-liquidity pool-data))
        (liquidity-a (if (> total-supply u0)
          (/ (* amount-a total-supply) reserve-a)
          amount-a
        ))
        (liquidity-b (if (> total-supply u0)
          (/ (* amount-b total-supply) reserve-b)
          amount-b
        ))
        (liquidity-minted (if (< liquidity-a liquidity-b) liquidity-a liquidity-b))
      )
        (asserts! (and (> amount-a u0) (> amount-b u0)) ERR-INVALID-AMOUNT)
        
        (map-set pools pool-id (merge pool-data {
          reserve-a: (+ reserve-a amount-a),
          reserve-b: (+ reserve-b amount-b),
          total-liquidity: (+ total-supply liquidity-minted),
        }))
        
        (map-set liquidity-positions
          {pool-id: pool-id, user: tx-sender}
          (+ (get-user-liquidity pool-id tx-sender) liquidity-minted)
        )
        
        (ok liquidity-minted)
      )
      ERR-INVALID-POOL
    )
  )
)

(define-public (remove-liquidity 
  (pool-id uint)
  (liquidity-to-remove uint)
)
  (let (
    (pool (map-get? pools pool-id))
    (user-liquidity (get-user-liquidity pool-id tx-sender))
  )
    (match pool
      pool-data
      (let (
        (total-supply (get total-liquidity pool-data))
        (reserve-a (get reserve-a pool-data))
        (reserve-b (get reserve-b pool-data))
        (amount-a (/ (* liquidity-to-remove reserve-a) total-supply))
        (amount-b (/ (* liquidity-to-remove reserve-b) total-supply))
      )
        (asserts! (>= user-liquidity liquidity-to-remove) ERR-INSUFFICIENT-LIQUIDITY)
        
        (map-set pools pool-id (merge pool-data {
          reserve-a: (- reserve-a amount-a),
          reserve-b: (- reserve-b amount-b),
          total-liquidity: (- total-supply liquidity-to-remove),
        }))
        
        (map-set liquidity-positions
          {pool-id: pool-id, user: tx-sender}
          (- user-liquidity liquidity-to-remove)
        )
        
        (ok {a: amount-a, b: amount-b})
      )
      ERR-INVALID-POOL
    )
  )
)

(define-read-only (get-pool-stats (pool-id uint))
  (match (get-pool pool-id)
    pool-data
    (ok {
      id: (get id pool-data),
      reserve-a: (get reserve-a pool-data),
      reserve-b: (get reserve-b pool-data),
      fee: (get fee pool-data),
      total-liquidity: (get total-liquidity pool-data),
      model: (get model pool-data),
    })
    ERR-INVALID-POOL
  )
)
