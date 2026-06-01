'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Search, Box } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';

import { Card } from '@/components/ui/card';

export default function ProductsPage() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiFetch('/products'),
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
    if (window.confirm('Tem certeza que deseja excluir este produto? Se houver contratos vinculados a ação falhará.')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Catálogo de Produtos</h1>
          <p className="text-slate-500 mt-1">Gerencie os softwares e módulos.</p>
        </div>
        <Link href="/products/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6">Novo Produto</Button>
        </Link>
      </div>

      <Card className="border-blue-200 shadow-sm bg-blue-50/40 overflow-hidden">
        <div className="bg-blue-100/50 border-b border-blue-200 px-6 py-4">
          <h2 className="text-base font-semibold flex items-center gap-2 text-blue-900">
            <Search size={18} className="text-blue-600"/> Filtros
          </h2>
          <p className="text-sm text-blue-700/80 mt-1">Refine a listagem do catálogo de produtos.</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">Busca (Nome)</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Buscar produto..." 
                  className="pl-9 border-slate-200 focus-visible:ring-blue-500" 
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
              <TableHead className="w-[40%] font-semibold text-slate-700 py-4 px-6">Nome do Produto</TableHead>
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
                    <p className="text-base font-medium text-slate-600">Nenhum produto cadastrado.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {products?.map((product: any) => (
              <TableRow key={product.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0 group">
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Box size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <Link href={`/products/${product.id}/edit`} className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                      {product.name}
                    </Link>
                  </div>
                </TableCell>
                <TableCell className="text-center py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {product.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </TableCell>
                <TableCell className="text-center text-slate-600 font-medium py-4">{product.modules?.length || 0}</TableCell>
                <TableCell className="text-right px-6 py-4">
                  <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Link href={`/products/${product.id}/edit`}>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200 shadow-sm" title="Editar Produto">
                        <Pencil size={16} />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 bg-white border border-slate-200 shadow-sm" title="Excluir Produto" onClick={() => handleDelete(product.id)}>
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
