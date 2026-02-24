
import { Search, Bell } from 'lucide-react';

export function Topbar() {
    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 z-10 shrink-0">
            <div className="relative w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Buscar sensor (ex: Milho), talhão ou alerta..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-100/80 border-2 border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:border-brand-primary/30 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all placeholder:text-gray-400"
                />
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right mr-4 hidden md:block">
                    <p className="text-sm font-bold text-gray-900">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    <p className="text-xs text-gray-500">Sistema online e operando.</p>
                </div>
                <button className="relative p-3 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 rounded-full transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                </button>
            </div>
        </header>
    );
}
