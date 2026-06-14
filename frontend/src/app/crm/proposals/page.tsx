'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, AlertCircle, PlusCircle, FileText, Download, CheckCircle, Clock } from 'lucide-react';
import { RequirePermissions } from '@/components/auth/RequirePermissions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function ProposalsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: proposals, isLoading, error } = useQuery({
    queryKey: ['proposals'],
    queryFn: () => apiFetch('/crm/proposals').catch(() => ([
      // Fallback/Mock até endpoint existir
      { id: '1', number: 'PRP-2023-001', opportunity: { name: 'Restaurante Sabor' }, totalValue: 1500, status: 'DRAFT', createdAt: new Date().toISOString() },
      { id: '2', number: 'PRP-2023-002', opportunity: { name: 'Padaria Pão Quente' }, totalValue: 850, status: 'SENT', createdAt: new Date().toISOString() },
      { id: '3', number: 'PRP-2023-003', opportunity: { name: 'Pizzaria Napolitana' }, totalValue: 2200, status: 'ACCEPTED', createdAt: new Date().toISOString() }
    ])),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">Rascunho</Badge>;
      case 'SENT': return <Badge className="bg-blue-100 text-blue-700 border border-blue-200 shadow-none"><Clock size={12} className="mr-1"/> Enviada</Badge>;
      case 'ACCEPTED': return <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-none"><CheckCircle size={12} className="mr-1"/> Aceita</Badge>;
      case 'REJECTED': return <Badge className="bg-red-100 text-red-700 border border-red-200 shadow-none">Rejeitada</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const filteredProposals = proposals?.filter((p: any) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        (p.number && p.number.toLowerCase().includes(term)) ||
        (p.opportunity?.name && p.opportunity.name.toLowerCase().includes(term))
      );
    }
    return true;
  }) || [];

  return (
    <div className="space-y-6 pb-12 text-slate-800 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Propostas Comerciais</h1>
          <p className="text-slate-500 mt-1">Crie propostas para suas oportunidades e gere PDFs automatizados.</p>
        </div>
        <RequirePermissions permissions="crm:manage">
          <Link href="/crm/proposals/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 gap-2">
              <PlusCircle size={18} /> Nova Proposta
            </Button>
          </Link>
        </RequirePermissions>
      </div>

      <Card className="border-indigo-100 shadow-sm bg-indigo-50/30 overflow-hidden">
        <div className="bg-indigo-50/80 border-b border-indigo-100 px-6 py-4">
          <h2 className="text-base font-semibold flex items-center gap-2 text-indigo-900">
            <Search size={18} className="text-indigo-600"/> Filtros
          </h2>
        </div>
        <div className="p-6">
          <div className="w-full md:max-w-md">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">Busca (Número ou Oportunidade)</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar proposta..." 
                className="pl-9 border-slate-200 focus-visible:ring-indigo-500" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-slate-700 py-4 px-6">Número</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4">Oportunidade</TableHead>
              <TableHead className="font-semibold text-center text-slate-700 py-4">Valor Total</TableHead>
              <TableHead className="font-semibold text-center text-slate-700 py-4">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-700 py-4 px-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-slate-500 animate-pulse">Carregando propostas...</TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-red-500 flex flex-col items-center gap-2">
                  <AlertCircle size={24} />
                  Erro ao carregar propostas: {error.message}
                </TableCell>
              </TableRow>
            )}
            {filteredProposals.length === 0 && !isLoading && !error && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16 text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText size={32} className="text-slate-300 mb-2" />
                    <p className="text-base font-medium text-slate-600">Nenhuma proposta encontrada</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {filteredProposals.map((proposal: any) => (
              <TableRow key={proposal.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0 group">
                <TableCell className="px-6 py-4 font-mono text-sm font-semibold text-indigo-700">
                  {proposal.number}
                </TableCell>
                
                <TableCell className="py-4 font-medium text-slate-700">
                  {proposal.opportunity?.name}
                </TableCell>
                
                <TableCell className="text-center py-4 font-medium text-slate-700">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.totalValue)}
                </TableCell>

                <TableCell className="text-center py-4">
                  {getStatusBadge(proposal.status)}
                </TableCell>
                
                <TableCell className="text-right px-6 py-4">
                  <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 bg-white border border-slate-200 shadow-sm rounded-md" title="Baixar PDF">
                      <Download size={14} />
                    </Button>
                    {proposal.status === 'ACCEPTED' && (
                      <RequirePermissions permissions="contracts:create">
                        <Button variant="ghost" size="sm" className="h-8 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 bg-white border border-slate-200 shadow-sm rounded-md font-medium text-xs px-3 ml-2" title="Gerar Contrato a partir desta Proposta">
                          Gerar Contrato
                        </Button>
                      </RequirePermissions>
                    )}
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
