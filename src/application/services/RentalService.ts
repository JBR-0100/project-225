import { ContractRepository } from '../../infrastructure/repositories/ContractRepository';
import { CustomerRepository } from '../../infrastructure/repositories/CustomerRepository';
import { VehicleRepository } from '../../infrastructure/repositories/VehicleRepository';
import { RentalContract } from '../../domain/entities/RentalContract';
import { InsurancePolicy } from '../../domain/entities/InsurancePolicy';
import { StandardPricingStrategy } from '../../domain/patterns/strategy/StandardPricingStrategy';
import { InsuranceTier } from '../../domain/types/enums';

export class RentalService {
    private contractRepo: ContractRepository;
    private customerRepo: CustomerRepository;
    private vehicleRepo: VehicleRepository;

    constructor() {
        this.contractRepo = new ContractRepository();
        this.customerRepo = new CustomerRepository();
        this.vehicleRepo = new VehicleRepository();
    }

    async rentVehicle(
        customerId: string,
        vehicleId: string,
        startDate: Date,
        durationDays: number,
        insuranceTier: InsuranceTier
    ): Promise<RentalContract> {
        // 1. Fetch Customer
        const customer = await this.customerRepo.findByEmail(customerId); // Assuming customerId is email for now, or need findById
        if (!customer) {
            throw new Error(`Customer with ID ${customerId} not found.`);
        }

        // 2. Fetch Vehicle
        const vehicle = await this.vehicleRepo.findById(vehicleId);
        if (!vehicle) {
            throw new Error(`Vehicle with ID ${vehicleId} not found.`);
        }

        // 3. Create Insurance Policy
        // Basic logic for now: Base 15, Deductible changes
        let dailyRate = 15;
        let deductible = 1000;
        let coverage = 5000;

        if (insuranceTier === InsuranceTier.PREMIUM) { dailyRate = 25; deductible = 500; coverage = 20000; }
        if (insuranceTier === InsuranceTier.FULL_COVERAGE) { dailyRate = 40; deductible = 0; coverage = 100000; }

        const insurance = new InsurancePolicy(insuranceTier, dailyRate, deductible, coverage);

        // 4. Create Contract
        const contract = new RentalContract(
            customer,
            vehicle,
            startDate,
            durationDays,
            insurance,
            new StandardPricingStrategy() // Default strategy
        );

        // 5. Confirm Contract (Side effect: Vehicle -> RESERVED)
        contract.confirm();

        // 6. Persist
        await this.contractRepo.save(contract);

        // Also ensure vehicle state is saved if repo doesn't cascade
        await this.vehicleRepo.save(vehicle);

        return contract;
    }
}
