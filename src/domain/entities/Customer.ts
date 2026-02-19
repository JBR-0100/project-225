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
    private passwordHash: string;
    private role: string;

    constructor(
        firstName: string,
        lastName: string,
        email: string,
        phone: string,
        passwordHash: string = '',
        role: string = 'CUSTOMER'
    ) {
        this.customerId = uuidv4();
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.loyaltyTier = LoyaltyTier.BRONZE;
        this.loyaltyPoints = 0;
        this.isBlacklisted = false;
        this.passwordHash = passwordHash;
        this.role = role;
    }

    getCustomerId(): string {
        return this.customerId;
    }

    getName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    getEmail(): string {
        return this.email;
    }

    getPhone(): string {
        return this.phone;
    }

    getLoyaltyTier(): LoyaltyTier {
        return this.loyaltyTier;
    }

    getLoyaltyPoints(): number {
        return this.loyaltyPoints;
    }

    isEligibleToRent(): boolean {
        return !this.isBlacklisted;
    }

    getPasswordHash(): string {
        return this.passwordHash;
    }

    getRole(): string {
        return this.role;
    }

    setPasswordHash(hash: string): void {
        this.passwordHash = hash;
    }

    setRole(role: string): void {
        this.role = role;
    }

    isBlocked(): boolean {
        return this.isBlacklisted;
    }

    addLoyaltyPoints(points: number): void {
        this.loyaltyPoints += points;
        this.updateTier();
    }

    private updateTier(): void {
        if (this.loyaltyPoints > 500) this.loyaltyTier = LoyaltyTier.PLATINUM;
        else if (this.loyaltyPoints > 300) this.loyaltyTier = LoyaltyTier.GOLD;
        else if (this.loyaltyPoints > 100) this.loyaltyTier = LoyaltyTier.SILVER;
    }

    static restore(
        customerId: string,
        firstName: string,
        lastName: string,
        email: string,
        phone: string,
        loyaltyTier: LoyaltyTier,
        loyaltyPoints: number,
        isBlacklisted: boolean,
        passwordHash: string,
        role: string
    ): Customer {
        const customer = new Customer(firstName, lastName, email, phone, passwordHash, role);
        customer.customerId = customerId;
        customer.loyaltyTier = loyaltyTier;
        customer.loyaltyPoints = loyaltyPoints;
        customer.isBlacklisted = isBlacklisted;
        return customer;
    }
}
