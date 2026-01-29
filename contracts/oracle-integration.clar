;; Oracle Integration Contract
;; Handles external data feeds and market resolution verification

(use-trait governance-token-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u300))
(define-constant err-unauthorized-oracle (err u301))
(define-constant err-market-not-found (err u302))
(define-constant err-already-resolved (err u303))
(define-constant err-invalid-result (err u304))
(define-constant err-dispute-period-expired (err u305))
(define-constant err-dispute-active (err u306))

;; Oracle Settings
(define-data-var dispute-period uint u144) ;; ~24 hours in blocks
(define-data-var oracle-fee uint u5000000) ;; 5 STX fee for resolution

;; Data Maps
(define-map registered-oracles principal bool)
(define-map market-resolutions
  uint
  {
    oracle: principal,
    result: uint,
    resolved-at: uint,
    disputed: bool,
    dispute-end: uint
  })

(define-map oracle-stats
  principal
  {
    total-resolutions: uint,
    successful-resolutions: uint,
    disputed-resolutions: uint
  })

;; Read-Only Functions

(define-read-only (is-registered-oracle (oracle principal))
  (default-to false (map-get? registered-oracles oracle)))

(define-read-only (get-market-resolution (market-id uint))
  (map-get? market-resolutions market-id))

(define-read-only (get-oracle-stats (oracle principal))
  (default-to 
    {total-resolutions: u0, successful-resolutions: u0, disputed-resolutions: u0}
    (map-get? oracle-stats oracle)))

;; Public Functions

(define-public (register-oracle (oracle principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set registered-oracles oracle true))))

(define-public (remove-oracle (oracle principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-delete registered-oracles oracle))))

(define-public (submit-resolution (market-id uint) (result uint))
  (let ((oracle tx-sender))
    (asserts! (is-registered-oracle oracle) err-unauthorized-oracle)
    (asserts! (is-none (map-get? market-resolutions market-id)) err-already-resolved)
    
    ;; Record resolution with dispute period
    (map-set market-resolutions market-id {
      oracle: oracle,
      result: result,
      resolved-at: block-height,
      disputed: false,
      dispute-end: (+ block-height (var-get dispute-period))
    })
    
    ;; Update oracle stats
    (let ((stats (get-oracle-stats oracle)))
      (map-set oracle-stats oracle (merge stats {
        total-resolutions: (+ (get total-resolutions stats) u1)
      })))
    
    (print {event: "resolution-submitted", market-id: market-id, result: result, oracle: oracle})
    (ok true)))

(define-public (dispute-resolution (market-id uint))
  (let ((resolution (unwrap! (map-get? market-resolutions market-id) err-market-not-found)))
    (asserts! (<= block-height (get dispute-end resolution)) err-dispute-period-expired)
    (asserts! (not (get disputed resolution)) err-dispute-active)
    
    (map-set market-resolutions market-id (merge resolution {disputed: true}))
    
    ;; Update oracle stats
    (let ((oracle (get oracle resolution))
          (stats (get-oracle-stats oracle)))
      (map-set oracle-stats oracle (merge stats {
        disputed-resolutions: (+ (get disputed-resolutions stats) u1)
      })))
    
    (print {event: "resolution-disputed", market-id: market-id, oracle: (get oracle resolution)})
    (ok true)))

(define-public (resolve-dispute (market-id uint) (final-result uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (let ((resolution (unwrap! (map-get? market-resolutions market-id) err-market-not-found)))
      (map-set market-resolutions market-id (merge resolution {
        result: final-result,
        disputed: false,
        dispute-end: block-height ;; End dispute period immediately
      }))
      
      (print {event: "dispute-resolved", market-id: market-id, final-result: final-result})
      (ok true))))

;; Admin Functions

(define-public (set-dispute-period (new-period uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (var-set dispute-period new-period))))

(define-public (set-oracle-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (var-set oracle-fee new-fee))))
