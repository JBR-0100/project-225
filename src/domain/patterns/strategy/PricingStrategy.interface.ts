import { RentalContract } from '../../entities/RentalContract';

export interface PricingStrategy {
    calculatePrice(contract: RentalContract): number;
    getStrategyName(): string;
}
