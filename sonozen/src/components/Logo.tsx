/* Símbolo: lua crescente inclinada com três estrelas aninhadas no vão, representando os pilares do produto (diagnóstico, rotina e monitoramento) */

export default function Logo({ className = "w-10 h-10 text-blue-500" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      {/* Inclina o símbolo inteiro (lua + estrelas) */}
      <g transform="rotate(-25 12 12)">
        {/* Lua crescente fina (formato de "C") */}
        <path d="M15.8 3.8A9 9 0 1 0 15.8 20.2A8.2 8.2 0 0 1 15.8 3.8Z" />
        {/* Estrelas aninhadas no vão da lua */}
        <path d="M13.5 8.2l0.8 1.8 1.8 0.8-1.8 0.8-0.8 1.8-0.8-1.8-1.8-0.8 1.8-0.8Z" />
        <path d="M16.5 13.6l0.6 1.3 1.3 0.6-1.3 0.6-0.6 1.3-0.6-1.3-1.3-0.6 1.3-0.6Z" />
        <path d="M17.5 6.2l0.4 0.9 0.9 0.4-0.9 0.4-0.4 0.9-0.4-0.9-0.9-0.4 0.9-0.4Z" />
      </g>
    </svg>
  );
}
