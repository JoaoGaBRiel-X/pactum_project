'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Search, Box, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';
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

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modulesFilter, setModulesFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [productToDelete, setProductToDelete] = useState<any>(null);

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiFetch('/products'),
  });

  const { data: groups } = useQuery({
    queryKey: ['product-groups'],
    queryFn: () => apiFetch('/product-groups'),
  });

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: any) => {
      alert(`Erro ao excluir: ${err.message || 'Desconhecido'}`);
    }
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
    setProductToDelete(null);
  };

  const filteredProducts = products?.filter((product: any) => {
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    if (statusFilter === 'active' && !product.isActive) return false;
    if (statusFilter === 'inactive' && product.isActive) return false;

    const modulesCount = product.modules?.length || 0;
    if (modulesFilter === 'with' && modulesCount === 0) return false;
    if (modulesFilter === 'without' && modulesCount > 0) return false;

    if (groupFilter !== 'all') {
      if (groupFilter === 'none' && product.productGroupId) return false;
      if (groupFilter !== 'none' && product.productGroupId !== groupFilter) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Catálogo de Produtos</h1>
          <p className="text-slate-500 mt-1">Gerencie os softwares e módulos.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/product-groups">
            <Button variant="outline" className="font-medium px-6 border-slate-300">Grupos de Produtos</Button>
          </Link>
          <Link href="/products/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6">Novo Produto</Button>
          </Link>
        </div>
      </div>

      <Card className="border-blue-200 shadow-sm bg-blue-50/40 overflow-hidden">
        <div className="bg-blue-100/50 border-b border-blue-200 px-6 py-4">
          <h2 className="text-base font-semibold flex items-center gap-2 text-blue-900">
            <Search size={18} className="text-blue-600"/> Filtros
          </h2>
          <p className="text-sm text-blue-700/80 mt-1">Refine a listagem do catálogo de produtos.</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">Busca (Nome)</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Buscar produto..." 
                  className="pl-9 border-slate-200 focus-visible:ring-blue-500" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-slate-200 focus:ring-blue-500">
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
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">Módulos</label>
              <Select value={modulesFilter} onValueChange={setModulesFilter}>
                <SelectTrigger className="border-slate-200 focus:ring-blue-500">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="with">Com módulos</SelectItem>
                  <SelectItem value="without">Sem módulos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">Grupo</label>
              <Select value={groupFilter} onValueChange={setGroupFilter}>
                <SelectTrigger className="border-slate-200 focus:ring-blue-500">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="none">Sem Grupo</SelectItem>
                  {groups?.map((g: any) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
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
              <TableHead className="w-[30%] font-semibold text-slate-700 py-4 px-6">Nome do Produto</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4 text-left">Grupo</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4 text-center">Status</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4 text-center">Módulos</TableHead>
              <TableHead className="text-right font-semibold text-slate-700 py-4 px-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-slate-500 animate-pulse">Carregando...</TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-red-500">
                  Erro ao carregar produtos: {error.message}
                </TableCell>
              </TableRow>
            )}
            {products?.length === 0 && !isLoading && !error && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-16 text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search size={32} className="text-slate-300 mb-2" />
                    <p className="text-base font-medium text-slate-600">Nenhum produto encontrado</p>
                    <p className="text-sm text-slate-400">Tente ajustar os filtros acima para ver mais resultados.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {filteredProducts?.map((product: any) => (
              <TableRow key={product.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0 group">
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Box size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <Link href={`/products/${product.id}`} className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                      {product.name}
                    </Link>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  {product.productGroup ? (
                    <span className="text-sm font-medium text-slate-700">{product.productGroup.name}</span>
                  ) : (
                    <span className="text-sm text-slate-400 italic">Sem grupo</span>
                  )}
                </TableCell>
                <TableCell className="text-center py-4">
                  {product.isActive ? (
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
                    {product.modules?.length || 0} módulo(s)
                  </span>
                </TableCell>
                <TableCell className="text-right px-6 py-4">
                  <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Link href={`/products/${product.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 bg-white border border-slate-200 shadow-sm rounded-md" title="Ver Produto">
                        <Eye size={14} />
                      </Button>
                    </Link>
                    <Link href={`/products/${product.id}/edit`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 bg-white border border-slate-200 shadow-sm rounded-md" title="Editar Produto">
                        <Pencil size={14} />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 bg-white border border-slate-200 shadow-sm rounded-md" 
                      title="Excluir Produto"
                      onClick={() => setProductToDelete(product)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {productToDelete?._count?.contracts > 0 ? 'Exclusão Bloqueada' : 'Excluir Produto?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {productToDelete?._count?.contracts > 0 ? (
                <>
                  Este produto não pode ser excluído pois possui <strong>{productToDelete._count.contracts}</strong> contrato(s) vinculado(s). 
                  Cancele os contratos antes de prosseguir com a exclusão do produto.
                </>
              ) : (
                `Tem certeza que deseja excluir o produto "${productToDelete?.name}"? Esta ação apagará também todos os módulos associados a ele.`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {productToDelete?._count?.contracts > 0 ? (
              <AlertDialogAction onClick={() => setProductToDelete(null)}>Entendi</AlertDialogAction>
            ) : (
              <>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => {
                    if (productToDelete) handleDelete(productToDelete.id);
                  }} 
                  className="bg-red-600 hover:bg-red-700"
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
