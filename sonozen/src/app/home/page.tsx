// src/app/home/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Sidebar from "../../components/Sidebar";
import MobileNav from "../../components/MobileNav";
import CeuEstrelado from "../../components/CeuEstrelado";
import Logo from "../../components/Logo";

import { ArrowRight, ClipboardList, Sparkles, BarChart3, Lightbulb } from "lucide-react";

export default function PaginaPrincipal() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
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
    // 1. Verifica se o usuário tem um diagnóstico processado
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
            <section className="text-center py-10 md:py-16 relative isolate rounded-2xl overflow-hidden border border-gray-800/50 bg-gray-900/20">
              <CeuEstrelado />
              <div className="relative z-10 px-4">
                {temDiagnostico ? (
                  <Logo className="w-20 h-20 text-purple-500 mx-auto mb-6 block drop-shadow-[0_0_12px_rgba(192,132,252,0.5)]" />
                ) : (
                  <Logo className="w-20 h-20 text-blue-500 mx-auto mb-6 block drop-shadow-[0_0_12px_rgba(96,165,250,0.5)]" />
                )}
                
                <h1 className="text-4xl md:text-5xl font-display font-semibold mb-4 text-white">
                  {temDiagnostico ? (
                    <>Sua rotina está <span className="text-purple-500">pronta</span></>
                  ) : (
                    <>Durma melhor com <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">SonoZen AI</span></>
                  )}
                </h1>
                
                <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
                  {temDiagnostico 
                    ? "Nossa IA já traçou seu plano para esta noite. Siga sua linha do tempo e descanse."
                    : "Personalize sua rotina noturna e conquiste o sono profundo que seu corpo precisa."
                  }
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  {temDiagnostico ? (
                    <>
                      <Link href="/rotine">
                        <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 h-12 px-8 py-6 text-base font-medium rounded-xl text-white shadow-[0_0_25px_rgba(168,85,247,0.25)] transition-all hover:scale-105 active:scale-95">
                          Seguir minha rotina
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </button>
                      </Link>
                      <Link href="/diagnostic">
                        <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent border border-gray-700 hover:border-gray-500 hover:bg-gray-800/50 h-12 px-8 py-6 text-base font-medium rounded-xl text-gray-300 transition-all active:scale-95">
                          Revisar diagnóstico
                        </button>
                      </Link>
                    </>
                  ) : (
                    <Link href="/diagnostic">
                      <button className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 h-12 px-8 py-6 text-base font-medium rounded-xl text-white shadow-[0_0_25px_rgba(37,99,235,0.25)] transition-all hover:scale-105 active:scale-95">
                        Comece seu diagnóstico
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
                <div className="p-6 rounded-xl bg-gray-900 border border-gray-800 border-t-2 border-t-blue-500/60 transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] h-full">
                  <ClipboardList className="w-8 h-8 text-blue-500 mb-6" />
                  <h3 className="font-display font-semibold text-lg mb-1 text-gray-200">
                    {temDiagnostico ? "Seu Diagnóstico" : "Diagnóstico de Sono"}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {temDiagnostico ? "Entenda seu resultado em detalhes" : "Descubra o que sabota seu sono"}
                  </p>
                </div>
              </Link>

              <Link href="/rotine">
                <div className="p-6 rounded-xl bg-gray-900 border border-gray-800 border-t-2 border-t-purple-500/60 transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] h-full">
                  <Sparkles className="w-8 h-8 text-purple-500 mb-6" />
                  <h3 className="font-display font-semibold text-lg mb-1 text-gray-200">Rotina Personalizada</h3>
                  <p className="text-gray-500 text-sm">
                    {temDiagnostico ? "Coloque sua rotina em prática" : "Gere sua rotina noturna ideal"}
                  </p>
                </div>
              </Link>

              <Link href="/dashboard">
                <div className="p-6 rounded-xl bg-gray-900 border border-gray-800 border-t-2 border-t-emerald-500/60 transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] h-full">
                  <BarChart3 className="w-8 h-8 text-emerald-500 mb-6" />
                  <h3 className="font-display font-semibold text-lg mb-1 text-gray-200">Acompanhamento</h3>
                  <p className="text-gray-500 text-sm">Monitore seu progresso semana a semana</p>
                </div>
              </Link>

              <Link href="/dicas">
                <div className="p-6 rounded-xl bg-gray-900 border border-gray-800 border-t-2 border-t-orange-500/60 transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] h-full">
                  <Lightbulb className="w-8 h-8 text-orange-500 mb-6" />
                  <h3 className="font-display font-semibold text-lg mb-1 text-gray-200">Central de Dicas</h3>
                  <p className="text-gray-500 text-sm">
                    {temDiagnostico ? "Aplique as dicas no seu dia a dia" : "Aprenda técnicas de relaxamento"}
                  </p>
                </div>
              </Link>
            </section>
          </div>

        </div>
      </main>

      <MobileNav />

    </div>
  );
}