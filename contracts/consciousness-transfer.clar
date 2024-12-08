;; consciousness-transfer contract

(define-map transfer-protocols
  { protocol-id: uint }
  {
    creator: principal,
    name: (string-utf8 64),
    description: (string-utf8 256),
    ethical-score: uint,
    status: (string-ascii 20)
  }
)

(define-data-var next-protocol-id uint u1)

(define-public (create-transfer-protocol (name (string-utf8 64)) (description (string-utf8 256)) (ethical-score uint))
  (let
    (
      (protocol-id (var-get next-protocol-id))
    )
    (map-set transfer-protocols
      { protocol-id: protocol-id }
      {
        creator: tx-sender,
        name: name,
        description: description,
        ethical-score: ethical-score,
        status: "active"
      }
    )
    (var-set next-protocol-id (+ protocol-id u1))
    (ok protocol-id)
  )
)

(define-read-only (get-transfer-protocol (protocol-id uint))
  (map-get? transfer-protocols { protocol-id: protocol-id })
)

(define-public (update-protocol-status (protocol-id uint) (new-status (string-ascii 20)))
  (let
    (
      (protocol (unwrap! (map-get? transfer-protocols { protocol-id: protocol-id }) (err u404)))
    )
    (asserts! (is-eq (get creator protocol) tx-sender) (err u403))
    (ok (map-set transfer-protocols
      { protocol-id: protocol-id }
      (merge protocol { status: new-status })
    ))
  )
)

