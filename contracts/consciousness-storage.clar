;; consciousness-storage contract

(define-map consciousness-data
  { owner: principal }
  {
    data-hash: (buff 32),
    timestamp: uint,
    version: uint
  }
)

(define-data-var next-version-number uint u1)

(define-public (store-consciousness (data-hash (buff 32)))
  (let
    (
      (current-version (var-get next-version-number))
    )
    (map-set consciousness-data
      { owner: tx-sender }
      {
        data-hash: data-hash,
        timestamp: block-height,
        version: current-version
      }
    )
    (var-set next-version-number (+ current-version u1))
    (ok current-version)
  )
)

(define-read-only (get-consciousness-data (owner principal))
  (map-get? consciousness-data { owner: owner })
)

(define-public (delete-consciousness-data)
  (begin
    (map-delete consciousness-data { owner: tx-sender })
    (ok true)
  )
)

