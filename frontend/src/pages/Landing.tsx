import { useState, useEffect } from 'react';
import {
    Droplets,
    Menu,
    X,
    Sprout,
    Frown,
    TrendingDown,
    BadgeDollarSign,
    BrainCircuit,
    Settings,
    BarChart3,
    ArrowRight,
    CheckCircle2
} from 'lucide-react';

interface LandingProps {
    onNavigate: (view: 'landing' | 'login' | 'register') => void;
}

export function Landing({ onNavigate }: LandingProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Handle navbar styling on scroll
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-brand-white font-sans text-brand-black flex flex-col selection:bg-brand-accent selection:text-white">
            {/* Navigation */}
            <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/70 backdrop-blur-xl shadow-md border-b border-gray-200 py-2' : 'bg-brand-black/20 backdrop-blur-md border-b border-white/10 py-4'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <div className="flex items-center gap-2 cursor-pointer group">
                            <div className={`p-2 rounded-xl transition-colors ${scrolled ? 'bg-brand-primary text-white' : 'bg-white/10 backdrop-blur-md text-white'}`}>
                                <Droplets size={26} strokeWidth={2.5} />
                            </div>
                            <span className={`text-2xl font-bold tracking-tight transition-colors ${scrolled ? 'text-brand-primary' : 'text-white drop-shadow-md'}`}>HydroSync</span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#problematica" className={`font-medium transition-colors hover:text-brand-accent ${scrolled ? 'text-brand-secondary' : 'text-white/90 drop-shadow-sm'}`}>O Problema</a>
                            <a href="#solucao" className={`font-medium transition-colors hover:text-brand-accent ${scrolled ? 'text-brand-secondary' : 'text-white/90 drop-shadow-sm'}`}>A Solução</a>
                            <a href="#diferenciais" className={`font-medium transition-colors hover:text-brand-accent ${scrolled ? 'text-brand-secondary' : 'text-white/90 drop-shadow-sm'}`}>Tecnologia</a>

                            <div className="flex items-center gap-4 ml-6 border-l border-gray-300/30 pl-6">
                                <button onClick={() => onNavigate('login')} className={`font-semibold transition-colors hover:text-brand-accent ${scrolled ? 'text-brand-primary' : 'text-white drop-shadow-sm'}`}>
                                    Login
                                </button>
                                <button onClick={() => onNavigate('register')} className={`px-6 py-2.5 rounded-full font-semibold transition-all shadow-md hover:shadow-lg ${scrolled ? 'bg-brand-primary text-white hover:bg-brand-secondary shadow-brand-primary/20' : 'bg-brand-accent text-white hover:bg-white hover:text-brand-accent shadow-black/10'}`}>
                                    Cadastrar
                                </button>
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className={`p-2 transition-colors ${scrolled ? 'text-brand-primary' : 'text-white drop-shadow-sm'}`}
                            >
                                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Dropdown */}
                <div className={`md:hidden absolute w-full transition-all duration-300 origin-top ${isMobileMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'}`}>
                    <div className="bg-brand-white border-t border-gray-100 shadow-xl mt-2">
                        <div className="px-4 py-6 space-y-4">
                            <a href="#problematica" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-lg font-medium text-brand-secondary hover:text-brand-primary hover:bg-blue-50/50 rounded-xl transition-colors">O Problema</a>
                            <a href="#solucao" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-lg font-medium text-brand-secondary hover:text-brand-primary hover:bg-blue-50/50 rounded-xl transition-colors">A Solução</a>
                            <a href="#diferenciais" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-lg font-medium text-brand-secondary hover:text-brand-primary hover:bg-blue-50/50 rounded-xl transition-colors">Tecnologia</a>
                            <div className="pt-6 mt-4 border-t border-gray-100 flex flex-col gap-3">
                                <button onClick={() => { setIsMobileMenuOpen(false); onNavigate('login'); }} className="w-full text-brand-primary border-2 border-brand-primary/20 font-bold py-3.5 rounded-xl hover:bg-brand-primary/5 transition-colors">
                                    Acessar Conta
                                </button>
                                <button onClick={() => { setIsMobileMenuOpen(false); onNavigate('register'); }} className="w-full bg-brand-primary text-brand-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-primary/20">
                                    Criar Conta Grátis
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow">

                {/* Improved Hero Section with Background Image */}
                <section className="relative min-h-[90vh] flex items-center pt-20 pb-16 overflow-hidden">
                    {/* Background Image Setup */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/hero-bg.png"
                            alt="Plantação agrícola angolana ao amanhecer"
                            className="w-full h-full object-cover object-center scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
                        />
                        {/* Gradient Overlay for Text Readability - blending deeply to brand-dark/black */}
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-black/90 via-brand-dark/80 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-black/50 via-transparent to-brand-primary/30"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full mt-10">
                        <div className="grid lg:grid-cols-12 gap-12 items-center">

                            {/* Hero Text Content */}
                            <div className="lg:col-span-7 text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-accent/20 border border-brand-accent/30 text-brand-accent font-semibold text-sm mb-8 backdrop-blur-md shadow-lg">
                                    <Sprout size={16} /> Inovação para o agricultor Angolano
                                </div>

                                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-brand-white tracking-tight leading-[1.1] mb-6 drop-shadow-xl">
                                    A água certa,<br />
                                    no <span className="text-brand-accent">momento exato.</span>
                                </h1>

                                <p className="text-lg sm:text-xl text-gray-200 mb-10 leading-relaxed font-light max-w-2xl mx-auto lg:mx-0 drop-shadow-md">
                                    A irrigação não precisa ser um jogo de adivinhação. Transforme sua plantação com um sistema inteligente, acessível e baseado em dados que acaba com o desperdício e aumenta sua produtividade.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                    <button onClick={() => onNavigate('register')} className="bg-brand-accent hover:bg-white text-brand-black px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(41,167,217,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] flex items-center justify-center gap-2 group">
                                        Descobrir como funciona
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <button onClick={() => onNavigate('login')} className="bg-white/10 text-white border border-white/30 hover:border-white hover:bg-white/20 px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 backdrop-blur-md">
                                        Ver Protótipo Interativo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Bottom section gradient removed as requested */}
                </section >

                {/* Storytelling: O Problema */}
                < section id="problematica" className="py-24 bg-brand-white relative" >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col lg:flex-row gap-16 items-center">

                            {/* Text Focus */}
                            <div className="lg:w-1/3">
                                <h2 className="text-brand-secondary font-bold tracking-wide uppercase text-sm mb-3">A dura realidade</h2>
                                <h3 className="text-3xl md:text-5xl font-extrabold text-brand-black mb-6 leading-tight">O jeito antigo <br />está secando <br /><span className="text-brand-primary">seus lucros.</span></h3>
                                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                    Em Angola, o uso de horários fixos para irrigar ignora completamente o que o solo realmente precisa. Essa falta de sincronia gera um ciclo perigoso de perdas invisíveis diariamente.
                                </p>
                                <div className="h-1 w-20 bg-brand-accent rounded-full"></div>
                            </div>

                            {/* Cards Grid */}
                            <div className="lg:w-2/3 grid sm:grid-cols-2 gap-6">
                                {[
                                    { icon: Droplets, title: "Desperdício Hídrico", desc: "A água vaza ou evapora porque a terra já estava saturada.", color: "text-brand-accent", bg: "bg-brand-accent/10" },
                                    { icon: BadgeDollarSign, title: "Custos Fora de Controle", desc: "Bombas ligadas sem necessidade gastam combustível e energia à toa.", color: "text-red-500", bg: "bg-red-50" },
                                    { icon: Frown, title: "Stress na Planta", desc: "Raízes afogadas ou secas afetam o enraizamento e a saúde da cultura.", color: "text-orange-500", bg: "bg-orange-50" },
                                    { icon: TrendingDown, title: "Colheita Fraca", desc: "Menos produtividade por hectare devido ao manejo hídrico incorreto.", color: "text-brand-primary", bg: "bg-brand-primary/10" },
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
                                        <div className={`mb-6 p-4 rounded-2xl w-16 h-16 flex items-center justify-center ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                                            <item.icon size={32} strokeWidth={2} />
                                        </div>
                                        <h4 className="text-xl font-bold text-brand-black mb-3">{item.title}</h4>
                                        <p className="text-gray-500 leading-relaxed font-light">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section >

                {/* Storytelling: A Transição (Bridging the gap) */}
                < section className="py-20 bg-brand-primary relative overflow-hidden" >
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
                    <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                        <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6">A tecnologia não precisa ser um luxo.</h3>
                        <p className="text-xl text-brand-accent font-light leading-relaxed">
                            O desafio sempre foi o preço. Sistemas importados são complexos e caros. Nós desenvolvemos a inteligência necessária com foco estrito na realidade do agricultor angolano. Baixo custo, alto impacto.
                        </p>
                    </div>
                </section >

                {/* Storytelling: A Solução (MVP View) */}
                < section id="solucao" className="py-32 bg-brand-black text-brand-white relative overflow-hidden" >
                    {/* Decorative glows */}
                    < div className="absolute top-0 right-0 -mr-40 w-96 h-96 bg-brand-dark rounded-full blur-[100px] opacity-60 pointer-events-none" ></div >
                    <div className="absolute bottom-0 left-0 -ml-40 w-96 h-96 bg-brand-primary rounded-full blur-[100px] opacity-40 pointer-events-none"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <h2 className="text-brand-accent font-bold tracking-widest uppercase text-sm mb-4 letter-spacing-2">O Sistema HydroSync</h2>
                            <h3 className="text-4xl md:text-5xl font-extrabold mb-6">Como o nosso cérebro <br />digital funciona.</h3>
                            <p className="text-xl text-gray-400 font-light">
                                Esqueça o relógio. O HydroSync lê o solo, analisa o clima e entrega exatamente o que sua cultura precisa. Sem faltar, sem sobrar.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-12 gap-12 items-center">

                            {/* Features List */}
                            <div className="lg:col-span-5 space-y-8">
                                {[
                                    { title: "Sensor de Umidade Físico", desc: "Acompanhamento em tempo real das condições exatas da terra, diretamente na raiz." },
                                    { title: "Ativação Inteligente", desc: "O sistema liga e desliga as bombas sozinho, garantindo a janela perfeita de irrigação." },
                                    { title: "Dashboard Integrado", desc: "Na palma da mão, acompanhe a economia estimada e o status de cada setor da fazenda." },
                                    { title: "Custo-Benefício", desc: "Arquitetura enxuta desenhada para retorno rápido do investimento através da economia gerada." }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-start">
                                        <div className="mt-1 bg-brand-dark/50 p-2 rounded-full border border-brand-accent/30 text-brand-accent shrink-0">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                                            <p className="text-gray-400 leading-relaxed font-light">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Visual Demo of Solução */}
                            <div className="lg:col-span-7 relative">
                                <div className="bg-gradient-to-br from-brand-secondary/20 to-brand-primary/10 border border-brand-primary/20 p-8 rounded-[2rem] backdrop-blur-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-accent to-transparent"></div>

                                    <div className="flex justify-between items-center mb-8">
                                        <h4 className="text-2xl font-bold text-white flex items-center gap-3">
                                            <BarChart3 className="text-brand-accent" /> Painel de Controle
                                        </h4>
                                        <span className="bg-brand-accent/20 text-brand-accent px-3 py-1 rounded-full text-xs font-bold border border-brand-accent/30">ONLINE</span>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Mock row 1 */}
                                        <div className="bg-brand-black/60 p-5 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 border border-white/5 hover:border-brand-accent/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-green-500/10 p-3 rounded-xl text-green-400"><Droplets /></div>
                                                <div>
                                                    <p className="font-bold text-lg">Setor 1: Milho</p>
                                                    <p className="text-sm text-gray-400">Umidade: 65% (Ideal)</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-green-400 font-bold">Modo de Espera</p>
                                                <p className="text-xs text-gray-500">Próxima checagem em 15m</p>
                                            </div>
                                        </div>

                                        {/* Mock row 2 */}
                                        <div className="bg-brand-primary/20 p-5 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 border border-brand-primary/50 relative overflow-hidden">
                                            <div className="absolute left-0 top-0 w-1 h-full bg-brand-accent"></div>
                                            <div className="flex items-center gap-4">
                                                <div className="bg-brand-accent/20 p-3 rounded-xl text-brand-accent animate-pulse"><Droplets /></div>
                                                <div>
                                                    <p className="font-bold text-lg text-white">Setor 2: Tomateiro</p>
                                                    <p className="text-sm text-brand-accent">Umidade: 30% (Crítico)</p>
                                                </div>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <p className="text-white font-bold inline-flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-brand-accent animate-ping block"></span> Irrigando Agora
                                                </p>
                                                <p className="text-xs text-brand-accent">IA prevê 25min necessários</p>
                                            </div>
                                        </div>

                                        {/* Savings Bar */}
                                        <div className="mt-8 pt-8 border-t border-white/10">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-gray-400 uppercase text-xs font-bold">Economia de Água Mensal</span>
                                                <span className="text-2xl font-bold text-brand-accent">14.500 Litros</span>
                                            </div>
                                            <div className="w-full h-3 bg-brand-black rounded-full overflow-hidden border border-white/10">
                                                <div className="h-full bg-gradient-to-r from-brand-primary to-brand-accent w-[65%] rounded-full relative">
                                                    <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress_1s_linear_infinite]"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section >

                {/* Diferenciais Section */}
                < section id="diferenciais" className="py-24 bg-gray-50" >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-brand-primary font-bold tracking-wide uppercase text-sm mb-2">O nosso segredo</h2>
                            <h3 className="text-3xl md:text-5xl font-extrabold text-brand-black">Simples na superfície,<br />Poderoso no fundo.</h3>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { icon: Settings, title: "Parametrização por Cultura", desc: "O sistema entende que milho não é tomate. Ajuste os parâmetros (MVP focado em 1 cultura) para base agronômica perfeita." },
                                { icon: BrainCircuit, title: "Inteligência Artificial Simples", desc: "Um modelo de ML leve que não precisa de supercomputadores. Ele aprende os padrões locais e prevê sua necessidade." },
                                { icon: Sprout, title: "Feito para Angola", desc: "Hardware adaptado, software focado nas dores reais das cooperativas e pequenos agricultores do país." },
                            ].map((item, idx) => (
                                <div key={idx} className="bg-brand-white p-10 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:border-brand-accent/40 transition-all duration-300 group">
                                    <div className="w-16 h-16 bg-brand-white shadow-md border border-gray-50 rounded-2xl flex items-center justify-center text-brand-primary mb-8 group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all">
                                        <item.icon size={30} />
                                    </div>
                                    <h4 className="text-2xl font-bold text-brand-black mb-4">{item.title}</h4>
                                    <p className="text-gray-500 leading-relaxed font-light text-lg">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section >

                {/* Final CTA */}
                < section className="py-24 bg-brand-primary relative overflow-hidden" >
                    <div className="absolute inset-0 bg-brand-dark opacity-50 mix-blend-multiply"></div>
                    <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-8 drop-shadow-lg">Pronto para modernizar sua plantação?</h2>
                        <p className="text-xl text-brand-white/80 mb-10 font-light max-w-2xl mx-auto">Junte-se ao movimento de agricultura inteligente em Angola. Economize água, reduza custos e veja a produtividade decolar.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button onClick={() => onNavigate('register')} className="bg-brand-accent hover:bg-white text-brand-black px-10 py-5 rounded-full font-bold text-lg transition-all shadow-[0_0_20px_rgba(41,167,217,0.5)]">
                                Criar Minha Conta Grátis
                            </button>
                            <button className="bg-transparent border border-white/50 text-white hover:bg-white/10 px-10 py-5 rounded-full font-bold text-lg transition-all">
                                Falar com Vendas
                            </button>
                        </div>
                    </div>
                </section >

            </main >

            {/* Footer */}
            < footer className="bg-brand-black text-white/50 pt-20 pb-10" >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-12 gap-12 mb-16">
                        <div className="md:col-span-5">
                            <div className="flex items-center gap-2 mb-6 opacity-80 hover:opacity-100 transition-opacity">
                                <Droplets size={28} className="text-brand-accent" strokeWidth={2.5} />
                                <span className="text-2xl font-bold text-brand-white tracking-tight">HydroSync</span>
                            </div>
                            <p className="text-lg leading-relaxed max-w-sm mb-6 font-light">
                                A água certa, no momento exato. Nascido para revolucionar o agronegócio de pequeno e médio porte em Angola.
                            </p>
                        </div>

                        <div className="md:col-span-3 md:col-start-7">
                            <h5 className="text-brand-white font-bold mb-6 text-lg">Solução</h5>
                            <ul className="space-y-4 font-light">
                                <li><a href="#" className="hover:text-brand-accent transition-colors">Para Cooperativas</a></li>
                                <li><a href="#" className="hover:text-brand-accent transition-colors">Para Governo (Projetos)</a></li>
                                <li><a href="#solucao" className="hover:text-brand-accent transition-colors">Como Funciona o hardware</a></li>
                                <li><a href="#diferenciais" className="hover:text-brand-accent transition-colors">Tecnologia ML</a></li>
                            </ul>
                        </div>

                        <div className="md:col-span-2 text-right">
                            <h5 className="text-brand-white font-bold mb-6 text-lg">Plataforma</h5>
                            <ul className="space-y-4 font-light flex flex-col items-end">
                                <li><button onClick={() => onNavigate('login')} className="text-brand-accent hover:text-white transition-colors border border-brand-accent/30 rounded-full px-4 py-1">Login Seguro</button></li>
                                <li><button onClick={() => onNavigate('register')} className="hover:text-brand-accent transition-colors">Cadastro Prévio</button></li>
                                <li><a href="#" className="hover:text-brand-accent transition-colors">Contato Comercial</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-light">
                        <p>© {new Date().getFullYear()} HydroSync Angola. Todos os direitos reservados.</p>
                        <div className="flex items-center gap-6">
                            <a href="#" className="hover:text-brand-white transition-colors">Termos de Política e Privacidade</a>
                        </div>
                    </div>
                </div>
            </footer >
        </div >
    );
}
