import { Router } from 'express';
import { VehicleController } from '../controllers/VehicleController';
import { validate } from '../middleware/validationMiddleware';
import { getVehiclesSchema, updateVehicleStatusSchema } from '../schemas/vehicleSchemas';

const router = Router();
const controller = new VehicleController();

router.get(
    '/available',
    validate(getVehiclesSchema),
    controller.getAvailableVehicles
);

router.patch(
    '/:id/status',
    validate(updateVehicleStatusSchema),
    controller.updateVehicleStatus
);

export default router;
