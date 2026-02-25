import { useState } from 'react';
import { ArrowLeft, Mail, Lock, User, Camera, Tractor, Briefcase, MapPin } from 'lucide-react';
import { api, authInfo } from '../lib/api';
interface RegisterProps {
    onNavigate: (view: 'landing' | 'login' | 'register' | 'dashboard') => void;
}

export function Register({ onNavigate }: RegisterProps) {
    const [name, setName] = useState('');
    const [fazendaNome, setFazendaNome] = useState('');
    const [nif, setNif] = useState('');
    const [email, setEmail] = useState('');
    const [endereco, setEndereco] = useState('');
    const [password, setPassword] = useState('');
    const [logo, setLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogo(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('nome', name);
            formData.append('fazenda_nome', fazendaNome);
            formData.append('nif', nif);
            formData.append('email', email);
            formData.append('endereco', endereco);
            formData.append('senha', password);
            if (logo) {
                formData.append('logo', logo);
            }

            const res = await api.register(formData);
            if (res.access_token) {
                authInfo.setToken(res.access_token);
                onNavigate('dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao realizar o registo. Verifique os dados.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-white flex font-sans selection:bg-brand-accent selection:text-white">
            {/* Right side - Form (mirrored structurally) */}
            <div className="w-full lg:w-1/2 flex flex-col px-8 sm:px-12 lg:px-20 py-8 order-1 lg:order-2 bg-white z-10 overflow-y-auto">
                <button
                    onClick={() => onNavigate('landing')}
                    className="flex items-center gap-2 text-gray-500 hover:text-brand-primary transition-colors w-fit mb-4"
                >
                    <ArrowLeft size={20} />
                    <span className="font-semibold">Voltar para a página inicial</span>
                </button>

                <div className="max-w-md w-full mx-auto flex-grow flex flex-col justify-center">

                    {/* Logo Image Picker */}
                    <div className="flex flex-col items-center mb-8">
                        <label htmlFor="logo-upload" className="relative cursor-pointer group flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden transition-all group-hover:border-brand-primary mb-3">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Camera size={28} className="text-gray-400 group-hover:text-brand-primary transition-colors" />
                                )}
                            </div>
                            <span className="text-sm font-bold text-gray-700">Logo da fazenda</span>
                            <span className="text-xs text-gray-400">Toque para selecionar</span>
                            <input
                                id="logo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleLogoChange}
                            />
                        </label>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-primary"><User size={18} /></div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none text-brand-black transition-all"
                                placeholder="Nome"
                                required
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-primary"><Tractor size={18} /></div>
                            <input
                                type="text"
                                value={fazendaNome}
                                onChange={(e) => setFazendaNome(e.target.value)}
                                className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none text-brand-black transition-all"
                                placeholder="Nome da fazenda"
                                required
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-primary"><Briefcase size={18} /></div>
                            <input
                                type="text"
                                value={nif}
                                onChange={(e) => setNif(e.target.value)}
                                className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none text-brand-black transition-all"
                                placeholder="NIF"
                                required
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-primary"><Mail size={18} /></div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none text-brand-black transition-all"
                                placeholder="Email"
                                required
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-primary"><MapPin size={18} /></div>
                            <input
                                type="text"
                                value={endereco}
                                onChange={(e) => setEndereco(e.target.value)}
                                className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none text-brand-black transition-all"
                                placeholder="Endereço"
                                required
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-primary"><Lock size={18} /></div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none text-brand-black transition-all"
                                placeholder="Senha"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white font-bold py-3.5 rounded-xl transition-all mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Criando conta...' : 'Criar conta'}
                        </button>
                    </form>

                    <p className="text-center text-gray-500 mt-6 pb-6">
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
