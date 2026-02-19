import { VehicleFactory } from './domain/factories/VehicleFactory';
import { VehicleType, InsuranceTier, LoyaltyTier } from './domain/types/enums';
import { Customer } from './domain/entities/Customer';
import { RentalContract } from './domain/entities/RentalContract';
import { InsurancePolicy } from './domain/entities/InsurancePolicy';
import { StandardPricingStrategy } from './domain/patterns/strategy/StandardPricingStrategy';
import { WeeklyDiscountStrategy } from './domain/patterns/strategy/WeeklyDiscountStrategy';

// 1. Create a Fleet
console.log('--- 1. Creating Fleet ---');
const sedan = VehicleFactory.createVehicle(VehicleType.CAR, {
    make: 'Toyota',
    model: 'Camry',
    year: 2024,
    licensePlate: 'ABC-123',
    dailyRate: 50,
    numDoors: 4,
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    seatingCapacity: 5,
});

const truck = VehicleFactory.createVehicle(VehicleType.TRUCK, {
    make: 'Ford',
    model: 'F-150',
    year: 2023,
    licensePlate: 'TRK-999',
    dailyRate: 120,
    payloadCapacityTons: 1.5,
    truckClass: 'Light Duty',
    hasRefrigeration: false,
});

console.log('Created Car:', sedan.getSpecifications());
console.log('Created Truck:', truck.getSpecifications());

// 2. Create a Customer
console.log('\n--- 2. Creating Customer ---');
const customer = new Customer('John', 'Doe', 'john@example.com', '555-0199');
console.log(`Customer: ${customer.getName()} (${customer.getLoyaltyTier()})`);

// 3. Create Insurance Policy
console.log('\n--- 3. Selecting Insurance ---');
const insurance = new InsurancePolicy(InsuranceTier.STANDARD, 15, 500, 20000);
console.log(`Insurance: ${insurance.getTier()} ($${insurance.getDailyPremium()}/day)`);

// 4. Create Rental Contract (Standard Strategy)
console.log('\n--- 4. Creating Rental Contract (Standard Pricing) ---');
const startDate = new Date();
const days = 3;
const contract = new RentalContract(
    customer,
    sedan,
    startDate,
    3,
    insurance,
    new StandardPricingStrategy()
);

// 5. Lifecycle Management
console.log('\n--- 5. Processing Rental Lifecycle ---');
try {
    contract.confirm(); // Reserves vehicle

    // Transition vehicle state
    contract.activate(); // Rents vehicle

    console.log(`Vehicle State: ${sedan.getState().getStateName()}`);

    // Return vehicle
    console.log('Returning vehicle after 3 days...');
    const returnDate = new Date();
    returnDate.setDate(startDate.getDate() + 3);

    contract.complete(returnDate, 150); // Added 150km

    console.log(`Vehicle State: ${sedan.getState().getStateName()}`);
    console.log(`Customer Points: ${customer.getLoyaltyPoints()}`);

} catch (error) {
    console.error('Error:', error);
}

// 6. Demonstrate Weekly Discount
console.log('\n--- 6. Creating Long-Term Rental (Weekly Discount) ---');
try {
    const longTermContract = new RentalContract(
        customer,
        truck,
        new Date(),
        10, // 10 days
        insurance,
        new WeeklyDiscountStrategy()
    );

    longTermContract.confirm();

} catch (error) {
    console.error('Error:', error);
}
