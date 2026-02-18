# DriveFlow — Professional Car Rental & Fleet Maintenance System

## Problem Statement

Traditional car rental businesses operate with fragmented, manual workflows — vehicle availability is tracked in spreadsheets, maintenance is reactive rather than proactive, pricing is static, and customer loyalty goes unrewarded. This leads to:

- **Revenue leakage** from untracked late returns and missed late fees
- **Fleet downtime** due to unscheduled maintenance and no mileage-based alerting
- **Customer churn** from poor booking experiences and no loyalty incentives
- **Operational chaos** when managing diverse vehicle types (Cars, Trucks, EVs) with different rules
- **No audit trail** for payment holds, state changes, or insurance claims

**DriveFlow** solves this by providing a domain-driven, fully automated rental and fleet management platform where every business rule is encoded in the system.

---

## Core Features

### 1. Fleet Management
- Register and manage a diverse fleet: **Cars**, **Trucks**, and **Electric Vehicles (EVs)**
- Real-time vehicle availability tracking via a **State Machine** (Available → Reserved → Rented → Maintenance → Retired)
- Mileage-based and time-based maintenance alerts
- EV-specific: battery health, charging compatibility, range estimates

### 2. Customer & Loyalty Management
- Customer registration and profile management
- **Loyalty Tier System**: Bronze → Silver → Gold → Platinum (unlocks discounts and perks)
- Full rental history per customer
- Blacklist / eligibility check hooks

### 3. Rental Contract Lifecycle
- Search and filter vehicles by type, date range, location, and capacity
- **RentalContract** aggregate: vehicle, customer, dates, insurance, pricing, payment
- Dynamic pricing based on vehicle type, season, duration, and loyalty tier
- Contract states: Draft → Confirmed → Active → Completed / Cancelled
- Automatic late-fee calculation on overdue returns

### 4. Insurance Policy Selection
- Tiers: **Basic**, **Standard**, **Premium**, **Full Coverage**
- Eligibility rules per vehicle type (e.g., Trucks require minimum Standard)
- Policy attached to contract at booking time

### 5. Maintenance & Compliance
- Log service events: oil change, tire rotation, brake inspection, EV battery service
- Fleet Manager dashboard: overdue maintenance, scheduled windows
- Full maintenance history per vehicle

### 6. Pricing Engine
- Pluggable strategies:
  - `StandardPricingStrategy` — base rate × days
  - `WeeklyDiscountStrategy` — 15% off for 7+ day rentals
  - `LoyaltyPricingStrategy` — tier-based discount
  - `SeasonalSurgePricingStrategy` — peak season multiplier

### 7. Payment & Settlement
- Payment hold (pre-authorization) at booking
- Final charge on return (adjusted for late fees, damage, fuel)
- Multiple payment methods: Credit Card, Debit Card, Wallet
- Refund processing for cancellations

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Language** | TypeScript 5.x |
| **Runtime** | Node.js 20 LTS |
| **Framework** | Express.js |
| **ORM** | Prisma |
| **Database** | PostgreSQL 16 |
| **Cache** | Redis |
| **Auth** | JWT + Refresh Token rotation |
| **Validation** | Zod |
| **Queue / Jobs** | BullMQ + Redis |
| **Testing** | Jest + Supertest |
| **API Docs** | Swagger / OpenAPI 3.0 |
| **Containerization** | Docker + Docker Compose |

### Project Structure
```
driveflow/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── domain/          # Entities, interfaces, value objects
│   ├── application/     # Use cases / service layer
│   ├── infrastructure/  # Prisma repositories, external adapters
│   ├── api/             # Express routes, controllers, middleware
│   └── shared/          # DTOs, errors, utils, constants
├── tests/
├── docker-compose.yml
└── package.json
```

---

## Architecture Principles

- **Clean Architecture**: Controllers → Services → Repositories separation
- **OOP Principles**: Encapsulation, Abstraction, Inheritance, Polymorphism throughout the domain model
- **SOLID Principles** adherence across all modules
- **Repository Pattern** for data access abstraction
- **DTO Pattern** for data transfer between layers

### Design Patterns

| Pattern | Applied To |
|---|---|
| **Strategy** | Pricing algorithms (Standard, Weekly, Loyalty, Seasonal) |
| **State** | Vehicle and RentalContract lifecycle management |
| **Factory** | Creating Car, Truck, ElectricVehicle instances |
| **Observer** | Maintenance alerts triggered on mileage updates |
| **Chain of Responsibility** | Rental validation pipeline (eligibility, blacklist, insurance) |
| **Command** | Rental actions: PlaceBooking, CancelRental, ProcessReturn |
| **Builder** | Rental invoice and maintenance report generation |
| **Template Method** | Standardized settlement and billing process per vehicle type |
| **Mediator** | Booking engine coordinating between Customer, Vehicle, and Payment |

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
| **Extensibility** | OCP — new types/strategies add files, never modify existing ones |
| **Testability** | DIP — domain depends on interfaces; repositories are mockable |
| **Auditability** | All state transitions and payments logged with actor + timestamp |
| **Scalability** | Stateless API; horizontal scaling via Docker; Redis for shared state |
| **Security** | JWT auth, Zod input validation, RBAC (Customer / Fleet Manager / Admin) |
| **Observability** | Structured JSON logging, request tracing via correlation IDs |
