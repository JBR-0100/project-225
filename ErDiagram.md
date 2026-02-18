# DriveFlow — Entity Relationship Diagram

## Diagram

```mermaid
erDiagram

    CUSTOMER {
        uuid customer_id PK
        string first_name
        string last_name
        string email
        string phone
        string loyalty_tier
        int loyalty_points
        boolean is_blacklisted
        timestamp created_at
    }

    VEHICLE {
        uuid vehicle_id PK
        string make
        string model
        int year
        string license_plate
        string vehicle_type
        string state
        int mileage_km
        decimal daily_rate
        string location
        timestamp created_at
    }

    CAR {
        uuid car_id PK
        uuid vehicle_id FK
        int num_doors
        string transmission
        string fuel_type
        int seating_capacity
    }

    TRUCK {
        uuid truck_id PK
        uuid vehicle_id FK
        decimal payload_capacity_tons
        string truck_class
        boolean has_refrigeration
    }

    ELECTRIC_VEHICLE {
        uuid ev_id PK
        uuid vehicle_id FK
        int battery_capacity_kwh
        int range_km
        int battery_health_pct
        string charger_type
    }

    INSURANCE_POLICY {
        uuid policy_id PK
        string tier
        string coverage_description
        decimal daily_premium
        decimal deductible_amount
        decimal max_coverage_amount
    }

    RENTAL_CONTRACT {
        uuid contract_id PK
        uuid customer_id FK
        uuid vehicle_id FK
        uuid policy_id FK
        uuid pricing_strategy_id FK
        string status
        date start_date
        date end_date
        date actual_return_date
        decimal base_price
        decimal insurance_total
        decimal late_fee
        decimal total_amount
        timestamp created_at
        timestamp updated_at
    }

    PRICING_STRATEGY {
        uuid strategy_id PK
        string strategy_name
        string strategy_type
        decimal discount_rate
        decimal surge_multiplier
        string applicable_tier
    }

    PAYMENT_TRANSACTION {
        uuid transaction_id PK
        uuid contract_id FK
        string transaction_type
        string payment_method
        decimal amount
        string status
        string gateway_reference
        timestamp processed_at
    }

    MAINTENANCE_LOG {
        uuid log_id PK
        uuid vehicle_id FK
        uuid assigned_by FK
        string service_type
        string description
        int mileage_at_service
        decimal cost
        date scheduled_date
        date completed_date
        string status
    }

    FLEET_MANAGER {
        uuid manager_id PK
        string name
        string email
        string role
    }

    %% Inheritance (1:1 specialization)
    VEHICLE ||--o| CAR : "is-a"
    VEHICLE ||--o| TRUCK : "is-a"
    VEHICLE ||--o| ELECTRIC_VEHICLE : "is-a"

    %% Core rental relationships
    CUSTOMER ||--o{ RENTAL_CONTRACT : "books"
    VEHICLE ||--o{ RENTAL_CONTRACT : "assigned to"
    INSURANCE_POLICY ||--o{ RENTAL_CONTRACT : "covers"
    PRICING_STRATEGY ||--o{ RENTAL_CONTRACT : "applied to"

    %% Payment
    RENTAL_CONTRACT ||--o{ PAYMENT_TRANSACTION : "generates"

    %% Maintenance
    VEHICLE ||--o{ MAINTENANCE_LOG : "has"
    FLEET_MANAGER ||--o{ MAINTENANCE_LOG : "assigns"
```

---

## Relationship Summary

| Relationship | Cardinality | Description |
|---|---|---|
| `VEHICLE` → `CAR` | 1:0..1 | A vehicle may be specialized as a Car |
| `VEHICLE` → `TRUCK` | 1:0..1 | A vehicle may be specialized as a Truck |
| `VEHICLE` → `ELECTRIC_VEHICLE` | 1:0..1 | A vehicle may be specialized as an EV |
| `CUSTOMER` → `RENTAL_CONTRACT` | 1:N | A customer can have many rental contracts |
| `VEHICLE` → `RENTAL_CONTRACT` | 1:N | A vehicle can appear in many contracts (over time) |
| `INSURANCE_POLICY` → `RENTAL_CONTRACT` | 1:N | One policy type can be used across many contracts |
| `PRICING_STRATEGY` → `RENTAL_CONTRACT` | 1:N | A strategy can be applied to many contracts |
| `RENTAL_CONTRACT` → `PAYMENT_TRANSACTION` | 1:N | A contract generates multiple transactions (hold, charge, refund) |
| `VEHICLE` → `MAINTENANCE_LOG` | 1:N | A vehicle has a full maintenance history |
| `FLEET_MANAGER` → `MAINTENANCE_LOG` | 1:N | A manager can assign many maintenance tasks |

---

## Notes

- **Vehicle Inheritance**: Implemented as a **Table-Per-Type (TPT)** strategy — the `VEHICLE` table holds common fields; `CAR`, `TRUCK`, and `ELECTRIC_VEHICLE` tables hold type-specific fields linked via FK.
- **Pricing Strategy**: Stored as a reference table; the actual algorithm lives in the application layer (Strategy Pattern).
- **Rental Contract Status**: Managed by the application's State Machine — values: `DRAFT`, `CONFIRMED`, `ACTIVE`, `COMPLETED`, `CANCELLED`.
- **Payment Transaction Types**: `HOLD`, `CHARGE`, `LATE_FEE`, `REFUND`, `DAMAGE_FEE`.
