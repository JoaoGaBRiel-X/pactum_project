'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Plus, Pencil, Trash2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { RequirePermissions } from '@/components/auth/RequirePermissions';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function RolesPage() {
  const { data: roles, isLoading, error } = useQuery({
    queryKey: ['roles'],
    queryFn: () => apiFetch('/roles'),
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: any) => apiFetch('/roles', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string, payload: any }) => apiFetch(`/roles/${data.id}`, {
      method: 'PATCH',
      body: JSON.stringify(data.payload)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/roles/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Perfil excluído com sucesso');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Falha ao excluir perfil');
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este perfil de acesso? Usuários vinculados poderão perder acesso.')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="text-primary w-8 h-8 hidden md:block" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Perfis de Acesso</h1>
            <p className="text-slate-500 mt-1">Gerencie os papéis e permissões dos usuários do sistema.</p>
          </div>
        </div>
        <RequirePermissions permissions="roles:create">
          <Link href="/admin/settings/roles/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6">
              <Plus size={16} className="mr-2" /> Novo Perfil
            </Button>
          </Link>
        </RequirePermissions>
      </div>

      <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-slate-700 py-4 px-6">Nome do Perfil</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4">Descrição</TableHead>
              <TableHead className="text-right font-semibold text-slate-700 py-4 px-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-12 text-slate-500 animate-pulse">Carregando perfis...</TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-red-500 flex flex-col items-center gap-2">
                  <AlertCircle size={24} />
                  Erro ao carregar perfis: {error.message}
                </TableCell>
              </TableRow>
            )}
            {roles?.map((role: any) => (
              <TableRow key={role.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0 group">
                <TableCell className="px-6 py-4 font-semibold text-slate-800">
                  {role.name}
                  {role.isSystem && (
                    <span className="ml-2 px-2 py-0.5 text-[10px] bg-slate-100 text-slate-500 border border-slate-200 rounded uppercase tracking-wider">
                      Sistema
                    </span>
                  )}
                </TableCell>
                <TableCell className="py-4 text-slate-600">
                  {role.description || <span className="text-slate-400 italic">Sem descrição</span>}
                </TableCell>
                <TableCell className="text-right px-6 py-4">
                  <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    {!role.isSystem && (
                      <>
                        <RequirePermissions permissions="roles:update">
                          <Link href={`/admin/settings/roles/${role.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 bg-white border border-slate-200 shadow-sm rounded-md" title="Editar Perfil">
                              <Pencil size={14} />
                            </Button>
                          </Link>
                        </RequirePermissions>
                        <RequirePermissions permissions="roles:delete">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 bg-white border border-slate-200 shadow-sm rounded-md" title="Excluir Perfil" onClick={() => handleDelete(role.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </RequirePermissions>
                      </>
                    )}
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
