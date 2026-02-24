
import { CloudSun, CloudRain, BrainCircuit } from 'lucide-react';

export function WeatherWidget() {
    return (
        <div className="flex flex-wrap justify-between items-center gap-6 bg-white/70 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] shadow-sm border border-white relative overflow-hidden ring-1 ring-gray-100">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-brand-primary/10 via-brand-accent/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

            <div className="relative z-10 min-w-[280px] flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-black text-brand-black tracking-tight">Monitoramento Geral</h2>
                    <span className="flex items-center gap-1.5 bg-green-500/10 text-green-600 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-green-500/20"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Em Tempo Real</span>
                </div>
                <p className="text-gray-500 font-medium text-13 flex items-center gap-1"><BrainCircuit size={14} className="text-brand-accent" /> IA sincronizada no Huambo às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 relative z-10 w-full lg:w-auto">
                <div className="flex items-center gap-3 bg-white/70 p-3.5 rounded-2xl border border-white shadow-sm flex-1 sm:flex-initial min-w-[140px]">
                    <div className="p-2.5 bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-xl shadow-inner-light shadow-orange-500/30">
                        <CloudSun size={20} />
                    </div>
                    <div>
                        <p className="text-xl font-black text-gray-900 leading-none mb-1">28°C</p>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest leading-none">Prov. Huambo</p>
                    </div>
                </div>
                <div className="w-full h-px sm:w-px sm:h-10 bg-gradient-to-r sm:bg-gradient-to-b from-transparent via-gray-200 to-transparent shrink-0"></div>
                <div className="flex items-center gap-3 bg-white/70 p-3.5 rounded-2xl border border-white shadow-sm flex-1 sm:flex-initial min-w-[140px]">
                    <div className="p-2.5 bg-gradient-to-br from-brand-primary/80 to-brand-primary text-white rounded-xl shadow-inner-light shadow-brand-primary/30">
                        <CloudRain size={20} />
                    </div>
                    <div>
                        <p className="text-xl font-black text-brand-primary leading-none mb-1">20%</p>
                        <p className="text-[10px] uppercase font-bold text-brand-primary/60 tracking-widest leading-none">Chuva Prevista</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
