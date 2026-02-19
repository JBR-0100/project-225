import { Router } from 'express';
import { RentalController } from '../controllers/RentalController';
import { validate } from '../middleware/validationMiddleware';
import { createRentalSchema } from '../schemas/rentalSchemas';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware';

const router = Router();
const controller = new RentalController();

router.post(
    '/',
    rateLimitMiddleware,
    authMiddleware,
    roleMiddleware('CUSTOMER'),
    validate(createRentalSchema),
    controller.createRental
);

export default router;
