import { useState } from 'react';
import { ArrowLeft, Droplets, Mail, Lock, User } from 'lucide-react';

interface RegisterProps {
    onNavigate: (view: 'landing' | 'login' | 'register' | 'dashboard') => void;
}

export function Register({ onNavigate }: RegisterProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Redirecting to Dashboard to simulate successful registration
        if (name && email && password) {
            onNavigate('dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-brand-white flex font-sans selection:bg-brand-accent selection:text-white">
            {/* Right side - Form (mirrored structurally) */}
            <div className="w-full lg:w-1/2 flex flex-col px-8 sm:px-16 lg:px-24 py-12 order-1 lg:order-2 bg-white z-10">
                <button
                    onClick={() => onNavigate('landing')}
                    className="flex items-center gap-2 text-gray-500 hover:text-brand-primary transition-colors w-fit mb-8"
                >
                    <ArrowLeft size={20} />
                    <span className="font-semibold">Voltar para a página inicial</span>
                </button>

                <div className="max-w-md w-full mx-auto flex-grow flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="bg-brand-primary text-white p-2 rounded-xl">
                            <Droplets size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-brand-black">HydroSync</span>
                    </div>

                    <h1 className="text-4xl font-extrabold text-brand-black mb-2">Crie sua conta</h1>
                    <p className="text-gray-500 mb-8 leading-relaxed">Junte-se à revolução agrícola em Angola. Crie sua conta gratuita em menos de um minuto.</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Nome Completo</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><User size={20} /></div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none text-brand-black transition-all"
                                    placeholder="Seu nome"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">E-mail</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Mail size={20} /></div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none text-brand-black transition-all"
                                    placeholder="voce@fazenda.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Senha</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Lock size={20} /></div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none text-brand-black transition-all"
                                    placeholder="Crie uma senha forte"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-start gap-3 mt-4">
                            <input type="checkbox" id="terms" className="mt-1.5 w-4 h-4 text-brand-primary rounded border-gray-300 focus:ring-brand-primary" required />
                            <label htmlFor="terms" className="text-sm text-gray-500 leading-relaxed cursor-pointer">
                                Eu concordo com os <a href="#" className="font-semibold text-brand-primary hover:underline">Termos de Serviço</a> e a <a href="#" className="font-semibold text-brand-primary hover:underline">Política de Privacidade</a> da HydroSync.
                            </label>
                        </div>

                        <button type="submit" className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-primary/20 transition-all mt-4">
                            Começar agora
                        </button>
                    </form>

                    <p className="text-center text-gray-500 mt-8">
                        Já tem uma conta?{' '}
                        <button onClick={() => onNavigate('login')} className="text-brand-primary font-bold hover:text-brand-accent transition-colors">
                            Entrar
                        </button>
                    </p>
                </div>
            </div>

            {/* Left side - Image Cover with Glassmorphism */}
            <div className="hidden lg:block lg:w-1/2 relative bg-brand-dark overflow-hidden order-2 lg:order-1">
                <img
                    src="/hero-bg.png"
                    alt="Tecnologia no Campo"
                    className="absolute inset-0 w-full h-full object-cover object-center scale-105"
                    style={{ transform: 'scaleX(-1) scale(1.05)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-dark/40 to-transparent mix-blend-multiply"></div>

                <div className="absolute inset-0 flex flex-col justify-end p-16 z-10">
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4 shadow-sm">O futuro da agricultura <br />está nas suas mãos.</h2>
                    <p className="text-xl text-gray-300 font-light max-w-lg mb-8">Tecnologia acessível para gerir sua irrigação de qualquer lugar, a qualquer hora.</p>

                    <div className="flex gap-4">
                        <div className="flex flex-col gap-1 items-center bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-xl">
                            <span className="text-3xl font-bold text-brand-accent">+200</span>
                            <span className="text-xs text-brand-white uppercase tracking-wider font-bold">Fazendas</span>
                        </div>
                        <div className="flex flex-col gap-1 items-center bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-xl">
                            <span className="text-3xl font-bold text-brand-accent">30%</span>
                            <span className="text-xs text-brand-white uppercase tracking-wider font-bold">Eco. Água</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
