import { Request, Response, NextFunction } from 'express';
import { RentalService } from '../../../application/services/RentalService';
import { InsuranceTier } from '../../../domain/types/enums';

export class RentalController {
    private rentalService: RentalService;

    constructor() {
        this.rentalService = new RentalService();
    }

    createRental = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { customerId, vehicleId, startDate, days, insuranceTier } = req.body;

            // Simple transformation: string to Date, string to Enum
            const start = new Date(startDate);
            const tier = insuranceTier as InsuranceTier; // Already validated by Zod ideally

            const contract = await this.rentalService.rentVehicle(
                customerId,
                vehicleId,
                start,
                days,
                tier
            );

            res.status(201).json({
                status: 'success',
                data: {
                    contractId: contract.getContractId(), // Assuming getter exists or we return serialized contract
                    totalAmount: contract.getTotalAmount(),
                    status: 'CONFIRMED'
                }
            });
        } catch (error) {
            next(error);
        }
    };
}
