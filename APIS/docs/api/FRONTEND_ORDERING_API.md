# Frontend Ordering API Guide

This guide is the implementation handoff for the customer-facing storefront:
sign-in, cart, checkout, COD and Razorpay payment, and order follow-up. It
describes the current Laravel API implementation and flags known integration
issues that need backend attention.

For catalogue, product, category, brand, search, and other site APIs, see the
full [API reference](../../API.md). A working React checkout example is in
[CheckoutPage.jsx](../react/CheckoutPage.jsx); use this guide for the current
request contracts and important caveats.

## 1. API base, auth, and response format

The API is versioned. Set the base URL for the environment supplied by the
backend team; do not hard-code a development or production host into individual
requests.

```text
{API_BASE}/api/v1
```

Example local base: ``. The deployed installation
may use a subdirectory, currently documented as
`https://vasuhjewels.com/api/v1`; verify the active deployment URL
before release.

Register or sign in, then send the returned token on every protected request:

```http
Authorization: Bearer <token>
Accept: application/json
Content-Type: application/json
```

Register: `POST /auth/register`

```json
{
  "name": "Asha Customer",
  "email": "asha@example.com",
  "phone": "9876543210",
  "password": "ExamplePass123!",
  "password_confirmation": "ExamplePass123!"
}
```

Login: `POST /auth/login`

```json
{
  "email": "asha@example.com",
  "password": "ExamplePass123!"
}
```

Both return credentials in `data`:

```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "token": "<opaque-token>",
    "token_type": "Bearer",
    "user": {
      "id": 24,
      "name": "Asha Customer",
      "email": "asha@example.com",
      "phone": "9876543210",
      "gehna_coins": 0
    }
  },
  "meta": {}
}
```

Protected cart, checkout, and order routes require this token. There is no
guest-cart or guest-checkout API. Use `GET /auth/me` on app startup to restore
the signed-in customer. A `401` means clear the local token and ask the user to
sign in again.

All API success responses use `{ success, message, data, meta }`. Errors use
`{ success: false, message, data: null, errors, meta }`. Map `422` field
errors from `errors` to the form; handle `401`, `403`, `404`, `409`, `429`, and
`5xx` distinctly. Do not assume `meta` or `errors` is an array.

## 2. Customer purchase journey

1. Sign in or register.
2. Load products/combos from the public catalogue API; use the product or combo
   `id` when adding to the cart.
3. Add items, then fetch the cart.
4. Fetch checkout summary and retain its `checkout_token` for the entire
   checkout attempt.
5. Optionally validate a coupon and select coins. Send coupon code and coin
   count explicitly in checkout summary and final order placement; see the
   session warning below.
6. Submit the order once. For COD, display the returned order. For Razorpay,
   open the payment popup, send its response to the verification endpoint, and
   confirm payment from the server response/status endpoint.
7. Show order history/details from the customer order endpoints.

All prices, discounts, shipping, and final totals come from the server. Never
calculate the payable total as the source of truth in the browser or send
client-calculated prices.

## 3. Cart endpoints

All cart routes below require authentication. Cart line IDs are the `id`
returned by the cart API (not product IDs).

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/cart` | Read the signed-in user's cart |
| `POST` | `/cart` | Add a product/variation |
| `POST` | `/cart/combo` | Add a live combo bundle |
| `PATCH` | `/cart/{cart}` | Set line quantity; `0` removes the line |
| `DELETE` | `/cart/{cart}` | Remove one cart line |
| `DELETE` | `/cart` | Clear the cart |

### Add a product

`POST /cart`

```json
{
  "product_id": 123,
  "product_variation_id": 456,
  "quantity": 1
}
```

`product_variation_id` and `quantity` are optional; quantity defaults to `1`.
Quantity must be from 1 to 99 when adding. Omit the variation ID for simple
products. The server checks that the variation belongs to that product, checks
availability, and calculates the price itself. Adding the same product and
variation tops up the existing line.

### Add a combo

`POST /cart/combo`

```json
{
  "combo_id": 15,
  "quantity": 1
}
```

Quantity is optional and defaults to `1` (maximum 99). The combo must be live
and contain at least two sellable products. The server allocates the current
bundle price across its product lines; do not add combo products individually
if the customer intends to purchase the bundle price.

### Update, remove, and clear

Set quantity:

```http
PATCH /cart/987
```

```json
{ "quantity": 2 }
```

Quantity accepts `0` through `99`; `0` removes that line. Alternatively use
`DELETE /cart/987` to remove one line or `DELETE /cart` to empty the cart.

### Cart response shape

Successful cart reads and mutations return:

```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 987,
      "product_id": 123,
      "product_variation_id": 456,
      "combo_id": null,
      "name": "Gold Ring",
      "slug": "gold-ring",
      "sku": "RING-18",
      "image": "https://store.example/storage/products/ring.jpg",
      "options": { "Size": "18" },
      "price": 4500,
      "quantity": 1,
      "is_combo": false,
      "combo": null,
      "combo_units": 0,
      "combo_names": [],
      "regular_unit_price": 4500,
      "line_total": 4500,
      "available_stock": 8,
      "url": "https://store.example/product/gold-ring"
    }
  ],
  "meta": {
    "subtotal": 4500,
    "combo_discount": 0,
    "total": 4500,
    "count": 1
  }
}
```

The example is illustrative: nullable fields, variation options, and combo
fields vary by item. `line_total` is the charged line amount; use `meta` for
cart totals. Checkout summary is the authority for shipping and final payable
amount.

> **Known blocker:** cart serialization currently tries to generate the `url`
> using the web route named `product.show`, but that storefront route is
> disabled in `routes/web.php`. In the current configuration, cart responses
> containing product lines can return `500` (`Route [product.show] not
> defined`). The backend must fix this (or restore/provide the route) before the
> frontend can rely on cart read/add/update responses. This is not a missing
> cart endpoint; it is a response serialization failure.

## 4. Checkout and discounts

All checkout routes require authentication.

### Get authoritative totals

`GET /checkout/summary`

Optional query parameters:

| Parameter | Type | Meaning |
|---|---|---|
| `coupon_code` | string | Coupon to validate and include in this summary |
| `coins` | integer | Coins requested to redeem for this summary |

Example:

```http
GET /checkout/summary?coupon_code=SAVE500&coins=200
```

On a non-empty cart, `data` includes:

```json
{
  "pricing": {
    "subtotal": 6000,
    "total_quantity": 1,
    "combo_discount": 0,
    "coupon_discount": 500,
    "coins_discount": 200,
    "coins_used": 200,
    "shipping_charge": 0,
    "grand_total": 5300
  },
  "combo_summary": {
    "has_applied_combo": false,
    "discount": 0
  },
  "applied_coupon": {
    "id": 8,
    "code": "SAVE500",
    "discount": 500
  },
  "applied_coins": {
    "coins": 200,
    "discount": 200
  },
  "user_coins": {
    "balance": 300,
    "balance_after": 100
  },
  "available_coupons": [],
  "payment_providers": {
    "cod": { "enabled": true, "name": "Cash on Delivery" },
    "razorpay": {
      "enabled": true,
      "name": "Razorpay",
      "key": "rzp_test_public_key"
    }
  },
  "checkout_token": "b33e3972-6e77-438a-9ae4-e88314514350"
}
```

The response includes additional coupon metadata; the abbreviated example
shows the key structure. If the cart is empty, the endpoint returns `422`.
Render totals from `data.pricing`, and let the customer select only payment
providers with `enabled: true`.

### Validate a coupon

`POST /checkout/apply-coupon`

```json
{ "coupon_code": "SAVE500" }
```

Successful `data.coupon` includes `id`, `code`, `type`, `amount`, `discount`,
and `free_items`. Invalid, expired, or ineligible codes return a failure
message, usually `404` or `422`. Coupons cannot be combined with an active
combo offer.

### Request Gehna Coins

`POST /checkout/apply-coins`

```json
{ "coins": 200 }
```

Successful `data` includes `coins_used`, `discount`, `balance`, and
`balance_after`. The API clamps the usable amount to the customer's balance
and eligible order total. A customer with no coins receives `422`.

### Important stateless API caveat for coupon and coins

The apply/remove endpoints currently write selected coupon/coins to Laravel
session, but the v1 API group uses stateless API middleware and the React
client authenticates with bearer tokens. Do **not** assume a selection made by
an apply endpoint will still be available to the next request.

For reliable preview and order pricing:

1. Keep the selected `coupon_code` and requested `coins` in frontend checkout
   state.
2. Request `GET /checkout/summary?coupon_code=...&coins=...` to preview totals.
3. Include those same values as `coupon_code` and `coins` in
   `POST /checkout/place-order`.
4. Treat the final order response as authoritative.

`apply-coupon`/`apply-coins` can still be called to validate or get immediate
feedback, but the final order must carry the values explicitly. The coin apply
endpoint does not accept a coupon code, so its standalone response may not
represent the combined coupon-plus-coins amount; use summary with both query
parameters for the combined preview.

The current `/checkout/remove-coupon` and `/checkout/remove-coins` endpoints
only clear session state. For the stateless frontend, clear the local selection
and reload summary without that query parameter.

## 5. Place an order

`POST /checkout/place-order`

This endpoint supports `cod` and `razorpay`. Required billing fields:

| Field | Rules |
|---|---|
| `payment_method` | `cod` or `razorpay` |
| `billing_name` | required string, max 100 |
| `billing_email` | required valid email, max 100 |
| `billing_phone` | required string, max 20 |
| `billing_line1` | required string, max 255 |
| `billing_city` | required string, max 100 |
| `billing_state` | required string, max 100 |
| `billing_zip` | required string, max 20 |
| `billing_country` | required string, max 100 |

Optional fields:

| Field | Rules |
|---|---|
| `checkout_token` | UUID from checkout summary; reuse on retries |
| `coupon_code` | string, max 50 |
| `coins` | integer, minimum 0 |
| `shipping_same_as_billing` | boolean |
| `shipping_name`, `shipping_phone`, `shipping_line1`, `shipping_city`, `shipping_state`, `shipping_zip`, `shipping_country` | Optional; each falls back to billing when omitted |

Example request:

```json
{
  "payment_method": "cod",
  "checkout_token": "b33e3972-6e77-438a-9ae4-e88314514350",
  "coupon_code": "SAVE500",
  "coins": 200,
  "billing_name": "Asha Customer",
  "billing_email": "asha@example.com",
  "billing_phone": "9876543210",
  "billing_line1": "12 Main Road",
  "billing_city": "Mumbai",
  "billing_state": "Maharashtra",
  "billing_zip": "400001",
  "billing_country": "India",
  "shipping_same_as_billing": true
}
```

`checkout_token` makes creation idempotent. Retain the same token after a
timeout, uncertain network response, or payment retry; do not submit a new
token just because the client did not receive the first response. Fetch a new
summary/token only for a genuinely new checkout attempt.

### COD response

Returns `201 Created` with:

```json
{
  "success": true,
  "message": "Order placed successfully with Cash on Delivery.",
  "data": {
    "order": {
      "id": 314,
      "order_number": 314,
      "status": "pending",
      "payment_status": "pending",
      "payment_method": "cod",
      "total": 5300
    },
    "payment_method": "cod",
    "is_paid": false
  },
  "meta": {}
}
```

The actual order includes addresses, timestamps, and other safe order fields.
On success, show confirmation and the order number. COD is not a paid order.

### Razorpay response

For `payment_method: "razorpay"`, `201 Created` includes the order and
`data.razorpay`:

```json
{
  "key": "rzp_test_public_key",
  "order_id": "order_gateway_id",
  "amount": 530000,
  "currency": "INR",
  "name": "Store name",
  "description": "Order #314",
  "prefill": {
    "name": "Asha Customer",
    "email": "asha@example.com",
    "contact": "9876543210"
  }
}
```

`amount` is in paise. Use the server-provided `key`, `order_id`, amount,
currency, and prefill to open Razorpay Checkout. Never put the Razorpay secret
or webhook secret in frontend code.

## 6. Razorpay verification and payment status

### Verify a popup payment

After the Razorpay popup handler fires, send its fields to:
`POST /checkout/verify-razorpay`

```json
{
  "order_id": 314,
  "razorpay_order_id": "order_gateway_id",
  "razorpay_payment_id": "pay_gateway_id",
  "razorpay_signature": "signature_from_razorpay"
}
```

The server checks order ownership, provider, gateway order ID, and signature.
On success, `data.payment_status` is `paid`. Do not mark the order paid based
only on the browser popup callback. A signature mismatch returns `422`.

### Check status after dismissal or uncertain response

`GET /checkout/payment-status/{order}`

The authenticated customer can check only their own order. `data.state` is
one of:

| State | Meaning |
|---|---|
| `paid` | Payment confirmed |
| `failed` | Payment failed; the same checkout token may be retried |
| `processing` | Payment is still being confirmed |
| `cod_confirmed` | COD order exists; payment is due on delivery |

Poll after a popup is dismissed or a verification request times out, with a
finite retry policy and user feedback. The endpoint is authenticated and is
not cacheable by the frontend. If the order is still processing after polling,
show a pending state and allow the customer to check again; do not start an
unrelated second order.

### Payment webhook (backend-to-backend)

Razorpay calls:

```text
POST {API_BASE}/webhooks/razorpay
```

The Laravel handler validates `X-Razorpay-Signature` using the configured
provider webhook secret. Supported event handling includes `payment.captured`,
`payment.failed`, `refund.created`, and `refund.processed`.

The frontend must **not** call this endpoint, create its own webhook request,
or contain the webhook secret. Configure the webhook URL, secret, and event
subscriptions in the Razorpay dashboard and the backend payment-provider
settings. The webhook is a secondary server-side confirmation path; the
frontend uses `verify-razorpay` and `payment-status`.

## 7. Customer order endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/orders` | Paginated order history; optional `status`, `payment_status`, `page`, `per_page` |
| `GET` | `/orders/{id}` | One of the signed-in customer's orders |
| `POST` | `/orders/{id}/cancel` | Request cancellation for eligible pending/processing order |
| `POST` | `/orders/{id}/return-requests` | Request return for delivered order |

`GET /orders` returns `data` as an array and pagination in `meta`. Order
resources include `id`, `order_number`, `status`, `payment_status`,
`payment_method`, totals/refund state, addresses, items when loaded, and
timestamps. Each item includes its product name, SKU, unit price, quantity,
line total, and image when available.

Cancellation body:

```json
{ "reason": "Please cancel this order." }
```

`reason` is optional, max 500 characters. Orders that cannot be cancelled
return `409`.

Return request body:

```json
{
  "reason": "Size does not fit",
  "payout_method": "upi",
  "upi_id": "customer@upi",
  "items": [
    { "order_item_id": 562, "quantity": 1 }
  ]
}
```

`payout_method` is `bank`, `upi`, or `gehna_coins`. For `bank`, provide
`account_holder` and `account_number`; `ifsc` is accepted and `bank_name` is
optional. For `upi`, provide `upi_id`. `items` is required; each item needs
the order item's ID and a positive quantity available for return. Only
delivered orders can be returned.

## 8. Known backend issues / release checks

These are implementation issues, not API routes the frontend can work around
fully:

1. **Cart response 500:** product line serialization generates the disabled
   `product.show` web route. Fix before relying on cart endpoints.
2. **Coupon/coin session reliance:** apply/remove endpoints store values in
   server session, but v1 requests are stateless bearer-token API calls. Send
   coupon and coins on summary and place-order as described above. The backend
   should ideally persist discount selection in an API-safe way or make the
   frontend's explicit fields the documented contract.
3. **Payment integration must be tested against configured gateway keys:** a
   successful route listing does not prove that Razorpay credentials, webhook
   secret, event subscriptions, CORS origins, or live callback delivery are
   configured correctly.
4. **No guest checkout:** account creation/sign-in is required before cart and
   checkout; implement a sign-in prompt/return-to-checkout path.

Before release, test the full flow against the intended environment: add
product, fetch cart, preview totals, apply coupon/coins, submit COD, submit
Razorpay test payment, verify payment, dismiss popup and check status, reload
order history, and confirm webhook-driven payment state. Do not use a real
payment until the gateway is intentionally configured for live mode.
