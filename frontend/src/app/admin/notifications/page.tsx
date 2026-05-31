'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, Plus, Edit } from 'lucide-react';
import Link from 'next/link';

export default function NotificationTemplatesPage() {
  const { data: templates, isLoading } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: () => apiFetch('/notification-templates'),
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="text-primary w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Templates de E-mail</h1>
            <p className="text-muted-foreground">Gerencie as notificações enviadas aos clientes.</p>
          </div>
        </div>
        <Link href="/admin/notifications/new">
          <Button className="shadow-lg shadow-primary/30">
            <Plus size={16} className="mr-2" /> Novo Template
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Assunto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Carregando...</TableCell>
              </TableRow>
            )}
            {templates?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Nenhum template encontrado.</TableCell>
              </TableRow>
            )}
            {templates?.map((t: any) => (
              <TableRow key={t.id} className="hover:bg-slate-50 transition-colors">
                <TableCell className="font-semibold text-slate-800">{t.name}</TableCell>
                <TableCell>{t.subject}</TableCell>
                <TableCell>
                  {t.isActive ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">Ativo</span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">Inativo</span>
                  )}
                </TableCell>
                <TableCell>
                  <Link href={`/admin/notifications/${t.id}/edit`}>
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      <Edit size={16} />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
