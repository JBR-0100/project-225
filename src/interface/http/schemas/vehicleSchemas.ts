import { z } from 'zod';

export const getVehiclesSchema = z.object({
    query: z.object({
        startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid date format',
        }),
        endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid date format',
        }),
        type: z.string().optional(),
    }),
});

export const updateVehicleStatusSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid vehicle ID'),
    }),
    body: z.object({
        status: z.enum(['AVAILABLE', 'MAINTENANCE', 'RETIRED']),
    }),
});
