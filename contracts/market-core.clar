;; market-core.clar
;; 0xCast - Decentralized Prediction Market Protocol
;; Core contract for creating and managing prediction markets

;; ============================================
;; Constants
;; ============================================

;; Market Status Constants
(define-constant MARKET-STATUS-ACTIVE u0)
(define-constant MARKET-STATUS-RESOLVED u1)
(define-constant MARKET-STATUS-DISPUTED u2)
(define-constant MARKET-STATUS-REFUNDED u3)

;; Market Outcome Constants
(define-constant OUTCOME-NONE u0)
(define-constant OUTCOME-YES u1)
(define-constant OUTCOME-NO u2)

;; Category Constants
(define-constant CATEGORY-CRYPTO u1)
(define-constant CATEGORY-SPORTS u2)
(define-constant CATEGORY-POLITICS u3)
(define-constant CATEGORY-ECONOMICS u4)
(define-constant CATEGORY-OTHER u5)

;; Error Constants
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-MARKET-NOT-FOUND (err u101))
(define-constant ERR-MARKET-ALREADY-RESOLVED (err u102))
(define-constant ERR-MARKET-NOT-ENDED (err u103))
(define-constant ERR-INVALID-OUTCOME (err u104))
(define-constant ERR-MARKET-STILL-ACTIVE (err u105))
(define-constant ERR-INVALID-DATES (err u106))
(define-constant ERR-MARKET-ENDED (err u107))
(define-constant ERR-ALREADY-CLAIMED (err u108))
(define-constant ERR-NO-WINNINGS (err u109))
(define-constant ERR-MARKET-NOT-RESOLVED (err u110))
(define-constant ERR-INVALID-CATEGORY (err u111))
(define-constant ERR-MARKET-ABANDONED (err u112))
(define-constant ERR-ALREADY-REFUNDED (err u113))
(define-constant ERR-MARKET-IN-DISPUTE (err u114))
(define-constant ERR-REFUND-NOT-ALLOWED (err u115))
(define-constant ERR-MARKET-NOT-FINALIZED (err u116))
(define-constant ERR-FINALIZATION-NOT-READY (err u117))
(define-constant ERR-MARKET-NOT-DISPUTED (err u118))
(define-constant ERR-CONTRACT-PAUSED (err u119))
(define-constant ERR-INVALID-PAUSE-STATE (err u120))
(define-constant ERR-PAUSE-ALREADY-APPROVED (err u121))
(define-constant ERR-PAUSE-NOT-AUTHORIZED (err u122))
(define-constant ERR-RATE-LIMIT-EXCEEDED (err u123))
(define-constant ERR-INVALID-NEW-OWNER (err u124))
(define-constant ERR-OWNER-TRANSFER-COOLDOWN (err u125))
(define-constant ERR-QUESTION-TOO-SHORT (err u126))
(define-constant ERR-QUESTION-TOO-LONG (err u127))
(define-constant ERR-MARKET-DURATION-TOO-SHORT (err u128))
(define-constant ERR-MARKET-DURATION-TOO-LONG (err u129))
(define-constant ERR-RESOLUTION-WINDOW-TOO-SHORT (err u130))
(define-constant ERR-RESOLUTION-WINDOW-TOO-LONG (err u131))
(define-constant ERR-TOTAL-DURATION-TOO-LONG (err u132))

;; Only the oracle integration contract may invoke oracle/dispute entrypoints
(define-constant ORACLE-INTEGRATION .oracle-integration)

(define-constant DEFAULT-PAUSE-REASON "emergency pause request")
(define-constant DEFAULT-RESUME-REASON "resume request")

;; Market Creation Validation Constants
;; Question length constraints
(define-constant MIN-QUESTION-LENGTH u10)
(define-constant MAX-QUESTION-LENGTH u256)

;; Market duration constraints (in blocks)
;; Minimum: ~1 hour (6 blocks)
;; Maximum: ~1 year (52,560 blocks = 365 * 144)
(define-constant MIN-MARKET-DURATION u6)
(define-constant MAX-MARKET-DURATION u52560)

;; Resolution window constraints (in blocks)
;; Minimum: ~1 hour (6 blocks)
;; Maximum: ~30 days (4,320 blocks = 30 * 144)
(define-constant MIN-RESOLUTION-WINDOW u6)
(define-constant MAX-RESOLUTION-WINDOW u4320)

;; Total market lifetime constraint (in blocks)
;; Maximum: ~1.5 years (78,840 blocks = 547.5 * 144)
(define-constant MAX-TOTAL-DURATION u78840)

;; Auto-resolve fallback: blocks after resolution-date before auto-resolve kicks in
;; ~7 days in blocks (7 * 144 = 1008)
(define-data-var abandonment-period uint u1008)

;; Owner transfer cooldown period (~7 days in blocks)
(define-data-var owner-transfer-cooldown uint u1008)

;; Pending owner transfer
(define-data-var pending-owner (optional principal) none)
(define-data-var owner-transfer-initiated-at uint u0)

;; ============================================
;; Data Variables
;; ============================================

;; Counter to track total number of markets created
(define-data-var market-counter uint u0)

;; ============================================
;; Data Maps
;; ============================================

;; Main market data structure
;; Maps market-id to market details
(define-map markets
  { market-id: uint }
  {
    question: (string-ascii 256),
    creator: principal,
    category: uint,
    end-date: uint,
    resolution-date: uint,
    resolution-deadline: uint,
    total-yes-stake: uint,
    total-no-stake: uint,
    status: uint,
    outcome: uint,
    created-at: uint,
    resolved-at: uint,
    finalizes-at: uint,
    finalized: bool,
    resolved-by: (optional principal),
    resolution-source: (string-ascii 20)
  }
)

;; Index map for category-based market lookups
(define-map market-categories
  { category: uint, index: uint }
  { market-id: uint }
)

;; Counter for markets per category
(define-map category-counters
  { category: uint }
  { count: uint }
)

;; User positions in markets
;; Maps (market-id, user) to their position
(define-map user-positions
  { market-id: uint, user: principal }
  {
    yes-stake: uint,          ;; Amount staked on YES
    no-stake: uint,           ;; Amount staked on NO
    claimed: bool             ;; Whether winnings have been claimed
  }
)

;; Rate limiting maps
(define-map rate-limit-stakes
  principal
  { count: uint, window-start: uint }
)

(define-map rate-limit-markets
  principal
  { count: uint, window-start: uint }
)

(define-map rate-limit-resolutions
  principal
  { count: uint, window-start: uint }
)

;; ============================================
;; Read-Only Functions
;; ============================================

;; Get the current contract owner
(define-read-only (get-contract-owner)
  (var-get contract-owner)
)

;; Get pending owner transfer details
(define-read-only (get-pending-owner-transfer)
  {
    pending-owner: (var-get pending-owner),
    initiated-at: (var-get owner-transfer-initiated-at),
    cooldown: (var-get owner-transfer-cooldown)
  }
)

;; Get the current market counter
(define-read-only (get-market-counter)
  (var-get market-counter)
)

;; Get market details by ID
(define-read-only (get-market (market-id uint))
  (map-get? markets { market-id: market-id })
)

;; Get user position in a specific market
(define-read-only (get-user-position (market-id uint) (user principal))
  (map-get? user-positions { market-id: market-id, user: user })
)

;; Check if a market exists
(define-read-only (market-exists (market-id uint))
  (is-some (map-get? markets { market-id: market-id }))
)

;; Get total pool size for a market
(define-read-only (get-market-pool-size (market-id uint))
  (match (map-get? markets { market-id: market-id })
    market (ok (+ (get total-yes-stake market) (get total-no-stake market)))
    ERR-MARKET-NOT-FOUND
  )
)

;; Get count of markets in a category
(define-read-only (get-market-category-count (category uint))
  (default-to u0 (get count (map-get? category-counters { category: category })))
)

;; Get market-id by category and index
(define-read-only (get-market-by-category (category uint) (index uint))
  (map-get? market-categories { category: category, index: index })
)

(define-read-only (get-dispute-period)
  (var-get dispute-period)
)

(define-read-only (get-resolution-deadline (market-id uint))
  (match (map-get? markets { market-id: market-id })
    market (ok (get resolution-deadline market))
    ERR-MARKET-NOT-FOUND
  )
)

(define-read-only (get-rate-limit-config)
  {
    window: (var-get rate-limit-window),
    max-stakes: (var-get max-stakes-per-window),
    max-markets: (var-get max-markets-per-window),
    max-resolutions: (var-get max-resolutions-per-window)
  }
)

(define-read-only (get-user-rate-limit-status (user principal) (action (string-ascii 20)))
  (if (is-eq action "stake")
    (ok (default-to { count: u0, window-start: u0 } (map-get? rate-limit-stakes user)))
    (if (is-eq action "market")
      (ok (default-to { count: u0, window-start: u0 } (map-get? rate-limit-markets user)))
      (if (is-eq action "resolve")
        (ok (default-to { count: u0, window-start: u0 } (map-get? rate-limit-resolutions user)))
        (err u999)
      )
    )
  )
)

;; ============================================
;; Private Functions
;; ============================================

;; Increment market counter and return new ID
(define-private (increment-market-counter)
  (let ((current-counter (var-get market-counter)))
    (var-set market-counter (+ current-counter u1))
    current-counter
  )
)

;; Enforce that a resolution attempt occurs on/before a market's stored deadline.
(define-private (assert-within-resolution-deadline (current-block uint) (deadline uint))
  (if (<= current-block deadline)
    (ok true)
    ERR-MARKET-ABANDONED
  )
)

;; Prevent write actions while contract is paused
(define-private (assert-not-paused)
  (if (var-get contract-paused)
    ERR-CONTRACT-PAUSED
    (ok true)
  )
)

;; Validate market creation parameters
;; @param question: Market question string
;; @param end-date: Block height when trading closes
;; @param resolution-date: Block height when market can be resolved
;; @param category: Market category (1-5)
;; @param current-block: Current block height
;; @returns: (ok true) if valid, error code otherwise
(define-private (validate-market-parameters 
  (question (string-ascii 256))
  (end-date uint)
  (resolution-date uint)
  (category uint)
  (current-block uint))
  (let (
    (question-len (len question))
    (market-duration (- end-date current-block))
    (resolution-window (- resolution-date end-date))
    (total-duration (- resolution-date current-block))
  )
    ;; Validate question length
    (asserts! (>= question-len MIN-QUESTION-LENGTH) ERR-QUESTION-TOO-SHORT)
    (asserts! (<= question-len MAX-QUESTION-LENGTH) ERR-QUESTION-TOO-LONG)
    
    ;; Validate category
    (asserts! (and (>= category u1) (<= category u5)) ERR-INVALID-CATEGORY)
    
    ;; Validate dates are in future
    (asserts! (> end-date current-block) ERR-INVALID-DATES)
    (asserts! (> resolution-date end-date) ERR-INVALID-DATES)
    
    ;; Validate market duration (current to end-date)
    (asserts! (>= market-duration MIN-MARKET-DURATION) ERR-MARKET-DURATION-TOO-SHORT)
    (asserts! (<= market-duration MAX-MARKET-DURATION) ERR-MARKET-DURATION-TOO-LONG)
    
    ;; Validate resolution window (end-date to resolution-date)
    (asserts! (>= resolution-window MIN-RESOLUTION-WINDOW) ERR-RESOLUTION-WINDOW-TOO-SHORT)
    (asserts! (<= resolution-window MAX-RESOLUTION-WINDOW) ERR-RESOLUTION-WINDOW-TOO-LONG)
    
    ;; Validate total duration
    (asserts! (<= total-duration MAX-TOTAL-DURATION) ERR-TOTAL-DURATION-TOO-LONG)
    
    (ok true)
  )
)

(define-private (check-rate-limit (user principal) (action (string-ascii 20)) (max-count uint))
  (let (
    (current-block stacks-block-height)
    (window (var-get rate-limit-window))
    (limit-data (if (is-eq action "stake")
      (default-to { count: u0, window-start: u0 } (map-get? rate-limit-stakes user))
      (if (is-eq action "market")
        (default-to { count: u0, window-start: u0 } (map-get? rate-limit-markets user))
        (default-to { count: u0, window-start: u0 } (map-get? rate-limit-resolutions user))
      )
    ))
    (window-start (get window-start limit-data))
    (count (get count limit-data))
  )
    (if (>= (- current-block window-start) window)
      (ok true)
      (if (< count max-count)
        (ok true)
        ERR-RATE-LIMIT-EXCEEDED
      )
    )
  )
)

(define-private (record-rate-limit (user principal) (action (string-ascii 20)))
  (begin
    (let (
      (current-block stacks-block-height)
      (window (var-get rate-limit-window))
      (limit-data (if (is-eq action "stake")
        (default-to { count: u0, window-start: u0 } (map-get? rate-limit-stakes user))
        (if (is-eq action "market")
          (default-to { count: u0, window-start: u0 } (map-get? rate-limit-markets user))
          (default-to { count: u0, window-start: u0 } (map-get? rate-limit-resolutions user))
        )
      ))
      (window-start (get window-start limit-data))
      (count (get count limit-data))
      (new-window (>= (- current-block window-start) window))
    )
      (if (is-eq action "stake")
        (map-set rate-limit-stakes user {
          count: (if new-window u1 (+ count u1)),
          window-start: (if new-window current-block window-start)
        })
        (if (is-eq action "market")
          (map-set rate-limit-markets user {
            count: (if new-window u1 (+ count u1)),
            window-start: (if new-window current-block window-start)
          })
          (map-set rate-limit-resolutions user {
            count: (if new-window u1 (+ count u1)),
            window-start: (if new-window current-block window-start)
          })
        )
      )
    )
    (ok true)
  )
)

(define-private (is-emergency-signer (signer principal))
  (or
    (is-eq signer (var-get contract-owner))
    (match (map-get? emergency-approvers { signer: signer })
      approval (get enabled approval)
      false
    )
  )
)

(define-private (append-circuit-breaker-event
  (action (string-ascii 20))
  (reason (string-ascii 128))
  (request-id uint)
  (approval-count uint)
  (paused bool))
  (if true
    (let ((event-id (var-get circuit-breaker-log-id)))
      (begin
        (var-set circuit-breaker-log-id (+ event-id u1))
        (map-set circuit-breaker-events
          { log-id: event-id }
          {
            action: action,
            actor: tx-sender,
            reason: reason,
            request-id: request-id,
            approval-count: approval-count,
            threshold: (var-get pause-approval-threshold),
            paused: paused,
            created-at: stacks-block-height
          }
        )
        (ok event-id)
      )
    )
    (err u0)
  )
)

(define-private (open-pause-request (reason (string-ascii 128)))
  (if true
    (begin
      (var-set pause-request-id (+ (var-get pause-request-id) u1))
      (var-set pause-request-open true)
      (var-set pause-request-reason reason)
      (var-set pause-approval-count u0)
      (ok true)
    )
    (err u0)
  )
)

(define-private (open-resume-request (reason (string-ascii 128)))
  (if true
    (begin
      (var-set resume-request-id (+ (var-get resume-request-id) u1))
      (var-set resume-request-open true)
      (var-set resume-request-reason reason)
      (var-set resume-approval-count u0)
      (ok true)
    )
    (err u0)
  )
)

(define-private (process-emergency-pause-approval (reason (string-ascii 128)))
  (let ((current-block stacks-block-height))
    (try! (if (not (var-get pause-request-open))
      (open-pause-request reason)
      (ok true)
    ))

    (let ((request-id (var-get pause-request-id)))
      (asserts!
        (is-none (map-get? pause-request-approvals { request-id: request-id, signer: tx-sender }))
        ERR-PAUSE-ALREADY-APPROVED
      )
      (map-set pause-request-approvals
        { request-id: request-id, signer: tx-sender }
        { approved-at: current-block }
      )
      (var-set pause-approval-count (+ (var-get pause-approval-count) u1))
      (try! (append-circuit-breaker-event
        "pause-approval"
        (var-get pause-request-reason)
        request-id
        (var-get pause-approval-count)
        false
      ))

      (if (>= (var-get pause-approval-count) (var-get pause-approval-threshold))
        (begin
          (var-set contract-paused true)
          (var-set pause-request-open false)
          (try! (append-circuit-breaker-event
            "pause-activated"
            (var-get pause-request-reason)
            request-id
            (var-get pause-approval-count)
            true
          ))
          (ok true)
        )
        (ok true)
      )
    )
  )
)

(define-private (process-emergency-resume-approval (reason (string-ascii 128)))
  (let ((current-block stacks-block-height))
    (try! (if (not (var-get resume-request-open))
      (open-resume-request reason)
      (ok true)
    ))

    (let ((request-id (var-get resume-request-id)))
      (asserts!
        (is-none (map-get? resume-request-approvals { request-id: request-id, signer: tx-sender }))
        ERR-PAUSE-ALREADY-APPROVED
      )
      (map-set resume-request-approvals
        { request-id: request-id, signer: tx-sender }
        { approved-at: current-block }
      )
      (var-set resume-approval-count (+ (var-get resume-approval-count) u1))
      (try! (append-circuit-breaker-event
        "resume-approval"
        (var-get resume-request-reason)
        request-id
        (var-get resume-approval-count)
        true
      ))

      (if (>= (var-get resume-approval-count) (var-get pause-approval-threshold))
        (begin
          (var-set contract-paused false)
          (var-set resume-request-open false)
          (try! (append-circuit-breaker-event
            "resume-activated"
            (var-get resume-request-reason)
            request-id
            (var-get resume-approval-count)
            false
          ))
          (ok true)
        )
        (ok true)
      )
    )
  )
)

;; ============================================
;; Public Functions
;; ============================================

(define-public (set-emergency-approver (approver principal) (enabled bool))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    (map-set emergency-approvers
      { signer: approver }
      {
        enabled: enabled,
        updated-at: stacks-block-height,
        updated-by: tx-sender
      }
    )
    (ok true)
  )
)

(define-public (set-emergency-approval-threshold (threshold uint))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    (asserts! (> threshold u0) ERR-INVALID-PAUSE-STATE)
    (ok (var-set pause-approval-threshold threshold))
  )
)

(define-public (approve-emergency-pause (reason (string-ascii 128)))
  (begin
    (asserts! (is-emergency-signer tx-sender) ERR-PAUSE-NOT-AUTHORIZED)
    (asserts! (not (var-get contract-paused)) ERR-INVALID-PAUSE-STATE)
    (process-emergency-pause-approval reason)
  )
)

(define-public (approve-emergency-resume (reason (string-ascii 128)))
  (begin
    (asserts! (is-emergency-signer tx-sender) ERR-PAUSE-NOT-AUTHORIZED)
    (asserts! (var-get contract-paused) ERR-INVALID-PAUSE-STATE)
    (process-emergency-resume-approval reason)
  )
)

;; Create a new prediction market
;; @param question: The market question (max 256 characters)
;; Create a new prediction market
;; @param question: The market question (10-256 characters)
;; @param end-date: Block height when trading closes
;; @param resolution-date: Block height when market can be resolved
;; @param category: Market category (1=Crypto, 2=Sports, 3=Politics, 4=Economics, 5=Other)
;; @returns: (ok market-id) on success, error code on failure
(define-public (create-market (question (string-ascii 256)) (end-date uint) (resolution-date uint) (category uint))
  (let
    (
      (current-block stacks-block-height)
      (new-market-id (increment-market-counter))
      (cat-count (get-market-category-count category))
      (resolution-deadline (+ resolution-date (var-get abandonment-period)))
    )
    (try! (assert-not-paused))
    (try! (check-rate-limit tx-sender "market" (var-get max-markets-per-window)))
    
    ;; Comprehensive parameter validation
    (try! (validate-market-parameters question end-date resolution-date category current-block))
    
    (map-set markets
      { market-id: new-market-id }
      {
        question: question,
        creator: tx-sender,
        category: category,
        end-date: end-date,
        resolution-date: resolution-date,
        resolution-deadline: resolution-deadline,
        total-yes-stake: u0,
        total-no-stake: u0,
        status: MARKET-STATUS-ACTIVE,
        outcome: OUTCOME-NONE,
        created-at: current-block,
        resolved-at: u0,
        finalizes-at: u0,
        finalized: false,
        resolved-by: none,
        resolution-source: ""
      }
    )
    
    (map-set market-categories
      { category: category, index: cat-count }
      { market-id: new-market-id }
    )
    (map-set category-counters
      { category: category }
      { count: (+ cat-count u1) }
    )
    
    (unwrap-panic (record-rate-limit tx-sender "market"))
    (ok new-market-id)
  )
)

;; Place a stake on YES outcome
;; @param market-id: The ID of the market to stake on
;; @param amount: Amount of STX to stake
;; @returns: (ok true) on success, error code on failure
(define-public (place-yes-stake (market-id uint) (amount uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
      (current-block stacks-block-height)
      (current-position (default-to 
        { yes-stake: u0, no-stake: u0, claimed: false }
        (map-get? user-positions { market-id: market-id, user: tx-sender })
      ))
    )
    (try! (assert-not-paused))
    (try! (check-rate-limit tx-sender "stake" (var-get max-stakes-per-window)))
    (asserts! (> amount u0) ERR-MARKET-STILL-ACTIVE)
    (asserts! (is-eq (get status market) MARKET-STATUS-ACTIVE) ERR-MARKET-ALREADY-RESOLVED)
    
    (asserts! (< current-block (get end-date market)) ERR-MARKET-ENDED)
    
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    
    (map-set markets
      { market-id: market-id }
      (merge market { total-yes-stake: (+ (get total-yes-stake market) amount) })
    )
    
    (map-set user-positions
      { market-id: market-id, user: tx-sender }
      (merge current-position { yes-stake: (+ (get yes-stake current-position) amount) })
    )
    
    (unwrap-panic (record-rate-limit tx-sender "stake"))
    (ok true)
  )
)

;; Place a stake on NO outcome
;; @param market-id: The ID of the market to stake on
;; @param amount: Amount of STX to stake
;; @returns: (ok true) on success, error code on failure
(define-public (place-no-stake (market-id uint) (amount uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
      (current-block stacks-block-height)
      (current-position (default-to 
        { yes-stake: u0, no-stake: u0, claimed: false }
        (map-get? user-positions { market-id: market-id, user: tx-sender })
      ))
    )
    (try! (assert-not-paused))
    (try! (check-rate-limit tx-sender "stake" (var-get max-stakes-per-window)))
    (asserts! (> amount u0) ERR-MARKET-STILL-ACTIVE)
    (asserts! (is-eq (get status market) MARKET-STATUS-ACTIVE) ERR-MARKET-ALREADY-RESOLVED)
    
    (asserts! (< current-block (get end-date market)) ERR-MARKET-ENDED)
    
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    
    (map-set markets
      { market-id: market-id }
      (merge market { total-no-stake: (+ (get total-no-stake market) amount) })
    )
    
    (map-set user-positions
      { market-id: market-id, user: tx-sender }
      (merge current-position { no-stake: (+ (get no-stake current-position) amount) })
    )
    
    (unwrap-panic (record-rate-limit tx-sender "stake"))
    (ok true)
  )
)

;; Resolve a market with the final outcome
;; @param market-id: The ID of the market to resolve
;; @param outcome: The final outcome (OUTCOME-YES or OUTCOME-NO)
;; @returns: (ok true) on success, error code on failure
(define-public (resolve-market (market-id uint) (outcome uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
      (current-block stacks-block-height)
    )
    (asserts! (is-eq tx-sender (get creator market)) ERR-NOT-AUTHORIZED)
    (try! (check-rate-limit tx-sender "resolve" (var-get max-resolutions-per-window)))
    
    (asserts! (is-eq (get status market) MARKET-STATUS-ACTIVE) ERR-MARKET-ALREADY-RESOLVED)
    
    (asserts! (>= current-block (get resolution-date market)) ERR-MARKET-NOT-ENDED)

    (try! (assert-within-resolution-deadline current-block (get resolution-deadline market)))
    
    (asserts! (or (is-eq outcome OUTCOME-YES) (is-eq outcome OUTCOME-NO)) ERR-INVALID-OUTCOME)
    
    (map-set markets
      { market-id: market-id }
      (merge market {
        status: MARKET-STATUS-RESOLVED,
        outcome: outcome,
        resolved-at: current-block,
        finalizes-at: (+ current-block (var-get dispute-period)),
        finalized: false,
        resolved-by: (some tx-sender),
        resolution-source: "creator"
      })
    )
    
    (unwrap-panic (record-rate-limit tx-sender "resolve"))
    (ok true)
  )
)

;; Claim winnings from a resolved market
;; @param market-id: The ID of the market to claim from
;; @returns: (ok payout-amount) on success, error code on failure
(define-public (claim-winnings (market-id uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
      (position (unwrap! (map-get? user-positions { market-id: market-id, user: tx-sender }) ERR-NO-WINNINGS))
      (total-pool (+ (get total-yes-stake market) (get total-no-stake market)))
      (outcome (get outcome market))
      (recipient tx-sender)
    )
    ;; Validate market is resolved
    (asserts! (is-eq (get status market) MARKET-STATUS-RESOLVED) ERR-MARKET-NOT-RESOLVED)

    ;; Validate market is finalized (dispute window passed and/or dispute settled)
    (asserts! (get finalized market) ERR-MARKET-NOT-FINALIZED)
    
    ;; Validate user hasn't already claimed
    (asserts! (not (get claimed position)) ERR-ALREADY-CLAIMED)
    
    ;; Calculate payout based on outcome
    (let
      (
        (payout (if (is-eq outcome OUTCOME-YES)
          ;; YES won: calculate proportional share of total pool
          (if (> (get total-yes-stake market) u0)
            (/ (* (get yes-stake position) total-pool) (get total-yes-stake market))
            u0
          )
          ;; NO won: calculate proportional share of total pool
          (if (> (get total-no-stake market) u0)
            (/ (* (get no-stake position) total-pool) (get total-no-stake market))
            u0
          )
        ))
      )
      ;; Validate user has winnings to claim
      (asserts! (> payout u0) ERR-NO-WINNINGS)
      
      ;; Transfer payout from contract to user
      (try! (as-contract (stx-transfer? payout tx-sender recipient)))
      
      ;; Mark position as claimed
      (map-set user-positions
        { market-id: market-id, user: tx-sender }
        (merge position { claimed: true })
      )
      
      (ok payout)
    )
  )
)

;; Resolve a market via oracle data
(define-public (oracle-resolve (market-id uint) (outcome uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
      (current-block stacks-block-height)
    )
    (asserts! (is-eq contract-caller ORACLE-INTEGRATION) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get status market) MARKET-STATUS-ACTIVE) ERR-MARKET-ALREADY-RESOLVED)
    (asserts! (>= current-block (get resolution-date market)) ERR-MARKET-NOT-ENDED)

    ;; Do not allow oracle resolution after the deadline; the fallback refund path applies.
    (try! (assert-within-resolution-deadline current-block (get resolution-deadline market)))
    (asserts! (or (is-eq outcome OUTCOME-YES) (is-eq outcome OUTCOME-NO)) ERR-INVALID-OUTCOME)
    (map-set markets
      { market-id: market-id }
      (merge market {
        status: MARKET-STATUS-RESOLVED,
        outcome: outcome,
        resolved-at: current-block,
        finalizes-at: (+ current-block (var-get dispute-period)),
        finalized: false,
        resolved-by: (some contract-caller),
        resolution-source: "oracle"
      })
    )
    (ok true)
  )
)

(define-public (set-dispute-period (new-period uint))
  (begin
    (asserts! (is-eq contract-caller ORACLE-INTEGRATION) ERR-NOT-AUTHORIZED)
    (ok (var-set dispute-period new-period))
  )
)

;; Mark a market as disputed (called when dispute is filed)
(define-public (mark-disputed (market-id uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
    )
    (asserts! (is-eq contract-caller ORACLE-INTEGRATION) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get status market) MARKET-STATUS-RESOLVED) ERR-MARKET-NOT-RESOLVED)
    (asserts! (not (get finalized market)) ERR-MARKET-ALREADY-RESOLVED)
    (map-set markets
      { market-id: market-id }
      (merge market { status: MARKET-STATUS-DISPUTED })
    )
    (ok true)
  )
)

;; Re-resolve after dispute is settled
(define-public (resolve-after-dispute (market-id uint) (outcome uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
    )
    (asserts! (is-eq contract-caller ORACLE-INTEGRATION) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get status market) MARKET-STATUS-DISPUTED) ERR-MARKET-NOT-DISPUTED)
    (asserts! (or (is-eq outcome OUTCOME-YES) (is-eq outcome OUTCOME-NO)) ERR-INVALID-OUTCOME)
    (map-set markets
      { market-id: market-id }
      (merge market {
        status: MARKET-STATUS-RESOLVED,
        outcome: outcome,
        resolved-at: stacks-block-height,
        finalizes-at: stacks-block-height,
        finalized: true,
        resolved-by: (some contract-caller),
        resolution-source: "dispute"
      })
    )
    (ok true)
  )
)

;; Finalize a resolved market after the dispute window ends (no active dispute)
(define-public (finalize-market (market-id uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
      (current-block stacks-block-height)
    )
    (asserts! (is-eq (get status market) MARKET-STATUS-RESOLVED) ERR-MARKET-NOT-RESOLVED)
    (asserts! (not (get finalized market)) ERR-MARKET-ALREADY-RESOLVED)
    (asserts! (> current-block (get finalizes-at market)) ERR-FINALIZATION-NOT-READY)
    (map-set markets
      { market-id: market-id }
      (merge market { finalized: true })
    )
    (ok true)
  )
)

;; Community resolution fallback (used when oracle data unavailable)
(define-public (community-resolve (market-id uint) (outcome uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
      (current-block stacks-block-height)
    )
    (asserts! (is-eq contract-caller ORACLE-INTEGRATION) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get status market) MARKET-STATUS-ACTIVE) ERR-MARKET-ALREADY-RESOLVED)
    (asserts! (>= current-block (get resolution-date market)) ERR-MARKET-NOT-ENDED)

    ;; Do not allow fallback resolutions after the deadline; the refund path applies.
    (try! (assert-within-resolution-deadline current-block (get resolution-deadline market)))
    (asserts! (or (is-eq outcome OUTCOME-YES) (is-eq outcome OUTCOME-NO)) ERR-INVALID-OUTCOME)
    (map-set markets
      { market-id: market-id }
      (merge market {
        status: MARKET-STATUS-RESOLVED,
        outcome: outcome,
        resolved-at: current-block,
        finalizes-at: current-block,
        finalized: true,
        resolved-by: (some contract-caller),
        resolution-source: "community"
      })
    )
    (ok true)
  )
)

;; Mark a market as refunded once the resolution deadline has passed.
;; This is the "auto-resolution" fallback for abandoned markets.
(define-public (trigger-auto-refund (market-id uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
      (current-block stacks-block-height)
    )
    (asserts! (is-eq (get status market) MARKET-STATUS-ACTIVE) ERR-REFUND-NOT-ALLOWED)
    (asserts! (> current-block (get resolution-deadline market)) ERR-REFUND-NOT-ALLOWED)
    (map-set markets
      { market-id: market-id }
      (merge market {
        status: MARKET-STATUS-REFUNDED,
        outcome: OUTCOME-NONE,
        resolved-at: current-block,
        finalizes-at: current-block,
        finalized: true,
        resolved-by: (some tx-sender),
        resolution-source: "deadline-refund"
      })
    )
    (ok true)
  )
)

;; Emergency refund for abandoned or irresolvable markets
(define-public (emergency-refund (market-id uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
      (position (unwrap! (map-get? user-positions { market-id: market-id, user: tx-sender }) ERR-NO-WINNINGS))
      (current-block stacks-block-height)
      (user-total (+ (get yes-stake position) (get no-stake position)))
      (recipient tx-sender)
    )
    (asserts! (is-eq (get status market) MARKET-STATUS-ACTIVE) ERR-REFUND-NOT-ALLOWED)
    (asserts! (> current-block (get resolution-deadline market)) ERR-REFUND-NOT-ALLOWED)
    (asserts! (not (get claimed position)) ERR-ALREADY-CLAIMED)
    (asserts! (> user-total u0) ERR-NO-WINNINGS)
    (try! (as-contract (stx-transfer? user-total tx-sender recipient)))
    (map-set user-positions
      { market-id: market-id, user: tx-sender }
      (merge position { claimed: true })
    )
    (ok user-total)
  )
)

;; Admin: force refund status on a market
(define-public (admin-force-refund (market-id uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
    )
    (asserts! (is-eq tx-sender (get creator market)) ERR-NOT-AUTHORIZED)
    (map-set markets
      { market-id: market-id }
      (merge market {
        status: MARKET-STATUS-REFUNDED,
        resolution-source: "refund"
      })
    )
    (ok true)
  )
)

;; Claim refund from a market that was force-refunded
(define-public (claim-refund (market-id uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) ERR-MARKET-NOT-FOUND))
      (position (unwrap! (map-get? user-positions { market-id: market-id, user: tx-sender }) ERR-NO-WINNINGS))
      (user-total (+ (get yes-stake position) (get no-stake position)))
      (recipient tx-sender)
    )
    (asserts! (is-eq (get status market) MARKET-STATUS-REFUNDED) ERR-REFUND-NOT-ALLOWED)
    (asserts! (not (get claimed position)) ERR-ALREADY-CLAIMED)
    (asserts! (> user-total u0) ERR-NO-WINNINGS)
    (try! (as-contract (stx-transfer? user-total tx-sender recipient)))
    (map-set user-positions
      { market-id: market-id, user: tx-sender }
      (merge position { claimed: true })
    )
    (ok user-total)
  )
)

;; Owner-only emergency pause controls
(define-public (set-contract-paused (paused bool))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    (if paused
      (process-emergency-pause-approval DEFAULT-PAUSE-REASON)
      (process-emergency-resume-approval DEFAULT-RESUME-REASON)
    )
  )
)

(define-read-only (is-contract-paused)
  (var-get contract-paused)
)

(define-read-only (get-emergency-approval-threshold)
  (var-get pause-approval-threshold)
)

(define-read-only (get-circuit-breaker-status)
  {
    paused: (var-get contract-paused),
    pause-request-open: (var-get pause-request-open),
    pause-request-id: (var-get pause-request-id),
    pause-approval-count: (var-get pause-approval-count),
    pause-reason: (var-get pause-request-reason),
    resume-request-open: (var-get resume-request-open),
    resume-request-id: (var-get resume-request-id),
    resume-approval-count: (var-get resume-approval-count),
    resume-reason: (var-get resume-request-reason),
    threshold: (var-get pause-approval-threshold)
  }
)

(define-read-only (get-circuit-breaker-log (log-id uint))
  (map-get? circuit-breaker-events { log-id: log-id })
)

(define-read-only (get-circuit-breaker-log-count)
  (var-get circuit-breaker-log-id)
)

(define-read-only (is-emergency-approver (signer principal))
  (is-emergency-signer signer)
)

(define-read-only (get-abandonment-period)
  (var-get abandonment-period))

(define-read-only (is-market-abandoned (market-id uint))
  (match (map-get? markets { market-id: market-id })
    market (and
      (is-eq (get status market) MARKET-STATUS-ACTIVE)
      (> stacks-block-height (get resolution-deadline market)))
    false))

;; ============================================
;; Owner Transfer Functions
;; ============================================

;; Initiate owner transfer with time-locked security period
;; The new owner must claim ownership after the cooldown period
(define-public (initiate-owner-transfer (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    (asserts! (not (is-eq new-owner (var-get contract-owner))) ERR-INVALID-NEW-OWNER)
    
    ;; Set pending owner and record initiation time
    (var-set pending-owner (some new-owner))
    (var-set owner-transfer-initiated-at stacks-block-height)
    
    (ok true)
  )
)

;; Cancel a pending owner transfer (only current owner)
(define-public (cancel-owner-transfer)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    (asserts! (is-some (var-get pending-owner)) ERR-INVALID-NEW-OWNER)
    
    ;; Clear pending owner
    (var-set pending-owner none)
    (var-set owner-transfer-initiated-at u0)
    
    (ok true)
  )
)

;; Claim ownership after cooldown period (only pending owner)
(define-public (claim-ownership)
  (let (
    (pending (var-get pending-owner))
    (initiated-at (var-get owner-transfer-initiated-at))
    (cooldown (var-get owner-transfer-cooldown))
    (current-block stacks-block-height)
  )
    (asserts! (is-some pending) ERR-INVALID-NEW-OWNER)
    (asserts! (is-eq tx-sender (unwrap! pending ERR-INVALID-NEW-OWNER)) ERR-NOT-AUTHORIZED)
    
    ;; Ensure cooldown period has passed
    (asserts! (>= current-block (+ initiated-at cooldown)) ERR-OWNER-TRANSFER-COOLDOWN)
    
    ;; Transfer ownership
    (var-set contract-owner tx-sender)
    (var-set pending-owner none)
    (var-set owner-transfer-initiated-at u0)
    
    (ok true)
  )
)

;; Update owner transfer cooldown (only owner)
(define-public (set-owner-transfer-cooldown (new-cooldown uint))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    (asserts! (> new-cooldown u0) ERR-INVALID-PAUSE-STATE)
    (ok (var-set owner-transfer-cooldown new-cooldown))
  )
)
