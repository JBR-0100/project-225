-- CreateTable
CREATE TABLE "VehicleTypeEnum" (
    "name" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "VehicleStateEnum" (
    "name" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "LoyaltyTierEnum" (
    "name" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "ContractStatusEnum" (
    "name" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "InsuranceTierEnum" (
    "name" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "MaintenanceStatusEnum" (
    "name" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "Customer" (
    "customerId" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "loyaltyTier" TEXT NOT NULL DEFAULT 'BRONZE',
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "isBlacklisted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "vehicleId" TEXT NOT NULL PRIMARY KEY,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "dailyRate" REAL NOT NULL,
    "location" TEXT NOT NULL DEFAULT 'HQ',
    "mileageKm" INTEGER NOT NULL DEFAULT 0,
    "state" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "numDoors" INTEGER,
    "transmission" TEXT,
    "fuelType" TEXT,
    "seatingCapacity" INTEGER,
    "payloadCapacityTons" REAL,
    "truckClass" TEXT,
    "hasRefrigeration" BOOLEAN,
    "batteryCapacityKwh" INTEGER,
    "rangeKm" INTEGER,
    "batteryHealthPct" INTEGER,
    "chargerType" TEXT,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RentalContract" (
    "contractId" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "actualReturnDate" DATETIME,
    "basePrice" REAL NOT NULL DEFAULT 0,
    "insuranceTotal" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RentalContract_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("customerId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RentalContract_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("vehicleId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InsurancePolicy" (
    "policyId" TEXT NOT NULL PRIMARY KEY,
    "contractId" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "dailyPremium" REAL NOT NULL,
    "deductibleAmount" REAL NOT NULL,
    "maxCoverageAmount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InsurancePolicy_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "RentalContract" ("contractId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_licensePlate_key" ON "Vehicle"("licensePlate");

-- CreateIndex
CREATE UNIQUE INDEX "InsurancePolicy_contractId_key" ON "InsurancePolicy"("contractId");
