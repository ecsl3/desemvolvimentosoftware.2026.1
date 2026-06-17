// src/app/page.tsx
import Link from "next/link";
import Logo from "../components/Logo";
import CeuEstrelado from "../components/CeuEstrelado";

export default function LandingPage() {
  return (
    <div className="relative isolate min-h-screen bg-gray-950 text-white selection:bg-blue-500/30">

      {/* Céu estrelado cobrindo toda a página */}
      <CeuEstrelado />

      {/* --- NAVBAR SIMPLES --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10 text-blue-500" />
            <span className="font-display text-xl font-semibold">SonoZen AI</span>
          </div>

          <Link href="/login">
            <button className="text-sm font-medium text-gray-300 hover:text-white transition-colors border border-gray-800 hover:border-gray-600 px-5 py-2 rounded-lg bg-gray-900/50">
              Entrar
            </button>
          </Link>
          
        </div>
      </nav>

      {/* --- HERO SECTION (Principal) --- */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-sm font-medium mb-4">
            <span className="flex w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            A IA que entende o seu descanso
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200">
            Durma melhor. <br className="hidden md:block" />
            <span className="text-blue-500 italic">Acorde transformado.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Reinvente suas noites com o SonoZen AI: rotinas personalizadas baseadas nos seus hábitos para o descanso profundo e restaurador que seu corpo precisa.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/login" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg shadow-[0_0_25px_rgba(37,99,235,0.25)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                Comece agora
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </button>
            </Link>
          </div>

        </div>
      </main>

      {/* --- SEÇÃO DE BENEFÍCIOS (Simples e Direta) --- */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800 border-t-2 border-t-blue-500/60 transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-blue-500 mb-6"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="M12 11h4"></path><path d="M12 16h4"></path></svg>
              <h3 className="font-display text-xl font-semibold text-white mb-3">Diagnóstico Preciso</h3>
              <p className="text-gray-400 leading-relaxed">Descubra os sabotadores do seu sono através de uma análise inteligente da sua rotina diária e noturna.</p>
            </div>

            <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800 border-t-2 border-t-purple-500/60 transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-purple-500 mb-6"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path></svg>
              <h3 className="font-display text-xl font-semibold text-white mb-3">Rotina sob Medida</h3>
              <p className="text-gray-400 leading-relaxed">Receba um plano de higiene do sono personalizado pela nossa IA, adaptado ao seu relógio biológico.</p>
            </div>

            <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800 border-t-2 border-t-green-500/60 transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-green-500 mb-6"><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>
              <h3 className="font-display text-xl font-semibold text-white mb-3">Monitoramento Contínuo</h3>
              <p className="text-gray-400 leading-relaxed">Acompanhe sua evolução através de dashboards simples e mantenha a sequência de boas noites.</p>
            </div>

          </div>
        </div>
      </section>

      {/* --- FOOTER SIMPLES --- */}
      <footer className="py-8 text-center border-t border-gray-900 text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} SonoZen AI. Todos os direitos reservados.</p>
      </footer>

    </div>
  );
}