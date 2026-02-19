import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../../application/services/AuthService';
import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string(),
    lastName: z.string(),
    role: z.string().optional() // Allow role for demo purposes, normally restricted
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password, firstName, lastName, role } = registerSchema.parse(req.body);
            await this.authService.register(email, password, firstName, lastName, role);
            res.status(201).json({ status: 'success', message: 'User registered successfully' });
        } catch (error) {
            next(error);
        }
    };

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = loginSchema.parse(req.body);
            const token = await this.authService.login(email, password);
            res.status(200).json({ status: 'success', token });
        } catch (error) {
            next(error);
        }
    };
}
