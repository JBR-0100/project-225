import { VehicleRepository } from '../../infrastructure/repositories/VehicleRepository';
import { MaintenanceStatus } from '../../domain/types/enums';
import { MaintenanceState } from '../../domain/patterns/state/MaintenanceState';

export class MaintenanceService {
    private vehicleRepo: VehicleRepository;
    private readonly MAINTENANCE_THRESHOLD_KM = 5000;

    constructor() {
        this.vehicleRepo = new VehicleRepository();
    }

    async checkForMaintenance(vehicleId: string): Promise<boolean> {
        const vehicle = await this.vehicleRepo.findById(vehicleId);
        if (!vehicle) {
            throw new Error(`Vehicle with ID ${vehicleId} not found.`);
        }
        const mileage = vehicle.getMileage();

        // Simplified check: Every 5000km
        return mileage > 0 && mileage % this.MAINTENANCE_THRESHOLD_KM < 100;
    }

    async scheduleMaintenance(vehicleId: string): Promise<void> {
        const vehicle = await this.vehicleRepo.findById(vehicleId);
        if (!vehicle) {
            throw new Error(`Vehicle with ID ${vehicleId} not found.`);
        }

        // Transition to Maintenance State
        const maintenanceState = new MaintenanceState();
        vehicle.setState(maintenanceState);

        await this.vehicleRepo.save(vehicle);
    }
}
