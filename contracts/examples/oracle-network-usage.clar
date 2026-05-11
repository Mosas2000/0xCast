;; Oracle Network Usage Examples
;; Demonstrates how to use the enhanced oracle integration contract

;; Example 1: Register multiple oracle providers
(define-public (setup-oracle-network)
  (begin
    ;; Register Chainlink oracle
    (try! (contract-call? .oracle-integration register-oracle-provider
      'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7
      "Chainlink"
      "https://api.chainlink.com/btc-usd"
      u100))
    
    ;; Register Coinbase oracle
    (try! (contract-call? .oracle-integration register-oracle-provider
      'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ8
      "Coinbase"
      "https://api.coinbase.com/v2/prices/BTC-USD"
      u90))
    
    ;; Register Binance oracle
    (try! (contract-call? .oracle-integration register-oracle-provider
      'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ9
      "Binance"
      "https://api.binance.com/api/v3/ticker/price"
      u85))
    
    (ok true)))

;; Example 2: Submit prices for consensus
(define-public (submit-consensus-prices (market-id uint))
  (begin
    ;; Each oracle submits their price
    ;; Oracle 1 submits
    (try! (contract-call? .oracle-integration submit-price-for-consensus
      market-id
      u50000)) ;; $50,000
    
    ;; Oracle 2 submits
    (try! (contract-call? .oracle-integration submit-price-for-consensus
      market-id
      u50100)) ;; $50,100
    
    ;; Oracle 3 submits
    (try! (contract-call? .oracle-integration submit-price-for-consensus
      market-id
      u49900)) ;; $49,900
    
    ;; Check consensus state
    (ok (contract-call? .oracle-integration get-consensus-state market-id))))

;; Example 3: Configure oracle source for a market
(define-public (configure-market-oracle (market-id uint))
  (begin
    (try! (contract-call? .oracle-integration configure-oracle-source
      market-id
      "price-feed"
      "https://api.example.com/btc-usd"
      u50000)) ;; Threshold price
    
    (ok true)))

;; Example 4: Update oracle provider priority
(define-public (adjust-provider-priority (oracle principal) (new-priority uint))
  (begin
    (try! (contract-call? .oracle-integration update-oracle-priority
      oracle
      new-priority))
    
    (ok true)))

;; Example 5: Disable underperforming oracle
(define-public (disable-bad-oracle (oracle principal))
  (begin
    (try! (contract-call? .oracle-integration disable-oracle-provider oracle))
    (ok true)))

;; Example 6: Re-enable recovered oracle
(define-public (enable-recovered-oracle (oracle principal))
  (begin
    (try! (contract-call? .oracle-integration enable-oracle-provider oracle))
    (ok true)))

;; Example 7: Check oracle provider details
(define-read-only (get-provider-info (oracle principal))
  (contract-call? .oracle-integration get-oracle-provider oracle))

;; Example 8: Check consensus status for market
(define-read-only (check-market-consensus (market-id uint))
  (let ((consensus (contract-call? .oracle-integration get-consensus-state market-id)))
    (match consensus
      state (ok {
        submissions: (get submission-count state),
        total-weight: (get total-weight state),
        consensus-reached: (get consensus-reached state),
        final-price: (get final-price state)
      })
      (err u404))))

;; Example 9: Get price submission from specific oracle
(define-read-only (get-oracle-submission (market-id uint) (oracle principal))
  (contract-call? .oracle-integration get-price-submission market-id oracle))

;; Example 10: Complete workflow - setup and resolve market
(define-public (complete-oracle-workflow (market-id uint))
  (begin
    ;; Step 1: Setup oracle network
    (try! (setup-oracle-network))
    
    ;; Step 2: Configure market oracle
    (try! (configure-market-oracle market-id))
    
    ;; Step 3: Submit prices for consensus
    (try! (submit-consensus-prices market-id))
    
    ;; Step 4: Check if consensus reached
    (let ((consensus (unwrap! (contract-call? .oracle-integration get-consensus-state market-id) (err u500))))
      (if (get consensus-reached consensus)
        (ok {
          success: true,
          final-price: (get final-price consensus),
          submissions: (get submission-count consensus)
        })
        (err u501)))))

;; Example 11: Monitor oracle health
(define-read-only (get-oracle-health-report (oracle principal))
  (let ((stats (contract-call? .oracle-integration get-oracle-stats oracle)))
    (ok {
      total-resolutions: (get total-resolutions stats),
      successful: (get successful-resolutions stats),
      disputed: (get disputed-resolutions stats),
      success-rate: (if (> (get total-resolutions stats) u0)
        (/ (* (get successful-resolutions stats) u100) (get total-resolutions stats))
        u100)
    })))

;; Example 12: Batch update oracle priorities
(define-public (update-all-priorities)
  (begin
    (try! (contract-call? .oracle-integration update-oracle-priority
      'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7
      u100))
    
    (try! (contract-call? .oracle-integration update-oracle-priority
      'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ8
      u95))
    
    (try! (contract-call? .oracle-integration update-oracle-priority
      'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ9
      u90))
    
    (ok true)))
