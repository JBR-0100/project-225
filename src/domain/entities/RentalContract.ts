import { v4 as uuidv4 } from 'uuid';
import { ContractStatus } from '../types/enums';
import { Customer } from './Customer';
import { Vehicle } from './Vehicle';
import { InsurancePolicy } from './InsurancePolicy';
import { PricingStrategy } from '../patterns/strategy/PricingStrategy.interface';

export class RentalContract {
    private contractId: string;
    private status: ContractStatus;
    private startDate: Date;
    private endDate: Date;
    private actualReturnDate: Date | null;
    private customer: Customer;
    private vehicle: Vehicle;
    private insurancePolicy: InsurancePolicy;
    private pricingStrategy: PricingStrategy;

    // Financials
    private basePrice: number;
    private insuranceTotal: number;
    private totalAmount: number;

    constructor(
        customer: Customer,
        vehicle: Vehicle,
        startDate: Date,
        days: number,
        insurance: InsurancePolicy,
        strategy: PricingStrategy
    ) {
        this.contractId = uuidv4();
        this.status = ContractStatus.DRAFT;
        this.customer = customer;
        this.vehicle = vehicle;
        this.startDate = startDate;
        this.endDate = new Date(startDate);
        this.endDate.setDate(startDate.getDate() + days);
        this.insurancePolicy = insurance;
        this.pricingStrategy = strategy;
        this.actualReturnDate = null;
        this.basePrice = 0;
        this.insuranceTotal = 0;
        this.totalAmount = 0;
    }

    // Getters
    getContractId(): string { return this.contractId; }
    getStatus(): ContractStatus { return this.status; }
    getCustomer(): Customer { return this.customer; }
    getVehicle(): Vehicle { return this.vehicle; }
    getRentalDurationDays(): number {
        const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    getTotalAmount(): number { return this.totalAmount; }

    confirm(): void {
        if (!this.customer.isEligibleToRent()) {
            throw new Error('Customer is not eligible to rent.');
        }
        if (!this.vehicle.getState().getStateName().includes('AVAILABLE')) {
            throw new Error('Vehicle is not available for rental.');
        }

        this.CalculateEstimatedTotal();
        this.status = ContractStatus.CONFIRMED;
        this.vehicle.reserve(); // Transition vehicle state
        console.log(`Contract ${this.contractId} confirmed. Estimated Total: $${this.totalAmount}`);
    }

    activate(): void {
        if (this.status !== ContractStatus.CONFIRMED) {
            throw new Error('Contract must be confirmed before activating.');
        }
        this.status = ContractStatus.ACTIVE;
        this.vehicle.activateRental(); // Transition vehicle state
        console.log(`Contract ${this.contractId} activated.`);
    }

    complete(returnDate: Date, mileageAdded: number): void {
        if (this.status !== ContractStatus.ACTIVE) {
            throw new Error('Contract is not active.');
        }
        this.actualReturnDate = returnDate;
        this.status = ContractStatus.COMPLETED;
        this.vehicle.returnVehicle(mileageAdded); // Transition vehicle state

        // Recalculate based on actual return date (simple logic for now)
        this.totalAmount = this.pricingStrategy.calculatePrice(this) + this.insuranceTotal;

        // Add loyalty points (1 point per $10 spent)
        const pointsEarned = Math.floor(this.totalAmount / 10);
        this.customer.addLoyaltyPoints(pointsEarned);

        console.log(`Contract completed. Final Total: $${this.totalAmount}. Points earned: ${pointsEarned}`);
    }

    private CalculateEstimatedTotal(): void {
        const vehicleCost = this.pricingStrategy.calculatePrice(this);
        const days = this.getRentalDurationDays();
        this.insuranceTotal = this.insurancePolicy.getDailyPremium() * days;
        this.totalAmount = vehicleCost + this.insuranceTotal;
    }
}
