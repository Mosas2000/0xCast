;; Governance Token Contract
;; SIP-010 Compliant Fungible Token for 0xCast Governance

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-insufficient-balance (err u102))
(define-constant err-invalid-amount (err u103))

;; Token Configuration
(define-fungible-token cast-token u1000000000) ;; 1 billion tokens max supply

;; Data Variables
(define-data-var token-name (string-ascii 32) "0xCast Governance Token")
(define-data-var token-symbol (string-ascii 10) "CAST")
(define-data-var token-decimals uint u6)
(define-data-var token-uri (optional (string-utf8 256)) none)

;; Data Maps
(define-map token-balances principal uint)
(define-map token-supplies-at-block uint uint)
(define-map delegated-voting-power 
  principal 
  (optional principal))

;; SIP-010 Functions

(define-read-only (get-name)
  (ok (var-get token-name)))

(define-read-only (get-symbol)
  (ok (var-get token-symbol)))

(define-read-only (get-decimals)
  (ok (var-get token-decimals)))

(define-read-only (get-balance (account principal))
  (ok (ft-get-balance cast-token account)))

(define-read-only (get-total-supply)
  (ok (ft-get-supply cast-token)))

(define-read-only (get-token-uri)
  (ok (var-get token-uri)))

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-token-owner)
    (asserts! (> amount u0) err-invalid-amount)
    (try! (ft-transfer? cast-token amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)))

;; Governance-Specific Functions

(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (> amount u0) err-invalid-amount)
    (ft-mint? cast-token amount recipient)))

(define-public (burn (amount uint))
  (begin
    (asserts! (> amount u0) err-invalid-amount)
    (ft-burn? cast-token amount tx-sender)))

;; Voting Power Functions

(define-read-only (get-voting-power (account principal))
  (let ((delegate (unwrap! (map-get? delegated-voting-power account) (ok (ft-get-balance cast-token account)))))
    (if (is-some delegate)
      (ok (ft-get-balance cast-token (unwrap-panic delegate)))
      (ok (ft-get-balance cast-token account)))))

(define-public (delegate-voting-power (delegate principal))
  (begin
    (asserts! (not (is-eq tx-sender delegate)) err-invalid-amount)
    (ok (map-set delegated-voting-power tx-sender (some delegate)))))

(define-public (revoke-delegation)
  (ok (map-delete delegated-voting-power tx-sender)))

(define-read-only (get-delegation (account principal))
  (ok (map-get? delegated-voting-power account)))

;; Historical Balance Tracking (for proposal snapshots)

(define-read-only (get-balance-at-block (account principal) (block-height uint))
  ;; Simplified version - in production, would need more sophisticated tracking
  (ok (ft-get-balance cast-token account)))

;; Initialize
(begin
  ;; Mint initial supply to contract owner
  (try! (ft-mint? cast-token u100000000 contract-owner)) ;; 100M initial supply
  (print {event: "token-deployed", initial-supply: u100000000}))
