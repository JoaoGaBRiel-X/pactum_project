'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, Plus, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function NotificationTemplatesPage() {
  const { data: templates, isLoading } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: () => apiFetch('/notification-templates'),
  });

  const handleDelete = (id: string) => {
    // TODO: implement delete
  };

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Mail className="text-primary w-8 h-8 hidden md:block" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Templates de E-mail</h1>
            <p className="text-slate-500 mt-1">Gerencie as notificações enviadas aos clientes.</p>
          </div>
        </div>
        <Link href="/admin/notifications/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6">
            <Plus size={16} className="mr-2" /> Novo Template
          </Button>
        </Link>
      </div>

      <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[30%] font-semibold text-slate-700 py-4 px-6">Nome</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4">Categoria</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4">Assunto</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-700 py-4 px-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-slate-500 animate-pulse">Carregando...</TableCell>
              </TableRow>
            )}
            {templates?.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16 text-slate-500">Nenhum template encontrado.</TableCell>
              </TableRow>
            )}
            {templates?.map((t: any) => (
              <TableRow key={t.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0 group">
                <TableCell className="font-semibold text-slate-800 px-6 py-4">{t.name}</TableCell>
                <TableCell className="py-4">
                  <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">{t.category || 'COMMERCIAL'}</span>
                </TableCell>
                <TableCell className="py-4">{t.subject}</TableCell>
                <TableCell className="py-4">
                  {t.isActive ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">Ativo</span>
                  ) : (
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">Inativo</span>
                  )}
                </TableCell>
                <TableCell className="text-right px-6 py-4">
                  <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Link href={`/admin/notifications/${t.id}/edit`}>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200 shadow-sm" title="Editar Template">
                        <Pencil size={16} />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 bg-white border border-slate-200 shadow-sm" title="Excluir Template" onClick={() => handleDelete(t.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
