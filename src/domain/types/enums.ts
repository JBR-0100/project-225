export enum VehicleType {
    CAR = 'CAR',
    TRUCK = 'TRUCK',
    ELECTRIC_VEHICLE = 'ELECTRIC_VEHICLE',
}

export enum LoyaltyTier {
    BRONZE = 'BRONZE',
    SILVER = 'SILVER',
    GOLD = 'GOLD',
    PLATINUM = 'PLATINUM',
}

export enum ContractStatus {
    DRAFT = 'DRAFT',
    CONFIRMED = 'CONFIRMED',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export enum InsuranceTier {
    BASIC = 'BASIC',
    STANDARD = 'STANDARD',
    PREMIUM = 'PREMIUM',
    FULL_COVERAGE = 'FULL_COVERAGE',
}

export enum MaintenanceStatus {
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export enum TransactionType {
    HOLD = 'HOLD',
    CHARGE = 'CHARGE',
    LATE_FEE = 'LATE_FEE',
    REFUND = 'REFUND',
    DAMAGE_FEE = 'DAMAGE_FEE',
}

export enum PaymentMethod {
    CREDIT_CARD = 'CREDIT_CARD',
    DEBIT_CARD = 'DEBIT_CARD',
    WALLET = 'WALLET',
}

export enum TransactionStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
}
