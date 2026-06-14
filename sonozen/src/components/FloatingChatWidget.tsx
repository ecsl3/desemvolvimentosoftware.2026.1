"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { MessageSquare, X, Send, Brain } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { perguntarParaIA } from "../app/actions";

interface HistoricoItem {
  id: string;
  pergunta: string;
  resposta: string;
  created_at: string;
}

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);
  const [input, setInput] = useState("");
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [carregandoIA, setCarregandoIA] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener('toggleChat', handleToggle);
    return () => window.removeEventListener('toggleChat', handleToggle);
  }, []);

  useEffect(() => {
    async function checarSessao() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUsuario(session.user);
        carregarHistorico(session.user.id);
      }

      const { data: authListener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (session?.user) {
            setUsuario(session.user);
            carregarHistorico(session.user.id);
          } else {
            setUsuario(null);
            setHistorico([]);
            setIsOpen(false);
          }
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
    checarSessao();
  }, []);

  async function carregarHistorico(userId: string) {
    const { data } = await supabase
      .from("historico")
      .select("*")
      .eq("usuario_id", userId)
      .order("created_at", { ascending: true }); // do mais antigo para o mais novo
    
    if (data) setHistorico(data);
  }

  // Auto-scroll sempre que o histórico atualiza
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [historico, isOpen, carregandoIA]);

  async function enviarPergunta(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !usuario) return;

    const perguntaTemp = input.trim();
    setInput("");
    setCarregandoIA(true);

    try {
      const textoIA = await perguntarParaIA(perguntaTemp);

      const novoHistorico: HistoricoItem = {
        id: Date.now().toString(), // fake ID pro state local
        pergunta: perguntaTemp,
        resposta: textoIA,
        created_at: new Date().toISOString()
      };
      
      setHistorico(prev => [...prev, novoHistorico]);

      // Salva no banco de forma assíncrona para não travar a UI
      await supabase.from("historico").insert([
        { pergunta: perguntaTemp, resposta: textoIA, usuario_id: usuario.id },
      ]);

    } catch (err) {
      console.error("Erro:", err);
      alert("Erro ao conectar com a IA.");
    } finally {
      setCarregandoIA(false);
    }
  }

  // Se não tem usuário logado, o widget não aparece
  if (!usuario) return null;

  return (
    <>
      {/* Botão Flutuante (Apenas Desktop) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`hidden md:flex fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-transform duration-300 active:scale-95 items-center justify-center ${isOpen ? 'bg-gray-800 text-gray-400 rotate-90' : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-105'}`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Janela do Chat */}
      <div className={`fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`} style={{ height: "550px", maxHeight: "calc(100vh - 120px)" }}>
        
        {/* Header do Chat */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-800 bg-gray-900/90 rounded-t-2xl backdrop-blur-md">
          <Brain className="w-6 h-6 text-blue-500" />
          <div>
            <h3 className="font-semibold text-white leading-tight">SonoZen AI</h3>
            <p className="text-[10px] text-blue-400 uppercase tracking-wider font-bold">Assistente Virtual</p>
          </div>
        </div>

        {/* Área de Mensagens (Histórico) */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
          {historico.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50 px-4">
              <MessageSquare className="w-10 h-10 text-gray-500" />
              <p className="text-sm text-gray-400">Olá! Eu sou o SonoZen AI. Como posso te ajudar a dormir melhor hoje?</p>
            </div>
          ) : (
            historico.map((item, idx) => (
              <div key={item.id || idx} className="space-y-3">
                {/* Balão do Usuário */}
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[85%] shadow-md">
                    {item.pergunta}
                  </div>
                </div>

                {/* Balão da IA */}
                <div className="flex justify-start">
                  <div className="bg-gray-800 border border-gray-700 text-gray-300 text-sm px-4 py-3 rounded-2xl rounded-tl-sm max-w-[90%] shadow-md leading-relaxed prose prose-invert prose-p:mb-2 prose-p:last:mb-0 prose-ul:mb-2 prose-ul:pl-4 prose-li:mb-1">
                    <ReactMarkdown>{item.resposta}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {carregandoIA && (
            <div className="flex justify-start">
              <div className="bg-gray-800 border border-gray-700 text-gray-400 text-sm px-4 py-3 rounded-2xl rounded-tl-sm shadow-md flex items-center gap-2">
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={enviarPergunta} className="p-3 border-t border-gray-800 bg-gray-950 rounded-b-2xl flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua dúvida..."
            className="flex-1 bg-gray-900 border border-gray-800 focus:border-blue-500 text-white text-sm rounded-xl px-4 py-2.5 outline-none transition"
            disabled={carregandoIA}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || carregandoIA}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center transition shrink-0"
          >
            <Send className="w-4 h-4 ml-1" />
          </button>
        </form>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4b5563; }
      `}</style>
    </>
  );
}
