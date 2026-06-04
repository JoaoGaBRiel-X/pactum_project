'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Package, Search, Eye, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [productsFilter, setProductsFilter] = useState('all');
  const [groupToDelete, setGroupToDelete] = useState<any>(null);

  const { data: groups, isLoading, error } = useQuery({
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
    
    if (statusFilter !== 'all') {
      const isFilterActive = statusFilter === 'active';
      if (group.isActive !== isFilterActive) return false;
    }

    if (productsFilter !== 'all') {
      const hasProducts = group._count?.products > 0;
      if (productsFilter === 'with_products' && !hasProducts) return false;
      if (productsFilter === 'empty' && hasProducts) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestão de Grupos de Produtos</h1>
          <p className="text-slate-500 mt-1">Agrupe e gerencie diferentes ofertas e variações de software sob um mesmo pacote.</p>
        </div>
        <Link href="/product-groups/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6">
            Novo Grupo
          </Button>
        </Link>
      </div>

      <Card className="border-blue-200 shadow-sm bg-blue-50/40 overflow-hidden">
        <div className="bg-blue-100/50 border-b border-blue-200 px-6 py-4">
          <h2 className="text-base font-semibold flex items-center gap-2 text-blue-900">
            <Search size={18} className="text-blue-600"/> Filtros
          </h2>
          <p className="text-sm text-blue-700/80 mt-1">Refine a listagem de grupos usando os critérios abaixo.</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-slate-200 bg-white focus:ring-blue-500">
                  <SelectValue placeholder="Todos os Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">Vínculo de Produtos</label>
              <Select value={productsFilter} onValueChange={setProductsFilter}>
                <SelectTrigger className="border-slate-200 bg-white focus:ring-blue-500">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="with_products">Com Produtos Vinculados</SelectItem>
                  <SelectItem value="empty">Vazios (Sem Produtos)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[45%] font-semibold text-slate-700 py-4 px-6">Nome do Grupo</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4 text-center">Status</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4 text-center">Produtos Vinculados</TableHead>
              <TableHead className="text-right font-semibold text-slate-700 py-4 px-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-slate-500 animate-pulse">Carregando grupos...</TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-red-500 flex flex-col items-center gap-2">
                  <AlertCircle size={24} />
                  Erro ao carregar grupos.
                </TableCell>
              </TableRow>
            )}
            {filteredGroups?.length === 0 && !isLoading && !error ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-16 text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search size={32} className="text-slate-300 mb-2" />
                    <p className="text-base font-medium text-slate-600">Nenhum grupo encontrado</p>
                    <p className="text-sm text-slate-400">Tente ajustar os filtros acima para ver mais resultados.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredGroups?.map((group: any) => (
                <TableRow key={group.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0 group/row">
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col">
                      <Link href={`/product-groups/${group.id}`} className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors flex items-center gap-2">
                        <Package size={16} className="text-slate-400 group-hover/row:text-blue-600 transition-colors" />
                        {group.name}
                      </Link>
                      {group.description && (
                        <span className="text-xs text-slate-500 mt-1 truncate max-w-sm">{group.description}</span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center py-4">
                    {group.isActive ? (
                      <Badge className="bg-emerald-100/80 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 shadow-sm inline-flex items-center gap-1.5 px-2.5 py-1">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <span className="font-medium">Ativo</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-500 border-slate-200 bg-slate-50 hover:bg-slate-100 inline-flex items-center gap-1.5 px-2.5 py-1">
                        <XCircle size={14} className="text-slate-400" />
                        <span className="font-medium">Inativo</span>
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-center py-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-md border border-blue-200">
                      {group._count?.products || 0} produto(s)
                    </span>
                  </TableCell>

                  <TableCell className="text-right px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Link href={`/product-groups/${group.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 bg-white border border-slate-200 shadow-sm rounded-md" title="Ver Grupo">
                            <Eye size={14} />
                          </Button>
                        </Link>
                        <Link href={`/product-groups/${group.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 bg-white border border-slate-200 shadow-sm rounded-md" title="Editar Grupo">
                            <Pencil size={14} />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 bg-white border border-slate-200 shadow-sm rounded-md" 
                          title="Excluir Grupo"
                          onClick={() => setGroupToDelete(group)}
                        >
                          <Trash2 size={14} />
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
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 text-red-700">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p className="text-sm font-medium">Atenção: Este grupo possui {groupToDelete._count.products} produto(s) vinculado(s) e não poderá ser excluído até que eles sejam removidos.</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {groupToDelete?._count?.products > 0 ? (
              <AlertDialogAction onClick={() => setGroupToDelete(null)} className="bg-slate-900">Entendi</AlertDialogAction>
            ) : (
              <>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => deleteMutation.mutate(groupToDelete.id)}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                >
                  Excluir
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
