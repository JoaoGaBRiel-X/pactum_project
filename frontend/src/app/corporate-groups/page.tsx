'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Building2, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

export default function CorporateGroupsPage() {
  const queryClient = useQueryClient();

  const { data: groups, isLoading } = useQuery({
    queryKey: ['corporate-groups'],
    queryFn: () => apiFetch('/corporate-groups'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/corporate-groups/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['corporate-groups'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Grupos Econômicos</h1>
          <p className="text-muted-foreground">Agrupe múltiplas empresas sob um mesmo grupo.</p>
        </div>
        <Link href="/corporate-groups/new">
          <Button><Plus size={16} className="mr-2" /> Novo Grupo</Button>
        </Link>
      </div>

      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-blue-800 font-semibold mb-2">
          <Search size={18} />
          <h2>Filtros</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">BUSCA (NOME)</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input placeholder="Buscar grupo..." className="pl-9 bg-white border-slate-200" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="font-semibold text-slate-700">Nome do Grupo</TableHead>
              <TableHead className="font-semibold text-slate-700 text-center">Empresas Vinculadas</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Carregando...</TableCell>
              </TableRow>
            ) : groups?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Nenhum grupo econômico encontrado.</TableCell>
              </TableRow>
            ) : (
              groups?.map((group: any) => (
                <TableRow key={group.id} className="hover:bg-slate-50/50 group">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                      <Link href={`/corporate-groups/${group.id}/edit`} className="text-slate-900 font-semibold group-hover:text-blue-700 transition-colors">
                        {group.name}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {group._count?.customers || 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-right px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Link href={`/corporate-groups/${group.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200 shadow-sm" title="Editar Grupo">
                          <Edit size={16} />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 bg-white border border-slate-200 shadow-sm"
                        title="Excluir Grupo"
                        onClick={() => {
                          if(confirm('Deseja realmente excluir este grupo?')) deleteMutation.mutate(group.id);
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
