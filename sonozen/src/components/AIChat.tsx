// src/components/AIChat.tsx
import ReactMarkdown from "react-markdown";
import Logo from "./Logo";

interface AIChatProps {
  input: string;
  setInput: (value: string) => void;
  enviarPergunta: () => void;
  carregandoIA: boolean;
  respostaAtual: string;
}

export default function AIChat({
  input,
  setInput,
  enviarPergunta,
  carregandoIA,
  respostaAtual,
}: AIChatProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
      
      {/* 1. Área da Resposta Atual (Ao Vivo) */}
      {respostaAtual && (
        <div className="mb-6 p-5 bg-gray-950/50 border border-gray-800 rounded-xl animate-in fade-in duration-500">
          <div className="flex items-center gap-2 mb-3">
            <Logo className="w-5 h-5 text-blue-500 drop-shadow-[0_0_6px_rgba(96,165,250,0.5)]" />
            <h3 className="font-semibold text-blue-400">Resposta do SonoZen AI:</h3>
          </div>
          
          {/* A mágica do Markdown acontece aqui */}
          <div className="text-gray-300 text-sm leading-relaxed">
            <ReactMarkdown
              components={{
                strong: ({node, ...props}) => <span className="font-bold text-blue-400" {...props} />,
                p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                li: ({node, ...props}) => <li className="mb-1" {...props} />,
              }}
            >
              {respostaAtual}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* 2. Área do Input de Texto */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !carregandoIA && input.trim() !== "") {
              enviarPergunta();
            }
          }}
          placeholder="Ex: Como o magnésio ajuda a dormir?"
          disabled={carregandoIA}
          className="flex-1 bg-gray-950 border border-gray-800 focus:border-blue-500 rounded-xl px-4 py-3 text-white outline-none transition disabled:opacity-50"
        />
        <button
          onClick={enviarPergunta}
          disabled={!input.trim() || carregandoIA}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:shadow-none text-white px-6 py-3 rounded-xl font-semibold transition shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95 flex items-center justify-center min-w-[140px]"
        >
          {carregandoIA ? (
            <span className="flex items-center gap-2">
              {/* Spinner de Loading */}
              <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Pensando...
            </span>
          ) : (
            "Enviar"
          )}
        </button>
      </div>
    </div>
  );
}