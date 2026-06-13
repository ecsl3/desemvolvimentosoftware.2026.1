// src/components/Header.tsx

interface HeaderProps {
  usuario: any; // O usuário vindo do Supabase
  onDeslogar: () => void; // A função de clicar no botão "Sair"
}

export default function Header({ usuario, onDeslogar }: HeaderProps) {
  return (
    <section className="flex justify-between items-center bg-gray-900 p-4 rounded-xl shadow-lg border border-gray-800">
      <div className="text-left">
        <h1 className="font-display text-2xl font-semibold text-blue-500">Consultor de Sono IA</h1>
        <p className="text-xs text-gray-400">
          Conectado como: <span className="text-gray-300">{usuario?.email}</span>
        </p>
      </div>
      <button
        onClick={onDeslogar}
        className="px-4 py-2 bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white text-sm font-bold rounded-lg border border-red-900/50 transition-colors"
      >
        Sair
      </button>
    </section>
  );
}