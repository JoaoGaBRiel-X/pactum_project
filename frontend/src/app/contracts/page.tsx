'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Plus, FileSignature, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ContractsPage() {
  const { data: contracts, isLoading, error } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => apiFetch('/contracts'),
  });

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
              <TableRow key={contract.id} className="hover:bg-slate-50 transition-colors">
                <TableCell className="font-medium text-slate-800">
                  <div className="text-xs text-muted-foreground">{contract.id.split('-')[0]}</div>
                  {/* Ideally fetch customer name, but for now we just show customer ID or wait for relation */}
                  Cliente: {contract.customerId.substring(0, 8)}...
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
                <TableCell>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">Ver Detalhes</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
