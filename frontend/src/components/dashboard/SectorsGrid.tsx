import type { Zone } from '../../types';
import { Settings, Battery, Wifi, Droplets, CloudSun, Map as MapIcon, BrainCircuit } from 'lucide-react';

interface SectorsGridProps {
    zones: Zone[];
    handleToggleAi: (id: number) => void;
    handleTogglePump: (id: number) => void;
}

export function SectorsGrid({ zones, handleToggleAi, handleTogglePump }: SectorsGridProps) {
    return (
        <div className="flex-1 w-full flex flex-col gap-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-brand-black tracking-tight flex items-center gap-3">
                        <MapIcon className="text-brand-accent" size={28} />
                        Gestão de Setores
                    </h2>
                    <p className="text-gray-500 font-medium text-sm mt-1">Monitore e controle cada talhão da sua fazenda individualmente.</p>
                </div>
                <div className="hidden sm:flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                    <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 text-center min-w-[100px]">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Sensores</p>
                        <p className="font-black text-brand-black text-lg leading-none">{zones.filter(z => z.type === 'sensor').length}</p>
                    </div>
                    <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 text-center min-w-[100px]">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Irrigando</p>
                        <p className="font-black text-brand-primary text-lg leading-none">{zones.filter(z => z.status === 'irrigating').length}</p>
                    </div>
                    <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 text-center min-w-[100px]">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Tanques</p>
                        <p className="font-black text-blue-600 text-lg leading-none">{zones.filter(z => z.type === 'tank').length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                {zones.map((zone) => (
                    <div key={zone.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                        {/* Interactive Background Glow based on status */}
                        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 opacity-20 transition-colors duration-500 pointer-events-none ${zone.type === 'tank' ? 'bg-blue-500' :
                            zone.status === 'optimal' ? 'bg-green-500' :
                                zone.status === 'attention' ? 'bg-orange-500' : 'bg-brand-primary'
                            }`}></div>

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                                <h3 className="font-black text-xl text-gray-900 flex items-center gap-2">
                                    {zone.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{zone.type === 'sensor' ? zone.crop : 'Reservatório'}</span>
                                    {zone.status === 'optimal' && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">✔ Ideal</span>}
                                    {zone.status === 'attention' && <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full border border-orange-100">! Atenção</span>}
                                    {zone.status === 'irrigating' && <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-full border border-brand-primary/20 animate-pulse">💧 Irrigando</span>}
                                    {zone.type === 'tank' && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">💧 Nível OK</span>}
                                </div>
                            </div>
                            <button className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-full transition-colors">
                                <Settings size={18} />
                            </button>
                        </div>

                        {zone.type === 'sensor' && (
                            <>
                                <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100/80 hover:bg-white hover:shadow-sm hover:border-brand-primary/20 transition-all group/stat">
                                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                                            <div className="p-1.5 bg-white rounded-lg shadow-sm text-brand-primary group-hover/stat:scale-110 transition-transform"><Droplets size={14} /></div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Umidade</span>
                                        </div>
                                        <div className="flex items-end gap-1.5">
                                            <p className={`text-3xl font-black leading-none ${zone.moisture && zone.moisture < 40 ? 'text-orange-500' : 'text-gray-900'}`}>{zone.moisture}%</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100/80 hover:bg-white hover:shadow-sm hover:border-orange-400/20 transition-all group/stat">
                                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                                            <div className="p-1.5 bg-white rounded-lg shadow-sm text-orange-500 group-hover/stat:scale-110 transition-transform"><CloudSun size={14} /></div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Temp.</span>
                                        </div>
                                        <div className="flex items-end gap-1.5">
                                            <p className="text-3xl font-black text-gray-900 leading-none">{zone.temp}°C</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs font-medium text-gray-500 border-t border-gray-100 pt-4 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-200/60"><Battery size={14} className={zone.battery && zone.battery < 20 ? 'text-red-500' : 'text-green-500'} /> {zone.battery}%</span>
                                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-200/60"><Wifi size={14} className="text-brand-primary" /> {zone.signal}</span>
                                    </div>
                                    <span>Atualizado {zone.lastUpdate}</span>
                                </div>

                                {/* Controls */}
                                <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl flex items-center justify-center transition-colors ${zone.aiMode ? 'bg-brand-accent/10' : 'bg-gray-100'}`}>
                                            <BrainCircuit size={18} className={zone.aiMode ? 'text-brand-accent animate-pulse' : 'text-gray-400'} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">Modo IA</p>
                                            <p className="text-[10px] text-gray-500 font-medium">Auto-irrigação</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer ml-auto">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={zone.aiMode || false}
                                            onChange={() => handleToggleAi(zone.id)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent"></div>
                                    </label>
                                </div>

                                {/* Manual Action Warning - only show if AI is off */}
                                {!zone.aiMode && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center justify-between bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                                            <div>
                                                <p className="text-[11px] font-bold text-orange-800 uppercase tracking-widest leading-none mb-1">Ação Manual</p>
                                                <p className="text-xs text-orange-600 font-medium">Bomba de Água</p>
                                            </div>
                                            <button
                                                onClick={() => handleTogglePump(zone.id)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${zone.pumpOn
                                                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20'
                                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-brand-primary hover:border-brand-primary/30'
                                                    }`}
                                            >
                                                {zone.pumpOn ? 'Desligar Bomba' : 'Ligar Bomba'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {zone.type === 'tank' && (
                            <div className="relative z-10 flex flex-col items-center justify-center py-6">
                                <div className="relative w-32 h-32 flex items-center justify-center">
                                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="45"
                                            fill="none"
                                            stroke="#2563eb"
                                            strokeWidth="8"
                                            strokeDasharray={`${(zone.level || 0) * 2.827} 282.7`}
                                            className="transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-black text-gray-900">{zone.level}%</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Capacidade</span>
                                    </div>
                                </div>
                                <div className="mt-8 text-center space-y-2">
                                    <p className="text-sm font-medium text-gray-600 flex items-center justify-center gap-1.5"><Droplets size={16} className="text-blue-500" /> Fluxo de Água Normal</p>
                                    <p className="text-xs text-gray-400">Último abastecimento: Hoje, 06:00</p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
