
import { Activity, Battery, Wifi, BrainCircuit } from 'lucide-react';

export function SystemMetricsSidebar() {
    return (
        <div className="w-full xl:w-[380px] flex flex-col gap-6 shrink-0">

            {/* AI Digital Brain Widget */}
            <div className="bg-gradient-to-br from-brand-dark to-[#1a2b4c] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/20 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-primary/20 rounded-full blur-xl -ml-10 -mb-10"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 shadow-inner">
                                <BrainCircuit className="text-brand-accent animate-pulse" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg leading-tight">Cérebro Digital</h3>
                                <p className="text-xs text-brand-accent/80 font-medium">HydroSync AI</p>
                            </div>
                        </div>
                        <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-green-500/30 flex items-center gap-1.5 shadow-sm">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span> Ativo
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-colors">
                            <p className="text-xs text-gray-300 font-medium mb-1 flex items-center gap-1.5"><Activity size={12} className="text-brand-accent" /> Decisão Recente</p>
                            <p className="text-sm font-semibold text-white">Irrigação iniciada no Setor Sul (Umidade &lt; 35%)</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-colors">
                            <p className="text-xs text-gray-300 font-medium mb-1 flex items-center gap-1.5"><Activity size={12} className="text-brand-accent" /> Previsão IA</p>
                            <p className="text-sm font-semibold text-white">Economia de 12% de água no ciclo atual.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Logs & Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col relative overflow-hidden group">
                {/* Decorative background element */}
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-gray-50 rounded-full group-hover:scale-110 transition-transform duration-500 pointer-events-none"></div>

                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 relative z-10"><Activity size={18} className="text-brand-primary" /> Atividade do Sistema</h3>

                <div className="space-y-5 relative z-10 flex-1">
                    <div className="flex gap-4">
                        <div className="w-2 h-2 rounded-full bg-brand-primary mt-1.5 shrink-0 ring-4 ring-brand-primary/10"></div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Sensores calibrados</p>
                            <p className="text-xs text-gray-500 mt-0.5">Todos os 42 sensores operantes.</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1.5">Há 2 horas</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 shrink-0 ring-4 ring-orange-400/10"></div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Alerta de Bateria</p>
                            <p className="text-xs text-gray-500 mt-0.5">Sensor Leste-04 com 15% de carga.</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1.5">Há 5 horas</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0 ring-4 ring-green-500/10"></div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Irrigação Concluída</p>
                            <p className="text-xs text-gray-500 mt-0.5">Setor Norte (Milho) atingiu 60% umidade.</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1.5">Ontem, 18:30</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-2 gap-4 relative z-10">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100/50 hover:bg-gray-100/80 transition-colors">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <Battery size={14} />
                            <span className="text-xs font-bold uppercase tracking-wider">Bateria Média</span>
                        </div>
                        <p className="text-xl font-black text-gray-900">87%</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100/50 hover:bg-gray-100/80 transition-colors">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <Wifi size={14} />
                            <span className="text-xs font-bold uppercase tracking-wider">Sinal Rede</span>
                        </div>
                        <p className="text-xl font-black text-gray-900">Forte</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
