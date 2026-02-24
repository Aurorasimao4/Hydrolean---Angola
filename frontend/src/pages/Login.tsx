import { useState } from 'react';
import { ArrowLeft, Droplets, Mail, Lock } from 'lucide-react';

interface LoginProps {
    onNavigate: (view: 'landing' | 'login' | 'register') => void;
}

export function Login({ onNavigate }: LoginProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: implement real login
        console.log('Login attempt:', { email, password });
    };

    return (
        <div className="min-h-screen bg-brand-white flex font-sans selection:bg-brand-accent selection:text-white">
            {/* Left side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col px-8 sm:px-16 lg:px-24 py-12">
                <button
                    onClick={() => onNavigate('landing')}
                    className="flex items-center gap-2 text-gray-500 hover:text-brand-primary transition-colors w-fit mb-16"
                >
                    <ArrowLeft size={20} />
                    <span className="font-semibold">Voltar para a página inicial</span>
                </button>

                <div className="max-w-md w-full mx-auto flex-grow flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-10">
                        <div className="bg-brand-primary text-white p-2 rounded-xl">
                            <Droplets size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-brand-black">HydroSync</span>
                    </div>

                    <h1 className="text-4xl font-extrabold text-brand-black mb-2">Bem-vindo de volta</h1>
                    <p className="text-gray-500 mb-8 leading-relaxed">Acesse o seu painel de controle e acompanhe a irrigação da sua plantação em tempo real.</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">E-mail</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all text-brand-black outline-none"
                                    placeholder="voce@fazenda.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-bold text-gray-700">Senha</label>
                                <a href="#" className="text-sm font-semibold text-brand-accent hover:text-brand-primary transition-colors">Esqueceu a senha?</a>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all text-brand-black outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-primary/20 transition-all mt-4">
                            Entrar na conta
                        </button>
                    </form>

                    <p className="text-center text-gray-500 mt-8">
                        Ainda não tem conta?{' '}
                        <button onClick={() => onNavigate('register')} className="text-brand-primary font-bold hover:text-brand-accent transition-colors">
                            Cadastre-se grátis
                        </button>
                    </p>
                </div>
            </div>

            {/* Right side - Image Cover with Glassmorphism */}
            <div className="hidden lg:block lg:w-1/2 relative bg-brand-dark overflow-hidden">
                <img
                    src="/hero-bg.png"
                    alt="Agricultura Tecnológica"
                    className="absolute inset-0 w-full h-full object-cover object-center scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-dark/40 to-transparent mix-blend-multiply"></div>

                <div className="absolute inset-0 flex flex-col justify-end p-16 z-10">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl w-full max-w-lg shadow-2xl">
                        <p className="text-xl text-white font-medium italic mb-6">
                            "Desde que implementamos o HydroSync, nossa economia de água chegou a 40% e a produtividade da safra de milho bateu recordes."
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-brand-accent flex items-center justify-center text-white font-bold text-xl">
                                JA
                            </div>
                            <div>
                                <p className="text-white font-bold">João Almeida</p>
                                <p className="text-brand-accent text-sm">Cooperativa Agrícola do Cuanza Sul</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
