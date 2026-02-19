import { Router } from 'express';
import { RentalController } from '../controllers/RentalController';
import { validate } from '../middleware/validationMiddleware';
import { createRentalSchema } from '../schemas/rentalSchemas';

const router = Router();
const controller = new RentalController();

router.post(
    '/',
    validate(createRentalSchema),
    controller.createRental
);

export default router;
