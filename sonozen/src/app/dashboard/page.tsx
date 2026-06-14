"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { Bell, Activity, Lightbulb, ChevronRight, Brain } from "lucide-react";
import Link from "next/link";

import Sidebar from "../../components/Sidebar";
import MobileNav from "../../components/MobileNav";

interface DashboardData {
  nome: string;
  score: number | null;
  resumo_ia: string | null;
  lembretesAtivos: number;
  proximoLembrete: any | null;
  dicas: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    nome: "",
    score: null,
    resumo_ia: null,
    lembretesAtivos: 0,
    proximoLembrete: null,
    dicas: []
  });

  useEffect(() => {
    async function carregarDashboard() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        // 1. Busca Perfil
        const { data: perfil } = await supabase.from("perfis").select("nome").eq("id", user.id).single();

        // 2. Busca Último Diagnóstico
        const { data: diag } = await supabase
          .from("diagnosticos_sono")
          .select("score_obtido, resumo_ia")
          .eq("usuario_id", user.id)
          .eq("processado_ia", true)
          .order("criado_em", { ascending: false })
          .limit(1)
          .single();

        // 3. Busca Lembretes
        const { data: lembretes } = await supabase
          .from("lembretes")
          .select("*")
          .eq("usuario_id", user.id)
          .eq("ativo", true)
          .order("horario", { ascending: true });

        // 4. Busca algumas Dicas Recomendadas
        const { data: usuarioDicas } = await supabase
          .from("usuario_dicas")
          .select("dicas(titulo, descricao)")
          .eq("usuario_id", user.id)
          .limit(2);

        // Processa o próximo lembrete (lógica simples baseada na hora atual - fallback p/ o primeiro)
        let prox = null;
        if (lembretes && lembretes.length > 0) {
          const agora = new Date();
          const horaAtualStr = agora.getHours().toString().padStart(2, '0') + ":" + agora.getMinutes().toString().padStart(2, '0');
          prox = lembretes.find(l => l.horario >= horaAtualStr) || lembretes[0];
        }

        setData({
          nome: perfil?.nome || "Viajante do Sono",
          score: diag?.score_obtido || null,
          resumo_ia: diag?.resumo_ia || null,
          lembretesAtivos: lembretes?.length || 0,
          proximoLembrete: prox,
          dicas: usuarioDicas?.map((ud: any) => ud.dicas) || []
        });

        setLoading(false);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
        setLoading(false);
      }
    }
    carregarDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-950 text-white font-sans">
        <Sidebar />
        <main className="flex-1 md:ml-64 flex items-center justify-center">
          <p className="text-blue-500 font-display font-semibold text-2xl animate-pulse">
            Carregando Dashboard...
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
        <div className="container py-8 md:py-12 max-w-5xl mx-auto px-6 space-y-8 animate-in fade-in duration-500">
          
          {/* Header */}
          <div className="border-b border-gray-800 pb-6">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
              Olá, <span className="text-blue-400">{data.nome}</span>!
            </h1>
            <p className="text-gray-400 mt-2 text-lg">Aqui está o resumo da sua jornada do sono hoje.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Score de Sono */}
            <Link href="/diagnostic" className="bg-gradient-to-br from-blue-900/30 to-gray-900 border border-blue-900/50 p-6 rounded-2xl shadow-lg hover:border-blue-500/50 transition group flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-8 -mt-8"></div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-300 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" /> Score Atual
                  </h3>
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition" />
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-black text-white">
                    {data.score !== null ? data.score : "--"}
                  </span>
                  <span className="text-sm text-gray-500 mb-2">/ 100</span>
                </div>
              </div>
              {data.resumo_ia && (
                <p className="text-xs text-blue-300/80 mt-4 line-clamp-2 leading-relaxed">
                  <Brain className="w-3 h-3 inline mr-1" /> {data.resumo_ia}
                </p>
              )}
            </Link>

            {/* Lembretes */}
            <Link href="/reminders" className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg hover:border-gray-700 transition group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-300 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-yellow-500" /> Lembretes Ativos
                  </h3>
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition" />
                </div>
                <div className="text-4xl font-bold text-white mb-1">{data.lembretesAtivos}</div>
                <p className="text-xs text-gray-500">Alertas programados para hoje</p>
              </div>
              
              {data.proximoLembrete && (
                <div className="mt-4 bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
                  <p className="text-[10px] uppercase text-gray-500 font-bold mb-1 tracking-wider">Próximo</p>
                  <p className="text-sm text-white font-medium flex justify-between">
                    <span>{data.proximoLembrete.titulo}</span>
                    <span className="text-yellow-400">{data.proximoLembrete.horario.substring(0,5)}</span>
                  </p>
                </div>
              )}
            </Link>

            {/* Dicas em Destaque */}
            <Link href="/tips" className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg hover:border-gray-700 transition group flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-300 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-purple-500" /> Dicas Rápidas
                </h3>
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition" />
              </div>
              
              <div className="flex-1 flex flex-col gap-3 justify-center">
                {data.dicas.length > 0 ? (
                  data.dicas.map((d, i) => (
                    <div key={i} className="bg-gray-950 p-3 rounded-xl border border-gray-800/80">
                      <p className="text-sm font-medium text-purple-300 line-clamp-1">{d.titulo}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{d.descricao}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-gray-500">
                    Faça um diagnóstico para receber dicas personalizadas.
                  </div>
                )}
              </div>
            </Link>

          </div>

        </div>
      </main>

      <MobileNav />
    </div>
  );
}