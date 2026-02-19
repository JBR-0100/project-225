import { VehicleFactory } from './domain/factories/VehicleFactory';
import { VehicleType } from './domain/types/enums';

console.log('Testing VehicleFactory...');

try {
    const car = VehicleFactory.createVehicle(VehicleType.CAR, {
        make: 'Honda',
        model: 'Civic',
        year: 2025,
        licensePlate: 'TEST-001',
        dailyRate: 60,
        numDoors: 4,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        seatingCapacity: 5
    });
    console.log('Car created via Factory:', car);
} catch (e) {
    console.error('Error creating car via Factory:', e);
}
