;; oracle-integration.clar
;; Handles oracle data feeds, dispute mechanism, and automated resolution

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u300))
(define-constant err-unauthorized-oracle (err u301))
(define-constant err-market-not-found (err u302))
(define-constant err-already-resolved (err u303))
(define-constant err-invalid-result (err u304))
(define-constant err-dispute-period-expired (err u305))
(define-constant err-dispute-active (err u306))
(define-constant err-insufficient-stake (err u307))
(define-constant err-already-disputed (err u308))
(define-constant err-no-dispute (err u309))
(define-constant err-already-voted (err u310))
(define-constant err-voting-closed (err u311))
(define-constant err-dispute-not-resolved (err u312))
(define-constant err-invalid-price (err u313))
(define-constant err-oracle-not-configured (err u314))
(define-constant err-dispute-period-active (err u315))

(define-constant DISPUTE-STATUS-ACTIVE u0)
(define-constant DISPUTE-STATUS-UPHELD u1)
(define-constant DISPUTE-STATUS-REJECTED u2)

(define-constant VOTE-YES u1)
(define-constant VOTE-NO u2)

;; Settings
(define-data-var dispute-period uint u144) ;; ~24 hours in blocks
(define-data-var voting-period uint u288) ;; ~48 hours in blocks
(define-data-var min-dispute-stake uint u5000000) ;; 5 STX minimum to dispute
(define-data-var dispute-quorum uint u3) ;; minimum votes needed
(define-data-var oracle-fee uint u5000000)
(define-data-var dispute-counter uint u0)
(define-data-var slashed-balance uint u0)

;; Oracle Registry
(define-map registered-oracles principal bool)

;; Oracle stats
(define-map oracle-stats
  principal
  {
    total-resolutions: uint,
    successful-resolutions: uint,
    disputed-resolutions: uint
  })

;; Oracle configuration per market
(define-map oracle-sources
  { market-id: uint }
  {
    oracle-type: (string-ascii 20),
    data-feed: (string-ascii 100),
    threshold-price: uint,
    configured: bool
  })

;; Price feed data submitted by oracles
(define-map price-feeds
  { market-id: uint }
  {
    price: uint,
    timestamp: uint,
    oracle: principal,
    confirmed: bool
  })

;; Market resolution records
(define-map market-resolutions
  uint
  {
    oracle: principal,
    result: uint,
    resolved-at: uint,
    finalized: bool,
    dispute-end: uint
  })

;; Disputes
(define-map disputes
  { market-id: uint }
  {
    dispute-id: uint,
    disputer: principal,
    stake: uint,
    reason: (string-utf8 256),
    status: uint,
    created-at: uint,
    voting-end: uint,
    yes-votes: uint,
    no-votes: uint,
    total-voters: uint
  })

;; Individual votes on disputes
(define-map dispute-votes
  { market-id: uint, voter: principal }
  { vote: uint, weight: uint })

;; Read-Only Functions

(define-read-only (is-registered-oracle (oracle principal))
  (default-to false (map-get? registered-oracles oracle)))

(define-read-only (get-market-resolution (market-id uint))
  (map-get? market-resolutions market-id))

(define-read-only (get-oracle-stats (oracle principal))
  (default-to
    {total-resolutions: u0, successful-resolutions: u0, disputed-resolutions: u0}
    (map-get? oracle-stats oracle)))

(define-read-only (get-oracle-source (market-id uint))
  (map-get? oracle-sources { market-id: market-id }))

(define-read-only (get-price-feed (market-id uint))
  (map-get? price-feeds { market-id: market-id }))

(define-read-only (get-dispute (market-id uint))
  (map-get? disputes { market-id: market-id }))

(define-read-only (get-dispute-vote (market-id uint) (voter principal))
  (map-get? dispute-votes { market-id: market-id, voter: voter }))

(define-read-only (get-dispute-period)
  (var-get dispute-period))

(define-read-only (get-voting-period)
  (var-get voting-period))

(define-read-only (get-min-dispute-stake)
  (var-get min-dispute-stake))

(define-read-only (get-dispute-counter)
  (var-get dispute-counter))

(define-read-only (get-slashed-balance)
  (var-get slashed-balance))

(define-read-only (is-resolution-finalized (market-id uint))
  (match (map-get? market-resolutions market-id)
    resolution (get finalized resolution)
    false))

(define-read-only (is-in-dispute-period (market-id uint))
  (match (map-get? market-resolutions market-id)
    resolution (and
      (not (get finalized resolution))
      (<= stacks-block-height (get dispute-end resolution)))
    false))

;; Oracle Management

(define-public (register-oracle (oracle principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set registered-oracles oracle true))))

(define-public (remove-oracle (oracle principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-delete registered-oracles oracle))))

;; Oracle Source Configuration

(define-public (configure-oracle-source
    (market-id uint)
    (oracle-type (string-ascii 20))
    (data-feed (string-ascii 100))
    (threshold-price uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set oracle-sources
      { market-id: market-id }
      {
        oracle-type: oracle-type,
        data-feed: data-feed,
        threshold-price: threshold-price,
        configured: true
      }))))

;; Price Feed Submission

(define-public (submit-price-feed (market-id uint) (price uint))
  (let ((oracle tx-sender))
    (asserts! (is-registered-oracle oracle) err-unauthorized-oracle)
    (asserts! (> price u0) err-invalid-price)
    (asserts! (is-some (map-get? oracle-sources { market-id: market-id })) err-oracle-not-configured)
    (map-set price-feeds
      { market-id: market-id }
      {
        price: price,
        timestamp: stacks-block-height,
        oracle: oracle,
        confirmed: true
      })
    (print {event: "price-feed-submitted", market-id: market-id, price: price, oracle: oracle})
    (ok true)))

;; Resolution Submission

(define-public (submit-resolution (market-id uint) (result uint))
  (let ((oracle tx-sender))
    (asserts! (is-registered-oracle oracle) err-unauthorized-oracle)
    (asserts! (contract-call? .market-core market-exists market-id) err-market-not-found)
    (asserts! (is-none (map-get? market-resolutions market-id)) err-already-resolved)
    (asserts! (or (is-eq result u1) (is-eq result u2)) err-invalid-result)

    (try! (contract-call? .market-core oracle-resolve market-id result))
    (map-set market-resolutions market-id {
      oracle: oracle,
      result: result,
      resolved-at: stacks-block-height,
      finalized: false,
      dispute-end: (+ stacks-block-height (var-get dispute-period))
    })
    (let ((stats (get-oracle-stats oracle)))
      (map-set oracle-stats oracle (merge stats {
        total-resolutions: (+ (get total-resolutions stats) u1)
      })))
    (print {event: "resolution-submitted", market-id: market-id, result: result, oracle: oracle})
    (ok true)))

;; Auto-resolve using price feed data
(define-public (auto-resolve-with-oracle (market-id uint))
  (let (
    (oracle tx-sender)
    (source (unwrap! (map-get? oracle-sources { market-id: market-id }) err-oracle-not-configured))
    (feed (unwrap! (map-get? price-feeds { market-id: market-id }) err-market-not-found))
  )
    (asserts! (is-registered-oracle oracle) err-unauthorized-oracle)
    (asserts! (contract-call? .market-core market-exists market-id) err-market-not-found)
    (asserts! (is-none (map-get? market-resolutions market-id)) err-already-resolved)
    (asserts! (get confirmed feed) err-invalid-price)
    (let ((result (if (>= (get price feed) (get threshold-price source)) u1 u2)))
      (try! (contract-call? .market-core oracle-resolve market-id result))
      (map-set market-resolutions market-id {
        oracle: oracle,
        result: result,
        resolved-at: stacks-block-height,
        finalized: false,
        dispute-end: (+ stacks-block-height (var-get dispute-period))
      })
      (let ((stats (get-oracle-stats oracle)))
        (map-set oracle-stats oracle (merge stats {
          total-resolutions: (+ (get total-resolutions stats) u1)
        })))
      (print {event: "auto-resolved", market-id: market-id, result: result, price: (get price feed)})
      (ok result))))

;; Finalize a resolution after dispute period passes without dispute
(define-public (finalize-resolution (market-id uint))
  (let ((resolution (unwrap! (map-get? market-resolutions market-id) err-market-not-found)))
    (asserts! (not (get finalized resolution)) err-already-resolved)
    (asserts! (> stacks-block-height (get dispute-end resolution)) err-dispute-period-active)
    (asserts! (is-none (map-get? disputes { market-id: market-id })) err-dispute-active)
    (map-set market-resolutions market-id (merge resolution { finalized: true }))

    (try! (contract-call? .market-core finalize-market market-id))
    (let ((oracle (get oracle resolution))
          (stats (get-oracle-stats oracle)))
      (map-set oracle-stats oracle (merge stats {
        successful-resolutions: (+ (get successful-resolutions stats) u1)
      })))
    (print {event: "resolution-finalized", market-id: market-id, result: (get result resolution)})
    (ok (get result resolution))))

;; Dispute Mechanism

(define-public (submit-dispute (market-id uint) (reason (string-utf8 256)) (stake uint))
  (let (
    (resolution (unwrap! (map-get? market-resolutions market-id) err-market-not-found))
    (current-id (var-get dispute-counter))
  )
    (asserts! (not (get finalized resolution)) err-already-resolved)
    (asserts! (<= stacks-block-height (get dispute-end resolution)) err-dispute-period-expired)
    (asserts! (is-none (map-get? disputes { market-id: market-id })) err-already-disputed)
    (asserts! (>= stake (var-get min-dispute-stake)) err-insufficient-stake)
    (try! (stx-transfer? stake tx-sender (as-contract tx-sender)))
    (var-set dispute-counter (+ current-id u1))
    (map-set disputes
      { market-id: market-id }
      {
        dispute-id: current-id,
        disputer: tx-sender,
        stake: stake,
        reason: reason,
        status: DISPUTE-STATUS-ACTIVE,
        created-at: stacks-block-height,
        voting-end: (+ stacks-block-height (var-get voting-period)),
        yes-votes: u0,
        no-votes: u0,
        total-voters: u0
      })
    (let ((oracle (get oracle resolution))
          (stats (get-oracle-stats oracle)))
      (map-set oracle-stats oracle (merge stats {
        disputed-resolutions: (+ (get disputed-resolutions stats) u1)
      })))

    (try! (contract-call? .market-core mark-disputed market-id))
    (print {event: "dispute-submitted", market-id: market-id, disputer: tx-sender, stake: stake})
    (ok current-id)))

;; Vote on a dispute
(define-public (vote-on-dispute (market-id uint) (vote uint))
  (let ((dispute (unwrap! (map-get? disputes { market-id: market-id }) err-no-dispute)))
    (asserts! (is-eq (get status dispute) DISPUTE-STATUS-ACTIVE) err-voting-closed)
    (asserts! (<= stacks-block-height (get voting-end dispute)) err-voting-closed)
    (asserts! (is-none (map-get? dispute-votes { market-id: market-id, voter: tx-sender })) err-already-voted)
    (asserts! (or (is-eq vote VOTE-YES) (is-eq vote VOTE-NO)) err-invalid-result)
    (map-set dispute-votes
      { market-id: market-id, voter: tx-sender }
      { vote: vote, weight: u1 })
    (map-set disputes
      { market-id: market-id }
      (merge dispute
        (if (is-eq vote VOTE-YES)
          { yes-votes: (+ (get yes-votes dispute) u1), no-votes: (get no-votes dispute), total-voters: (+ (get total-voters dispute) u1) }
          { yes-votes: (get yes-votes dispute), no-votes: (+ (get no-votes dispute) u1), total-voters: (+ (get total-voters dispute) u1) })))
    (print {event: "dispute-vote", market-id: market-id, voter: tx-sender, vote: vote})
    (ok true)))

;; Resolve dispute after voting period ends
(define-public (resolve-dispute (market-id uint))
  (let (
    (dispute (unwrap! (map-get? disputes { market-id: market-id }) err-no-dispute))
    (resolution (unwrap! (map-get? market-resolutions market-id) err-market-not-found))
  )
    (asserts! (is-eq (get status dispute) DISPUTE-STATUS-ACTIVE) err-voting-closed)
    (asserts! (> stacks-block-height (get voting-end dispute)) err-voting-closed)
    (asserts! (>= (get total-voters dispute) (var-get dispute-quorum)) err-voting-closed)
    (let (
      (upheld (> (get yes-votes dispute) (get no-votes dispute)))
      (original-result (get result resolution))
      (final-result (if upheld
        (if (is-eq original-result u1) u2 u1)
        original-result))
    )
      (if upheld
        (begin
          (map-set disputes { market-id: market-id }
            (merge dispute { status: DISPUTE-STATUS-UPHELD }))
          (map-set market-resolutions market-id
            (merge resolution {
              result: final-result,
              finalized: true,
              dispute-end: stacks-block-height
            }))
          (try! (contract-call? .market-core resolve-after-dispute market-id final-result))
          (try! (as-contract (stx-transfer? (get stake dispute) tx-sender (get disputer dispute))))
          (print {event: "dispute-upheld", market-id: market-id, final-result: final-result})
          (ok DISPUTE-STATUS-UPHELD))
        (begin
          (map-set disputes { market-id: market-id }
            (merge dispute { status: DISPUTE-STATUS-REJECTED }))
          (map-set market-resolutions market-id
            (merge resolution {
              finalized: true,
              dispute-end: stacks-block-height
            }))
          (try! (contract-call? .market-core resolve-after-dispute market-id final-result))

          (let (
            (stake (get stake dispute))
            (slash-amount (unwrap-panic (contract-call? .market-fees record-slash market-id stake)))
            (refund (- stake slash-amount))
          )
            (var-set slashed-balance (+ (var-get slashed-balance) slash-amount))
            (if (> refund u0)
              (try! (as-contract (stx-transfer? refund tx-sender (get disputer dispute))))
              true))

          (let ((oracle (get oracle resolution))
                (stats (get-oracle-stats oracle)))
            (map-set oracle-stats oracle (merge stats {
              successful-resolutions: (+ (get successful-resolutions stats) u1)
            })))
          (print {event: "dispute-rejected", market-id: market-id, final-result: final-result})
          (ok DISPUTE-STATUS-REJECTED)))))

;; Admin: override dispute resolution
(define-public (admin-resolve-dispute (market-id uint) (final-result uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (or (is-eq final-result u1) (is-eq final-result u2)) err-invalid-result)
    (let (
      (dispute (unwrap! (map-get? disputes { market-id: market-id }) err-no-dispute))
      (resolution (unwrap! (map-get? market-resolutions market-id) err-market-not-found))
    )
      (map-set disputes { market-id: market-id }
        (merge dispute { status: DISPUTE-STATUS-UPHELD }))
      (map-set market-resolutions market-id {
        oracle: (get oracle resolution),
        result: final-result,
        resolved-at: stacks-block-height,
        finalized: true,
        dispute-end: stacks-block-height
      })
      (try! (contract-call? .market-core resolve-after-dispute market-id final-result))
      (try! (as-contract (stx-transfer? (get stake dispute) tx-sender (get disputer dispute))))
      (print {event: "admin-dispute-resolved", market-id: market-id, final-result: final-result})
      (ok true))))

;; Admin Settings

(define-public (set-dispute-period (new-period uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set dispute-period new-period)
    (try! (contract-call? .market-core set-dispute-period new-period))
    (ok true)))

(define-public (set-voting-period (new-period uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (var-set voting-period new-period))))

(define-public (set-min-dispute-stake (new-stake uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (var-set min-dispute-stake new-stake))))

(define-public (set-dispute-quorum (new-quorum uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (var-set dispute-quorum new-quorum))))

(define-public (set-oracle-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (var-set oracle-fee new-fee))))

(define-public (withdraw-slashed)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (let ((bal (var-get slashed-balance)))
      (asserts! (> bal u0) err-market-not-found)
      (var-set slashed-balance u0)
      (try! (as-contract (stx-transfer? bal tx-sender contract-owner)))
      (ok bal))))
