'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
                <TableRow key={group.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium text-slate-800">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-primary" />
                      {group.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {group._count?.customers || 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/corporate-groups/${group.id}/edit`}>
                      <Button variant="outline" size="sm" className="h-8 text-slate-600 hover:text-primary">
                        <Edit size={14} className="mr-1" /> Editar
                      </Button>
                    </Link>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="h-8"
                      onClick={() => {
                        if(confirm('Deseja realmente excluir este grupo?')) deleteMutation.mutate(group.id);
                      }}
                    >
                      <Trash2 size={14} className="mr-1" /> Excluir
                    </Button>
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
