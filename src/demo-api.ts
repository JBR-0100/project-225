import request from 'supertest';
import app from './app';
import { VehicleFactory } from './domain/factories/VehicleFactory';
import { VehicleType, InsuranceTier } from './domain/types/enums';
import { Customer } from './domain/entities/Customer';
import { VehicleRepository } from './infrastructure/repositories/VehicleRepository';
import { CustomerRepository } from './infrastructure/repositories/CustomerRepository';

async function main() {
    const vehicleRepo = new VehicleRepository();
    const customerRepo = new CustomerRepository();

    console.log('--- 1. Seeding Data for API Test ---');

    // Seed Vehicle
    const car = VehicleFactory.createVehicle(VehicleType.CAR, {
        make: 'Toyota',
        model: 'Corolla',
        year: 2024,
        licensePlate: 'API-TEST-001',
        dailyRate: 50,
        numDoors: 4,
        transmission: 'Automatic',
        fuelType: 'Hybrid',
        seatingCapacity: 5
    });
    await vehicleRepo.save(car);
    const vehicleId = car.getVehicleId();
    console.log(`Seeded Vehicle: ${vehicleId}`);

    // Seed Customer
    const customer = new Customer('John', 'Doe', 'john.api@example.com', '555-1234');
    await customerRepo.save(customer);
    const customerId = customer.getEmail(); // Using email as ID for findByEmail
    console.log(`Seeded Customer: ${customerId}`);

    console.log('\n--- 2. Testing GET /api/v1/vehicles/available ---');
    const today = new Date().toISOString();
    const tomorrow = new Date(Date.now() + 86400000).toISOString();

    const resVehicles = await request(app)
        .get('/api/v1/vehicles/available')
        .query({ startDate: today, endDate: tomorrow });

    console.log('Status:', resVehicles.status);
    console.log('Vehicles found:', resVehicles.body.data?.length);
    if (resVehicles.status === 200 && resVehicles.body.data.length > 0) {
        console.log('SUCCESS: Retrieved available vehicles.');
    } else {
        console.error('FAILED: Could not retrieve vehicles.', resVehicles.body);
    }

    console.log('\n--- 3. Testing POST /api/v1/rentals (Create Booking) ---');
    const resRental = await request(app)
        .post('/api/v1/rentals')
        .send({
            customerId: customerId,
            vehicleId: vehicleId,
            startDate: tomorrow,
            days: 3,
            insuranceTier: InsuranceTier.FULL_COVERAGE
        });

    console.log('Status:', resRental.status);
    console.log('Response:', resRental.body);

    if (resRental.status === 201) {
        console.log('SUCCESS: Rental contract created.');
    } else {
        console.error('FAILED: Could not create rental.', resRental.body);
    }

    console.log('\n--- 4. Testing PATCH /api/v1/vehicles/:id/status (Maintenance) ---');
    const resMaintenance = await request(app)
        .patch(`/api/v1/vehicles/${vehicleId}/status`)
        .send({ status: 'MAINTENANCE' });

    console.log('Status:', resMaintenance.status);
    console.log('Response:', resMaintenance.body);

    if (resMaintenance.status === 200) {
        console.log('SUCCESS: Vehicle status updated to MAINTENANCE.');
    } else {
        console.error('FAILED: Could not update status.', resMaintenance.body);
    }
}

main().catch(console.error);
