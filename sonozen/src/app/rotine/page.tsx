// src/app/rotine/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

// Importando os componentes modulares
import Sidebar from "../../components/Sidebar";
import MobileNav from "../../components/MobileNav";
import Logo from "../../components/Logo";

// Importando ícones dinâmicos do Lucide
import {
  Clock, Moon, Bed, Bath, BookOpen, Utensils,
  Smartphone, Brain, Coffee, Calendar, RotateCcw, ArrowRight
} from "lucide-react";

export default function RoutinePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rotina, setRotina] = useState<any[]>([]);

  useEffect(() => {
    async function fetchRotina() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Busca a rotina ordenada cronologicamente
        const { data, error } = await supabase
          .from("rotinas_pre_sono")
          .select("*")
          .eq("usuario_id", user.id)
          .order("ordem", { ascending: true });

        if (data && data.length > 0) {
          setRotina(data);
        }
      }
      setLoading(false);
    }

    fetchRotina();
  }, []);

  // Mapeador de Ícones: A IA envia strings, nós transformamos em ícones visuais
  const getIcon = (iconName: string) => {
    const name = iconName?.toLowerCase() || "";
    if (name.includes("bed") || name.includes("sleep")) return <Bed className="w-5 h-5" />;
    if (name.includes("moon")) return <Moon className="w-5 h-5" />;
    if (name.includes("bath") || name.includes("shower")) return <Bath className="w-5 h-5" />;
    if (name.includes("book") || name.includes("school") || name.includes("study")) return <BookOpen className="w-5 h-5" />;
    if (name.includes("dinner") || name.includes("food")) return <Utensils className="w-5 h-5" />;
    if (name.includes("phone") || name.includes("screen")) return <Smartphone className="w-5 h-5" />;
    if (name.includes("meditation") || name.includes("breath") || name.includes("brain")) return <Brain className="w-5 h-5" />;
    if (name.includes("coffee")) return <Coffee className="w-5 h-5" />;
    if (name.includes("calendar") || name.includes("plan")) return <Calendar className="w-5 h-5" />;
    
    // Fallback genérico
    return <Clock className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-950 text-white font-sans">
        <Sidebar />
        <main className="flex-1 md:ml-64 flex items-center justify-center">
          <p className="text-blue-500 font-display font-semibold text-2xl md:text-3xl animate-pulse">Carregando SonoZen AI...</p>
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-950 text-white font-sans">
      <Sidebar />

      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <div className="container py-8 max-w-3xl mx-auto px-6">
          
          {rotina.length > 0 ? (
            // ESTADO COM DADOS: Renderiza a Linha do Tempo (Timeline)
            <div className="space-y-8 animate-in fade-in duration-500">
              
              <div className="flex items-start justify-between border-b border-gray-800 pb-4">
                <div>
                  <h2 className="font-display text-3xl font-semibold mb-1">Sua Rotina Pré-Sono</h2>
                  <p className="text-gray-400 text-sm">Seu plano guiado para desacelerar antes de dormir.</p>
                </div>
                <button 
                  onClick={() => router.push("/diagnostic")}
                  className="px-4 py-2 bg-gray-900 border border-gray-700 hover:border-blue-500 text-gray-300 hover:text-blue-400 rounded-xl text-sm transition flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Refazer
                </button>
              </div>

              {/* Início da Linha do Tempo */}
              <div className="relative mt-8">
                {/* Linha vertical central/lateral */}
                <div className="absolute left-[1.4rem] md:left-[1.9rem] top-2 bottom-2 w-px bg-gray-800"></div>

                <div className="space-y-6">
                  {rotina.map((item, index) => {
                    const isLast = index === rotina.length - 1;

                    return (
                      <div key={item.id} className="relative flex gap-4 md:gap-6 group">
                        
                        {/* Ícone Redondo Flutuante */}
                        <div className={`relative z-10 w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300
                          ${isLast 
                            ? "bg-blue-600 border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.4)] text-white" 
                            : "bg-gray-900 border-gray-700 text-blue-400 group-hover:border-blue-500 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                          }`}
                        >
                          {getIcon(item.icone_nome)}
                        </div>

                        {/* Card de Conteúdo */}
                        <div className="flex-1 p-5 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-colors shadow-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-mono text-blue-400 font-bold bg-blue-950/50 px-2 py-0.5 rounded">
                              {item.horario_inicio}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                              • {item.duracao_minutos} min
                            </span>
                          </div>
                          
                          <h4 className="text-lg font-semibold text-gray-100 mb-1">
                            {item.atividade}
                          </h4>
                          <p className="text-gray-400 text-sm mb-3">
                            {item.descricao}
                          </p>
                          
                          {/* O "Por quê" em destaque suave */}
                          <div className="bg-gray-950/50 p-3 rounded-xl border border-gray-800/50">
                            <p className="text-xs text-gray-500 italic">
                              <span className="font-semibold text-gray-400 not-italic">Por que fazer isso?</span> {item.por_que}
                            </p>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            // ESTADO VAZIO (Nenhuma rotina encontrada)
            <div className="flex flex-col items-center justify-center text-center py-20 px-4 animate-in zoom-in-95 duration-500">
              <Logo className="w-24 h-24 text-blue-500 mb-6 drop-shadow-[0_0_16px_rgba(96,165,250,0.5)]" />
              <h2 className="font-display text-3xl font-semibold mb-3 text-white">Comece sua rotina pré-sono</h2>
              <p className="text-gray-400 max-w-md mb-8">
                Sua rotina ainda não foi criada. Faça o diagnóstico e receba um plano pré-sono sob medida da nossa IA.
              </p>
              <button 
                onClick={() => router.push("/diagnostic")}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white transition-all shadow-[0_0_25px_rgba(37,99,235,0.25)] hover:scale-105 active:scale-95"
              >
                Criar minha rotina
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}