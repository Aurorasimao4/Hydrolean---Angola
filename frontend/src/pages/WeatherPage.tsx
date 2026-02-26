import { useState, useEffect } from 'react';
import { CloudSun, CloudRain, Wind, Droplets, Calendar, Loader2, RefreshCw, Navigation } from 'lucide-react';
import { api } from '../lib/api';

interface WeatherPageProps {
    lat: number;
    lng: number;
}

export function WeatherPage({ lat, lng }: WeatherPageProps) {
    const [weather, setWeather] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    const handleFullAnalysis = async () => {
        setAnalyzing(true);
        try {
            const res = await api.fullAnalysis({
                latitude: lat,
                longitude: lng,
                N: 50, P: 50, K: 50,
                temperature: current?.temp_media || 25,
                humidity: current?.humidade_media || 60,
                ph: 6.5,
                rainfall: daily?.precipitacao_total[0] || 0
            });
            setAnalysis(res);
            setShowAnalysis(true);
        } catch (err) {
            console.error("Erro na análise completa:", err);
            alert("Não foi possível gerar a análise detalhada agora.");
        } finally {
            setAnalyzing(false);
        }
    };

    const fetchWeather = async () => {
        setRefreshing(true);
        try {
            const data = await api.getMeteo(lat, lng);
            setWeather(data);
        } catch (err) {
            console.error("Erro ao carregar clima:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchWeather();
    }, [lat, lng]);

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 size={48} className="text-brand-primary animate-spin mb-4" />
                <p className="text-gray-500 font-bold">A carregar previsão meteorológica...</p>
            </div>
        );
    }

    const current = weather?.previsao_horaria_resumo?.proximas_6h;
    const daily = weather?.previsao_diaria;
    const dec = weather?.decisao_rapida;

    return (
        <div className="flex-1 flex flex-col gap-6 lg:gap-8 pb-10 max-w-6xl mx-auto w-full relative">
            {/* Background Decorativo para realçar o Glassmorphism */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-brand-accent/15 rounded-full blur-[100px]"></div>
                <div className="absolute top-[30%] right-[10%] w-[25%] h-[25%] bg-blue-400/10 rounded-full blur-[80px]"></div>
            </div>

            {/* Header com Localização - Glassmorphism */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl shadow-black/5 border border-white/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div>
                    <div className="flex items-center gap-2 text-brand-primary font-bold mb-2">
                        <Navigation size={18} />
                        <span className="uppercase tracking-widest text-xs">Localização da Fazenda</span>
                    </div>
                    <h1 className="text-4xl font-black text-brand-black tracking-tighter">Previsão do Tempo</h1>
                    <p className="text-gray-500 mt-1 flex items-center gap-2">
                        <span className="font-bold">{lat.toFixed(4)}, {lng.toFixed(4)}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                        Última atualização: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <button
                    onClick={fetchWeather}
                    className="bg-white/50 hover:bg-white/80 backdrop-blur-md text-gray-700 p-4 rounded-2xl transition-all border border-white/50 shadow-sm group"
                    disabled={refreshing}
                >
                    <RefreshCw size={24} className={refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Card Principal - Agora - Glassmorphism Premium */}
                <div className="lg:col-span-2 bg-gradient-to-br from-brand-primary/90 to-brand-secondary/90 backdrop-blur-lg p-8 rounded-[2.5rem] text-white shadow-2xl shadow-brand-primary/20 relative overflow-hidden flex flex-col justify-between min-h-[350px] border border-white/20">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-40 -mt-40"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">Agora</span>
                                <div className="mt-6 flex items-baseline gap-2">
                                    <span className="text-8xl font-black tracking-tighter">{current?.temp_media ?? '--'}°</span>
                                    <span className="text-2xl font-bold opacity-70">C</span>
                                </div>
                            </div>
                            <CloudSun size={100} className="text-white drop-shadow-2xl" strokeWidth={1} />
                        </div>
                    </div>

                    <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-white/10">
                        <div className="flex flex-col">
                            <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Humidade Ar</span>
                            <div className="flex items-center gap-2 font-black text-lg">
                                <Droplets size={18} className="text-brand-accent" />
                                {current?.humidade_media ?? '--'}%
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Vento</span>
                            <div className="flex items-center gap-2 font-black text-lg">
                                <Wind size={18} className="text-brand-accent" />
                                {weather?.vento_atual_kmh ?? '--'} km/h
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Céu</span>
                            <div className="flex items-center gap-2 font-black text-lg capitalize">
                                Parcial. Nublado
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Prob. Chuva</span>
                            <div className="flex items-center gap-2 font-black text-lg">
                                <CloudRain size={18} className="text-brand-accent" />
                                {daily?.prob_precipitacao_max?.[0] ?? '--'}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card de Recomendação IA - Glassmorphism Dark */}
                <div className="bg-brand-dark/90 backdrop-blur-xl p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col border border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-brand-accent/20 rounded-2xl text-brand-accent border border-brand-accent/20">
                            <RefreshCw size={24} />
                        </div>
                        <h3 className="text-xl font-bold">Conselho IA</h3>
                    </div>

                    <div className="flex-1 space-y-6">
                        <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10">
                            <p className="text-sm font-bold text-brand-accent uppercase tracking-widest mb-2">Decisão de Irrigação</p>
                            <p className="text-2xl font-black mb-2">{dec?.irrigar_agora ? 'Recomendado' : 'Aguardar'}</p>
                            <p className="text-sm text-gray-300 font-medium leading-relaxed">
                                {dec?.motivo ?? 'Analisando condições locais para otimização hídrica.'}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400 font-medium">Balanço Hídrico (24h)</span>
                                <span className="font-bold text-brand-accent">{weather?.previsao_horaria_resumo?.proximas_24h?.balanco_hidrico_mm ?? '--'} mm</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400 font-medium">Evapotranspiração</span>
                                <span className="font-bold">{weather?.previsao_horaria_resumo?.proximas_24h?.evapotranspiracao_mm ?? '--'} mm</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleFullAnalysis}
                        disabled={analyzing}
                        className="mt-8 w-full py-4 bg-brand-primary hover:bg-brand-secondary transition-all rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 group disabled:opacity-50"
                    >
                        {analyzing ? 'Analisando...' : 'Ver Análise Completa'}
                        <RefreshCw size={18} className={analyzing ? 'animate-spin' : 'group-hover:rotate-90 transition-transform'} />
                    </button>
                </div>
            </div>

            {/* Modal de Análise Completa - Glassmorphism */}
            {showAnalysis && analysis && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-brand-dark/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white/90 backdrop-blur-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl border border-white/50 p-8 md:p-12 relative animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setShowAnalysis(false)}
                            className="absolute top-8 right-8 p-3 hover:bg-gray-100 rounded-2xl transition-colors text-gray-400 hover:text-gray-900"
                        >
                            <RefreshCw size={24} className="rotate-45" />
                        </button>

                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-4 bg-brand-primary/10 rounded-3xl text-brand-primary border border-brand-primary/20">
                                <RefreshCw size={32} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-brand-black tracking-tight">Análise Estratégica IA</h2>
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-1">Processado por HydroSync Brain v2.0</p>
                            </div>
                        </div>

                        <div className="prose prose-slate max-w-none">
                            <div className="bg-brand-primary/5 border border-brand-primary/10 p-8 rounded-3xl mb-8">
                                <h3 className="text-xl font-bold text-brand-primary mb-4 flex items-center gap-2">
                                    <CloudSun size={20} /> Condições Detectadas
                                </h3>
                                <p className="text-gray-700 leading-relaxed font-medium">
                                    {analysis.analise_clima || "Análise climática detalhada não disponível no momento."}
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-green-50/50 border border-green-100 p-8 rounded-3xl">
                                    <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                                        <Droplets size={20} /> Recomendação de Irrigação
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed font-medium">
                                        {analysis.recomendacao_irrigacao || "Aguardando dados adicionais dos sensores."}
                                    </p>
                                </div>
                                <div className="bg-orange-50/50 border border-orange-100 p-8 rounded-3xl">
                                    <h3 className="text-xl font-bold text-orange-700 mb-4 flex items-center gap-2">
                                        <Wind size={20} /> Próximos Passos
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed font-medium">
                                        {analysis.proximos_passos || "Continue o monitoramento regular."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                            <p className="text-gray-400 text-sm font-medium">Esta análise utiliza modelos climáticos e agronómicos de precisão.</p>
                            <button
                                onClick={() => setShowAnalysis(false)}
                                className="px-10 py-4 bg-brand-dark text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-brand-dark/20"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Previsão Próximos Dias - Glassmorphism List */}
            <div className="bg-white/30 backdrop-blur-xl p-8 lg:p-10 rounded-[2.5rem] shadow-xl border border-white/40">
                <div className="flex items-center gap-3 mb-8">
                    <Calendar className="text-brand-primary" size={24} />
                    <h2 className="text-2xl font-black text-brand-black tracking-tight">Próximos Dias</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {daily?.dias.map((dia: string, idx: number) => (
                        <div key={idx} className="bg-white/40 backdrop-blur-md flex flex-col p-6 rounded-3xl border border-white/40 shadow-sm hover:shadow-xl hover:bg-white/60 transition-all hover:translate-y-[-4px] group">
                            <span className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-4">
                                {new Date(dia).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric' })}
                            </span>

                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    {daily.precipitacao_total[idx] > 5 ? <CloudRain className="text-brand-primary" size={32} /> : <CloudSun className="text-orange-400" size={32} />}
                                    <div>
                                        <p className="text-2xl font-black text-brand-black leading-none">{daily.temp_max[idx]}°</p>
                                        <p className="text-sm text-gray-500 font-bold mt-1.5">{daily.temp_min[idx]}° mínima</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-brand-primary font-black text-lg leading-none">{daily.prob_precipitacao_max[idx]}%</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1.5">Chuva</p>
                                </div>
                            </div>

                            <div className="mt-auto pt-4 border-t border-black/5">
                                <p className="text-[11px] text-gray-600 font-medium font-bold">Previsão: {daily.precipitacao_total[idx]}mm chuva total</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
