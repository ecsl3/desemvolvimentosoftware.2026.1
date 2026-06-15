"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { Save, User, Moon, LogOut } from "lucide-react";

// Importando os componentes modulares
import Sidebar from "../../components/Sidebar";
import MobileNav from "../../components/MobileNav";

interface PerfilData {
  nome: string;
  meta_sono: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState<PerfilData>({ nome: "", meta_sono: 8 });
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: "", erro: false });

  useEffect(() => {
    async function inicializar() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        } 
        
        setUsuario(user);

        // Busca os dados do perfil
        const { data, error } = await supabase
          .from("perfis")
          .select("nome, meta_sono")
          .eq("id", user.id)
          .single();

        if (data) {
          setPerfil({
            nome: data.nome || "",
            meta_sono: data.meta_sono || 8
          });
        } else if (error && error.code !== "PGRST116") {
          console.error("Erro ao buscar perfil:", error);
        }

        setLoading(false);
      } catch (err) {
        console.error("Erro na inicialização:", err);
        setLoading(false);
      }
    }
    inicializar();
  }, [router]);

  async function salvarPerfil(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setMensagem({ texto: "", erro: false });

    try {
      const { error } = await supabase
        .from("perfis")
        .upsert({ 
          id: usuario.id, 
          nome: perfil.nome, 
          meta_sono: perfil.meta_sono 
        });

      if (error) throw error;
      
      setMensagem({ texto: "Perfil atualizado com sucesso!", erro: false });
    } catch (error: any) {
      setMensagem({ texto: "Erro ao salvar perfil: " + error.message, erro: true });
    } finally {
      setSalvando(false);
    }
  }

  async function deslogar() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Erro ao sair: " + error.message);
    } else {
      router.push("/login");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-950 text-white font-sans">
        <Sidebar />
        <main className="flex-1 md:ml-64 flex items-center justify-center">
          <p className="text-blue-500 font-display font-semibold text-2xl animate-pulse">
            Carregando Perfil...
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
        <div className="container py-6 md:py-10 max-w-3xl mx-auto px-6 space-y-8 animate-in fade-in duration-500">
          
          <div className="flex justify-between items-center border-b border-gray-800 pb-6">
            <div>
              <h1 className="text-3xl font-display font-semibold text-white">Meu Perfil</h1>
              <p className="text-gray-400 mt-1">Gerencie suas informações e metas.</p>
            </div>
            <button 
              onClick={deslogar}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair da Conta</span>
            </button>
          </div>

          <form onSubmit={salvarPerfil} className="bg-gray-900 border border-gray-800 p-6 md:p-8 rounded-2xl shadow-lg space-y-6">
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" /> E-mail
                </label>
                <input 
                  type="email" 
                  value={usuario?.email || ""} 
                  disabled 
                  className="w-full bg-gray-950/50 border border-gray-800 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">O e-mail não pode ser alterado.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" /> Nome Completo
                </label>
                <input 
                  type="text" 
                  placeholder="Como gostaria de ser chamado?"
                  value={perfil.nome}
                  onChange={(e) => setPerfil({ ...perfil, nome: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 focus:border-blue-500 rounded-xl px-4 py-3 text-white transition outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <Moon className="w-4 h-4 text-blue-500" /> Meta Diária de Sono (horas)
                </label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="4" 
                    max="12" 
                    step="1"
                    value={perfil.meta_sono}
                    onChange={(e) => setPerfil({ ...perfil, meta_sono: parseInt(e.target.value) })}
                    className="flex-1 accent-blue-500"
                  />
                  <span className="text-2xl font-bold text-blue-400 w-12 text-center">
                    {perfil.meta_sono}h
                  </span>
                </div>
              </div>
            </div>

            {mensagem.texto && (
              <div className={`p-4 rounded-xl text-sm ${mensagem.erro ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                {mensagem.texto}
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={salvando}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {salvando ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>

        </div>
      </main>

      <MobileNav />
    </div>
  );
}