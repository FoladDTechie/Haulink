# Haulink — Demo Guide

Haulink is a cargo logistics platform for Nigerian haulage operators and merchants. It lets merchants book cargo slots on scheduled truck routes (starting with Uyo → Lagos), pay by card or ADA on the Cardano blockchain, and track their shipment end-to-end — from booking through to proof-of-delivery, with every key event optionally anchored on-chain.

---

## Merchant Flow

1. **Create an account** at [haulink.xyz/auth/signup](https://haulink.xyz/auth/signup)
2. **Book a slot** at `/book` — use the cargo estimator to size your shipment, select the **Uyo → Lagos** route, and complete the booking form
3. **Pay** — choose Card (no wallet needed) or ADA via Eternl/Nami on Cardano preprod testnet
4. **Note your tracking code** shown on the confirmation screen
5. **Track your shipment** at `/track/[your-code]` — follow it through each status update in real time
6. **Proof of delivery** — when status reaches **Arrived**, the operator confirms delivery with a photo; the POD card appears on the tracking page
7. **On-chain confirmation** — if you paid in ADA, a Cardanoscan preprod link appears on the tracking page confirming the booking was anchored on-chain

---

## Admin / Operator Demo

Admin access is available at [haulink.xyz/admin](https://haulink.xyz/admin) (requires an admin-role email — contact the team for demo access).

The admin panel covers:
- Trip creation and slot management
- Shipment list with status updates
- POD confirmation (upload photo to mark delivery complete)

---

## Test Data Notes

- The **Uyo → Lagos** pilot route has active trips with available slots
- **Card payment** is fastest for testing — no wallet setup required
- **ADA payment** requires the [Eternl](https://eternl.io) or [Nami](https://namiwallet.io) browser extension connected to the **Cardano preprod testnet** with test ADA
  - Faucet: [docs.cardano.org/cardano-testnet/tools/faucet](https://docs.cardano.org/cardano-testnet/tools/faucet)

---

## Links

| | |
|---|---|
| Live product | [haulink.xyz](https://haulink.xyz) |
| GitHub repo | [github.com/FoladDTechie/Haulink](https://github.com/FoladDTechie/Haulink) |
| Cardanoscan preprod | [preprod.cardanoscan.io](https://preprod.cardanoscan.io) |
