import { AuthService } from '../src/application/services/AuthService';

async function main() {
    const authService = new AuthService();
    try {
        await authService.register(
            'admin@driveflow.com',
            'admin123',
            'Admin',
            'User',
            'FLEET_MANAGER'
        );
        console.log('Admin user created: admin@driveflow.com / admin123');
    } catch (err: any) {
        if (err.message === 'Email already in use') {
            console.log('Admin user already exists.');
        } else {
            console.error('Failed to create admin user:', err.message);
        }
    }
}

main().catch(console.error);
