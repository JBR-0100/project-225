import { PricingStrategy } from './PricingStrategy.interface';
import { RentalContract } from '../../entities/RentalContract';
import { LoyaltyTier } from '../../types/enums';

export class LoyaltyPricingStrategy implements PricingStrategy {
    private tierDiscounts: Map<LoyaltyTier, number> = new Map([
        [LoyaltyTier.BRONZE, 0.0],
        [LoyaltyTier.SILVER, 0.05],
        [LoyaltyTier.GOLD, 0.10],
        [LoyaltyTier.PLATINUM, 0.15],
    ]);

    calculatePrice(contract: RentalContract): number {
        const days = contract.getRentalDurationDays();
        const dailyRate = contract.getVehicle().getDailyRate();
        const baseTotal = days * dailyRate;

        const customerTier = contract.getCustomer().getLoyaltyTier();
        const discount = this.tierDiscounts.get(customerTier) || 0.0;

        if (discount > 0) {
            console.log(`Applying ${discount * 100}% loyalty discount for ${customerTier} tier.`);
        }

        return baseTotal * (1 - discount);
    }

    getStrategyName(): string {
        return 'Loyalty Tier Discount';
    }
}
