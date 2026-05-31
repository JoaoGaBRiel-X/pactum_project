'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
          <h1 className="text-3xl font-bold tracking-tight">Catálogo de Produtos</h1>
          <p className="text-muted-foreground">Gerencie os softwares e módulos.</p>
        </div>
        <Link href="/products/new">
          <Button>Novo Produto</Button>
        </Link>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Módulos</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">Carregando...</TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-red-500">
                  Erro ao carregar produtos: {error.message}
                </TableCell>
              </TableRow>
            )}
            {products?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">Nenhum produto cadastrado.</TableCell>
              </TableRow>
            )}
            {products?.map((product: any) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {product.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </TableCell>
                <TableCell>{product.modules?.length || 0} módulos</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link href={`/products/${product.id}/edit`}>
                      <Button variant="outline" size="sm" title="Editar Produto">
                        <Pencil size={16} />
                      </Button>
                    </Link>
                    <Button variant="destructive" size="sm" title="Excluir" onClick={() => handleDelete(product.id)}>
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
