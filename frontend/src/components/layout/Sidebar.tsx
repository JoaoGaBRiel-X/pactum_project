'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Users, Package, Home, Settings, LogOut, FileText, DollarSign, TrendingUp, FileSignature } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/login') {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('gestao_token');
    localStorage.removeItem('gestao_tenant_id');
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white">Lefer SaaS</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link href="/" className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
          <Home size={18} /> Dashboard
        </Link>
        <Link href="/customers" className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
          <Users size={18} /> Clientes
        </Link>
        <Link href="/corporate-groups" className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
          <Users size={18} /> Grupos Econômicos
        </Link>
        <Link href="/products" className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
          <Package size={18} /> Produtos
        </Link>
        <Link href="/contracts" className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
          <FileText size={18} /> Contratos
        </Link>
        <Link href="/adjustments" className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
          <TrendingUp size={18} /> Reajustes
        </Link>
        <Link href="/templates" className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
          <FileSignature size={18} /> Templates de Documento
        </Link>
        <Link href="/financial" className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
          <DollarSign size={18} /> Financeiro
        </Link>
      </nav>
      <div className="p-4 border-t border-slate-800">
        <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors text-left">
          <LogOut size={18} /> Sair
        </button>
      </div>
    </aside>
  );
}
