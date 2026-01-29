;; Governance Core Contract
;; Proposal creation, voting, and execution system for 0xCast

(use-trait ft-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u200))
(define-constant err-not-found (err u201))
(define-constant err-already-voted (err u202))
(define-constant err-proposal-inactive (err u203))
(define-constant err-proposal-active (err u204))
(define-constant err-insufficient-voting-power (err u205))
(define-constant err-execution-failed (err u206))
(define-constant err-timelock-active (err u207))
(define-constant err-invalid-parameters (err u208))

;; Governance Parameters
(define-data-var proposal-threshold uint u1000000) ;; 1M tokens to create proposal
(define-data-var quorum-percentage uint u10) ;; 10% of total supply
(define-data-var voting-period uint u1440) ;; ~10 days in blocks
(define-data-var timelock-period uint u144) ;; ~1 day in blocks
(define-data-var execution-window uint u1440) ;; ~10 days to execute

;; Data Variables
(define-data-var proposal-count uint u0)
(define-data-var governance-token principal .governance-token)

;; Proposal Status
(define-constant status-pending u0)
(define-constant status-active u1)
(define-constant status-succeeded u2)
(define-constant status-defeated u3)
(define-constant status-queued u4)
(define-constant status-executed u5)
(define-constant status-cancelled u6)

;; Data Maps
(define-map proposals
  uint
  {
    proposer: principal,
    title: (string-utf8 256),
    description: (string-utf8 1024),
    start-block: uint,
    end-block: uint,
    for-votes: uint,
    against-votes: uint,
    abstain-votes: uint,
    status: uint,
    queued-at: (optional uint),
    executed-at: (optional uint),
    snapshot-block: uint
  })

(define-map votes
  {proposal-id: uint, voter: principal}
  {
    vote-type: uint, ;; 0: against, 1: for, 2: abstain
    voting-power: uint
  })

(define-map voter-receipts
  {proposal-id: uint, voter: principal}
  bool)

;; Read-Only Functions

(define-read-only (get-proposal (proposal-id uint))
  (map-get? proposals proposal-id))

(define-read-only (get-vote (proposal-id uint) (voter principal))
  (map-get? votes {proposal-id: proposal-id, voter: voter}))

(define-read-only (has-voted (proposal-id uint) (voter principal))
  (default-to false (map-get? voter-receipts {proposal-id: proposal-id, voter: voter})))

(define-read-only (get-proposal-count)
  (var-get proposal-count))

(define-read-only (get-governance-parameters)
  {
    proposal-threshold: (var-get proposal-threshold),
    quorum-percentage: (var-get quorum-percentage),
    voting-period: (var-get voting-period),
    timelock-period: (var-get timelock-period),
    execution-window: (var-get execution-window)
  })

(define-read-only (get-proposal-state (proposal-id uint))
  (let ((proposal (unwrap! (map-get? proposals proposal-id) err-not-found)))
    (let ((current-block block-height)
          (start-block (get start-block proposal))
          (end-block (get end-block proposal))
          (status (get status proposal)))
      (if (is-eq status status-executed)
        (ok status-executed)
        (if (is-eq status status-cancelled)
          (ok status-cancelled)
          (if (< current-block start-block)
            (ok status-pending)
            (if (<= current-block end-block)
              (ok status-active)
              (if (>= (get for-votes proposal) (calculate-quorum))
                (ok status-succeeded)
                (ok status-defeated)))))))))

;; Private Functions

(define-private (calculate-quorum)
  ;; Simplified - would integrate with governance token total supply
  u10000000) ;; 10M tokens quorum

;; Public Functions

(define-public (create-proposal 
  (title (string-utf8 256))
  (description (string-utf8 1024)))
  (let ((proposer-balance u0) ;; Would check governance token balance
        (new-proposal-id (+ (var-get proposal-count) u1))
        (start-block (+ block-height u10)) ;; Start in 10 blocks
        (end-block (+ block-height (var-get voting-period))))
    ;; In production, check proposer has enough tokens
    ;; (asserts! (>= proposer-balance (var-get proposal-threshold)) err-insufficient-voting-power)
    
    (map-set proposals new-proposal-id {
      proposer: tx-sender,
      title: title,
      description: description,
      start-block: start-block,
      end-block: end-block,
      for-votes: u0,
      against-votes: u0,
      abstain-votes: u0,
      status: status-pending,
      queued-at: none,
      executed-at: none,
      snapshot-block: block-height
    })
    
    (var-set proposal-count new-proposal-id)
    (print {event: "proposal-created", proposal-id: new-proposal-id, proposer: tx-sender})
    (ok new-proposal-id)))

(define-public (cast-vote (proposal-id uint) (vote-type uint))
  (let ((proposal (unwrap! (map-get? proposals proposal-id) err-not-found))
        (voter-power u1000000)) ;; Would get from governance token
    
    ;; Check proposal is active
    (asserts! (and 
      (>= block-height (get start-block proposal))
      (<= block-height (get end-block proposal)))
      err-proposal-inactive)
    
    ;; Check hasn't voted
    (asserts! (not (has-voted proposal-id tx-sender)) err-already-voted)
    
    ;; Record vote
    (map-set votes 
      {proposal-id: proposal-id, voter: tx-sender}
      {vote-type: vote-type, voting-power: voter-power})
    
    (map-set voter-receipts
      {proposal-id: proposal-id, voter: tx-sender}
      true)
    
    ;; Update vote counts
    (map-set proposals proposal-id
      (merge proposal
        (if (is-eq vote-type u1)
          {for-votes: (+ (get for-votes proposal) voter-power)}
          (if (is-eq vote-type u0)
            {against-votes: (+ (get against-votes proposal) voter-power)}
            {abstain-votes: (+ (get abstain-votes proposal) voter-power)}))))
    
    (print {event: "vote-cast", proposal-id: proposal-id, voter: tx-sender, vote-type: vote-type})
    (ok true)))

(define-public (queue-proposal (proposal-id uint))
  (let ((proposal (unwrap! (map-get? proposals proposal-id) err-not-found)))
    
    ;; Check proposal succeeded
    (asserts! (>= (get for-votes proposal) (calculate-quorum)) err-proposal-inactive)
    (asserts! (> block-height (get end-block proposal)) err-proposal-active)
    
    ;; Queue proposal
    (map-set proposals proposal-id
      (merge proposal {
        status: status-queued,
        queued-at: (some block-height)
      }))
    
    (print {event: "proposal-queued", proposal-id: proposal-id})
    (ok true)))

(define-public (execute-proposal (proposal-id uint))
  (let ((proposal (unwrap! (map-get? proposals proposal-id) err-not-found)))
    
    ;; Check proposal is queued
    (asserts! (is-eq (get status proposal) status-queued) err-proposal-inactive)
    
    ;; Check timelock has passed
    (let ((queued-at (unwrap! (get queued-at proposal) err-not-found)))
      (asserts! (>= block-height (+ queued-at (var-get timelock-period))) err-timelock-active))
    
    ;; Execute proposal (simplified - would call target contracts)
    (map-set proposals proposal-id
      (merge proposal {
        status: status-executed,
        executed-at: (some block-height)
      }))
    
    (print {event: "proposal-executed", proposal-id: proposal-id})
    (ok true)))

(define-public (cancel-proposal (proposal-id uint))
  (let ((proposal (unwrap! (map-get? proposals proposal-id) err-not-found)))
    
    ;; Only proposer or owner can cancel
    (asserts! (or 
      (is-eq tx-sender (get proposer proposal))
      (is-eq tx-sender contract-owner))
      err-owner-only)
    
    ;; Can't cancel executed proposals
    (asserts! (not (is-eq (get status proposal) status-executed)) err-execution-failed)
    
    (map-set proposals proposal-id
      (merge proposal {status: status-cancelled}))
    
    (print {event: "proposal-cancelled", proposal-id: proposal-id})
    (ok true)))

;; Admin Functions

(define-public (update-governance-parameters
  (new-threshold uint)
  (new-quorum uint)
  (new-voting-period uint)
  (new-timelock uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set proposal-threshold new-threshold)
    (var-set quorum-percentage new-quorum)
    (var-set voting-period new-voting-period)
    (var-set timelock-period new-timelock)
    (ok true)))
