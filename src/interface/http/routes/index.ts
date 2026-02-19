import { Router } from 'express';
import authRoutes from './authRoutes';
import rentalRoutes from './rentalRoutes';
import vehicleRoutes from './vehicleRoutes';

const router = Router();


router.use('/auth', authRoutes);
router.use('/rentals', rentalRoutes);
router.use('/vehicles', vehicleRoutes);

export default router;
