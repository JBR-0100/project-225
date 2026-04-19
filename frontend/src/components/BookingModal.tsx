import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import { VehicleData } from './VehicleCard';
import { X, CreditCard, Shield, Calculator, ChevronRight, CheckCircle } from 'lucide-react';

interface BookingModalProps {
    vehicle: VehicleData;
    onClose: () => void;
    onSuccess: () => void;
    theme?: 'dark' | 'light';
}

const insuranceTiers = [
    { tier: 'BASIC', label: 'Basic', premium: 200, desc: 'Liability only' },
    { tier: 'STANDARD', label: 'Standard', premium: 450, desc: 'Collision + liability' },
    { tier: 'PREMIUM', label: 'Premium', premium: 850, desc: 'Full coverage' },
];

export default function BookingModal({ vehicle, onClose, onSuccess, theme = 'dark' }: BookingModalProps) {
    const { user } = useAuth();
    const [days, setDays] = useState(3);
    const [insurance, setInsurance] = useState('STANDARD');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const isDark = theme === 'dark';

    const selectedInsurance = insuranceTiers.find(t => t.tier === insurance)!;
    const basePrice = vehicle.dailyRate * days;
    const insuranceCost = selectedInsurance.premium * days;
    const totalPrice = basePrice + insuranceCost;

    const handleBook = async () => {
        setLoading(true);
        setError('');
        try {
            await api.post('/rentals', {
                customerId: user?.email,
                vehicleId: vehicle.id,
                startDate: new Date().toISOString(),
                days,
                insuranceTier: insurance,
            });
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Booking failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300" onClick={onClose}>
            <div className={`rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transition-all duration-300 transform border ${
                isDark ? 'glass border-slate-700/50 shadow-2xl' : 'bg-white border-slate-200 shadow-2xl'
            }`} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-slate-800/80' : 'border-slate-100'}`}>
                    <div>
                        <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Book Vehicle</h2>
                        <p className="text-sm text-slate-400">{vehicle.make} {vehicle.model} • ₹{vehicle.dailyRate.toLocaleString()}/day</p>
                    </div>
                    <button onClick={onClose} className={`p-2 rounded-xl transition ${
                        isDark ? 'hover:bg-slate-800/80 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                    }`}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {success ? (
                        <div className="text-center py-8">
                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 border ${
                                isDark ? 'bg-emerald-950/60 border-emerald-800/50' : 'bg-emerald-50 border-emerald-200'
                            }`}>
                                <CheckCircle className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h3 className={`text-xl font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Booking Confirmed!</h3>
                            <p className="text-slate-400 text-sm">Your rental contract has been created.</p>
                        </div>
                    ) : (
                        <>
                            {/* Duration */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                    <CreditCard className="w-4 h-4 inline mr-1.5 text-brand-400" />
                                    Rental Duration
                                </label>
                                <div className="flex items-center gap-3">
                                    <input type="range" min="1" max="30" value={days} onChange={e => setDays(Number(e.target.value))}
                                        className="flex-1 accent-brand-500" />
                                    <span className={`font-bold text-lg w-20 text-center rounded-xl py-2 ${
                                        isDark ? 'text-white bg-slate-800/60' : 'text-slate-900 bg-slate-100'
                                    }`}>
                                        {days} {days === 1 ? 'day' : 'days'}
                                    </span>
                                </div>
                            </div>

                            {/* Insurance */}
                            <div>
                                <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                    <Shield className="w-4 h-4 inline mr-1.5 text-brand-400" />
                                    Insurance Tier
                                </label>
                                <div className="space-y-2">
                                    {insuranceTiers.map(tier => (
                                        <button key={tier.tier} onClick={() => setInsurance(tier.tier)}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition ${
                                                insurance === tier.tier
                                                    ? 'bg-brand-600/15 border-brand-500/40 text-white'
                                                    : isDark ? 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:border-slate-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                                                }`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${insurance === tier.tier ? 'border-brand-400' : 'border-slate-600'}`}>
                                                    {insurance === tier.tier && <div className="w-2 h-2 rounded-full bg-brand-400" />}
                                                </div>
                                                <div className="text-left">
                                                    <span className={`font-medium ${insurance === tier.tier ? (isDark ? 'text-white' : 'text-slate-900') : ''}`}>{tier.label}</span>
                                                    <span className="text-xs text-slate-500 ml-2">{tier.desc}</span>
                                                </div>
                                            </div>
                                            <span className="font-semibold text-brand-400">₹{tier.premium}/day</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Preview */}
                            <div className={`rounded-xl p-4 border transition-colors ${
                                isDark ? 'bg-slate-800/40 border-slate-700/30' : 'bg-slate-50 border-slate-100 shadow-inner'
                            }`}>
                                <h4 className={`text-sm font-semibold mb-3 flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                    <Calculator className="w-4 h-4 text-brand-400" />
                                    Price Preview
                                </h4 >
                                <div className="space-y-2.5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Base Rate ({days} × ₹{vehicle.dailyRate.toLocaleString()})</span>
                                        <span className={isDark ? 'text-slate-300' : 'text-slate-600 font-medium'}>₹{basePrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Insurance ({days} × ₹{selectedInsurance.premium})</span>
                                        <span className={isDark ? 'text-slate-300' : 'text-slate-600 font-medium'}>₹{insuranceCost.toLocaleString()}</span>
                                    </div>
                                    <div className={`border-t pt-2 flex justify-between ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
                                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Estimated Total</span>
                                        <span className="text-2xl font-bold text-brand-400">₹{totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <button onClick={handleBook} disabled={loading}
                                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-brand-500/20 active:scale-95">
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Confirm Reservation
                                        <ChevronRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
