import { z } from 'zod';
import { InsuranceTier } from '../../../domain/types/enums';

export const createRentalSchema = z.object({
    body: z.object({
        customerId: z.string().email('Invalid email address'),
        vehicleId: z.string().uuid('Invalid vehicle ID'),
        startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid date format',
        }),
        days: z.number().int().positive(),
        insuranceTier: z.nativeEnum(InsuranceTier),
    }),
});
