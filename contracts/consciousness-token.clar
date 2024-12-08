;; consciousness-token contract

(define-fungible-token consciousness-token)

(define-constant contract-owner tx-sender)

(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) (err u403))
    (ft-mint? consciousness-token amount recipient)
  )
)

(define-public (transfer (amount uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) (err u403))
    (ft-transfer? consciousness-token amount sender recipient)
  )
)

(define-read-only (get-balance (account principal))
  (ok (ft-get-balance consciousness-token account))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply consciousness-token))
)

