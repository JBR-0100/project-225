import { PrismaClient } from '@prisma/client';
import { Customer } from '../../domain/entities/Customer';
import { PrismaService } from '../PrismaService';

export class CustomerRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = PrismaService.getInstance();
    }

    async save(customer: Customer): Promise<void> {
        await this.prisma.customer.upsert({
            where: { customerId: customer.getCustomerId() },
            update: {
                firstName: customer.getName().split(' ')[0], // Simplification for demo
                lastName: customer.getName().split(' ')[1] || '',
                email: customer.getEmail(),
                phone: '555-0000', // Placeholder as domain entity might not expose everything yet
                loyaltyTier: customer.getLoyaltyTier(),
                loyaltyPoints: customer.getLoyaltyPoints(),
            },
            create: {
                customerId: customer.getCustomerId(),
                firstName: customer.getName().split(' ')[0] || '',
                lastName: customer.getName().split(' ')[1] || '',
                email: customer.getEmail(),
                phone: '555-0000',
                loyaltyTier: customer.getLoyaltyTier(),
                loyaltyPoints: customer.getLoyaltyPoints(),
            },
        });
    }

    async findByEmail(email: string): Promise<Customer | null> {
        const data = await this.prisma.customer.findUnique({ where: { email } });
        if (!data) return null;

        // Hydrate domain entity (simplified)
        // Note: In a real app, we would use a Factory or static method to reconstitute
        // without generating a new ID/events. For now, we hack it by creating new and restoring ID.
        const customer = new Customer(data.firstName, data.lastName, data.email, data.phone);
        (customer as any).customerId = data.customerId;
        (customer as any).loyaltyTier = data.loyaltyTier as any;
        (customer as any).loyaltyPoints = data.loyaltyPoints;

        return customer;
    }
}
