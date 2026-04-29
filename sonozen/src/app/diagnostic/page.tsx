// src/app/diagnostic/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

// Importando os componentes modulares
import Sidebar from "../../components/Sidebar";
import MobileNav from "../../components/MobileNav";
import DiagnosticForm from "../../components/DiagnosticForm";

export default function DiagnosticPage() {
  const [loading, setLoading] = useState(true);
  const [diagnosticoAtual, setDiagnosticoAtual] = useState<any>(null);
  const [isRefazendo, setIsRefazendo] = useState(false);

  // Função para buscar se o usuário já tem diagnóstico no banco
  const fetchDiagnostico = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data, error } = await supabase
        .from("diagnosticos_sono")
        .select("score_obtido, classificacao_ia, resumo_ia, atualizado_em, processado_ia")
        .eq("usuario_id", user.id)
        .order("criado_em", { ascending: false })
        .limit(1)
        .single();

      // Só consideramos como um diagnóstico válido se a IA já o processou
      if (data && data.processado_ia) {
        setDiagnosticoAtual(data);
      } else {
        setDiagnosticoAtual(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDiagnostico();
  }, []);

  // Formata a data para exibir bonito
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  // Se estiver carregando, mostra apenas um layout vazio
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-950 text-white font-sans">
        <Sidebar />
        <main className="flex-1 md:ml-64 flex items-center justify-center">
          <p className="text-gray-400">Carregando dados...</p>
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-950 text-white font-sans">
      <Sidebar />

      <main className="flex-1 md:ml-64 pb-20 md:pb-0 flex flex-col">
        <div className="container py-6 md:py-10 max-w-4xl flex-1 flex flex-col">
          
          {/* SE TIVER DIAGNÓSTICO E NÃO ESTIVER REFAZENDO, MOSTRA O RESUMO */}
          {diagnosticoAtual && !isRefazendo ? (
            <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Card Score */}
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -mr-10 -mt-10"></div>
                  <p className="text-gray-400 font-semibold mb-2 uppercase text-xs tracking-wider">Score de Sono</p>
                  <div className="text-6xl font-black text-blue-500 mb-2">{diagnosticoAtual.score_obtido}</div>
                  <p className="text-xs text-gray-500">Pontuação de 0 a 100</p>
                </div>

                {/* Card Classificação */}
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
                  <span className="text-xl">🤖</span> Análise do SonoZen
                </p>
                <p className="text-gray-300 leading-relaxed">
                  {diagnosticoAtual.resumo_ia}
                </p>
              </div>
            </div>
          ) : (
            // SE NÃO TIVER DIAGNÓSTICO OU CLICOU EM REFAZER, MOSTRA O FORMULÁRIO
            <DiagnosticForm 
              onSuccess={() => {
                // Quando o formulário termina, desativamos o modo refazer e recarregamos os dados
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