import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import {
    Car, LayoutDashboard, Wrench, LogOut, Shield, User,
    RefreshCw, ChevronRight,
} from 'lucide-react';

interface SidebarProps {
    onMaintenanceCheck: () => void;
    onRefresh: () => void;
    theme?: 'dark' | 'light';
}

export default function Sidebar({ onMaintenanceCheck, onRefresh, theme = 'dark' }: SidebarProps) {
    const { user, logout, isFleetManager } = useAuth();
    const [checkLoading, setCheckLoading] = useState(false);
    const [checkResult, setCheckResult] = useState<string | null>(null);
    const handleMaintenanceCheck = async () => {
        setCheckLoading(true);
        setCheckResult(null);
        try {
            const res = await api.post('/vehicles/maintenance/check');
            setCheckResult(`${res.data.flaggedCount} vehicle(s) flagged`);
            onMaintenanceCheck();
        } catch (err: any) {
            setCheckResult(err.response?.data?.error || 'Failed');
        } finally {
            setCheckLoading(false);
            setTimeout(() => setCheckResult(null), 3000);
        }
    };

    const isDark = theme === 'dark';

    return (
        <aside className={`w-72 h-screen border-r flex flex-col shrink-0 transition-colors duration-300 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-xl'
        }`}>
            {/* Logo */}
            <div className={`px-6 py-6 border-b ${isDark ? 'border-slate-800/80' : 'border-slate-100'}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-600/20 rounded-xl flex items-center justify-center border border-brand-500/30">
                        <Car className="w-5 h-5 text-brand-400" />
                    </div>
                    <div>
                        <h1 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>DriveFlow</h1>
                        <p className="text-xs text-slate-500">Fleet Dashboard</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Navigation</div>

                <button className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-medium ${
                    isDark ? 'text-white bg-brand-600/15 border-brand-500/20' : 'text-brand-700 bg-brand-50 border-brand-100'
                }`}>
                    <LayoutDashboard className={`w-4 h-4 ${isDark ? 'text-brand-400' : 'text-brand-600'}`} />
                    Fleet Overview
                    <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />
                </button>

                {isFleetManager && (
                    <>
                        <div className="px-3 pt-6 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Fleet Manager
                        </div>

                        <button onClick={handleMaintenanceCheck} disabled={checkLoading}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition text-sm group ${
                                isDark ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}>
                            <Wrench className={`w-4 h-4 text-amber-400 ${checkLoading ? 'animate-spin' : ''}`} />
                            Run Maintenance Check
                        </button>

                        <button onClick={onRefresh}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition text-sm ${
                                isDark ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}>
                            <RefreshCw className="w-4 h-4 text-slate-400" />
                            Refresh Fleet
                        </button>
                    </>
                )}
            </nav>

            {/* User section */}
            <div className={`px-4 py-4 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-100'}`}>
                <div className="flex items-center gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        <User className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.email}</p>
                        <div className="flex items-center gap-1.5">
                            <Shield className="w-3 h-3 text-brand-400" />
                            <span className="text-xs text-slate-400">{user?.role}</span>
                        </div>
                    </div>
                </div>
                <button onClick={logout}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition text-sm border ${
                        isDark 
                            ? 'bg-slate-800/80 text-slate-400 hover:text-red-400 hover:bg-red-950/30 hover:border-red-900/30 border-slate-700/50' 
                            : 'bg-white text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 border-slate-200 shadow-sm'
                    }`}>
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
