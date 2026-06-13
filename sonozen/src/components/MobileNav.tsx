// src/components/MobileNav.tsx
import Link from "next/link";

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50 pb-safe">
      {/* Adicionado 'overflow-x-auto' para permitir rolar horizontalmente caso
        a tela do celular seja muito pequena para os 7 botões.
      */}
      <div className="flex items-center justify-between overflow-x-auto gap-4 py-2 px-4 no-scrollbar">
        
        {/* Início */}
        <Link href="/home" className="flex flex-col items-center gap-1 min-w-[50px] text-blue-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><path d="M9 22V12h6v10"></path>
          </svg>
          <span className="text-[10px] font-medium">Início</span>
        </Link>
        
        {/* Diagnóstico */}
        <Link href="/diagnostic" className="flex flex-col items-center gap-1 min-w-[50px] text-gray-500 hover:text-gray-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <path d="M12 11h4"></path><path d="M12 16h4"></path><path d="M8 11h.01"></path><path d="M8 16h.01"></path>
          </svg>
          <span className="text-[10px] font-medium">Diagnóstico</span>
        </Link>
        
        {/* Rotina */}
        <Link href="/rotine" className="flex flex-col items-center gap-1 min-w-[50px] text-gray-500 hover:text-gray-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
            <path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path>
          </svg>
          <span className="text-[10px] font-medium">Rotina</span>
        </Link>

        {/* Lembretes */}
        <Link href="/reminders" className="flex flex-col items-center gap-1 min-w-[50px] text-gray-500 hover:text-gray-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
          </svg>
          <span className="text-[10px] font-medium">Lembretes</span>
        </Link>

        {/* Dashboard */}
        <Link href="/dashboard" className="flex flex-col items-center gap-1 min-w-[50px] text-gray-500 hover:text-gray-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path>
          </svg>
          <span className="text-[10px] font-medium">Dashboard</span>
        </Link>

        {/* Dicas */}
        <Link href="/tips" className="flex flex-col items-center gap-1 min-w-[50px] text-gray-500 hover:text-gray-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
            <path d="M9 18h6"></path><path d="M10 22h4"></path>
          </svg>
          <span className="text-[10px] font-medium">Dicas</span>
        </Link>

        {/* Perfil */}
        <Link href="/profile" className="flex flex-col items-center gap-1 min-w-[50px] text-gray-500 hover:text-gray-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span className="text-[10px] font-medium">Perfil</span>
        </Link>

      </div>
    </nav>
  );
}