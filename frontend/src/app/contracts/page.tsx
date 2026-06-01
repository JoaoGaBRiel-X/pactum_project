'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Plus, FileSignature, AlertCircle, Pencil, Trash2, Eye, Search, Building2 } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

export default function ContractsPage() {
  const { data: contracts, isLoading, error } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => apiFetch('/contracts'),
  });

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/contracts/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
    onError: (err: any) => {
      alert(`Erro ao excluir: ${err.message || 'Desconhecido'}`);
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir fisicamente este contrato em Rascunho? Essa ação é irreversível.')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT': return <span className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs font-semibold">Rascunho</span>;
      case 'PENDING_SIGNATURE': return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-semibold flex items-center gap-1"><FileSignature size={12}/> Pendente</span>;
      case 'ACTIVE': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">Ativo</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">{status}</span>;
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Carregando contratos...</div>;
  if (error) return <div className="p-8 text-center text-destructive flex items-center justify-center gap-2"><AlertCircle /> Erro ao carregar contratos.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="text-primary w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Contratos</h1>
            <p className="text-muted-foreground">Gerencie o ciclo de vida dos contratos SaaS.</p>
          </div>
        </div>
        <Link href="/contracts/new">
          <Button className="shadow-lg shadow-primary/30">
            <Plus size={16} className="mr-2" /> Novo Contrato
          </Button>
        </Link>
      </div>

      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-blue-800 font-semibold mb-2">
          <Search size={18} />
          <h2>Filtros</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">BUSCA (CLIENTE/ID)</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input placeholder="Buscar contrato..." className="pl-9 bg-white border-slate-200" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>ID / Cliente</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Renovação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum contrato cadastrado.
                </TableCell>
              </TableRow>
            )}
            {contracts?.map((contract: any) => (
              <TableRow key={contract.id} className="hover:bg-slate-50 transition-colors group">
                <TableCell className="font-medium text-slate-800">
                  <div className="text-xs text-muted-foreground mb-1">{contract.id.split('-')[0]}</div>
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <Link href={`/contracts/${contract.id}`} className="text-slate-900 font-semibold group-hover:text-blue-700 transition-colors">
                      {contract.customer?.corporateName || contract.customerId.split('-')[0]}
                    </Link>
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  R$ {Number(contract.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  {contract.renewalMode === 'AUTOMATIC' ? 'Automática' : 'Manual'}
                </TableCell>
                <TableCell>
                  {getStatusBadge(contract.status)}
                </TableCell>
                <TableCell className="text-right px-6 py-4">
                  {contract.status === 'DRAFT' ? (
                    <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Link href={`/contracts/${contract.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200 shadow-sm" title="Editar Rascunho">
                          <Pencil size={16} />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 bg-white border border-slate-200 shadow-sm" title="Excluir Rascunho" onClick={() => handleDelete(contract.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Link href={`/contracts/${contract.id}`}>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 bg-white border border-slate-200 shadow-sm" title="Ver Detalhes">
                          <Eye size={16} />
                        </Button>
                      </Link>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
