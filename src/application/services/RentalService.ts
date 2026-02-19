import { ContractRepository } from '../../infrastructure/repositories/ContractRepository';
import { CustomerRepository } from '../../infrastructure/repositories/CustomerRepository';
import { VehicleRepository } from '../../infrastructure/repositories/VehicleRepository';
import { RentalContract } from '../../domain/entities/RentalContract';
import { InsurancePolicy } from '../../domain/entities/InsurancePolicy';
import { StandardPricingStrategy } from '../../domain/patterns/strategy/StandardPricingStrategy';
import { InsuranceTier } from '../../domain/types/enums';

import { Logger } from '../../infrastructure/Logger';
import { AppError, VehicleNotAvailableError } from '../../domain/errors';
import { EventBus, DomainEvents } from '../../infrastructure/events/EventBus';

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
        Logger.info('Initiating rental process', { customerId, vehicleId, startDate, durationDays });

        // 1. Fetch Customer
        const customer = await this.customerRepo.findByEmail(customerId);
        if (!customer) {
            Logger.warn(`Customer not found during rental attempt`, { customerId });
            throw new AppError(`Customer with ID ${customerId} not found.`, 404);
        }

        // 2. Fetch Vehicle
        const vehicle = await this.vehicleRepo.findById(vehicleId);
        if (!vehicle) {
            Logger.warn(`Vehicle not found during rental attempt`, { vehicleId });
            throw new AppError(`Vehicle with ID ${vehicleId} not found.`, 404);
        }

        // Check if vehicle is available
        if (vehicle.getState().getStateName() !== 'AVAILABLE') {
            Logger.warn(`Vehicle not available`, { vehicleId, state: vehicle.getState().getStateName() });
            throw new VehicleNotAvailableError(`Vehicle ${vehicleId} is currently ${vehicle.getState().getStateName()}`);
        }

        // 3. Create Insurance Policy
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
            new StandardPricingStrategy()
        );

        // 5. Confirm Contract
        try {
            contract.confirm();
        } catch (error) {
            Logger.error('Failed to confirm contract', { error, vehicleId });
            throw new VehicleNotAvailableError('Vehicle failed to reserve.');
        }

        // 6. Persist
        await this.contractRepo.save(contract);
        await this.vehicleRepo.save(vehicle);

        Logger.info('Rental contract created successfully', { contractId: contract.getContractId(), vehicleId });

        // Observer Pattern: Publish event to trigger background jobs
        EventBus.publish(DomainEvents.RENTAL_CREATED, {
            contractId: contract.getContractId(),
            customerEmail: customerId,
            totalAmount: contract.getTotalAmount(),
            insuranceTier,
        });

        return contract;
    }
}
