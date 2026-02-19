# 🚗 DriveFlow — Enterprise Car Rental System

> A production-grade car rental backend built with **TypeScript**, **Express**, and **Prisma**, demonstrating advanced OOP principles, GoF design patterns, and real-world system design.

DriveFlow manages fleet operations—from vehicle creation to contract lifecycle, automated maintenance, and background task processing—using a clean three-tier architecture with no shortcuts.

---

## 📐 Design Patterns

### 🔄 State Pattern — Vehicle Lifecycle

Traditional approach: a giant `if/else` on a `status` string. Our approach: each state is its own class implementing `VehicleState`.

```
AVAILABLE → RESERVED → RENTED → AVAILABLE
                                    ↓
                              MAINTENANCE → AVAILABLE / RETIRED
```

Each state **enforces its own transition rules**. Try to rent an already-rented vehicle? The `RentedState` class throws immediately—no centralized switch needed.

```typescript
// The vehicle delegates behavior to its current state object
vehicle.reserve();          // AvailableState → ReservedState ✅
vehicle.reserve();          // RentedState → throws Error ❌
```

**Why?** Open/Closed Principle. Adding a new state (e.g., `DamagedState`) requires zero changes to existing code—just a new class.

---

### 💰 Strategy Pattern — Pricing Engine

Pricing logic is **decoupled from the contract**. Swap strategies at runtime without touching the `RentalContract` class.

| Strategy | Behavior |
|---|---|
| `StandardPricingStrategy` | `dailyRate × days` |
| `LoyaltyPricingStrategy` | Applies tier-based discounts (Gold: 10%, Platinum: 15%) |
| `SeasonalSurgePricingStrategy` | Dynamic multiplier for peak seasons |

```typescript
const contract = new RentalContract(customer, vehicle, date, 7, insurance, new LoyaltyPricingStrategy());
// Gold customer pays $451 instead of $490 — 10% saved
```

**Why?** Adding a "Corporate Fleet Discount" strategy requires zero changes to `RentalContract`.

---

### 🏭 Factory Pattern — Vehicle Creation

All vehicle instantiation goes through `VehicleFactory.createVehicle()`. The caller never needs to know about `Car`, `Truck`, or `ElectricVehicle` constructors.

```typescript
const ev = VehicleFactory.createVehicle(VehicleType.ELECTRIC_VEHICLE, {
    make: 'Tesla', model: 'Model 3', year: 2025,
    licensePlate: 'DF-EV-001', dailyRate: 120,
    batteryCapacityKwh: 75, rangeKm: 358, chargerType: 'Type 2',
});
```

**Why?** Centralizes validation, enforces consistency, and makes subclass changes invisible to consuming code.

---

## 🏗️ System Architecture

DriveFlow follows a strict **three-tier / layered architecture**:

```
┌──────────────────────────────────────────────────────┐
│                  API / Interface Layer                │
│   Routes → Controllers → Middleware (Auth, RBAC,     │
│   Rate Limiting, Validation, Error Handling)          │
├──────────────────────────────────────────────────────┤
│                  Application Layer                    │
│   RentalService, AuthService, MaintenanceService     │
│   (Orchestrates domain objects + infrastructure)      │
├──────────────────────────────────────────────────────┤
│                    Domain Layer                       │
│   Entities (Vehicle, Customer, RentalContract)       │
│   Patterns (State, Strategy, Factory)                │
│   Value Objects, Enums, Domain Errors                │
├──────────────────────────────────────────────────────┤
│                Infrastructure Layer                   │
│   Prisma Repositories, Winston Logger, EventBus,     │
│   JobQueue, CRON Scheduler, Background Workers       │
└──────────────────────────────────────────────────────┘
```

**Dependency Rule:** Each layer only depends on the layer below it. Domain has **zero** framework dependencies.

---

## ⚡ Key Real-World Features

### 🔒 Concurrency — Double-Booking Protection

The State Pattern ensures a vehicle cannot be rented twice simultaneously. The `VehicleState` interface enforces valid transitions at the domain level, while optimistic locking (`version` field) protects against race conditions at the database level.

### 🔧 Automated Maintenance Triggers

A **CRON job** runs daily at midnight, scanning for vehicles where:

```
mileageKm > lastServiceMileage + 5,000
```

Matching vehicles are automatically transitioned to `MAINTENANCE` state—no human intervention required.

### 📨 Background Task Processing

Long-running operations are offloaded to an **in-memory job queue** (Observer Pattern):

- **Customer Registration** → Welcome email (background)
- **Rental Creation** → PDF receipt + Insurance verification (background)
- Event-driven via `EventBus` pub/sub

### 🛡️ Security & Identity

- JWT-based authentication with bcrypt password hashing
- Role-Based Access Control (RBAC): `CUSTOMER` vs `FLEET_MANAGER`
- Rate limiting on sensitive endpoints

### 📊 Observability

- **Structured logging** via Winston (JSON + colored console)
- **Global error handler** — domain errors map to HTTP status codes, stack traces hidden in production
- **Health check** endpoint (`GET /health`) verifying database connectivity
- **Graceful shutdown** with connection draining

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
git clone https://github.com/JBR-0100/project-223.git
cd project-223
npm install
```

### Database Setup

```bash
npx prisma migrate dev        # Apply migrations (SQLite — zero external deps)
npx prisma generate           # Generate Prisma Client
```

### Run the Demo

```bash
# Full "Day in the Life" demo — exercises all 4 design patterns
npx ts-node src/demo-dayinlife.ts

# API verification (HTTP endpoints)
npx ts-node src/demo-api.ts

# Security demo (Auth, RBAC, Rate Limiting)
npx ts-node src/demo-auth.ts

# Background tasks demo (EventBus, CRON, Workers)
npx ts-node src/demo-background.ts

# Resilience demo (Health Check, Error Handling)
npx ts-node src/demo-resilience.ts
```

### Start the Server

```bash
npx ts-node src/server.ts      # Runs on http://localhost:3000
```

---

## 📁 Project Structure

```
src/
├── domain/                    # Pure business logic (no framework deps)
│   ├── entities/              # Vehicle, Customer, RentalContract, InsurancePolicy
│   ├── factories/             # VehicleFactory
│   ├── patterns/
│   │   ├── state/             # Available, Reserved, Rented, Maintenance, Retired
│   │   └── strategy/          # Standard, Loyalty, SeasonalSurge pricing
│   ├── errors/                # AppError, VehicleNotAvailableError
│   └── types/                 # Enums (VehicleType, LoyaltyTier, etc.)
├── application/               # Service orchestration
│   └── services/              # RentalService, AuthService, MaintenanceService
├── infrastructure/            # External concerns
│   ├── repositories/          # Prisma-backed persistence
│   ├── events/                # EventBus (Observer Pattern)
│   ├── queue/                 # In-memory JobQueue
│   ├── scheduler/             # CRON maintenance checker
│   ├── workers/               # Background job handlers
│   ├── Logger.ts              # Winston structured logging
│   └── bootstrap.ts           # Wires queues, events, CRON on startup
├── interface/http/            # Express API layer
│   ├── controllers/           # Request handlers
│   ├── middleware/             # Auth, RBAC, Rate Limit, Error Handler
│   ├── routes/                # Route definitions
│   └── schemas/               # Zod validation schemas
└── server.ts                  # Entry point with graceful shutdown
```

---

## 🧪 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | — | Register a new customer |
| `POST` | `/api/v1/auth/login` | — | Login and receive JWT |
| `GET` | `/api/v1/vehicles` | 🔑 | List all vehicles |
| `POST` | `/api/v1/vehicles` | 🔑👔 | Add a vehicle (Fleet Manager) |
| `POST` | `/api/v1/rentals` | 🔑 | Create a rental contract |
| `GET` | `/api/v1/health` | — | Service health check |

🔑 = Requires JWT &nbsp; 👔 = Fleet Manager role only

---

## 📝 License

ISC
