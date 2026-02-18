# DriveFlow — Professional Car Rental & Fleet Maintenance System

## Product Overview

DriveFlow is an enterprise-grade car rental and fleet management platform designed to handle the full lifecycle of a vehicle rental — from customer onboarding and vehicle discovery to contract execution, insurance selection, maintenance scheduling, and payment settlement.

The system is built around **domain-driven design** principles, ensuring that business rules live inside the domain layer and are not scattered across services or controllers.

---

## Core Features

### 1. Fleet Management
- Register and manage a diverse fleet: **Cars**, **Trucks**, and **Electric Vehicles (EVs)**
- Track vehicle availability in real time using a **State Machine** (Available → Reserved → Rented → Under Maintenance → Retired)
- Assign vehicles to maintenance windows based on mileage thresholds or scheduled intervals
- EV-specific: track battery health, charging station compatibility, and range estimates

### 2. Customer & Loyalty Management
- Customer registration with profile management
- **Loyalty Tier System**: Bronze → Silver → Gold → Platinum
  - Tiers unlock pricing discounts, priority booking, and insurance perks
- Rental history tracking per customer
- Blacklist / credit-check integration hooks

### 3. Rental Contract Lifecycle
- Search and filter available vehicles by type, date range, location, and capacity
- Create a **RentalContract** that encapsulates: vehicle, customer, dates, insurance, pricing, and payment
- Apply dynamic pricing based on vehicle type, season, duration, and customer tier
- Contract state transitions: Draft → Confirmed → Active → Completed / Cancelled
- Late return detection with automatic late-fee calculation

### 4. Insurance Policy Selection
- Multiple insurance tiers: **Basic**, **Standard**, **Premium**, **Full Coverage**
- Insurance eligibility rules per vehicle type (e.g., Trucks require minimum Standard)
- Policy attached to RentalContract at booking time

### 5. Maintenance & Compliance
- Log maintenance events: oil change, tire rotation, brake inspection, EV battery service
- Trigger maintenance alerts based on mileage or time elapsed since last service
- Fleet Manager dashboard: view overdue maintenance, schedule service windows
- Maintenance history per vehicle

### 6. Pricing Engine
- Pluggable **Pricing Strategy** per rental:
  - `StandardPricingStrategy` — base rate × days
  - `WeeklyDiscountStrategy` — 15% off for 7+ day rentals
  - `LoyaltyPricingStrategy` — tier-based discount applied on top
  - `SeasonalSurgePricingStrategy` — surge multiplier during peak seasons
- Strategies are composable (decorator pattern optional extension)

### 7. Payment & Settlement
- Payment hold at booking (pre-authorization)
- Final charge on vehicle return (adjusted for late fees, fuel charges, damage)
- Support for multiple payment methods: Credit Card, Debit Card, Wallet
- Refund processing for cancellations

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Java 17+ (or TypeScript/Node.js) |
| Architecture | Layered (Domain / Application / Infrastructure / API) |
| Database | PostgreSQL (relational) + Redis (session/cache) |
| ORM | Hibernate / TypeORM |
| API | REST (Spring Boot / Express.js) |
| Auth | JWT + OAuth2 |
| Messaging | RabbitMQ (maintenance alerts, payment events) |
| Testing | JUnit 5 / Jest + Mockito |
| Docs | OpenAPI 3.0 (Swagger) |
| Containerization | Docker + Docker Compose |

---

## Design Patterns Implemented

### 1. State Pattern — `VehicleState`
**Problem:** A vehicle's behavior (can it be rented? can it be serviced?) depends on its current state.

**Solution:** Each vehicle holds a reference to a `VehicleState` interface. Concrete states (`AvailableState`, `ReservedState`, `RentedState`, `MaintenanceState`, `RetiredState`) implement state-specific behavior and manage transitions.

```
Vehicle → holds → VehicleState (interface)
                    ├── AvailableState
                    ├── ReservedState
                    ├── RentedState
                    ├── MaintenanceState
                    └── RetiredState
```

### 2. Strategy Pattern — `PricingStrategy`
**Problem:** Pricing logic varies by vehicle type, rental duration, customer loyalty tier, and season. Hardcoding this creates a maintenance nightmare.

**Solution:** `PricingStrategy` interface with multiple interchangeable implementations. The `RentalContract` holds a reference to the active strategy, which can be swapped at runtime.

```
RentalContract → uses → PricingStrategy (interface)
                            ├── StandardPricingStrategy
                            ├── WeeklyDiscountStrategy
                            ├── LoyaltyPricingStrategy
                            └── SeasonalSurgePricingStrategy
```

### 3. Factory Pattern — `VehicleFactory`
**Problem:** Creating the correct vehicle subclass (Car, Truck, EV) with proper defaults requires conditional logic that should not leak into the service layer.

**Solution:** `VehicleFactory` encapsulates instantiation logic. Callers provide a `VehicleType` enum; the factory returns the correct concrete `Vehicle` subclass fully initialized.

```
VehicleFactory.create(VehicleType.EV, specs) → ElectricVehicle
VehicleFactory.create(VehicleType.TRUCK, specs) → Truck
VehicleFactory.create(VehicleType.CAR, specs) → Car
```

### 4. Repository Pattern
All data access is abstracted behind repository interfaces, keeping the domain layer free of persistence concerns.

### 5. Observer Pattern (Extension)
`MaintenanceObserver` listens to vehicle mileage update events and triggers maintenance alerts when thresholds are crossed.

---

## Domain Model Summary

| Entity | Role |
|---|---|
| `Vehicle` (Abstract) | Base class for all fleet assets |
| `Car`, `Truck`, `ElectricVehicle` | Concrete vehicle types |
| `Customer` | Renter with loyalty tier |
| `RentalContract` | Core domain aggregate |
| `VehicleState` | State machine interface |
| `PricingStrategy` | Pricing algorithm interface |
| `InsurancePolicy` | Coverage tier attached to contract |
| `MaintenanceLog` | Service history record |
| `PaymentTransaction` | Financial record per contract |

---

## Non-Functional Requirements

- **Extensibility**: New vehicle types or pricing strategies require zero changes to existing code (Open/Closed Principle)
- **Testability**: Domain logic is pure and injectable — no static calls or hidden dependencies
- **Auditability**: All state transitions and payment events are logged with timestamps
- **Scalability**: Stateless API layer; horizontal scaling supported
- **Security**: Role-based access (Customer, Fleet Manager, Admin)
