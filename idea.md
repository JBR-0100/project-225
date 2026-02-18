# DriveFlow — Professional Car Rental & Fleet Maintenance System

## Problem Statement

Traditional car rental businesses operate with fragmented, manual workflows — vehicle availability is tracked in spreadsheets, maintenance is reactive rather than proactive, pricing is static, and customer loyalty goes unrewarded. This leads to:

- **Revenue leakage** from untracked late returns and missed late fees
- **Fleet downtime** due to unscheduled maintenance and no mileage-based alerting
- **Customer churn** from poor booking experiences and no loyalty incentives
- **Operational chaos** when managing diverse vehicle types (Cars, Trucks, EVs) with different rules
- **No audit trail** for payment holds, state changes, or insurance claims

**DriveFlow** solves this by providing a domain-driven, fully automated rental and fleet management platform — where every business rule is encoded in the system, not in someone's head.

---

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
| **Language** | TypeScript 5.x |
| **Runtime** | Node.js 20 LTS |
| **Framework** | Express.js (REST API) |
| **ORM** | **Prisma** (type-safe DB client + migrations) |
| **Database** | PostgreSQL 16 |
| **Cache** | Redis (session store, rate limiting) |
| **Auth** | JWT (access token) + Refresh Token rotation |
| **Validation** | Zod (schema validation at API boundary) |
| **Messaging** | BullMQ + Redis (maintenance alerts, payment events) |
| **Testing** | Jest + Supertest (unit + integration) |
| **API Docs** | Swagger / OpenAPI 3.0 (via `swagger-jsdoc`) |
| **Containerization** | Docker + Docker Compose |
| **Linting** | ESLint + Prettier |

### Why Prisma?
- **Type-safe queries** — Prisma generates TypeScript types directly from the schema, eliminating runtime type mismatches
- **Auto-migrations** — `prisma migrate dev` keeps the DB schema in sync with `schema.prisma`
- **Readable schema** — The `schema.prisma` file serves as the single source of truth for the data model
- **Relation handling** — Nested reads/writes (e.g., contract with vehicle + customer + payments) are first-class citizens
- **Prisma Studio** — Built-in GUI for inspecting data during development

### Project Structure
```
driveflow/
├── prisma/
│   ├── schema.prisma          # Data model & relations
│   └── migrations/            # Auto-generated migration files
├── src/
│   ├── domain/                # Entities, interfaces, value objects
│   │   ├── vehicle/
│   │   ├── rental/
│   │   ├── customer/
│   │   └── maintenance/
│   ├── application/           # Use cases / service layer
│   ├── infrastructure/        # Prisma repositories, external APIs
│   ├── api/                   # Express routes, controllers, middleware
│   └── shared/                # DTOs, errors, utils, constants
├── tests/
├── docker-compose.yml
└── package.json
```

---

## Architecture Principles

### 1. Layered Architecture (Clean Architecture)
The codebase is divided into four strict layers with a one-way dependency rule:

```
API Layer  →  Application Layer  →  Domain Layer
                                        ↑
                          Infrastructure Layer (implements domain interfaces)
```

- **Domain Layer**: Pure TypeScript classes and interfaces. Zero framework dependencies. Contains `Vehicle`, `RentalContract`, `VehicleState`, `PricingStrategy`, etc.
- **Application Layer**: Orchestrates use cases (e.g., `CreateRentalUseCase`, `ReturnVehicleUseCase`). Calls domain logic and repository interfaces.
- **Infrastructure Layer**: Prisma repository implementations, payment gateway adapters, email/SMS clients.
- **API Layer**: Express controllers, route definitions, Zod validation, JWT middleware.

### 2. Open/Closed Principle (OCP)
New vehicle types, pricing strategies, or insurance tiers can be added **without modifying existing code** — only by adding new classes that implement the existing interfaces (`PricingStrategy`, `VehicleState`).

### 3. Dependency Inversion Principle (DIP)
The Application and Domain layers depend on **interfaces**, not concrete implementations. Prisma repositories are injected at runtime, making the domain fully testable with mock repositories.

### 4. Single Responsibility Principle (SRP)
Each class has one reason to change:
- `RentalContract` manages contract lifecycle logic
- `PricingEngine` selects and applies pricing strategies
- `VehicleStateManager` handles state transitions
- `PaymentService` handles all payment operations

### 5. Fail-Fast Validation
All incoming API requests are validated at the boundary using **Zod schemas** before reaching the application layer. Invalid data never enters the domain.

### 6. Immutable Value Objects
Monetary values (`Money`), date ranges (`DateRange`), and loyalty tiers are modeled as immutable value objects — no accidental mutation of financial data.

### 7. Event-Driven Side Effects
Side effects (sending emails, triggering maintenance alerts, posting payment events) are handled via **BullMQ jobs** — decoupled from the main request/response cycle. The core domain remains pure.

### 8. Audit Trail by Default
Every state transition (vehicle state, contract status, payment) is recorded with a timestamp and actor ID. This is enforced at the infrastructure layer, not left to individual developers.

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

```typescript
VehicleFactory.create(VehicleType.EV, specs)    // → ElectricVehicle
VehicleFactory.create(VehicleType.TRUCK, specs) // → Truck
VehicleFactory.create(VehicleType.CAR, specs)   // → Car
```

### 4. Repository Pattern
All data access is abstracted behind repository interfaces (`IVehicleRepository`, `IRentalContractRepository`, etc.). Prisma implementations live in the infrastructure layer, keeping the domain clean.

### 5. Observer Pattern (Extension)
`MaintenanceObserver` listens to vehicle mileage update events and triggers maintenance alerts when thresholds are crossed — implemented as BullMQ event handlers.

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

| Requirement | Approach |
|---|---|
| **Extensibility** | OCP — new types/strategies add files, not modify existing ones |
| **Testability** | DIP — domain logic is pure, repositories are mockable |
| **Auditability** | All state transitions and payments logged with actor + timestamp |
| **Scalability** | Stateless API; horizontal scaling via Docker; Redis for shared state |
| **Security** | JWT auth, Zod input validation, RBAC (Customer / Fleet Manager / Admin) |
| **Observability** | Structured JSON logging (Winston), request tracing via correlation IDs |
