"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Brain, Calendar, Clock, Bell, RefreshCw } from "lucide-react";

import Sidebar from "../../components/Sidebar";
import MobileNav from "../../components/MobileNav";

interface Lembrete {
  id: string;
  titulo: string;
  horario: string;
  ativo: boolean;
}

export default function LembretesPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  
  // Tab control
  const [activeTab, setActiveTab] = useState<"manual" | "ia">("manual");
  
  // Forms state
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novoHorario, setNovoHorario] = useState("");
  const [promptIA, setPromptIA] = useState("");
  const [carregandoIA, setCarregandoIA] = useState(false);
  const [salvandoManual, setSalvandoManual] = useState(false);

  useEffect(() => {
    async function inicializar() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        } 
        setUsuario(user);
        await buscarLembretes(user.id);
      } catch (err) {
        console.error("Erro na inicialização:", err);
        setLoading(false);
      }
    }
    inicializar();
  }, [router]);

  async function buscarLembretes(userId: string) {
    setLoading(true);
    const { data, error } = await supabase
      .from("lembretes")
      .select("*")
      .eq("usuario_id", userId)
      .order("horario", { ascending: true });

    if (!error && data) {
      setLembretes(data);
    }
    setLoading(false);
  }

  async function adicionarLembreteManual(e: React.FormEvent) {
    e.preventDefault();
    if (!novoTitulo || !novoHorario) return;
    setSalvandoManual(true);

    try {
      const { error } = await supabase
        .from("lembretes")
        .insert([{
          usuario_id: usuario.id,
          titulo: novoTitulo,
          horario: novoHorario,
          ativo: true
        }]);

      if (!error) {
        setNovoTitulo("");
        setNovoHorario("");
        await buscarLembretes(usuario.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSalvandoManual(false);
    }
  }

  async function gerarComIA(e: React.FormEvent) {
    e.preventDefault();
    if (!promptIA) return;
    setCarregandoIA(true);

    try {
      const res = await fetch("/api/lembretes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: usuario.id,
          promptUsuario: promptIA
        })
      });
      const data = await res.json();
      if (data.success) {
        setPromptIA("");
        await buscarLembretes(usuario.id);
        setActiveTab("manual"); // Volta para ver a lista gerada
      } else {
        alert("Erro: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar com a IA.");
    } finally {
      setCarregandoIA(false);
    }
  }

  async function apagarLembrete(id: string) {
    const { error } = await supabase.from("lembretes").delete().eq("id", id);
    if (!error) {
      setLembretes(lembretes.filter(l => l.id !== id));
    }
  }

  async function toggleLembrete(id: string, ativoAtual: boolean) {
    const { error } = await supabase.from("lembretes").update({ ativo: !ativoAtual }).eq("id", id);
    if (!error) {
      setLembretes(lembretes.map(l => l.id === id ? { ...l, ativo: !ativoAtual } : l));
    }
  }

  if (loading && !lembretes.length) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-950 text-white font-sans">
        <Sidebar />
        <main className="flex-1 md:ml-64 flex items-center justify-center">
          <p className="text-blue-500 font-display font-semibold text-2xl animate-pulse">
            Carregando Lembretes...
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
        <div className="container py-8 md:py-12 max-w-4xl mx-auto px-6 space-y-8 animate-in fade-in duration-500">
          
          <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-gray-800 pb-6 gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
                <Bell className="w-8 h-8 text-blue-500" />
                Seus Lembretes
              </h1>
              <p className="text-gray-400 mt-1">Gerencie alertas para manter sua rotina de sono.</p>
            </div>
            
            {/* Abas */}
            <div className="flex bg-gray-900 rounded-xl p-1 border border-gray-800 w-full md:w-auto">
              <button 
                onClick={() => setActiveTab("manual")}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === "manual" ? "bg-gray-800 text-white shadow" : "text-gray-400 hover:text-white"}`}
              >
                <Calendar className="w-4 h-4" />
                Minha Lista
              </button>
              <button 
                onClick={() => setActiveTab("ia")}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === "ia" ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-white"}`}
              >
                <Brain className="w-4 h-4" />
                Gerar com IA
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Coluna Esquerda: Formulários */}
            <div className="lg:col-span-1 space-y-6">
              {activeTab === "manual" ? (
                <form onSubmit={adicionarLembreteManual} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg space-y-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-blue-500" /> Novo Lembrete
                  </h3>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Título</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Tomar Chá"
                      value={novoTitulo}
                      onChange={(e) => setNovoTitulo(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-800 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-white transition outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Horário</label>
                    <input 
                      type="time" 
                      value={novoHorario}
                      onChange={(e) => setNovoHorario(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-800 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-white transition outline-none"
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={salvandoManual}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                  >
                    {salvandoManual ? "Adicionando..." : "Adicionar"}
                  </button>
                </form>
              ) : (
                <form onSubmit={gerarComIA} className="bg-gradient-to-br from-blue-900/40 to-gray-900 border border-blue-900/50 p-6 rounded-2xl shadow-lg space-y-4">
                  <h3 className="font-semibold text-blue-400 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-500" /> SonoZen AI
                  </h3>
                  <p className="text-xs text-gray-400">
                    Descreva o que você quer melhorar e a IA criará uma grade de lembretes para você.
                  </p>
                  
                  <div>
                    <textarea 
                      placeholder="Ex: Quero dormir às 22h, preciso de alertas para desacelerar e ler um livro."
                      value={promptIA}
                      onChange={(e) => setPromptIA(e.target.value)}
                      rows={4}
                      className="w-full bg-gray-950 border border-gray-800 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-white transition outline-none resize-none"
                      required
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={carregandoIA}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {carregandoIA ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Gerando...</>
                    ) : "Gerar lembretes"}
                  </button>
                </form>
              )}
            </div>

            {/* Coluna Direita: Lista */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg min-h-[400px]">
                <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" /> Grade Diária
                </h3>

                {lembretes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center h-48 space-y-4 opacity-50">
                    <Calendar className="w-12 h-12 text-gray-600" />
                    <p className="text-sm text-gray-400 max-w-[200px]">
                      Você ainda não tem lembretes. Crie manualmente ou peça ajuda para a IA!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lembretes.map((l) => (
                      <div key={l.id} className={`flex items-center justify-between p-4 rounded-xl border transition ${l.ativo ? 'bg-gray-950 border-gray-800' : 'bg-gray-950/50 border-gray-800/50 opacity-60'}`}>
                        
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => toggleLembrete(l.id, l.ativo)}
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition ${l.ativo ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-500'}`}
                          >
                            {l.horario.substring(0, 5)}
                          </button>
                          <div>
                            <p className={`font-medium ${l.ativo ? 'text-white' : 'text-gray-500 line-through'}`}>{l.titulo}</p>
                            <p className="text-xs text-gray-500">{l.ativo ? 'Ativo Diariamente' : 'Pausado'}</p>
                          </div>
                        </div>

                        <button 
                          onClick={() => apagarLembrete(l.id)}
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          title="Apagar Lembrete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </main>

      <MobileNav />
    </div>
  );
}