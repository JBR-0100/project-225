import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { CustomerRepository } from '../../infrastructure/repositories/CustomerRepository';
import { Customer } from '../../domain/entities/Customer';

export class AuthService {
    private customerRepo: CustomerRepository;
    private readonly JWT_SECRET = process.env.JWT_SECRET || 'secret';

    constructor() {
        this.customerRepo = new CustomerRepository();
    }

    async register(
        email: string,
        password: string,
        firstName: string,
        lastName: string,
        role: string = 'CUSTOMER'
    ): Promise<Customer> {
        const existing = await this.customerRepo.findByEmail(email);
        if (existing) {
            throw new Error('Email already in use');
        }

        const passwordHash = await bcrypt.hash(password, 10);

        // Use a dummy phone number for now as it wasn't prompted
        const customer = new Customer(firstName, lastName, email, '555-0123', passwordHash, role);

        await this.customerRepo.save(customer);
        return customer;
    }

    async login(email: string, password: string): Promise<{ token: string; user: { email: string; role: string; customerId: string } }> {
        const customer = await this.customerRepo.findByEmail(email);
        if (!customer) {
            throw new Error('Invalid credentials');
        }

        const valid = await bcrypt.compare(password, customer.getPasswordHash());
        if (!valid) {
            throw new Error('Invalid credentials');
        }

        const user = {
            email: customer.getEmail(),
            role: customer.getRole(),
            customerId: customer.getCustomerId(),
        };

        const token = jwt.sign(
            user,
            this.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return { token, user };
    }
}
