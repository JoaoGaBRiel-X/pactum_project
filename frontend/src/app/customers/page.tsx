'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function CustomersPage() {
  const { data: customers, isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: () => apiFetch('/customers'),
  });

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/customers/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (err: any) => {
      alert(`Erro ao excluir: ${err.message || 'Desconhecido'}`);
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente? Se houver contratos vinculados a ação falhará.')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Clientes</h1>
          <p className="text-muted-foreground">Gerencie as empresas cadastradas no sistema.</p>
        </div>
        <Link href="/customers/new">
          <Button>Novo Cliente</Button>
        </Link>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CNPJ</TableHead>
              <TableHead>Razão Social</TableHead>
              <TableHead>Contatos</TableHead>
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
                  Erro ao carregar clientes: {error.message}
                </TableCell>
              </TableRow>
            )}
            {customers?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">Nenhum cliente cadastrado.</TableCell>
              </TableRow>
            )}
            {customers?.map((customer: any) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.document}</TableCell>
                <TableCell>{customer.corporateName}</TableCell>
                <TableCell>{customer.contacts?.length || 0} contatos</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link href={`/customers/${customer.id}/edit`}>
                      <Button variant="outline" size="sm" title="Editar Cliente">
                        <Pencil size={16} />
                      </Button>
                    </Link>
                    <Button variant="destructive" size="sm" title="Excluir" onClick={() => handleDelete(customer.id)}>
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
