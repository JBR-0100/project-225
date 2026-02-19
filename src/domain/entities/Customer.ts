import { v4 as uuidv4 } from 'uuid';
import { LoyaltyTier } from '../types/enums';

export class Customer {
    private customerId: string;
    private firstName: string;
    private lastName: string;
    private email: string;
    private phone: string;
    private loyaltyTier: LoyaltyTier;
    private loyaltyPoints: number;
    private isBlacklisted: boolean;

    constructor(firstName: string, lastName: string, email: string, phone: string) {
        this.customerId = uuidv4();
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.loyaltyTier = LoyaltyTier.BRONZE;
        this.loyaltyPoints = 0;
        this.isBlacklisted = false;
    }

    getCustomerId(): string { return this.customerId; }
    getName(): string { return `${this.firstName} ${this.lastName}`; }
    getEmail(): string { return this.email; }
    getLoyaltyTier(): LoyaltyTier { return this.loyaltyTier; }
    getLoyaltyPoints(): number { return this.loyaltyPoints; }
    isEligibleToRent(): boolean { return !this.isBlacklisted; }

    addLoyaltyPoints(points: number): void {
        this.loyaltyPoints += points;
        console.log(`Added ${points} points. Total: ${this.loyaltyPoints}`);
        this.checkTierUpgrade();
    }

    private checkTierUpgrade(): void {
        let newTier = this.loyaltyTier;

        if (this.loyaltyPoints >= 1000) newTier = LoyaltyTier.PLATINUM;
        else if (this.loyaltyPoints >= 500) newTier = LoyaltyTier.GOLD;
        else if (this.loyaltyPoints >= 200) newTier = LoyaltyTier.SILVER;

        if (newTier !== this.loyaltyTier) {
            console.log(`Congratulations! Upgraded from ${this.loyaltyTier} to ${newTier}`);
            this.loyaltyTier = newTier;
        }
    }
}
