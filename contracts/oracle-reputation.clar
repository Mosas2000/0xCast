;; Oracle Reputation Contract
;; Tracks and rewards oracle performance in the 0xCast ecosystem

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u400))
(define-constant err-oracle-not-found (err u401))

;; Reputation Parameters
(define-data-var base-reputation uint u100)
(define-data-var success-bonus uint u10)
(define-data-var dispute-penalty uint u50)

;; Data Maps
(define-map oracle-reputation
  principal
  {
    score: uint,
    reliability: uint, ;; Percentage 0-100
    last-update: uint
  })

;; Read-Only Functions

(define-read-only (get-reputation (oracle principal))
  (default-to 
    {score: (var-get base-reputation), reliability: u100, last-update: block-height}
    (map-get? oracle-reputation oracle)))

;; Public Functions

(define-public (update-reputation (oracle principal) (success bool))
  (begin
    ;; Only called by oracle-integration or owner
    ;; In production, add authorization check
    (let ((current (get-reputation oracle)))
      (let ((new-score (if success 
                        (+ (get score current) (var-get success-bonus))
                        (if (> (get score current) (var-get dispute-penalty))
                          (- (get score current) (var-get dispute-penalty))
                          u0))))
        (map-set oracle-reputation oracle {
          score: new-score,
          reliability: (if success u100 u50), ;; Simplified reliability logic
          last-update: block-height
        })
        (ok true)))))

;; Admin Functions

(define-public (set-reputation-params (bonus uint) (penalty uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set success-bonus bonus)
    (var-set dispute-penalty penalty)
    (ok true)))
