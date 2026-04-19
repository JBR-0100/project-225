import { Router } from 'express';
import { VehicleController } from '../controllers/VehicleController';
import { validate } from '../middleware/validationMiddleware';
import { getVehiclesSchema, updateVehicleStatusSchema } from '../schemas/vehicleSchemas';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';

const router = Router();
const controller = new VehicleController();

// GET /vehicles — all vehicles (authenticated)
router.get('/', authMiddleware, controller.getAllVehicles);

// GET /vehicles/available — available by date (public)
router.get(
    '/available',
    validate(getVehiclesSchema),
    controller.getAvailableVehicles
);

// PATCH /vehicles/:id/status — change state (Fleet Manager only)
router.patch(
    '/:id/status',
    authMiddleware,
    roleMiddleware('FLEET_MANAGER'),
    validate(updateVehicleStatusSchema),
    controller.updateVehicleStatus
);

// POST /vehicles/:id/return — return a rented vehicle (Fleet Manager only)
router.post(
    '/:id/return',
    authMiddleware,
    roleMiddleware('FLEET_MANAGER'),
    controller.returnVehicle
);

// POST /maintenance/check — trigger maintenance check (Fleet Manager only)
router.post(
    '/maintenance/check',
    authMiddleware,
    roleMiddleware('FLEET_MANAGER'),
    controller.triggerMaintenanceCheck
);

export default router;
