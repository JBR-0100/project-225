import React from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import { Car, Zap, Truck, Wrench, RotateCcw, ArrowUpRight, Gauge, Calendar } from 'lucide-react';

export interface VehicleData {
    id: string;
    make: string;
    model: string;
    year: number;
    type: string;
    dailyRate: number;
    mileageKm: number;
    state: string;
    licensePlate: string;
}

interface VehicleCardProps {
    vehicle: VehicleData;
    onRefresh: () => void;
    onBook: (vehicle: VehicleData) => void;
    theme?: 'dark' | 'light';
}

const stateConfig: Record<string, { color: string; bg: string; border: string; dot: string; label: string }> = {
    AVAILABLE: { color: 'text-emerald-400', bg: 'bg-emerald-950/60', border: 'border-emerald-800/50', dot: 'bg-emerald-400', label: 'Available' },
    RESERVED: { color: 'text-yellow-400', bg: 'bg-yellow-950/60', border: 'border-yellow-800/50', dot: 'bg-yellow-400', label: 'Reserved' },
    RENTED: { color: 'text-blue-400', bg: 'bg-blue-950/60', border: 'border-blue-800/50', dot: 'bg-blue-400', label: 'Rented' },
    MAINTENANCE: { color: 'text-amber-400', bg: 'bg-amber-950/60', border: 'border-amber-800/50', dot: 'bg-amber-400', label: 'Maintenance' },
    RETIRED: { color: 'text-slate-400', bg: 'bg-slate-800/60', border: 'border-slate-700/50', dot: 'bg-slate-400', label: 'Retired' },
};

const lightStateConfig: Record<string, { color: string; bg: string; border: string; dot: string; label: string }> = {
    AVAILABLE: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-600', label: 'Available' },
    RESERVED: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-600', label: 'Reserved' },
    RENTED: { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-600', label: 'Rented' },
    MAINTENANCE: { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-600', label: 'Maintenance' },
    RETIRED: { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', dot: 'bg-slate-500', label: 'Retired' },
};

const typeIcons: Record<string, React.ReactNode> = {
    CAR: <Car className="w-8 h-8" />,
    ELECTRIC_VEHICLE: <Zap className="w-8 h-8" />,
    TRUCK: <Truck className="w-8 h-8" />,
};

const typeLabels: Record<string, string> = {
    CAR: 'Sedan',
    ELECTRIC_VEHICLE: 'Electric',
    TRUCK: 'Truck',
};

export default function VehicleCard({ vehicle, onRefresh, onBook, theme = 'dark' }: VehicleCardProps) {
    const { isFleetManager } = useAuth();
    const isDark = theme === 'dark';
    const state = (isDark ? stateConfig : lightStateConfig)[vehicle.state] || stateConfig.AVAILABLE;
    const [loading, setLoading] = React.useState<string | null>(null);

    const handleAction = async (action: string) => {
        setLoading(action);
        try {
            if (action === 'maintenance') {
                await api.patch(`/vehicles/${vehicle.id}/status`, { status: 'MAINTENANCE' });
            } else if (action === 'release') {
                await api.patch(`/vehicles/${vehicle.id}/status`, { status: 'AVAILABLE' });
            } else if (action === 'return') {
                await api.post(`/vehicles/${vehicle.id}/return`, { mileageAdded: Math.floor(Math.random() * 500) + 100 });
            }
            onRefresh();
        } catch (err: any) {
            console.error(err.response?.data?.error || err.message);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className={`rounded-2xl p-5 card-hover transition-all duration-300 flex flex-col border ${
            isDark ? 'glass border-slate-800/50 shadow-2xl' : 'bg-white border-slate-200 shadow-md'
        }`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                    isDark 
                        ? (vehicle.type === 'ELECTRIC_VEHICLE' ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/40' :
                           vehicle.type === 'TRUCK' ? 'bg-orange-950/60 text-orange-400 border border-orange-800/40' :
                           'bg-brand-950/60 text-brand-400 border border-brand-800/40')
                        : (vehicle.type === 'ELECTRIC_VEHICLE' ? 'bg-cyan-50 text-cyan-600 border border-cyan-100' :
                           vehicle.type === 'TRUCK' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                           'bg-brand-50 text-brand-600 border border-brand-100')
                }`}>
                    {typeIcons[vehicle.type] || <Car className="w-8 h-8" />}
                </div>

                {/* Status badge */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${state.bg} ${state.color} ${state.border} ${isDark && vehicle.state === 'AVAILABLE' ? 'badge-available' : ''}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${state.dot}`} />
                    {state.label}
                </span>
            </div>

            {/* Vehicle info */}
            <h3 className={`font-semibold text-lg leading-tight transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {vehicle.make} {vehicle.model}
            </h3>
            <div className="flex items-center gap-2 mt-1 mb-4">
                <span className={`text-xs px-2 py-0.5 rounded-md transition-colors ${isDark ? 'text-slate-400 bg-slate-800/60' : 'text-slate-500 bg-slate-100'}`}>{typeLabels[vehicle.type] || vehicle.type}</span>
                <span className={`text-xs transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{vehicle.year}</span>
                <span className="text-xs text-slate-400">•</span>
                <span className={`text-xs transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{vehicle.licensePlate}</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className={`rounded-xl px-3 py-2.5 transition-colors ${isDark ? 'bg-slate-800/40' : 'bg-slate-50 border border-slate-100 shadow-sm'}`}>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                        <Calendar className="w-3 h-3" /> Daily Rate
                    </div>
                    <p className={`font-bold text-lg transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{vehicle.dailyRate.toLocaleString()}</p>
                </div>
                <div className={`rounded-xl px-3 py-2.5 transition-colors ${isDark ? 'bg-slate-800/40' : 'bg-slate-50 border border-slate-100 shadow-sm'}`}>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                        <Gauge className="w-3 h-3" /> Mileage
                    </div>
                    <p className={`font-bold text-lg transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>{vehicle.mileageKm.toLocaleString()}<span className="text-xs font-normal ml-0.5">km</span></p>
                </div>
            </div>

            {/* Actions */}
            <div className={`mt-auto pt-4 border-t flex gap-2 flex-wrap ${isDark ? 'border-slate-800/50' : 'border-slate-100'}`}>
                {vehicle.state === 'AVAILABLE' && (
                    <button onClick={() => onBook(vehicle)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition shadow-lg shadow-brand-500/20 active:scale-95">
                        <ArrowUpRight className="w-3.5 h-3.5" /> Book Now
                    </button>
                )}

                {isFleetManager && vehicle.state === 'AVAILABLE' && (
                    <button onClick={() => handleAction('maintenance')} disabled={loading === 'maintenance'}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2.5 border rounded-xl text-sm font-medium transition disabled:opacity-50 ${
                            isDark ? 'bg-amber-600/20 text-amber-400 border-amber-700/40 hover:bg-amber-600/30' : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'
                        }`}>
                        <Wrench className={`w-3.5 h-3.5 ${loading === 'maintenance' ? 'animate-spin' : ''}`} />
                    </button>
                )}

                {isFleetManager && vehicle.state === 'RENTED' && (
                    <button onClick={() => handleAction('return')} disabled={loading === 'return'}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border rounded-xl text-sm font-medium transition disabled:opacity-50 ${
                            isDark ? 'bg-blue-600/20 text-blue-400 border-blue-700/40 hover:bg-blue-600/30' : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'
                        }`}>
                        <RotateCcw className={`w-3.5 h-3.5 ${loading === 'return' ? 'animate-spin' : ''}`} /> Return
                    </button>
                )}

                {isFleetManager && vehicle.state === 'MAINTENANCE' && (
                    <button onClick={() => handleAction('release')} disabled={loading === 'release'}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border rounded-xl text-sm font-medium transition disabled:opacity-50 ${
                            isDark ? 'bg-emerald-600/20 text-emerald-400 border-emerald-700/40 hover:bg-emerald-600/30' : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                        }`}>
                        <RotateCcw className={`w-3.5 h-3.5 ${loading === 'release' ? 'animate-spin' : ''}`} /> Release
                    </button>
                )}
            </div>
        </div>
    );
}
