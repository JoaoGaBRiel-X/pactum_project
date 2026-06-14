'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Pencil, Trash2, Search, AlertCircle, PlusCircle, Building2, Phone, Eye } from 'lucide-react';
import { RequirePermissions } from '@/components/auth/RequirePermissions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Badge } from '@/components/ui/badge';

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [leadToDelete, setLeadToDelete] = useState<any>(null);
  
  const { data: leads, isLoading, error } = useQuery({
    queryKey: ['leads'],
    queryFn: () => apiFetch('/crm/leads'),
  });

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/crm/leads/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (err: any) => {
      alert(`Erro ao excluir: ${err.message || 'Desconhecido'}`);
    }
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
    setLeadToDelete(null);
  };

  const filteredLeads = leads?.filter((l: any) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        (l.companyName && l.companyName.toLowerCase().includes(term)) ||
        (l.contactName && l.contactName.toLowerCase().includes(term)) ||
        (l.document && l.document.includes(term))
      );
    }
    return true;
  }) || [];

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestão de Leads</h1>
          <p className="text-slate-500 mt-1">Acompanhe potenciais clientes antes da conversão.</p>
        </div>
        <RequirePermissions permissions="crm:manage">
          <Link href="/crm/leads/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 gap-2">
              <PlusCircle size={18} /> Novo Lead
            </Button>
          </Link>
        </RequirePermissions>
      </div>

      <Card className="border-indigo-200 shadow-sm bg-indigo-50/40 overflow-hidden">
        <div className="bg-indigo-100/50 border-b border-indigo-200 px-6 py-4">
          <h2 className="text-base font-semibold flex items-center gap-2 text-indigo-900">
            <Search size={18} className="text-indigo-600"/> Filtros
          </h2>
          <p className="text-sm text-indigo-700/80 mt-1">Refine a listagem de leads usando os critérios abaixo.</p>
        </div>
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">Busca (Empresa, Contato ou CNPJ)</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Buscar lead..." 
                    className="pl-9 border-slate-200 focus-visible:ring-indigo-500" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
              <TableHead className="font-semibold text-slate-700 py-4 px-6">Empresa</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4">Contato</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4">Segmento</TableHead>
              <TableHead className="font-semibold text-center text-slate-700 py-4">Oportunidades</TableHead>
              <TableHead className="text-right font-semibold text-slate-700 py-4 px-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-slate-500 animate-pulse">Carregando leads...</TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-red-500 flex flex-col items-center gap-2">
                  <AlertCircle size={24} />
                  Erro ao carregar leads: {error.message}
                </TableCell>
              </TableRow>
            )}
            {filteredLeads.length === 0 && !isLoading && !error && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16 text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search size={32} className="text-slate-300 mb-2" />
                    <p className="text-base font-medium text-slate-600">Nenhum lead encontrado</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {filteredLeads.map((lead: any) => (
              <TableRow key={lead.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0 group">
                <TableCell className="px-6 py-4">
                  <div className="flex flex-col">
                    <Link href={`/crm/leads/${lead.id}/edit`} className="font-semibold text-indigo-700 hover:text-indigo-900 hover:underline transition-colors flex items-center gap-2">
                      <Building2 size={16} className="text-indigo-400" />
                      {lead.companyName}
                    </Link>
                    {lead.document && (
                      <span className="text-xs text-slate-500 font-mono mt-1 ml-6">{lead.document}</span>
                    )}
                  </div>
                </TableCell>
                
                <TableCell className="py-4">
                  <div className="flex flex-col text-sm">
                    <span className="font-medium text-slate-700">{lead.contactName || '-'}</span>
                    {lead.whatsapp && (
                      <span className="text-slate-500 flex items-center gap-1 mt-1 text-xs">
                        <Phone size={12} /> {lead.whatsapp}
                      </span>
                    )}
                  </div>
                </TableCell>
                
                <TableCell className="py-4">
                  {lead.segment ? (
                    <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                      {lead.segment}
                    </Badge>
                  ) : (
                    <span className="text-slate-400 text-sm">-</span>
                  )}
                </TableCell>

                <TableCell className="text-center py-4">
                  <Badge className="bg-emerald-100/80 text-emerald-700 border border-emerald-200">
                    {lead.opportunities?.length || 0} Abertas
                  </Badge>
                </TableCell>
                
                <TableCell className="text-right px-6 py-4">
                  <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <RequirePermissions permissions="crm:manage">
                      <Link href={`/crm/leads/${lead.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 bg-white border border-slate-200 shadow-sm rounded-md" title="Ver Detalhes">
                          <Eye size={14} />
                        </Button>
                      </Link>
                    </RequirePermissions>
                    <RequirePermissions permissions="crm:manage">
                      <Link href={`/crm/leads/${lead.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 bg-white border border-slate-200 shadow-sm rounded-md" title="Editar Lead">
                          <Pencil size={14} />
                        </Button>
                      </Link>
                    </RequirePermissions>
                    <RequirePermissions permissions="crm:manage">
                      <Button variant="ghost" size="icon" onClick={() => setLeadToDelete(lead)} className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 bg-white border border-slate-200 shadow-sm rounded-md" title="Excluir Lead">
                        <Trash2 size={14} />
                      </Button>
                    </RequirePermissions>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!leadToDelete} onOpenChange={(open) => !open && setLeadToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Lead?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o lead "{leadToDelete?.companyName}"? Esta ação é irreversível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (leadToDelete) handleDelete(leadToDelete.id);
              }} 
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
