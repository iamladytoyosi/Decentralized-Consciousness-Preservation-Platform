;; bci-integration contract

(define-map bci-devices
  { device-id: uint }
  {
    owner: principal,
    name: (string-utf8 64),
    status: (string-ascii 20)
  }
)

(define-map collected-data
  { device-id: uint, timestamp: uint }
  {
    data-hash: (buff 32),
    processed: bool
  }
)

(define-data-var next-device-id uint u1)

(define-public (register-device (name (string-utf8 64)))
  (let
    (
      (device-id (var-get next-device-id))
    )
    (map-set bci-devices
      { device-id: device-id }
      {
        owner: tx-sender,
        name: name,
        status: "active"
      }
    )
    (var-set next-device-id (+ device-id u1))
    (ok device-id)
  )
)

(define-public (submit-data (device-id uint) (data-hash (buff 32)))
  (begin
    (asserts! (is-eq (get owner (unwrap! (map-get? bci-devices { device-id: device-id }) (err u404))) tx-sender) (err u403))
    (ok (map-set collected-data
      { device-id: device-id, timestamp: block-height }
      {
        data-hash: data-hash,
        processed: false
      }
    ))
  )
)

(define-public (process-data (device-id uint) (timestamp uint))
  (let
    (
      (data (unwrap! (map-get? collected-data { device-id: device-id, timestamp: timestamp }) (err u404)))
    )
    (ok (map-set collected-data
      { device-id: device-id, timestamp: timestamp }
      (merge data { processed: true })
    ))
  )
)

(define-read-only (get-device (device-id uint))
  (map-get? bci-devices { device-id: device-id })
)

(define-read-only (get-collected-data (device-id uint) (timestamp uint))
  (map-get? collected-data { device-id: device-id, timestamp: timestamp })
)

