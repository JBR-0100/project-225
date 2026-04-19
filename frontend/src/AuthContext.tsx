import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    email: string;
    role: string;
    customerId: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
    logout: () => void;
    isFleetManager: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const savedToken = localStorage.getItem('driveflow_token');
        const savedUser = localStorage.getItem('driveflow_user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const login = async (email: string, password: string) => {
        let res: Response;
        try {
            res = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
        } catch {
            throw new Error('Backend not reachable — run: npx ts-node src/server.ts');
        }

        let data: any;
        try {
            data = await res.json();
        } catch {
            throw new Error('Backend returned empty response — is the server running?');
        }

        if (!res.ok) throw new Error(data.error || 'Login failed');

        localStorage.setItem('driveflow_token', data.token);
        localStorage.setItem('driveflow_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
    };

    const register = async (email: string, password: string, firstName: string, lastName: string) => {
        let res: Response;
        try {
            res = await fetch('/api/v1/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, firstName, lastName }),
            });
        } catch {
            throw new Error('Backend not reachable — run: npx ts-node src/server.ts');
        }

        let data: any;
        try {
            data = await res.json();
        } catch {
            throw new Error('Backend returned empty response — is the server running?');
        }

        if (!res.ok) throw new Error(data.error || 'Registration failed');
    };

    const logout = () => {
        localStorage.removeItem('driveflow_token');
        localStorage.removeItem('driveflow_user');
        setToken(null);
        setUser(null);
    };

    const isFleetManager = user?.role === 'FLEET_MANAGER';

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isFleetManager }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
