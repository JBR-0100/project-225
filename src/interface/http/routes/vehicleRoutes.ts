import { Router } from 'express';
import { VehicleController } from '../controllers/VehicleController';
import { validate } from '../middleware/validationMiddleware';
import { getVehiclesSchema, updateVehicleStatusSchema } from '../schemas/vehicleSchemas';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';

const router = Router();
const controller = new VehicleController();

router.get(
    '/available',
    // Public route, but could be protected if needed
    validate(getVehiclesSchema),
    controller.getAvailableVehicles
);

router.patch(
    '/:id/status',
    authMiddleware,
    roleMiddleware('FLEET_MANAGER'),
    validate(updateVehicleStatusSchema),
    controller.updateVehicleStatus
);

export default router;
