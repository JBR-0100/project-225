import { Request, Response, NextFunction } from 'express';
import { VehicleRepository } from '../../../infrastructure/repositories/VehicleRepository';
import { MaintenanceService } from '../../../application/services/MaintenanceService';

export class VehicleController {
    private vehicleRepo: VehicleRepository;
    private maintenanceService: MaintenanceService;

    constructor() {
        this.vehicleRepo = new VehicleRepository();
        this.maintenanceService = new MaintenanceService();
    }

    getAvailableVehicles = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                // Return all or handle error? Repo requires dates.
                return res.status(400).json({ error: 'startDate and endDate are required' });
            }

            const start = new Date(startDate as string);
            const end = new Date(endDate as string);

            const vehicles = await this.vehicleRepo.findAvailableByDate(start, end);

            // Simple transformation for response
            const responseData = vehicles.map(v => ({
                id: v.getVehicleId(),
                make: v.getMake(),
                model: v.getModel(),
                type: v.getVehicleType(),
                dailyRate: v.getDailyRate()
            }));

            res.status(200).json({ status: 'success', data: responseData });
        } catch (error) {
            next(error);
        }
    };

    updateVehicleStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'Vehicle ID is required' });
            }

            // Simplify: Only allow maintenance trigger for now via service
            if (status === 'MAINTENANCE') {
                await this.maintenanceService.scheduleMaintenance(id as string);
                return res.status(200).json({ status: 'success', message: 'Maintenance scheduled' });
            }

            // Other statuses: Not implemented in this phase scope
            res.status(501).json({ status: 'error', message: 'Status update not fully implemented' });
        } catch (error) {
            next(error);
        }
    };
}
