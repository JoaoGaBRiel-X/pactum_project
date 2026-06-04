'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Plus, FileSignature, AlertCircle, Pencil, Trash2, Eye, Search, Building2, CalendarDays, Filter } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { RequirePermissions } from '@/components/auth/RequirePermissions';

export default function ContractsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

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
      case 'DRAFT': return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-md text-[11px] font-bold uppercase tracking-wider shadow-sm">Rascunho</span>;
      case 'PENDING_APPROVAL': return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 border border-amber-300 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit shadow-sm"><AlertCircle size={12}/> Aguard. Aprovação</span>;
      case 'PENDING_SIGNATURE': return <span className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit shadow-sm"><FileSignature size={12}/> Pendente Assin.</span>;
      case 'ACTIVE': return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-md text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 w-fit"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Ativo</span>;
      case 'CANCELLED': return <span className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-md text-[11px] font-bold uppercase tracking-wider shadow-sm">Cancelado</span>;
      default: return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-[11px] font-bold uppercase tracking-wider shadow-sm">{status}</span>;
    }
  };

  const filteredContracts = useMemo(() => {
    if (!contracts) return [];
    return contracts.filter((c: any) => {
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const term = searchTerm.toLowerCase();
      const matchSearch = term === '' 
        || c.id.toLowerCase().includes(term)
        || c.customerId.toLowerCase().includes(term)
        || c.customer?.corporateName?.toLowerCase().includes(term)
        || c.customer?.document?.toLowerCase().includes(term);
      return matchStatus && matchSearch;
    });
  }, [contracts, searchTerm, statusFilter]);

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
        <RequirePermissions permissions="contracts:create">
          <Link href="/contracts/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6">
              <Plus size={16} className="mr-2" /> Novo Contrato
            </Button>
          </Link>
        </RequirePermissions>
      </div>

      <Card className="border-indigo-100 shadow-sm bg-white overflow-hidden rounded-2xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -z-10 pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="bg-gradient-to-r from-indigo-50/80 to-white/20 border-b border-indigo-100/50 px-6 py-4 backdrop-blur-sm">
          <h2 className="text-sm font-bold flex items-center gap-2 text-indigo-900 tracking-wide">
            <Filter size={16} className="text-indigo-600"/> Filtros
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Busca (Cliente/CNPJ/ID)</label>
              <div className="relative group">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <Input 
                  placeholder="Ex: Empresa Silva, 12.345.678/0001-90..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-all shadow-sm rounded-lg h-10 text-sm" 
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Status do Contrato</label>
              <div className="relative">
                <select 
                  className="w-full border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm rounded-lg h-10 px-3 text-sm text-slate-700 appearance-none outline-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">Todos os Status</option>
                  <option value="DRAFT">Rascunho</option>
                  <option value="PENDING_SIGNATURE">Pendente de Assinatura</option>
                  <option value="ACTIVE">Ativo</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
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
            {filteredContracts?.length === 0 && !isLoading && !error && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16 text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search size={32} className="text-slate-200 mb-2" />
                    <p className="text-sm font-medium text-slate-500">Nenhum contrato encontrado para os filtros selecionados.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {filteredContracts?.map((contract: any) => (
              <TableRow key={contract.id} className="hover:bg-indigo-50/30 transition-colors border-b border-slate-100 last:border-0 group">
                <TableCell className="px-6 py-4 font-medium text-slate-800">
                  <div className="text-[10px] text-slate-400 mb-1 font-mono uppercase tracking-widest">{contract.id.split('-')[0]}</div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                      <Building2 size={14} className="text-slate-500 group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <div className="flex flex-col">
                      <Link href={`/contracts/${contract.id}`} className="text-slate-900 font-semibold group-hover:text-indigo-700 transition-colors text-sm">
                        {contract.customer?.corporateName || contract.customerId.split('-')[0]}
                      </Link>
                      <span className="text-[11px] text-slate-500">{contract.customer?.document || 'CNPJ não informado'}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 text-sm">
                      R$ {Number(contract.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">Por Mês</span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                    <CalendarDays size={14} className="text-slate-400" />
                    {contract.renewalMode === 'AUTOMATIC' ? 'Automática' : 'Manual'}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  {getStatusBadge(contract.status)}
                </TableCell>
                <TableCell className="text-right px-6 py-4">
                  {contract.status === 'DRAFT' ? (
                    <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      <RequirePermissions permissions="contracts:update">
                        <Link href={`/contracts/${contract.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 bg-white border border-slate-200 shadow-sm rounded-md" title="Editar Rascunho">
                            <Pencil size={14} />
                          </Button>
                        </Link>
                      </RequirePermissions>
                      <RequirePermissions permissions="contracts:delete">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 bg-white border border-slate-200 shadow-sm rounded-md" title="Excluir Rascunho" onClick={() => handleDelete(contract.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </RequirePermissions>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Link href={`/contracts/${contract.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 bg-white border border-slate-200 shadow-sm rounded-md" title="Ver Detalhes">
                          <Eye size={14} />
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
