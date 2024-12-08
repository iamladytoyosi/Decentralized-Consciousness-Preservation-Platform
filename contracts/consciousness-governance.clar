;; consciousness-governance contract

(define-map proposals
  { proposal-id: uint }
  {
    creator: principal,
    description: (string-utf8 256),
    vote-count-yes: uint,
    vote-count-no: uint,
    status: (string-ascii 20),
    end-block: uint
  }
)

(define-map votes
  { voter: principal, proposal-id: uint }
  { vote: (string-ascii 3) }
)

(define-data-var next-proposal-id uint u1)
(define-constant voting-period u144) ;; Approximately 1 day in blocks

(define-public (create-proposal (description (string-utf8 256)))
  (let
    (
      (proposal-id (var-get next-proposal-id))
    )
    (map-set proposals
      { proposal-id: proposal-id }
      {
        creator: tx-sender,
        description: description,
        vote-count-yes: u0,
        vote-count-no: u0,
        status: "active",
        end-block: (+ block-height voting-period)
      }
    )
    (var-set next-proposal-id (+ proposal-id u1))
    (ok proposal-id)
  )
)

(define-public (vote (proposal-id uint) (vote-value (string-ascii 3)))
  (let
    (
      (proposal (unwrap! (map-get? proposals { proposal-id: proposal-id }) (err u404)))
    )
    (asserts! (< block-height (get end-block proposal)) (err u400))
    (asserts! (or (is-eq vote-value "yes") (is-eq vote-value "no")) (err u400))
    (map-set votes
      { voter: tx-sender, proposal-id: proposal-id }
      { vote: vote-value }
    )
    (if (is-eq vote-value "yes")
      (map-set proposals
        { proposal-id: proposal-id }
        (merge proposal { vote-count-yes: (+ (get vote-count-yes proposal) u1) })
      )
      (map-set proposals
        { proposal-id: proposal-id }
        (merge proposal { vote-count-no: (+ (get vote-count-no proposal) u1) })
      )
    )
    (ok true)
  )
)

(define-read-only (get-proposal (proposal-id uint))
  (map-get? proposals { proposal-id: proposal-id })
)

(define-read-only (get-vote (voter principal) (proposal-id uint))
  (map-get? votes { voter: voter, proposal-id: proposal-id })
)

