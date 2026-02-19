import { Router } from 'express';
import rentalRoutes from './rentalRoutes';
import vehicleRoutes from './vehicleRoutes';

const router = Router();

router.use('/rentals', rentalRoutes);
router.use('/vehicles', vehicleRoutes);

export default router;
