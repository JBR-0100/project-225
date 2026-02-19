import { PrismaClient } from '@prisma/client';
import { Customer } from '../../domain/entities/Customer';
import { PrismaService } from '../PrismaService';
import { EventBus, DomainEvents } from '../events/EventBus';
import { Logger } from '../Logger';
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
                isBlacklisted: customer.isBlocked(),
                passwordHash: customer.getPasswordHash(),
                role: customer.getRole()
            },
            create: {
                customerId: customer.getCustomerId(),
                firstName: customer.getName().split(' ')[0] || '',
                lastName: customer.getName().split(' ')[1] || '',
                email: customer.getEmail(),
                phone: '555-0000',
                passwordHash: customer.getPasswordHash(),
                role: customer.getRole()
            }
        });

        // Observer Pattern: Publish domain event (triggers welcome email job)
        EventBus.publish(DomainEvents.CUSTOMER_CREATED, {
            customerId: customer.getCustomerId(),
            email: customer.getEmail(),
            firstName: customer.getName().split(' ')[0],
        });
    }

    async findByEmail(email: string): Promise<Customer | null> {
        const customerData = await this.prisma.customer.findUnique({
            where: { email }
        });

        if (!customerData) return null;

        // Restore using static method
        return Customer.restore(
            customerData.customerId,
            customerData.firstName,
            customerData.lastName,
            customerData.email,
            customerData.phone,
            customerData.loyaltyTier as any,
            customerData.loyaltyPoints,
            customerData.isBlacklisted,
            customerData.passwordHash,
            customerData.role
        );
    }
}
