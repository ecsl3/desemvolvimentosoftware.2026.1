"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  ClipboardList, 
  Sparkles, 
  Bell, 
  BarChart3, 
  Lightbulb, 
  User,
  Menu,
  MessageSquare
} from "lucide-react";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/home", label: "Início", icon: Home },
    { href: "/diagnostic", label: "Diagnóstico", icon: ClipboardList },
    { href: "/rotine", label: "Rotina", icon: Sparkles },
    { href: "/reminders", label: "Lembretes", icon: Bell },
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/tips", label: "Dicas", icon: Lightbulb },
    { href: "/profile", label: "Perfil", icon: User },
  ];

  const currentLink = links.find(l => l.href === pathname);
  const pageName = currentLink ? currentLink.label : "SonoZen";

  const toggleChat = () => {
    window.dispatchEvent(new Event('toggleChat'));
  };

  return (
    <div className="md:hidden">
      {/* Overlay Background */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu Vertical Expansível */}
      <div 
        className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3 transition-all duration-300 origin-bottom ${isOpen ? 'scale-100 opacity-100' : 'scale-50 opacity-0 pointer-events-none'}`}
      >
        {links.map((link, idx) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link 
              key={link.href} 
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="group"
            >
              <div className={`flex items-center gap-4 p-3 pr-6 rounded-2xl border backdrop-blur-xl shadow-xl transition-all duration-300 w-[240px] ${isActive ? 'bg-blue-600/30 border-blue-500/50 text-white' : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'}`} style={{ transitionDelay: `${(links.length - idx) * 30}ms` }}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-gray-800/50 text-gray-400 group-hover:text-white group-hover:bg-gray-700/50'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-sm tracking-wide">{link.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Cápsula Liquid Glass (Pill) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[340px]">
        <div className="flex items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-full px-2 py-2">
          
          {/* Botão Menu (Hambúrguer) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 active:scale-95 ${isOpen ? 'bg-white/20 text-white rotate-90' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Nome da Página Atual */}
          <div className="flex-1 text-center truncate px-2">
            <span className="font-medium text-sm text-gray-200 tracking-wide">
              {pageName}
            </span>
          </div>

          <div className="w-[1px] h-6 bg-white/20 mx-1"></div>

          {/* Botão do Chat */}
          <button
            onClick={toggleChat}
            className="w-12 h-12 flex items-center justify-center rounded-full text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-all duration-300 active:scale-95"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

        </div>
      </div>

    </div>
  );
}