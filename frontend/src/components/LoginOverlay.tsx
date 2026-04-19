import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Car, Lock, UserPlus, LogIn, AlertCircle } from 'lucide-react';

export default function LoginOverlay() {
    const { login, register } = useAuth();
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [regSuccess, setRegSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setRegSuccess('');
        setLoading(true);
        try {
            if (isRegister) {
                await register(email, password, firstName, lastName);
                setRegSuccess('Account created! Switching to login...');
                setTimeout(() => {
                    setIsRegister(false);
                    setRegSuccess('');
                }, 1500);
            } else {
                await login(email, password);
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative w-full max-w-md mx-4">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600/20 rounded-2xl mb-4 border border-brand-500/30">
                        <Car className="w-8 h-8 text-brand-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">DriveFlow</h1>
                    <p className="text-slate-400 mt-1 text-sm">Fleet Management Dashboard</p>
                </div>

                {/* Card */}
                <div className="glass rounded-2xl p-8">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        {isRegister ? <UserPlus className="w-5 h-5 text-brand-400" /> : <Lock className="w-5 h-5 text-brand-400" />}
                        {isRegister ? 'Create Account' : 'Sign In'}
                    </h2>

                    {error && (
                        <div className="flex items-center gap-2 text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-4 py-2.5 mb-4 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {regSuccess && (
                        <div className="text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 rounded-lg px-4 py-2.5 mb-4 text-sm">
                            {regSuccess}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegister && (
                            <div className="grid grid-cols-2 gap-3">
                                <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required
                                    className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition text-sm" />
                                <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required
                                    className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition text-sm" />
                            </div>
                        )}
                        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition text-sm" />
                        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition text-sm" />

                        <button type="submit" disabled={loading}
                            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" />
                                    {isRegister ? 'Create Account' : 'Sign In'}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button onClick={() => { setIsRegister(!isRegister); setError(''); }}
                            className="text-sm text-brand-400 hover:text-brand-300 transition">
                            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                        </button>
                    </div>

                    {/* Quick login hint */}
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                        <p className="text-xs text-slate-500 text-center">
                            Demo: Register as any user, or create a FLEET_MANAGER via API
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
