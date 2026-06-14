'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, AlertCircle, DollarSign, ArrowDownToLine, Calendar, FileText } from 'lucide-react';
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

export default function CommissionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: commissions, isLoading, error } = useQuery({
    queryKey: ['commissions'],
    queryFn: () => apiFetch('/representatives/commissions').catch(() => ([
      // Fallback/Mock até o endpoint existir
      { id: '1', representative: { name: 'João Consultoria' }, type: 'SETUP', amount: 350.00, status: 'PENDING', contract: { id: 'c1', customer: { corporateName: 'Restaurante Sabor' } }, date: new Date().toISOString() },
      { id: '2', representative: { name: 'Maria Vendas' }, type: 'RECURRING', amount: 85.50, status: 'PAID', contract: { id: 'c2', customer: { corporateName: 'Padaria Central' } }, date: new Date().toISOString() },
      { id: '3', representative: { name: 'João Consultoria' }, type: 'RECURRING', amount: 120.00, status: 'PAID', contract: { id: 'c3', customer: { corporateName: 'Pizzaria Napolitana' } }, date: new Date().toISOString() }
    ])),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pendente</Badge>;
      case 'PAID': return <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-none">Pago</Badge>;
      case 'CANCELLED': return <Badge className="bg-red-100 text-red-700 border border-red-200 shadow-none">Cancelado</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const filteredCommissions = commissions?.filter((c: any) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        (c.representative?.name && c.representative.name.toLowerCase().includes(term)) ||
        (c.contract?.customer?.corporateName && c.contract.customer.corporateName.toLowerCase().includes(term))
      );
    }
    return true;
  }) || [];

  const totalPending = filteredCommissions.filter((c: any) => c.status === 'PENDING').reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const totalPaid = filteredCommissions.filter((c: any) => c.status === 'PAID').reduce((acc: number, curr: any) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 pb-12 text-slate-800 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Extrato de Comissões</h1>
          <p className="text-slate-500 mt-1">Acompanhe os repasses e comissionamentos de representantes.</p>
        </div>
        <RequirePermissions permissions="representatives:manage">
          <Button className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-6 gap-2">
            <ArrowDownToLine size={18} /> Exportar Relatório
          </Button>
        </RequirePermissions>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-emerald-200 shadow-sm bg-emerald-50/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between pb-2">
              <p className="text-sm font-medium text-emerald-700">Comissões Pagas (Filtro Atual)</p>
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-bold text-emerald-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPaid)}
            </h2>
          </CardContent>
        </Card>
        
        <Card className="border-amber-200 shadow-sm bg-amber-50/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between pb-2">
              <p className="text-sm font-medium text-amber-700">Comissões Pendentes (Filtro Atual)</p>
              <DollarSign className="h-5 w-5 text-amber-500" />
            </div>
            <h2 className="text-3xl font-bold text-amber-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPending)}
            </h2>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold flex items-center gap-2 text-slate-700">
            <Search size={18} className="text-slate-500"/> Filtros
          </h2>
        </div>
        <div className="p-6">
          <div className="w-full md:max-w-md">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">Busca (Representante ou Cliente)</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar comissão..." 
                className="pl-9 border-slate-200 focus-visible:ring-amber-500" 
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
              <TableHead className="font-semibold text-slate-700 py-4 px-6">Data</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4">Parceiro</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4">Cliente (Contrato)</TableHead>
              <TableHead className="font-semibold text-center text-slate-700 py-4">Tipo</TableHead>
              <TableHead className="font-semibold text-right text-slate-700 py-4">Valor</TableHead>
              <TableHead className="font-semibold text-center text-slate-700 py-4 px-6">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500 animate-pulse">Carregando comissões...</TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-red-500 flex flex-col items-center gap-2">
                  <AlertCircle size={24} />
                  Erro ao carregar comissões: {error.message}
                </TableCell>
              </TableRow>
            )}
            {filteredCommissions.length === 0 && !isLoading && !error && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText size={32} className="text-slate-300 mb-2" />
                    <p className="text-base font-medium text-slate-600">Nenhuma comissão encontrada</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {filteredCommissions.map((commission: any) => (
              <TableRow key={commission.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0">
                <TableCell className="px-6 py-4 text-sm text-slate-600 flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" />
                  {new Date(commission.date).toLocaleDateString('pt-BR')}
                </TableCell>
                
                <TableCell className="py-4 font-semibold text-amber-700">
                  {commission.representative?.name}
                </TableCell>
                
                <TableCell className="py-4 text-sm text-slate-700">
                  {commission.contract?.customer?.corporateName}
                </TableCell>

                <TableCell className="text-center py-4 text-sm text-slate-600">
                  {commission.type === 'SETUP' ? 'Adesão (Setup)' : 'Recorrência'}
                </TableCell>
                
                <TableCell className="text-right py-4 font-medium text-slate-800">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(commission.amount)}
                </TableCell>

                <TableCell className="text-center px-6 py-4">
                  {getStatusBadge(commission.status)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
