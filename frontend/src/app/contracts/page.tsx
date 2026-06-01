'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Plus, FileSignature, AlertCircle, Pencil, Trash2, Eye, Search, Building2 } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

import { Card } from '@/components/ui/card';

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
      case 'PENDING_SIGNATURE': return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-semibold flex items-center gap-1 w-fit"><FileSignature size={12}/> Pendente</span>;
      case 'ACTIVE': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">Ativo</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <FileText className="text-primary w-8 h-8 hidden md:block" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Contratos</h1>
            <p className="text-slate-500 mt-1">Gerencie o ciclo de vida dos contratos SaaS.</p>
          </div>
        </div>
        <Link href="/contracts/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6">
            <Plus size={16} className="mr-2" /> Novo Contrato
          </Button>
        </Link>
      </div>

      <Card className="border-blue-200 shadow-sm bg-blue-50/40 overflow-hidden">
        <div className="bg-blue-100/50 border-b border-blue-200 px-6 py-4">
          <h2 className="text-base font-semibold flex items-center gap-2 text-blue-900">
            <Search size={18} className="text-blue-600"/> Filtros
          </h2>
          <p className="text-sm text-blue-700/80 mt-1">Refine a listagem de contratos.</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">Busca (Cliente/ID)</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Buscar contrato..." 
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
              <TableHead className="w-[30%] font-semibold text-slate-700 py-4 px-6">ID / Cliente</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4">Valor Total</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4">Renovação</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-700 py-4 px-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-slate-500 animate-pulse">Carregando contratos...</TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-red-500 flex flex-col items-center gap-2">
                  <AlertCircle size={24} />
                  Erro ao carregar contratos: {error.message}
                </TableCell>
              </TableRow>
            )}
            {contracts?.length === 0 && !isLoading && !error && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16 text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search size={32} className="text-slate-300 mb-2" />
                    <p className="text-base font-medium text-slate-600">Nenhum contrato cadastrado.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {contracts?.map((contract: any) => (
              <TableRow key={contract.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0 group">
                <TableCell className="px-6 py-4 font-medium text-slate-800">
                  <div className="text-xs text-muted-foreground mb-1 font-mono">{contract.id.split('-')[0]}</div>
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <Link href={`/contracts/${contract.id}`} className="text-slate-900 font-semibold group-hover:text-blue-700 transition-colors">
                      {contract.customer?.corporateName || contract.customerId.split('-')[0]}
                    </Link>
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-primary py-4">
                  R$ {Number(contract.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="py-4">
                  {contract.renewalMode === 'AUTOMATIC' ? 'Automática' : 'Manual'}
                </TableCell>
                <TableCell className="py-4">
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
