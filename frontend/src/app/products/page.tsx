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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Catálogo de Produtos</h1>
          <p className="text-muted-foreground">Gerencie os softwares e módulos.</p>
        </div>
        <Link href="/products/new">
          <Button>Novo Produto</Button>
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
              <Input placeholder="Buscar produto..." className="pl-9 bg-white border-slate-200" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="font-semibold text-slate-700">Nome do Produto</TableHead>
              <TableHead className="font-semibold text-slate-700 text-center">Status</TableHead>
              <TableHead className="font-semibold text-slate-700 text-center">Módulos</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Carregando...</TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-destructive">
                  Erro ao carregar produtos: {error.message}
                </TableCell>
              </TableRow>
            )}
            {products?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Nenhum produto cadastrado.</TableCell>
              </TableRow>
            )}
            {products?.map((product: any) => (
              <TableRow key={product.id} className="hover:bg-slate-50/50 group">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Box size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <Link href={`/products/${product.id}/edit`} className="text-slate-900 font-semibold group-hover:text-blue-700 transition-colors">
                      {product.name}
                    </Link>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {product.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </TableCell>
                <TableCell className="text-center text-slate-600 font-medium">{product.modules?.length || 0}</TableCell>
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
