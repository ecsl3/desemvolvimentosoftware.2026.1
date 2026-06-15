"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Logo from "../../components/Logo";
import CeuEstrelado from "../../components/CeuEstrelado";
import { Mail, Lock } from "lucide-react";

// Ícones SVG para o botão de mostrar/ocultar senha
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // NOVO ESTADO
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const emailLimpo = email.trim();

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailLimpo,
        password,
      });
      if (error) alert("Erro ao entrar: " + error.message);
      else router.push("/home");
    } else {
      const { error } = await supabase.auth.signUp({
        email: emailLimpo,
        password,
      });
      // Supabase retorna erro genérico quando o email já existe por questões de segurança (se a confirmação de email estiver ligada).
      // Mas o "error.message" geralmente contém a informação de "User already registered"
      if (error) alert("Erro ao cadastrar: " + error.message);
      else alert("Cadastro realizado! Tente fazer o login agora.");
    }
    setLoading(false);
  }

  return (
    <main className="relative isolate min-h-screen bg-gray-950 flex items-center justify-center p-6 text-white font-sans">

      {/* Céu estrelado de fundo */}
      <CeuEstrelado />

      <div className="w-full max-w-md bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl space-y-6">

        {/* Logo/Título */}
        <div className="text-center space-y-2">
          <Logo className="w-14 h-14 text-blue-500 mx-auto" />
          <h1 className="font-display text-3xl font-semibold">SonoZen AI</h1>
          <p className="text-gray-400 text-sm">
            {isLogin ? "Que bom te ver novamente." : "Cadastre-se grátis e comece a usar."}
          </p>
        </div>

        {/* Seletor de Abas */}
        <div className="flex bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${isLogin ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-white"}`}
          >
            Entrar
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${!isLogin ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-white"}`}
          >
            Cadastrar
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase ml-1 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-blue-500" /> E-mail</label>
            <input
              type="email"
              required
              placeholder="seu@email.com"
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1 relative">
            <label className="text-xs font-semibold text-gray-500 uppercase ml-1 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-blue-500" /> Senha</label>
            <div className="relative">
              <input
                // AQUI A MÁGICA: Muda o tipo do input dependendo do estado
                type={showPassword ? "text" : "password"} 
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full p-3 pr-12 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                onChange={(e) => setPassword(e.target.value)}
              />
              {/* Botão de Alternância de Visibilidade */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white shadow-[0_0_25px_rgba(37,99,235,0.25)] transition transform active:scale-95 disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none"
          >
            {loading ? "Processando..." : isLogin ? "Acessar conta" : "Criar conta"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600">
          Ao continuar, você concorda com os termos de uso do SonoZen AI.
        </p>
      </div>
    </main>
  );
}