// src/app/diagnostic/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import MobileNav from "../../components/MobileNav";
import DiagnosticForm from "../../components/DiagnosticForm";

export default function DiagnosticPage() {
  const [loading, setLoading] = useState(true);
  const [diagnosticoAtual, setDiagnosticoAtual] = useState<any>(null);
  const [riscos, setRiscos] = useState<any[]>([]);
  const [isRefazendo, setIsRefazendo] = useState(false);

  // Função para buscar se o usuário já tem diagnóstico e os riscos associados
  const fetchDiagnostico = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Busca o diagnóstico principal
      const { data: diagData } = await supabase
        .from("diagnosticos_sono")
        .select("id, score_obtido, classificacao_ia, resumo_ia, atualizado_em, processado_ia")
        .eq("usuario_id", user.id)
        .order("criado_em", { ascending: false })
        .limit(1)
        .single();

      if (diagData && diagData.processado_ia) {
        setDiagnosticoAtual(diagData);

        // Se encontrou o diagnóstico, busca os fatores de risco atrelados a ele
        const { data: riscosData } = await supabase
          .from("fatores_risco_detectados")
          .select("*")
          .eq("usuario_id", user.id)
          .eq("diagnostico_id", diagData.id)
          .order("criado_em", { ascending: true });

        if (riscosData) {
          setRiscos(riscosData);
        }
      } else {
        setDiagnosticoAtual(null);
        setRiscos([]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDiagnostico();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-950 text-white font-sans">
        <Sidebar />
        <main className="flex-1 md:ml-64 flex items-center justify-center">
          <p className="text-gray-400 animate-pulse">Carregando dados...</p>
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-950 text-white font-sans">
      <Sidebar />

      <main className="flex-1 md:ml-64 pb-20 md:pb-0 flex flex-col">
        <div className="container py-6 md:py-10 max-w-4xl flex-1 flex flex-col px-6">
          
          {diagnosticoAtual && !isRefazendo ? (
            <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              
              {/* Cabeçalho */}
              <div className="flex justify-between items-end border-b border-gray-800 pb-4">
                <div>
                  <h2 className="text-3xl font-bold mb-1">Seu Diagnóstico</h2>
                  <p className="text-gray-400 text-sm">
                    Última atualização: {diagnosticoAtual.atualizado_em ? formatDate(diagnosticoAtual.atualizado_em) : "Recente"}
                  </p>
                </div>
                <button 
                  onClick={() => setIsRefazendo(true)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition font-medium border border-gray-700"
                >
                  Refazer Diagnóstico
                </button>
              </div>

              {/* Cards de Score e Classificação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -mr-10 -mt-10"></div>
                  <p className="text-gray-400 font-semibold mb-2 uppercase text-xs tracking-wider">Score de Sono</p>
                  <div className="text-6xl font-black text-blue-500 mb-2">{diagnosticoAtual.score_obtido}</div>
                  <p className="text-xs text-gray-500">Pontuação de 0 a 100</p>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -mr-10 -mt-10"></div>
                  <p className="text-gray-400 font-semibold mb-2 uppercase text-xs tracking-wider">Classificação IA</p>
                  <h3 className="text-2xl font-bold text-white leading-tight">
                    {diagnosticoAtual.classificacao_ia}
                  </h3>
                </div>
              </div>

              {/* Card Resumo */}
              <div className="bg-gradient-to-br from-blue-900/40 to-gray-900 border border-blue-900/50 p-6 rounded-2xl shadow-lg">
                <p className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                  <span className="text-xl">🤖</span> Análise do SonoZen AI
                </p>
                <p className="text-gray-300 leading-relaxed">
                  {diagnosticoAtual.resumo_ia}
                </p>
              </div>

              {/* Fatores de Risco */}
              {riscos.length > 0 && (
                <div className="pt-4">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                    <span className="text-red-400">⚠️</span> Sabotadores do Sono
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {riscos.map((risco) => (
                      <div key={risco.id} className="bg-red-950/20 border border-red-900/50 p-5 rounded-2xl flex flex-col justify-between">
                        <div>
                          <h4 className="text-red-400 font-semibold text-lg mb-2">{risco.titulo_risco}</h4>
                          <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                            {risco.texto_impacto}
                          </p>
                        </div>
                        <div className="bg-red-900/20 p-3 rounded-xl border border-red-800/30 mt-auto">
                          <span className="text-[10px] font-bold text-red-300 uppercase tracking-wider block mb-1">
                            Ação Recomendada: {risco.titulo_acao}
                          </span>
                          <p className="text-gray-400 text-xs">
                            {risco.texto_acao}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <DiagnosticForm 
              onSuccess={() => {
                setIsRefazendo(false);
                fetchDiagnostico();
              }} 
            />
          )}

        </div>
      </main>
      <MobileNav />
    </div>
  );
}