# DriveFlow — Sequence Diagram: "Rent a Vehicle" Workflow

## Workflow Overview

This diagram covers the complete **"Rent a Vehicle"** flow:
1. Customer searches for available vehicles
2. Vehicle details and pricing are retrieved
3. Customer creates a booking (RentalContract enters Draft state)
4. Insurance policy is selected
5. Pricing strategy is applied
6. Payment hold (pre-authorization) is processed
7. Contract is confirmed and vehicle state transitions to Reserved
8. Customer picks up the vehicle → state transitions to Rented

---

## Diagram

```mermaid
sequenceDiagram
    autonumber

    actor Customer
    participant API as "API Gateway"
    participant RentalService as "RentalService"
    participant VehicleRepo as "VehicleRepository"
    participant Vehicle as "Vehicle (State Machine)"
    participant ContractFactory as "ContractFactory"
    participant RentalContract as "RentalContract"
    participant PricingEngine as "PricingEngine"
    participant InsuranceService as "InsuranceService"
    participant PaymentService as "PaymentService"
    participant PaymentGateway as "Payment Gateway"
    participant NotificationService as "NotificationService"

    %% ── PHASE 1: Search ──────────────────────────────────────────────────
    rect rgb(230, 245, 255)
        Note over Customer, VehicleRepo: Phase 1 — Vehicle Search
        Customer->>API: GET /vehicles?type=CAR&from=2024-03-01&to=2024-03-07&location=NYC
        API->>RentalService: searchAvailableVehicles(criteria)
        RentalService->>VehicleRepo: findAvailable(type, dateRange, location)
        VehicleRepo-->>RentalService: List~Vehicle~ (state = AVAILABLE)
        RentalService-->>API: VehicleListDTO
        API-->>Customer: 200 OK — vehicle list with daily rates
    end

    %% ── PHASE 2: View Details ────────────────────────────────────────────
    rect rgb(230, 255, 235)
        Note over Customer, PricingEngine: Phase 2 — Vehicle Details & Pricing Preview
        Customer->>API: GET /vehicles/{vehicleId}?from=2024-03-01&to=2024-03-07
        API->>RentalService: getVehicleDetails(vehicleId, dateRange)
        RentalService->>VehicleRepo: findById(vehicleId)
        VehicleRepo-->>RentalService: Vehicle
        RentalService->>PricingEngine: estimatePrice(vehicle, dateRange, customer.loyaltyTier)
        Note right of PricingEngine: Selects strategy:<br/>WeeklyDiscount (7 days)<br/>+ LoyaltyDiscount (Gold tier)
        PricingEngine-->>RentalService: PriceEstimate {base, discount, total}
        RentalService-->>API: VehicleDetailDTO + PriceEstimate
        API-->>Customer: 200 OK — details, specs, insurance options, price breakdown
    end

    %% ── PHASE 3: Create Booking ──────────────────────────────────────────
    rect rgb(255, 248, 220)
        Note over Customer, RentalContract: Phase 3 — Booking Creation (Contract = DRAFT)
        Customer->>API: POST /rentals {vehicleId, startDate, endDate, insuranceTier: PREMIUM}
        API->>RentalService: createRental(customerId, vehicleId, dates, insuranceTier)

        RentalService->>VehicleRepo: findById(vehicleId)
        VehicleRepo-->>RentalService: Vehicle [state: AVAILABLE]

        alt Vehicle is NOT available
            RentalService-->>API: 409 Conflict — Vehicle unavailable
            API-->>Customer: 409 — "Vehicle is no longer available"
        else Vehicle IS available
            RentalService->>InsuranceService: getPolicy(insuranceTier, vehicleType)
            InsuranceService-->>RentalService: InsurancePolicy {dailyPremium: $15, deductible: $500}

            RentalService->>PricingEngine: selectStrategy(dateRange, customer.loyaltyTier)
            Note right of PricingEngine: Returns: WeeklyDiscountStrategy<br/>composed with LoyaltyPricingStrategy
            PricingEngine-->>RentalService: PricingStrategy

            RentalService->>ContractFactory: create(customer, vehicle, policy, strategy, dates)
            ContractFactory-->>RentalService: RentalContract [status: DRAFT]

            RentalService->>RentalContract: calculateTotalPrice()
            Note right of RentalContract: base = $420 (7d × $60)<br/>discount = -$63 (15% weekly)<br/>insurance = $105 (7d × $15)<br/>total = $462
            RentalContract-->>RentalService: $462.00

            RentalService-->>API: ContractDTO {contractId, status: DRAFT, total: $462}
            API-->>Customer: 201 Created — booking draft with price breakdown
        end
    end

    %% ── PHASE 4: Payment Hold ────────────────────────────────────────────
    rect rgb(255, 235, 235)
        Note over Customer, PaymentGateway: Phase 4 — Payment Pre-Authorization (Hold)
        Customer->>API: POST /rentals/{contractId}/confirm {paymentMethod: CREDIT_CARD, cardToken: "tok_xxx"}
        API->>RentalService: confirmRental(contractId, paymentDetails)

        RentalService->>PaymentService: processHold(contractId, amount: $462, cardToken)
        PaymentService->>PaymentGateway: authorize(cardToken, amount: $462)

        alt Authorization FAILED
            PaymentGateway-->>PaymentService: DECLINED
            PaymentService-->>RentalService: PaymentResult {status: FAILED}
            RentalService-->>API: 402 Payment Required
            API-->>Customer: 402 — "Payment authorization failed"
        else Authorization SUCCEEDED
            PaymentGateway-->>PaymentService: APPROVED {gatewayRef: "AUTH_789xyz"}
            PaymentService->>PaymentService: createTransaction(type: HOLD, amount: $462, ref: AUTH_789xyz)
            PaymentService-->>RentalService: PaymentResult {status: HELD, transactionId}
        end
    end

    %% ── PHASE 5: Contract Confirmation & State Transition ────────────────
    rect rgb(240, 230, 255)
        Note over RentalService, NotificationService: Phase 5 — Confirmation & State Transitions
        RentalService->>RentalContract: confirm()
        Note right of RentalContract: Contract status:<br/>DRAFT → CONFIRMED

        RentalService->>Vehicle: state.reserve(vehicle)
        Note right of Vehicle: AvailableState.reserve()<br/>→ sets state to ReservedState<br/>Vehicle is now RESERVED

        RentalService->>NotificationService: sendBookingConfirmation(customer, contract)
        NotificationService-->>Customer: 📧 Email + 📱 SMS — Booking Confirmed, Pickup Instructions

        RentalService-->>API: ContractDTO {status: CONFIRMED, vehicleState: RESERVED}
        API-->>Customer: 200 OK — Booking confirmed! Vehicle reserved for you.
    end

    %% ── PHASE 6: Vehicle Pickup ──────────────────────────────────────────
    rect rgb(220, 255, 240)
        Note over Customer, Vehicle: Phase 6 — Vehicle Pickup (Contract = ACTIVE)
        Customer->>API: POST /rentals/{contractId}/pickup
        API->>RentalService: activateRental(contractId)

        RentalService->>RentalContract: activate()
        Note right of RentalContract: Contract status:<br/>CONFIRMED → ACTIVE

        RentalService->>Vehicle: state.activate(vehicle)
        Note right of Vehicle: ReservedState.activate()<br/>→ sets state to RentedState<br/>Vehicle is now RENTED

        RentalService-->>API: ContractDTO {status: ACTIVE, vehicleState: RENTED}
        API-->>Customer: 200 OK — Enjoy your drive! 🚗
    end
```

---

## State Transition Summary

| Phase | RentalContract Status | Vehicle State |
|---|---|---|
| Search | — | `AVAILABLE` |
| Draft Created | `DRAFT` | `AVAILABLE` |
| Payment Held | `DRAFT` | `AVAILABLE` |
| Confirmed | `CONFIRMED` | `RESERVED` |
| Picked Up | `ACTIVE` | `RENTED` |
| Returned | `COMPLETED` | `AVAILABLE` or `MAINTENANCE` |
| Cancelled | `CANCELLED` | `AVAILABLE` |

---

## Design Pattern Interactions in This Flow

| Pattern | Where Applied |
|---|---|
| **State Pattern** | `Vehicle.state.reserve()` and `Vehicle.state.activate()` — each state validates and executes the transition |
| **Strategy Pattern** | `PricingEngine.selectStrategy()` returns the correct `PricingStrategy` implementation; `RentalContract.calculateTotalPrice()` delegates to it |
| **Factory Pattern** | `ContractFactory.create()` assembles the `RentalContract` aggregate with all dependencies |
