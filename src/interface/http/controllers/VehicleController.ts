import { Request, Response, NextFunction } from 'express';
import { VehicleRepository } from '../../../infrastructure/repositories/VehicleRepository';
import { MaintenanceService } from '../../../application/services/MaintenanceService';
import { runMaintenanceCheckNow } from '../../../infrastructure/scheduler/MaintenanceCron';
import { Logger } from '../../../infrastructure/Logger';

export class VehicleController {
    private vehicleRepo: VehicleRepository;
    private maintenanceService: MaintenanceService;

    constructor() {
        this.vehicleRepo = new VehicleRepository();
        this.maintenanceService = new MaintenanceService();
    }

    // GET /vehicles — all vehicles for the fleet grid
    getAllVehicles = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const vehicles = await this.vehicleRepo.findAll();
            const responseData = vehicles.map(v => ({
                id: v.getVehicleId(),
                make: v.getMake(),
                model: v.getModel(),
                year: v.getYear(),
                type: v.getVehicleType(),
                dailyRate: v.getDailyRate(),
                mileageKm: v.getMileage(),
                state: v.getState().getStateName(),
                licensePlate: v.getLicensePlate(),
            }));
            res.status(200).json({ status: 'success', data: responseData });
        } catch (error) {
            next(error);
        }
    };

    // GET /vehicles/available
    getAvailableVehicles = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                return res.status(400).json({ error: 'startDate and endDate are required' });
            }
            const start = new Date(startDate as string);
            const end = new Date(endDate as string);
            const vehicles = await this.vehicleRepo.findAvailableByDate(start, end);
            const responseData = vehicles.map(v => ({
                id: v.getVehicleId(),
                make: v.getMake(),
                model: v.getModel(),
                type: v.getVehicleType(),
                dailyRate: v.getDailyRate(),
                state: v.getState().getStateName(),
            }));
            res.status(200).json({ status: 'success', data: responseData });
        } catch (error) {
            next(error);
        }
    };

    // PATCH /vehicles/:id/status — change vehicle state (maintenance / available)
    updateVehicleStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const { status } = req.body;
            if (!id) return res.status(400).json({ error: 'Vehicle ID is required' });

            const vehicle = await this.vehicleRepo.findById(id);
            if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

            if (status === 'MAINTENANCE') {
                vehicle.sendToMaintenance();
                await this.vehicleRepo.save(vehicle);
                return res.status(200).json({ status: 'success', message: 'Vehicle sent to maintenance', state: 'MAINTENANCE' });
            }

            if (status === 'AVAILABLE') {
                // Release from maintenance
                const state = vehicle.getState();
                if (state.getStateName() === 'MAINTENANCE') {
                    (state as any).releaseFromMaintenance(vehicle);
                    await this.vehicleRepo.save(vehicle);
                    return res.status(200).json({ status: 'success', message: 'Vehicle released from maintenance', state: 'AVAILABLE' });
                }
                return res.status(400).json({ error: 'Vehicle is not in maintenance' });
            }

            res.status(400).json({ error: `Unsupported status transition: ${status}` });
        } catch (error) {
            next(error);
        }
    };

    // POST /vehicles/:id/return — return a rented vehicle
    returnVehicle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const { mileageAdded = 200 } = req.body;

            const vehicle = await this.vehicleRepo.findById(id);
            if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

            if (vehicle.getState().getStateName() !== 'RENTED') {
                return res.status(400).json({ error: 'Vehicle is not currently rented' });
            }

            vehicle.returnVehicle(mileageAdded);
            await this.vehicleRepo.save(vehicle);
            Logger.info(`Vehicle ${id} returned via dashboard`, { vehicleId: id, mileageAdded });
            res.status(200).json({ status: 'success', message: 'Vehicle returned', state: 'AVAILABLE' });
        } catch (error) {
            next(error);
        }
    };

    // POST /maintenance/check — trigger CRON maintenance check on demand
    triggerMaintenanceCheck = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const flagged = await runMaintenanceCheckNow();
            res.status(200).json({
                status: 'success',
                message: `Maintenance check complete. ${flagged} vehicle(s) flagged.`,
                flaggedCount: flagged,
            });
        } catch (error) {
            next(error);
        }
    };
}
