import { PrismaClient } from '@prisma/client';
import { RentalContract } from '../../domain/entities/RentalContract';
import { PrismaService } from '../PrismaService';

export class ContractRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = PrismaService.getInstance();
    }

    async save(contract: RentalContract): Promise<void> {
        const data = {
            contractId: contract.getContractId(),
            customerId: contract.getCustomer().getCustomerId(),
            vehicleId: contract.getVehicle().getVehicleId(),
            status: contract.getStatus().toString(),
            startDate: contract.getStartDate(),
            endDate: contract.getEndDate(),
            basePrice: contract.getBasePrice(),
            insuranceTotal: contract.getInsuranceTotal(),
            totalAmount: contract.getTotalAmount(),
            // Optimistic Locking Version
            version: 1
        };

        // Use transaction for double-booking check
        await this.prisma.$transaction(async (tx) => {
            // 1. Check for overlapping active contracts for this vehicle
            const overlapping = await tx.rentalContract.findFirst({
                where: {
                    vehicleId: data.vehicleId,
                    status: { in: ['CONFIRMED', 'ACTIVE'] },
                    OR: [
                        {
                            startDate: { lte: data.endDate },
                            endDate: { gte: data.startDate }
                        }
                    ]
                }
            });

            if (overlapping) {
                console.error(`Double booking prevented for vehicle ${data.vehicleId}`);
                throw new Error(`Vehicle ${data.vehicleId} is already booked for these dates.`);
            }

            // 2. Insert if safe
            await tx.rentalContract.upsert({
                where: { contractId: data.contractId },
                update: data,
                create: data
            });
        });
    }
}
