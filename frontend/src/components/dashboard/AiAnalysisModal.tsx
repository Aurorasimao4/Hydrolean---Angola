import { useState, useEffect } from 'react';
import { X, BrainCircuit, Droplets, Droplet, Sprout, Loader2, AlertTriangle, Info } from 'lucide-react';
import { api } from '../../lib/api';
import type { IrrigationParams } from '../../lib/api';
import type { Zone } from '../../types';

interface AiAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    zone: Zone | null;
}

export function AiAnalysisModal({ isOpen, onClose, zone }: AiAnalysisModalProps) {
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !zone) return;

        setLoading(true);
        setError(null);

        // Parameters for API
        const params: IrrigationParams = {
            latitude: zone.lat,
            longitude: zone.lng,
            N: zone.N || 90,
            P: zone.P || 42,
            K: zone.K || 43,
            temperature: zone.temp || 25,
            humidity: 60, // Dummy value
            ph: zone.ph || 6.5,
            rainfall: zone.rainfall || 100,
            area_hectares: 1.5, // Dummy value
            tipo_solo: 'Argiloso',
            sistema_irrigacao: 'Gotejamento'
        };

        api.fullAnalysis(params)
            .then(data => {
                setResult(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erro na análise:", err);
                setError("Ocorreu um erro ao conectar com o Agrónomo IA. Tente novamente mais tarde.");
                setLoading(false);
            });
    }, [isOpen, zone]);

    if (!isOpen) return null;

    // Helper function to render Markdown-like text from Gemini roughly.
    // In a real app, you'd use a markdown parser library like react-markdown.
    const renderMarkdownText = (text: string) => {
        return text.split('\n').map((line, idx) => {
            if (line.trim() === '') return <div key={idx} className="h-2"></div>;

            // Bold text parser
            const parseBold = (content: string) => {
                const parts = content.split(/\*\*(.*?)\*\*/g);
                return parts.map((part, i) =>
                    i % 2 === 1 ? <strong key={i} className="text-gray-900 font-black">{part}</strong> : part
                );
            };

            // Headers
            if (line.startsWith('##')) {
                return (
                    <h3 key={idx} className="text-lg font-black text-brand-black mt-6 mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-brand-accent rounded-full inline-block"></span>
                        {line.replace(/^#+\s*/, '').trim()}
                    </h3>
                );
            }

            // List Items
            if (line.match(/^[-*]\s/)) {
                return (
                    <li key={idx} className="ml-5 list-disc text-gray-600 mb-2 pl-1 marker:text-brand-accent">
                        {parseBold(line.replace(/^[-*]\s+/, ''))}
                    </li>
                );
            }

            // Numbered List Items
            if (line.match(/^\d+\.\s/)) {
                return (
                    <li key={idx} className="ml-5 list-decimal text-gray-600 mb-2 pl-1 marker:text-brand-accent marker:font-bold">
                        {parseBold(line.replace(/^\d+\.\s+/, ''))}
                    </li>
                );
            }

            // Normal paragraphs
            return (
                <p key={idx} className="text-gray-600 mb-3 leading-relaxed">
                    {parseBold(line.trim())}
                </p>
            );
        });
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden ring-1 ring-gray-200" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-brand-accent/10 p-2 rounded-xl text-brand-accent">
                            <BrainCircuit size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 leading-tight">Agrónomo IA</h2>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5">Análise em Tempo Real • {zone?.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center min-h-[300px]">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-brand-accent/20 blur-xl rounded-full"></div>
                                <Loader2 size={48} className="text-brand-accent animate-spin relative z-10" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Analisando o solo e clima...</h3>
                            <p className="text-gray-500 max-w-md text-center">A nossa IA está combinando os dados dos sensores do {zone?.name} com as previsões meteorológicas para gerar recomendações precisas.</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                            <AlertTriangle size={48} className="text-red-500 mb-4" />
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Oops! Algo deu errado.</h3>
                            <p className="text-gray-500 max-w-md">{error}</p>
                            <button onClick={onClose} className="mt-6 px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Fechar</button>
                        </div>
                    ) : result ? (
                        <div className="space-y-6">
                            {/* Top Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-green-50 rounded-2xl p-4 border border-green-100 flex items-start gap-3">
                                    <div className="bg-white p-2 text-green-600 rounded-xl shadow-sm"><Sprout size={20} /></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-green-800 uppercase tracking-widest mb-0.5">Cultura Ideal</p>
                                        <p className="font-black text-gray-900 text-lg leading-tight">{result.previsao.cultura_pt}</p>
                                        <p className="text-xs text-green-700 font-medium mt-1">{result.previsao.confianca}% de Confiança</p>
                                    </div>
                                </div>
                                <div className={`${result.irrigacao.decisao_rapida.irrigar_agora ? 'bg-brand-primary/10 border-brand-primary/20' : 'bg-orange-50 border-orange-100'} rounded-2xl p-4 border flex items-start gap-3`}>
                                    <div className={`bg-white p-2 rounded-xl shadow-sm ${result.irrigacao.decisao_rapida.irrigar_agora ? 'text-brand-primary' : 'text-orange-500'}`}><Droplet size={20} /></div>
                                    <div>
                                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${result.irrigacao.decisao_rapida.irrigar_agora ? 'text-brand-primary' : 'text-orange-800'}`}>Ação Imediata</p>
                                        <p className="font-black text-gray-900 text-lg leading-tight">{result.irrigacao.decisao_rapida.irrigar_agora ? 'Irrigar Agora' : 'Adiar Irrigação'}</p>
                                    </div>
                                </div>
                                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex items-start gap-3">
                                    <div className="bg-white p-2 text-blue-500 rounded-xl shadow-sm"><Droplets size={20} /></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-blue-800 uppercase tracking-widest mb-0.5">Previsão 24h</p>
                                        <p className="font-black text-gray-900 text-lg leading-tight">{result.irrigacao.previsao_meteo.proximas_24h.chuva_total_mm}mm Chuva</p>
                                    </div>
                                </div>
                            </div>

                            {/* Alert Msg */}
                            <div className={`p-4 rounded-2xl flex gap-3 ${result.irrigacao.decisao_rapida.irrigar_agora ? 'bg-blue-50 text-blue-800 border border-blue-100' : 'bg-orange-50 text-orange-800 border border-orange-100'}`}>
                                <Info size={20} className="shrink-0 mt-0.5" />
                                <p className="text-sm font-medium">{result.irrigacao.decisao_rapida.motivo}</p>
                            </div>

                            {/* Gemini Markdown Output */}
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-sm">
                                {renderMarkdownText(result.irrigacao.recomendacao_irrigacao)}
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl shadow-sm hover:bg-gray-800 transition-colors"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
}
