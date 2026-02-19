-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vehicle" (
    "vehicleId" TEXT NOT NULL PRIMARY KEY,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "dailyRate" REAL NOT NULL,
    "location" TEXT NOT NULL DEFAULT 'HQ',
    "mileageKm" INTEGER NOT NULL DEFAULT 0,
    "lastServiceMileage" INTEGER NOT NULL DEFAULT 0,
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
INSERT INTO "new_Vehicle" ("batteryCapacityKwh", "batteryHealthPct", "chargerType", "createdAt", "dailyRate", "deletedAt", "fuelType", "hasRefrigeration", "licensePlate", "location", "make", "mileageKm", "model", "numDoors", "payloadCapacityTons", "rangeKm", "seatingCapacity", "state", "transmission", "truckClass", "type", "updatedAt", "vehicleId", "year") SELECT "batteryCapacityKwh", "batteryHealthPct", "chargerType", "createdAt", "dailyRate", "deletedAt", "fuelType", "hasRefrigeration", "licensePlate", "location", "make", "mileageKm", "model", "numDoors", "payloadCapacityTons", "rangeKm", "seatingCapacity", "state", "transmission", "truckClass", "type", "updatedAt", "vehicleId", "year" FROM "Vehicle";
DROP TABLE "Vehicle";
ALTER TABLE "new_Vehicle" RENAME TO "Vehicle";
CREATE UNIQUE INDEX "Vehicle_licensePlate_key" ON "Vehicle"("licensePlate");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
