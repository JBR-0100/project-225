import { PricingStrategy } from './PricingStrategy.interface';
import { RentalContract } from '../../entities/RentalContract';

export class WeeklyDiscountStrategy implements PricingStrategy {
    private static readonly DISCOUNT_RATE = 0.15; // 15% off

    calculatePrice(contract: RentalContract): number {
        const days = contract.getRentalDurationDays();
        const dailyRate = contract.getVehicle().getDailyRate();
        let total = days * dailyRate;

        if (days >= 7) {
            console.log('Applying 15% weekly discount.');
            total = total * (1 - WeeklyDiscountStrategy.DISCOUNT_RATE);
        }

        return total;
    }

    getStrategyName(): string {
        return 'Weekly Discount (15% off for 7+ days)';
    }
}
