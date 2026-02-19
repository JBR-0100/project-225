import { PricingStrategy } from './PricingStrategy.interface';
import { RentalContract } from '../../entities/RentalContract';

export class StandardPricingStrategy implements PricingStrategy {
    calculatePrice(contract: RentalContract): number {
        const days = contract.getRentalDurationDays();
        const dailyRate = contract.getVehicle().getDailyRate();
        return days * dailyRate;
    }

    getStrategyName(): string {
        return 'Standard Pricing';
    }
}
