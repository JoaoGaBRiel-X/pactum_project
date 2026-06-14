'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Pencil, Trash2, Search, AlertCircle, PlusCircle, Briefcase, Key } from 'lucide-react';
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

export default function RepresentativesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [representativeToDelete, setRepresentativeToDelete] = useState<any>(null);
  
  const { data: representatives, isLoading, error } = useQuery({
    queryKey: ['representatives'],
    queryFn: () => apiFetch('/representatives'),
  });

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/representatives/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['representatives'] });
    },
    onError: (err: any) => {
      alert(`Erro ao excluir: ${err.message || 'Desconhecido'}`);
    }
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
    setRepresentativeToDelete(null);
  };

  const filteredRepresentatives = representatives?.filter((r: any) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        (r.name && r.name.toLowerCase().includes(term)) ||
        (r.document && r.document.includes(term)) ||
        (r.email && r.email.toLowerCase().includes(term))
      );
    }
    return true;
  }) || [];

  return (
    <div className="space-y-6 pb-12 text-slate-800 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestão de Representantes</h1>
          <p className="text-slate-500 mt-1">Gerencie seus parceiros de vendas, taxas de comissionamento e chaves PIX.</p>
        </div>
        <RequirePermissions permissions="representatives:manage">
          <Link href="/representatives/new">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-6 gap-2">
              <PlusCircle size={18} /> Novo Parceiro
            </Button>
          </Link>
        </RequirePermissions>
      </div>

      <Card className="border-amber-100 shadow-sm bg-amber-50/30 overflow-hidden">
        <div className="bg-amber-50/80 border-b border-amber-100 px-6 py-4">
          <h2 className="text-base font-semibold flex items-center gap-2 text-amber-900">
            <Search size={18} className="text-amber-600"/> Filtros
          </h2>
        </div>
        <div className="p-6">
          <div className="w-full md:max-w-md">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">Busca (Nome, E-mail ou CPF/CNPJ)</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar parceiro..." 
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
              <TableHead className="font-semibold text-slate-700 py-4 px-6">Representante</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4">Contato</TableHead>
              <TableHead className="font-semibold text-center text-slate-700 py-4">Taxa Setup</TableHead>
              <TableHead className="font-semibold text-center text-slate-700 py-4">Taxa Recorrência</TableHead>
              <TableHead className="text-right font-semibold text-slate-700 py-4 px-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-slate-500 animate-pulse">Carregando parceiros...</TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-red-500 flex flex-col items-center gap-2">
                  <AlertCircle size={24} />
                  Erro ao carregar parceiros: {error.message}
                </TableCell>
              </TableRow>
            )}
            {filteredRepresentatives.length === 0 && !isLoading && !error && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16 text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Briefcase size={32} className="text-slate-300 mb-2" />
                    <p className="text-base font-medium text-slate-600">Nenhum parceiro encontrado</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {filteredRepresentatives.map((rep: any) => (
              <TableRow key={rep.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0 group">
                <TableCell className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-amber-700 flex items-center gap-2">
                      <Briefcase size={16} className="text-amber-400" />
                      {rep.name}
                    </span>
                    <span className="text-xs text-slate-500 font-mono mt-1 ml-6">{rep.document}</span>
                    {!rep.isActive && (
                      <Badge variant="secondary" className="mt-1 ml-6 w-fit bg-slate-200">Inativo</Badge>
                    )}
                  </div>
                </TableCell>
                
                <TableCell className="py-4">
                  <div className="flex flex-col text-sm">
                    <span className="font-medium text-slate-700">{rep.email || '-'}</span>
                    {rep.phone && (
                      <span className="text-slate-500 mt-1 text-xs">
                        {rep.phone}
                      </span>
                    )}
                  </div>
                </TableCell>
                
                <TableCell className="text-center py-4 font-mono font-medium text-slate-600">
                  {rep.setupFeeCommissionPercentage}%
                </TableCell>

                <TableCell className="text-center py-4 font-mono font-medium text-slate-600">
                  {rep.recurringCommissionPercentage}%
                </TableCell>
                
                <TableCell className="text-right px-6 py-4">
                  <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <RequirePermissions permissions="representatives:manage">
                      <Link href={`/representatives/${rep.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-amber-600 hover:bg-amber-50 bg-white border border-slate-200 shadow-sm rounded-md" title="Editar Representante">
                          <Pencil size={14} />
                        </Button>
                      </Link>
                    </RequirePermissions>
                    <RequirePermissions permissions="representatives:manage">
                      <Button variant="ghost" size="icon" onClick={() => setRepresentativeToDelete(rep)} className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 bg-white border border-slate-200 shadow-sm rounded-md" title="Excluir Representante">
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

      <AlertDialog open={!!representativeToDelete} onOpenChange={(open) => !open && setRepresentativeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Representante?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o parceiro "{representativeToDelete?.name}"? Ações de comissionamento associadas podem perder referência nominal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (representativeToDelete) handleDelete(representativeToDelete.id);
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
