// src/app/home/page.tsx
"use client";

import { useState, useEffect } from "react";
import { perguntarParaIA } from "../actions";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Sidebar from "../../components/Sidebar";
import MobileNav from "../../components/MobileNav";
import AIChat from "../../components/AIChat";
import HistoryList from "../../components/HistoryList";

import { Moon, ArrowRight, ClipboardList, Sparkles, BarChart3, Lightbulb, CheckCircle2 } from "lucide-react";

interface HistoricoItem {
  id: string;
  pergunta: string;
  resposta: string;
  created_at: string;
}

export default function PaginaPrincipal() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [respostaAtual, setRespostaAtual] = useState("");
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [carregandoIA, setCarregandoIA] = useState(false);
  
  // Novo estado para controlar se a pessoa já fez o diagnóstico
  const [temDiagnostico, setTemDiagnostico] = useState(false);

  useEffect(() => {
    async function inicializar() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
        } else {
          setUsuario(user);
          carregarDados(user.id);
        }
      } catch (err) {
        console.error("Erro na inicialização:", err);
        setLoading(false);
      }
    }
    inicializar();
  }, [router]);

  async function carregarDados(userId: string) {
    // 1. Carrega o Histórico do Chat
    const { data: histData } = await supabase
      .from("historico")
      .select("*")
      .eq("usuario_id", userId)
      .order("created_at", { ascending: false });

    if (histData) setHistorico(histData);

    // 2. Verifica se o usuário tem um diagnóstico processado
    const { data: diagData } = await supabase
      .from("diagnosticos_sono")
      .select("id, processado_ia")
      .eq("usuario_id", userId)
      .order("criado_em", { ascending: false })
      .limit(1)
      .single();

    if (diagData && diagData.processado_ia) {
      setTemDiagnostico(true);
    } else {
      setTemDiagnostico(false);
    }

    setLoading(false);
  }

  async function enviarPergunta() {
    if (!input || !usuario) return;

    setCarregandoIA(true);
    try {
      const textoIA = await perguntarParaIA(input);
      setRespostaAtual(textoIA);

      const { error } = await supabase.from("historico").insert([
        { pergunta: input, resposta: textoIA, usuario_id: usuario.id },
      ]);

      if (error) throw error;

      setInput("");
      // Recarrega apenas o histórico após a pergunta
      const { data } = await supabase.from("historico").select("*").eq("usuario_id", usuario.id).order("created_at", { ascending: false });
      if (data) setHistorico(data);
      
    } catch (err) {
      console.error("Erro:", err);
      alert("Erro ao processar sua solicitação.");
    } finally {
      setCarregandoIA(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-950 text-white font-sans">
        <Sidebar />
        <main className="flex-1 md:ml-64 pb-20 md:pb-0 flex items-center justify-center">
          <p className="text-blue-500 font-display font-semibold text-2xl md:text-3xl animate-pulse">
            Carregando SonoZen AI...
          </p>
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-950 text-white font-sans">
      
      <Sidebar />

      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <div className="container py-6 md:py-10 max-w-4xl mx-auto px-6 space-y-12">
          
          <div className="space-y-12 animate-in fade-in duration-500">
            
            {/* HERO SECTION DINÂMICA */}
            <section className="text-center py-10 md:py-16 relative rounded-2xl overflow-hidden border border-gray-800/50 bg-gray-900/20">
              <img 
                src="/assets/hero-bg-C3FZrMYo.jpg" 
                alt="Banner Background" 
                className="absolute inset-0 w-full h-full object-cover opacity-20" 
              />
              <div className="relative z-10 px-4">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg ${temDiagnostico ? 'bg-purple-600 shadow-[0_0_30px_rgba(168,85,247,0.3)]' : 'bg-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.3)]'}`}>
                  {temDiagnostico ? <CheckCircle2 className="w-10 h-10 text-white" /> : <Moon className="w-10 h-10 text-white" />}
                </div>
                
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-white">
                  {temDiagnostico ? (
                    <>Sua rotina está <span className="text-purple-400 gradient-text">Pronta</span></>
                  ) : (
                    <>Durma melhor com <span className="text-blue-500 gradient-text">SonoZen AI</span></>
                  )}
                </h1>
                
                <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
                  {temDiagnostico 
                    ? "A Inteligência Artificial já traçou seu plano de ação para esta noite. Siga sua linha do tempo e descanse."
                    : "Transforme suas noites com rotinas personalizadas por IA. Descubra o poder da higiene do sono."
                  }
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  {temDiagnostico ? (
                    <>
                      <Link href="/rotine">
                        <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 h-12 px-8 py-6 text-base font-medium rounded-xl text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all active:scale-95">
                          Seguir Minha Rotina
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </button>
                      </Link>
                      <Link href="/diagnostic">
                        <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent border border-gray-700 hover:border-gray-500 hover:bg-gray-800/50 h-12 px-8 py-6 text-base font-medium rounded-xl text-gray-300 transition-all active:scale-95">
                          Revisar Diagnóstico
                        </button>
                      </Link>
                    </>
                  ) : (
                    <Link href="/diagnostic">
                      <button className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 h-12 px-8 py-6 text-base font-medium rounded-xl text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-95">
                        Começar Diagnóstico
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </section>

            {/* Grid de Funcionalidades */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/diagnostic">
                <div className="p-6 rounded-xl bg-gray-900 border border-gray-800 hover:border-blue-500/50 transition-colors shadow-lg group h-full">
                  <div className="w-12 h-12 rounded-lg bg-blue-900/30 flex items-center justify-center mb-4 group-hover:bg-blue-900/50 transition-colors">
                    <ClipboardList className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-1 text-gray-200">
                    {temDiagnostico ? "Meu Diagnóstico" : "Diagnóstico de Hábitos"}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {temDiagnostico ? "Veja sua pontuação e fatores de risco" : "Avalie sua rotina atual de sono"}
                  </p>
                </div>
              </Link>

              <Link href="/rotine">
                <div className="p-6 rounded-xl bg-gray-900 border border-gray-800 hover:border-purple-500/50 transition-colors shadow-lg group h-full">
                  <div className="w-12 h-12 rounded-lg bg-purple-900/30 flex items-center justify-center mb-4 group-hover:bg-purple-900/50 transition-colors">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-1 text-gray-200">Rotina Personalizada</h3>
                  <p className="text-gray-500 text-sm">
                    {temDiagnostico ? "Siga seu passo a passo" : "IA cria sua rotina ideal pré-sono"}
                  </p>
                </div>
              </Link>

              <Link href="/dashboard">
                <div className="p-6 rounded-xl bg-gray-900 border border-gray-800 hover:border-emerald-500/50 transition-colors shadow-lg group h-full">
                  <div className="w-12 h-12 rounded-lg bg-emerald-900/30 flex items-center justify-center mb-4 group-hover:bg-emerald-900/50 transition-colors">
                    <BarChart3 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-1 text-gray-200">Acompanhamento</h3>
                  <p className="text-gray-500 text-sm">Monitore sua evolução semanal</p>
                </div>
              </Link>

              <Link href="/dicas">
                <div className="p-6 rounded-xl bg-gray-900 border border-gray-800 hover:border-orange-500/50 transition-colors shadow-lg group h-full">
                  <div className="w-12 h-12 rounded-lg bg-orange-900/30 flex items-center justify-center mb-4 group-hover:bg-orange-900/50 transition-colors">
                    <Lightbulb className="w-6 h-6 text-orange-400" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-1 text-gray-200">Central de Dicas</h3>
                  <p className="text-gray-500 text-sm">
                    {temDiagnostico ? "Veja as dicas da IA" : "Aprenda técnicas de relaxamento"}
                  </p>
                </div>
              </Link>
            </section>
          </div>

          <hr className="border-gray-800/50" />

          {/* CHAT COM A IA */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Assistente Virtual</h2>
              <p className="text-gray-400 text-sm">Tire dúvidas rápidas sobre sono e relaxamento com a nossa IA.</p>
            </div>
            
            <AIChat 
              input={input} 
              setInput={setInput} 
              enviarPergunta={enviarPergunta} 
              carregandoIA={carregandoIA} 
              respostaAtual={respostaAtual} 
            />

            <HistoryList historico={historico} />
          </div>

        </div>
      </main>

      <MobileNav />

    </div>
  );
}