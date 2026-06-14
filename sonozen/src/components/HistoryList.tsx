// src/components/HistoryList.tsx
import ReactMarkdown from "react-markdown";

interface HistoricoItem {
  id: string;
  pergunta: string;
  resposta: string;
  created_at: string;
}

interface HistoryListProps {
  historico: HistoricoItem[];
}

export default function HistoryList({ historico }: HistoryListProps) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-semibold text-gray-400">
        Seu Histórico
      </h2>
      {historico.length === 0 && (
        <p className="text-gray-600 italic">Nenhuma conversa por aqui ainda. Faça sua primeira pergunta no chat acima.</p>
      )}
      <div className="space-y-4">
        {historico.map((item) => (
          <div key={item.id} className="bg-gray-900 p-5 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
            <p className="text-sm text-blue-400 font-medium mb-2 border-b border-gray-800 pb-2">
              <span className="text-gray-500 mr-2">Q:</span>{item.pergunta}
            </p>
            
            {/* Aqui entra o ReactMarkdown formatando tudo lindamente */}
            <div className="text-gray-300 text-sm leading-relaxed">
              <ReactMarkdown
                components={{
                  strong: ({node, ...props}) => <span className="font-bold text-blue-400" {...props} />,
                  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                }}
              >
                {item.resposta}
              </ReactMarkdown>
            </div>

            <span className="text-[10px] text-gray-500 mt-4 block uppercase tracking-wider">
              {new Date(item.created_at).toLocaleString("pt-BR")}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}