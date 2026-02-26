
import {
    Map as MapIcon,
    Settings,
    LogOut,
    LayoutDashboard,
    ChevronRight,
    CloudSun,
    PieChart
} from 'lucide-react';

interface SidebarProps {
    activeTab: 'visao-geral' | 'mapa-interativo' | 'setores' | 'previsao' | 'relatorios';
    setActiveTab: (tab: 'visao-geral' | 'mapa-interativo' | 'setores' | 'previsao' | 'relatorios') => void;
    onNavigate: (view: 'landing' | 'login' | 'register' | 'dashboard') => void;
    userProfile?: any;
}

export function Sidebar({ activeTab, setActiveTab, onNavigate, userProfile }: SidebarProps) {
    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="w-72 bg-white hidden lg:flex flex-col border-r border-gray-200 z-50 shadow-sm relative h-screen">
                {/* Logo Area */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-center md:justify-start gap-3 cursor-pointer" onClick={() => onNavigate('landing')}>
                    <img src="/logo-horizontal.png" alt="HydroSync" className="h-10 w-auto object-contain" />
                </div>

                {/* Primary Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-3 mb-4 mt-2">Menu Principal</p>
                    <button
                        onClick={() => setActiveTab('visao-geral')}
                        className={`w-full flex items-center justify-between px-4 py-3.5 font-bold text-sm rounded-xl transition-all ${activeTab === 'visao-geral' ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20 translate-x-1' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                        <div className="flex items-center gap-3"><LayoutDashboard size={20} className={activeTab === 'visao-geral' ? 'text-brand-accent' : 'text-gray-400'} /> Visão Geral</div>
                        {activeTab === 'visao-geral' && <ChevronRight size={16} className="text-white/70" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('mapa-interativo')}
                        className={`w-full flex items-center justify-between px-4 py-3.5 font-bold text-sm rounded-xl transition-all ${activeTab === 'mapa-interativo' ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20 translate-x-1' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                        <div className="flex items-center gap-3"><MapIcon size={20} className={activeTab === 'mapa-interativo' ? 'text-brand-accent' : 'text-gray-400'} /> Mapa Interativo</div>
                        {activeTab === 'mapa-interativo' && <ChevronRight size={16} className="text-white/70" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('setores')}
                        className={`w-full flex items-center justify-between px-4 py-3.5 font-bold text-sm rounded-xl transition-all ${activeTab === 'setores' ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20 translate-x-1' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                        <div className="flex items-center gap-3"><MapIcon size={20} className={activeTab === 'setores' ? 'text-brand-accent' : 'text-gray-400'} /> Setores da Fazenda</div>
                        {activeTab === 'setores' && <ChevronRight size={16} className="text-white/70" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('previsao')}
                        className={`w-full flex items-center justify-between px-4 py-3.5 font-bold text-sm rounded-xl transition-all ${activeTab === 'previsao' ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20 translate-x-1' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                        <div className="flex items-center gap-3"><CloudSun size={20} className={activeTab === 'previsao' ? 'text-brand-accent' : 'text-gray-400'} /> Previsão Tempo</div>
                        {activeTab === 'previsao' && <ChevronRight size={16} className="text-white/70" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('relatorios')}
                        className={`w-full flex items-center justify-between px-4 py-3.5 font-bold text-sm rounded-xl transition-all ${activeTab === 'relatorios' ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20 translate-x-1' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                        <div className="flex items-center gap-3"><PieChart size={20} className={activeTab === 'relatorios' ? 'text-brand-accent' : 'text-gray-400'} /> Relatórios</div>
                        {activeTab === 'relatorios' && <ChevronRight size={16} className="text-white/70" />}
                    </button>
                </nav>

                {/* Sidebar Footer (Settings & User) */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 mt-auto">
                    <button className="w-full flex items-center gap-3 px-4 py-3 font-medium text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors mb-2">
                        <Settings size={18} className="text-gray-400" /> Configurações
                    </button>
                    <div className="flex items-center gap-3 group px-4 py-3 rounded-xl hover:bg-white border text-left border-transparent hover:border-gray-200 transition-all cursor-pointer shadow-sm">
                        {userProfile?.logo_url ? (
                            <img src={`http://localhost:8000${userProfile.logo_url}`} alt="Avatar" className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-200" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-brand-dark flex items-center justify-center text-white font-bold text-sm shrink-0 uppercase">
                                {userProfile?.nome ? userProfile.nome.substring(0, 2) : 'JA'}
                            </div>
                        )}
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-gray-900 leading-tight truncate">
                                {userProfile?.nome || 'Carregando...'}
                            </p>
                            <p className="text-[11px] text-brand-primary font-bold truncate mt-0.5">
                                {userProfile?.role === 'admin' ? 'Admin' : 'Membro'} • {userProfile?.fazenda_nome || 'A carregar...'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => onNavigate('landing')}
                        className="mt-4 flex items-center justify-center gap-2 w-full py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100">
                        <LogOut size={16} /> Sair
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation (App Feel) */}
            <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-200 z-[9999] flex justify-between items-center px-6 py-3 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <button onClick={() => setActiveTab('visao-geral')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'visao-geral' ? 'text-brand-primary' : 'text-gray-400'}`}>
                    <LayoutDashboard size={24} className={activeTab === 'visao-geral' ? 'text-brand-accent' : ''} />
                    <span className="text-[10px] font-bold">Visão Geral</span>
                </button>
                <button onClick={() => setActiveTab('mapa-interativo')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'mapa-interativo' ? 'text-brand-primary' : 'text-gray-400'}`}>
                    <MapIcon size={24} className={activeTab === 'mapa-interativo' ? 'text-brand-accent' : ''} />
                    <span className="text-[10px] font-bold">Mapa</span>
                </button>
                <button onClick={() => setActiveTab('setores')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'setores' ? 'text-brand-primary' : 'text-gray-400'}`}>
                    <div className="relative">
                        <MapIcon size={24} className={activeTab === 'setores' ? 'text-brand-accent' : ''} />
                    </div>
                    <span className="text-[10px] font-bold">Setores</span>
                </button>
                <button onClick={() => setActiveTab('previsao')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'previsao' ? 'text-brand-primary' : 'text-gray-400'}`}>
                    <CloudSun size={24} className={activeTab === 'previsao' ? 'text-brand-accent' : ''} />
                    <span className="text-[10px] font-bold">Clima</span>
                </button>
                <button onClick={() => setActiveTab('relatorios')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'relatorios' ? 'text-brand-primary' : 'text-gray-400'}`}>
                    <PieChart size={24} className={activeTab === 'relatorios' ? 'text-brand-accent' : ''} />
                    <span className="text-[10px] font-bold">Relatório</span>
                </button>
            </nav>
        </>
    );
}
