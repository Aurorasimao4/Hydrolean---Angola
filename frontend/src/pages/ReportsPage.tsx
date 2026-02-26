import { useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { Droplets, Zap, Calendar, CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// === DADOS SIMULADOS (MOCK VIRTUAL PARA DECISÃO) ===
const weeklyData = [
    { day: 'Seg', agua: 1200, energia: 14.5, tempMax: 32 },
    { day: 'Ter', agua: 1400, energia: 16.2, tempMax: 34 },
    { day: 'Qua', agua: 1800, energia: 20.1, tempMax: 37 }, // Pico de calor
    { day: 'Qui', agua: 800, energia: 9.5, tempMax: 29 },  // Chuva
    { day: 'Sex', agua: 900, energia: 11.2, tempMax: 30 },
    { day: 'Sáb', agua: 1500, energia: 17.8, tempMax: 35 },
    { day: 'Dom', agua: 1350, energia: 15.5, tempMax: 33 },
];

const efficiencyData = [
    { name: 'Manual (Desperdício)', value: 15 },
    { name: 'IA (Otimizado)', value: 85 },
];
const COLORS = ['#ef4444', '#10b981'];

export function ReportsPage() {
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '1y'>('7d');

    return (
        <div className="flex-1 flex flex-col gap-6 lg:gap-8 pb-10 max-w-7xl mx-auto w-full relative animate-in fade-in duration-500">
            {/* Background Decorativo Glassmorphism */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-blue-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] bg-brand-primary/10 rounded-full blur-[100px]"></div>
            </div>

            {/* Header Módulo de Relatório Executivo */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl shadow-black/5 border border-white/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div>
                    <div className="flex items-center gap-2 text-brand-primary font-bold mb-2">
                        <Calendar size={18} />
                        <span className="uppercase tracking-widest text-xs">Módulo Analítico</span>
                    </div>
                    <h1 className="text-4xl font-black text-brand-black tracking-tighter">Tomada de Decisão</h1>
                    <p className="text-gray-500 mt-1 font-medium">Relatório executivo de consumo hídrico, energético e térmico.</p>
                </div>

                <div className="flex items-center gap-4 z-10 w-full md:w-auto">
                    <div className="flex bg-gray-100/80 backdrop-blur-md p-1 rounded-xl border border-white/40 shadow-inner w-full md:w-auto">
                        {(['7d', '30d', '1y'] as const).map(range => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex-1 md:flex-none ${timeRange === range ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                {range === '7d' ? '7 Dias' : range === '30d' ? '30 Dias' : '1 Ano'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* KPIs Executivos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 shadow-lg shadow-blue-900/5 hover:shadow-xl transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-colors"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Droplets size={24} /></div>
                        <span className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                            <ArrowUpRight size={14} /> 4.2%
                        </span>
                    </div>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Água Consumida</p>
                    <div className="mt-1 flex items-baseline gap-1">
                        <p className="text-3xl font-black text-gray-900">8.950</p>
                        <p className="text-sm font-bold text-gray-400">Litros</p>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 shadow-lg shadow-yellow-900/5 hover:shadow-xl transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-yellow-500/20 transition-colors"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl"><Zap size={24} /></div>
                        <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg border border-green-100">
                            <ArrowDownRight size={14} /> 12.1%
                        </span>
                    </div>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Energia (Bombas)</p>
                    <div className="mt-1 flex items-baseline gap-1">
                        <p className="text-3xl font-black text-gray-900">104.8</p>
                        <p className="text-sm font-bold text-gray-400">kWh</p>
                    </div>
                </div>
            </div>

            {/* Matriz Principal Recharts */}
            <div className="grid lg:grid-cols-2 gap-6">

                {/* Consumo de Energia */}
                <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] shadow-xl border border-white/50 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-black text-gray-900 mb-1">Carga Energética</h3>
                        <p className="text-xs text-gray-500 font-medium mb-6">Consumo das Bombas (kWh)</p>
                    </div>
                    <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} dy={5} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                <Bar dataKey="energia" name="kWh" fill="#eab308" radius={[6, 6, 6, 6]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Impacto da IA */}
                <div className="bg-brand-dark/95 backdrop-blur-xl p-6 rounded-[2rem] shadow-xl border border-white/10 text-white flex-1 relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/20 rounded-full blur-2xl -mr-10 -mt-10"></div>

                    <div className="relative z-10 flex items-center justify-between mb-4">
                        <h3 className="text-xl font-black">Impacto da IA</h3>
                        <div className="p-2 bg-brand-primary/20 text-brand-accent rounded-xl">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="h-[100px] w-[100px] shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={efficiencyData}
                                        innerRadius={30}
                                        outerRadius={45}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {efficiencyData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-300 mb-2">Decisões de Irrigação</p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs font-medium">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                    <span>85% Otimizado (IA)</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <span>15% Intervenção Manual</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10 relative z-10">
                        <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                            <AlertTriangle size={18} className="text-brand-accent shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-300 font-medium">
                                A automação preveniu o consumo de <strong className="text-white">1.250 Litros</strong> na Quinta-feira devido à previsão antecipada de chuva do Open-Meteo.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
