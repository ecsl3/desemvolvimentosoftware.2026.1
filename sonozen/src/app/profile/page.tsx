"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

// Importando os componentes modulares
import Sidebar from "../../components/Sidebar";
import MobileNav from "../../components/MobileNav";
import Header from "../../components/Header";


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

  useEffect(() => {
    async function inicializar() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
        } else {
          setUsuario(user);
          setLoading(false);
        }
      } catch (err) {
        console.error("Erro na inicialização:", err);
        setLoading(false);
      }
    }
    inicializar();
  }, [router]);

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
      
      {/* Layout Externo: Barra Lateral */}
      <Sidebar />

      {/* Conteúdo Principal Central */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 flex items-center justify-center">
        <p className="text-blue-500 font-display font-semibold text-2xl md:text-3xl animate-pulse">
          Carregando SonoZen AI...
        </p>
      </main>

      {/* Layout Externo: Navegação Mobile */}
      <MobileNav />

    </div>

      
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-950 text-white font-sans">
      
      {/* Layout Externo: Barra Lateral */}
      <Sidebar />

      {/* Conteúdo Principal Central */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <div className="container py-6 md:py-10 max-w-4xl mx-auto px-6 space-y-8">
          <hr className="border-gray-800" />
            <Header usuario={usuario} onDeslogar={deslogar} />
        </div>
      </main>

      {/* Layout Externo: Navegação Mobile */}
      <MobileNav />

    </div>
  );
}