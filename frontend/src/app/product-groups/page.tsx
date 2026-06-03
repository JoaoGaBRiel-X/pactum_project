'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Package, Search, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ProductGroupsPage() {
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [groupToDelete, setGroupToDelete] = useState<any>(null);

  const { data: groups, isLoading } = useQuery({
    queryKey: ['product-groups'],
    queryFn: () => apiFetch('/product-groups'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/product-groups/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product-groups'] }),
    onError: (error: any) => {
      alert(error.message || 'Erro ao excluir grupo de produtos');
    }
  });

  const filteredGroups = groups?.filter((group: any) => {
    if (searchTerm && !group.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Grupos de Produtos</h1>
          <p className="text-slate-500 mt-1">Agrupe diferentes ofertas e variações sob um mesmo produto.</p>
        </div>
        <Link href="/product-groups/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6">
            <Plus size={18} className="mr-2" />
            Novo Grupo
          </Button>
        </Link>
      </div>

      <Card className="border-blue-200 shadow-sm bg-blue-50/40 overflow-hidden">
        <div className="bg-blue-100/50 border-b border-blue-200 px-6 py-4">
          <h2 className="text-base font-semibold flex items-center gap-2 text-blue-900">
            <Search size={18} className="text-blue-600"/> Filtros
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">Busca (Nome)</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Buscar grupo..." 
                  className="pl-9 border-slate-200 focus-visible:ring-blue-500 bg-white" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[50%] font-semibold text-slate-700 py-4 px-6">Nome do Grupo</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4 text-center">Produtos Vinculados</TableHead>
              <TableHead className="text-right font-semibold text-slate-700 py-4 px-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-12 text-slate-500 animate-pulse">Carregando...</TableCell>
              </TableRow>
            ) : filteredGroups?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-16 text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search size={32} className="text-slate-300 mb-2" />
                    <p className="text-base font-medium text-slate-600">Nenhum grupo encontrado</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredGroups?.map((group: any) => (
                <TableRow key={group.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0 group/row">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-slate-400 group-hover/row:text-blue-600 transition-colors" />
                      <Link href={`/product-groups/${group.id}`} className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                        {group.name}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {group._count?.products || 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-right px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-80 group-hover/row:opacity-100 transition-opacity">
                      <Link href={`/product-groups/${group.id}`}>
                        <Button variant="outline" size="sm" className="h-8 border-slate-200 hover:bg-slate-100 hover:text-blue-600 text-slate-600">
                          <Eye size={14} className="mr-1.5" /> Ver
                        </Button>
                      </Link>
                      <Link href={`/product-groups/${group.id}/edit`}>
                        <Button variant="outline" size="sm" className="h-8 border-slate-200 hover:bg-slate-100 hover:text-blue-600 text-slate-600">
                          <Edit size={14} className="mr-1.5" /> Editar
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                        onClick={() => setGroupToDelete(group)}
                      >
                        <Trash2 size={14} className="mr-1.5" /> Excluir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!groupToDelete} onOpenChange={(open) => !open && setGroupToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Grupo de Produtos</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o grupo "{groupToDelete?.name}"? Esta ação não pode ser desfeita.
              {groupToDelete?._count?.products > 0 && (
                <div className="mt-2 text-red-600 font-semibold">
                  Atenção: Este grupo possui {groupToDelete._count.products} produto(s) vinculado(s) e não poderá ser excluído até que eles sejam removidos.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteMutation.mutate(groupToDelete.id)}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={groupToDelete?._count?.products > 0}
            >
              Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
