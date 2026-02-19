import { PricingStrategy } from './PricingStrategy.interface';
import { RentalContract } from '../../entities/RentalContract';

export class SeasonalSurgePricingStrategy implements PricingStrategy {
    private static readonly SURGE_MULTIPLIER = 1.25; // 25% surge

    calculatePrice(contract: RentalContract): number {
        const days = contract.getRentalDurationDays();
        const dailyRate = contract.getVehicle().getDailyRate();
        const baseTotal = days * dailyRate;

        // Simplified logic: assume current date is peak season for demo purposes
        // In real app, we check contract dates against configured peak periods
        const isPeakSeason = true;

        if (isPeakSeason) {
            console.log(`Applying ${SeasonalSurgePricingStrategy.SURGE_MULTIPLIER}x surge pricing.`);
            return baseTotal * SeasonalSurgePricingStrategy.SURGE_MULTIPLIER;
        }

        return baseTotal;
    }

    getStrategyName(): string {
        return 'Seasonal Surge Pricing';
    }
}
