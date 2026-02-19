import { VehicleFactory } from './domain/factories/VehicleFactory';
import { VehicleType, InsuranceTier, LoyaltyTier } from './domain/types/enums';
import { Customer } from './domain/entities/Customer';
import { RentalContract } from './domain/entities/RentalContract';
import { InsurancePolicy } from './domain/entities/InsurancePolicy';
import { StandardPricingStrategy } from './domain/patterns/strategy/StandardPricingStrategy';
import { VehicleRepository } from './infrastructure/repositories/VehicleRepository';
import { CustomerRepository } from './infrastructure/repositories/CustomerRepository';
import { ContractRepository } from './infrastructure/repositories/ContractRepository';

async function main() {
    const vehicleRepo = new VehicleRepository();
    const customerRepo = new CustomerRepository();
    const contractRepo = new ContractRepository();

    console.log('--- 1. Seeding Data ---');

    // Create Vehicle
    const car = VehicleFactory.createVehicle(VehicleType.CAR, {
        make: 'Honda',
        model: 'Civic',
        year: 2025,
        licensePlate: 'DB-TEST-001',
        dailyRate: 60,
        numDoors: 4,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        seatingCapacity: 5,
    });
    await vehicleRepo.save(car);
    console.log('Vehicle saved:', car.getVehicleId());

    // Create Customer
    const customer = new Customer('Jane', 'Smith', 'jane.db@example.com', '555-9999');
    await customerRepo.save(customer);
    console.log('Customer saved:', customer.getCustomerId());

    // --- Concurrency Test ---
    console.log('\n--- 2. Concurrency & Double Booking Test ---');

    const startDate = new Date();
    const insurance = new InsurancePolicy(InsuranceTier.BASIC, 10, 1000, 5000);

    // Booking 1
    const contract1 = new RentalContract(
        customer,
        car,
        startDate,
        3,
        insurance,
        new StandardPricingStrategy()
    );
    contract1.confirm(); // Set status to CONFIRMED

    // Booking 2 (Same dates, same vehicle)
    const contract2 = new RentalContract(
        customer,
        car,
        startDate,
        3,
        insurance,
        new StandardPricingStrategy()
    );
    contract2.confirm();

    try {
        console.log('Saving Contract 1...');
        await contractRepo.save(contract1);
        console.log('Contract 1 saved successfully.');
    } catch (e) {
        console.error('Failed to save Contract 1:', e);
    }

    try {
        console.log('Saving Contract 2 (Should Fail)...');
        await contractRepo.save(contract2);
        console.log('ERROR: Contract 2 saved but should have failed!');
    } catch (e: any) {
        console.log('SUCCESS: Contract 2 failed as expected:', e.message);
    }

    // --- Soft Delete Test ---
    console.log('\n--- 3. Soft Delete Test ---');

    const availableBefore = await vehicleRepo.findAvailableByDate(startDate, startDate);
    console.log(`Available vehicles before delete: ${availableBefore.length}`);

    await vehicleRepo.delete(car.getVehicleId());

    const availableAfter = await vehicleRepo.findAvailableByDate(startDate, startDate);
    console.log(`Available vehicles after delete: ${availableAfter.length}`);

    if (availableBefore.length > availableAfter.length) {
        console.log('SUCCESS: Vehicle was soft deleted and excluded from queries.');
    } else {
        console.log('ERROR: Soft delete verification failed.');
    }

}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        // Optional: Disconnect prisma if needed
    });
