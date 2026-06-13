// src/app/dicas/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

// Importando os componentes modulares
import Sidebar from "../../components/Sidebar";
import MobileNav from "../../components/MobileNav";

// 1. Tipagem ajustada para aceitar IDs de texto (UUID da dica personalizada) ou número (Genérica)
interface Dica {
  id: string | number;
  categoria: string;
  titulo: string;
  descricao: string;
  icone_nome: string;
  isPersonalizada?: boolean; // Flag para mostrarmos uma tag especial na tela
}

const renderizarIcone = (nome: string) => {
  const propsBase = {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const n = nome?.toLowerCase() || "";

  if (n.includes("moon")) return <svg {...propsBase} className="w-5 h-5 text-blue-400"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>;
  if (n.includes("coffee") || n.includes("break")) return <svg {...propsBase} className="w-5 h-5 text-orange-400"><path d="M10 2v2"></path><path d="M14 2v2"></path><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"></path><path d="M6 2v2"></path></svg>;
  if (n.includes("thermo") || n.includes("cool")) return <svg {...propsBase} className="w-5 h-5 text-teal-400"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"></path></svg>;
  if (n.includes("brain") || n.includes("mind")) return <svg {...propsBase} className="w-5 h-5 text-pink-400"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path><path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path><path d="M19.938 10.5a4 4 0 0 1 .585.396"></path><path d="M6 18a4 4 0 0 1-1.967-.516"></path><path d="M19.967 17.484A4 4 0 0 1 18 18"></path></svg>;
  if (n.includes("breath") || n.includes("wind")) return <svg {...propsBase} className="w-5 h-5 text-green-400"><path d="M12.8 19.6A2 2 0 1 0 14 16H2"></path><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"></path><path d="M9.8 4.4A2 2 0 1 1 11 8H2"></path></svg>;
  if (n.includes("phone") || n.includes("screen")) return <svg {...propsBase} className="w-5 h-5 text-red-400"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect><line x1="12" x2="12.01" y1="18" y2="18"></line><line x1="5" x2="19" y1="6" y2="6"></line></svg>;
  if (n.includes("timer") || n.includes("clock")) return <svg {...propsBase} className="w-5 h-5 text-purple-400"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
  
  return <svg {...propsBase} className="w-5 h-5 text-yellow-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
};

export default function DicasPage() {
  const [dicas, setDicas] = useState<Dica[]>([]);
  const [loading, setLoading] = useState(true);
  const [dicaAberta, setDicaAberta] = useState<string | number | null>(null);
  const [temDiagnostico, setTemDiagnostico] = useState(false);

  useEffect(() => {
    async function buscarDicas() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Busca Dicas Genéricas selecionadas para o usuário
        const { data: genericasUser } = await supabase
          .from("usuario_dicas")
          .select(`dicas (id, categoria, titulo, descricao, icone_nome)`)
          .eq("usuario_id", user.id);

        // 2. Busca Dicas Personalizadas criadas pela IA para o usuário
        const { data: personalizadasUser } = await supabase
          .from("dicas_personalizadas")
          .select(`id, titulo, descricao, icone_nome`)
          .eq("usuario_id", user.id);

        let listaFinal: Dica[] = [];

        // Verifica se o usuário já tem um diagnóstico processado (tem dados em alguma das tabelas)
        if ((genericasUser && genericasUser.length > 0) || (personalizadasUser && personalizadasUser.length > 0)) {
          setTemDiagnostico(true);

          // Extrai e formata as genéricas
          const formatadasGen = (genericasUser || []).map((v: any) => ({
            ...v.dicas,
            isPersonalizada: false
          }));

          // Formata as personalizadas (injetando uma categoria genérica já que elas não têm)
          const formatadasPers = (personalizadasUser || []).map((p: any) => ({
            id: p.id,
            categoria: "Sob Medida para Você",
            titulo: p.titulo,
            descricao: p.descricao,
            icone_nome: p.icone_nome,
            isPersonalizada: true
          }));

          listaFinal = [...formatadasPers, ...formatadasGen];
          setDicas(listaFinal);

        } else {
          // 3. Fallback: Usuário não tem diagnóstico. Busca as dicas de ID 1 a 6 (Catálogo Padrão)
          setTemDiagnostico(false);
          const { data: dicasPadrao } = await supabase
            .from("dicas")
            .select("*")
            .in("id", [1, 2, 3, 4, 5, 6])
            .order("id", { ascending: true });

          if (dicasPadrao) {
            setDicas(dicasPadrao.map(d => ({ ...d, isPersonalizada: false })));
          }
        }
      } catch (err) {
        console.error("Falha inesperada:", err);
      } finally {
        setLoading(false);
      }
    }

    buscarDicas();
  }, []);

  const toggleDica = (id: string | number) => {
    setDicaAberta(dicaAberta === id ? null : id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-950 text-white font-sans">
        <Sidebar />
        <main className="flex-1 md:ml-64 pb-20 md:pb-0 flex items-center justify-center">
          <div className="text-blue-500 font-display font-semibold text-2xl md:text-3xl animate-pulse">
            Carregando SonoZen AI...
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-950 text-white font-sans">
      <Sidebar />

      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <div className="container py-8 md:py-12 max-w-3xl mx-auto px-6 space-y-8 animate-in fade-in duration-500">
          
          <div className="border-b border-gray-800 pb-6">
            <h2 className="text-3xl font-bold mb-2 text-white">Central de Dicas</h2>
            <p className="text-gray-400 text-sm">
              {temDiagnostico 
                ? "Conhecimentos selecionados e criados sob medida pela Inteligência Artificial baseados na sua rotina." 
                : "Práticas fundamentais de higiene do sono para começar a melhorar suas noites."}
            </p>
          </div>

          {!temDiagnostico && (
            <div className="bg-blue-900/20 border border-blue-900/50 p-4 rounded-xl flex items-center gap-4">
              <span className="text-2xl">🤖</span>
              <p className="text-sm text-blue-200">
                Você está vendo as dicas padrão. Faça seu diagnóstico para receber conteúdo exclusivo sobre os seus próprios hábitos.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {dicas.map((dica) => {
              const isOpen = dicaAberta === dica.id;

              return (
                <div key={dica.id} className={`rounded-xl bg-gray-900 border transition-all overflow-hidden ${dica.isPersonalizada ? 'border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'border-gray-800 hover:border-gray-700'}`}>
                  <button 
                    onClick={() => toggleDica(dica.id)}
                    className="w-full text-left p-5 flex items-center justify-between focus:outline-none focus:bg-gray-800/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 shadow-inner ${dica.isPersonalizada ? 'bg-purple-950/30 border-purple-500/50' : 'bg-gray-800 border-gray-700'}`}>
                        {renderizarIcone(dica.icone_nome)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-[10px] uppercase tracking-wider font-semibold ${dica.isPersonalizada ? 'text-purple-400' : 'text-blue-500'}`}>
                          {dica.categoria} {dica.isPersonalizada && "✨ IA"}
                        </span>
                        <h4 className="font-semibold text-base text-gray-200 mt-1">
                          {dica.titulo}
                        </h4>
                      </div>
                    </div>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                      className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180 text-blue-400" : "rotate-0"}`}
                    >
                      <path d="m6 9 6 6 6-6"></path>
                    </svg>
                  </button>
                  <div className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-48 opacity-100 pb-5" : "max-h-0 opacity-0"}`}>
                    <p className="text-gray-400 text-sm pl-20 pr-6 leading-relaxed">
                      {dica.descricao}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>
      <MobileNav />
    </div>
  );
}