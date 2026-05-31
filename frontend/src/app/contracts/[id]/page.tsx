'use client';

import { useState, use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { FileText, ArrowLeft, RefreshCw, CheckCircle, Ban, Edit, Check } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContractHistoryTimeline } from '../components/ContractHistoryTimeline';
import { Input } from '@/components/ui/input';

export default function ContractDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editDiscount, setEditDiscount] = useState<number>(0);
  const [statusReason, setStatusReason] = useState<string>('');
  const [showStatusPrompt, setShowStatusPrompt] = useState<{ active: boolean, action: string, targetStatus: string }>({ active: false, action: '', targetStatus: '' });

  const { data: contract, isLoading } = useQuery({
    queryKey: ['contracts', id],
    queryFn: () => apiFetch(`/contracts/${id}`),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { status: string, reason: string }) => apiFetch(`/contracts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts', id] });
      setShowStatusPrompt({ active: false, action: '', targetStatus: '' });
      setStatusReason('');
    }
  });

  const updateDraftMutation = useMutation({
    mutationFn: (data: { globalDiscount: number }) => apiFetch(`/contracts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts', id] });
      setIsEditing(false);
    }
  });

  const generateDocMutation = useMutation({
    mutationFn: () => apiFetch(`/contracts/${id}/generate-document`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contracts', id] })
  });

  if (isLoading) return <div className="p-8 text-center">Carregando detalhes...</div>;
  if (!contract) return <div className="p-8 text-center text-red-500">Contrato não encontrado.</div>;

  const handleUpdateStatus = () => {
    updateStatusMutation.mutate({ status: showStatusPrompt.targetStatus, reason: statusReason || 'Alteração via portal' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT': return <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm font-semibold">Rascunho</span>;
      case 'PENDING_SIGNATURE': return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">Pendente Assinatura</span>;
      case 'ACTIVE': return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1"><CheckCircle size={14}/> Ativo</span>;
      case 'SUSPENDED': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">Suspenso</span>;
      case 'CANCELLED': return <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm font-semibold flex items-center gap-1"><Ban size={14}/> Cancelado</span>;
      default: return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold">{status}</span>;
    }
  };

  const isDraft = contract.status === 'DRAFT';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/contracts">
          <Button variant="outline" size="icon"><ArrowLeft size={16} /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              Contrato #{contract.id.split('-')[0]}
            </h1>
            {getStatusBadge(contract.status)}
          </div>
          <p className="text-muted-foreground">Cliente: {contract.customerId}</p>
        </div>

        <div className="flex items-center gap-2">
          {isDraft && (
            <Button 
              className="bg-primary"
              onClick={() => setShowStatusPrompt({ active: true, action: 'Enviar p/ Assinatura', targetStatus: 'PENDING_SIGNATURE' })}
            >
              <FileText size={16} className="mr-2" /> Enviar para Assinatura
            </Button>
          )}
          {['DRAFT', 'PENDING_SIGNATURE'].includes(contract.status) && (
            <Button 
              variant="default"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setShowStatusPrompt({ active: true, action: 'Ativar Contrato', targetStatus: 'ACTIVE' })}
            >
              <CheckCircle size={16} className="mr-2" /> Ativar
            </Button>
          )}
          {contract.status === 'ACTIVE' && (
            <>
              <Button variant="outline" onClick={() => setShowStatusPrompt({ active: true, action: 'Suspender', targetStatus: 'SUSPENDED' })}>Suspender</Button>
              <Button variant="destructive" onClick={() => setShowStatusPrompt({ active: true, action: 'Cancelar', targetStatus: 'CANCELLED' })}>Cancelar</Button>
            </>
          )}
        </div>
      </div>

      {showStatusPrompt.active && (
        <div className="bg-slate-50 p-4 rounded-xl border border-border shadow-sm flex items-end gap-4 animate-in slide-in-from-top-2">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Motivo / Justificativa para {showStatusPrompt.action}</label>
            <Input 
              placeholder="Ex: Assinado pelo cliente via Clicksign"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={() => setShowStatusPrompt({ active: false, action: '', targetStatus: '' })}>Cancelar</Button>
          <Button onClick={handleUpdateStatus} disabled={updateStatusMutation.isPending}>
            {updateStatusMutation.isPending ? 'Salvando...' : 'Confirmar'}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <Tabs defaultValue="details" className="w-full">
              <div className="bg-slate-50 border-b border-border px-4 py-2">
                <TabsList>
                  <TabsTrigger value="details">Detalhes & Valores</TabsTrigger>
                  <TabsTrigger value="items">Módulos</TabsTrigger>
                  <TabsTrigger value="docs">Documentos</TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="details" className="mt-0 space-y-6">
                  <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Produto</h4>
                      <p className="text-lg font-semibold">{contract.productId}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Renovação</h4>
                      <p className="font-medium flex items-center gap-2">
                        <RefreshCw size={14} className="text-primary"/>
                        {contract.renewalMode === 'AUTOMATIC' ? 'Automática' : 'Manual'}
                      </p>
                    </div>
                    
                    <div className="col-span-2 border-t pt-4 mt-2">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Resumo Financeiro</h4>
                        {isDraft && !isEditing && (
                          <Button variant="ghost" size="sm" onClick={() => { setIsEditing(true); setEditDiscount(Number(contract.globalDiscount)); }}>
                            <Edit size={14} className="mr-1" /> Editar
                          </Button>
                        )}
                      </div>
                      
                      <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Subtotal</span>
                          <span>R$ {Number(Number(contract.totalValue) + Number(contract.globalDiscount)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Desconto Global</span>
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <span>R$</span>
                              <Input 
                                type="number" 
                                className="w-24 h-8" 
                                value={editDiscount} 
                                onChange={(e) => setEditDiscount(Number(e.target.value))} 
                              />
                            </div>
                          ) : (
                            <span className="text-red-500">- R$ {Number(contract.globalDiscount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          )}
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                          <span>Total</span>
                          <span className="text-primary">R$ {isEditing 
                            ? (Number(contract.totalValue) + Number(contract.globalDiscount) - editDiscount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                            : Number(contract.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                          }</span>
                        </div>

                        {isEditing && (
                          <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancelar</Button>
                            <Button size="sm" onClick={() => updateDraftMutation.mutate({ globalDiscount: editDiscount })} disabled={updateDraftMutation.isPending}>
                              <Check size={14} className="mr-1" /> Salvar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="items" className="mt-0">
                  {contract.items?.length === 0 ? (
                    <p className="text-muted-foreground">Nenhum módulo selecionado.</p>
                  ) : (
                    <div className="space-y-3">
                      {contract.items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg bg-slate-50/50">
                          <div>
                            <p className="font-medium">{item.moduleId}</p>
                            <p className="text-sm text-muted-foreground">Qtd: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">R$ {Number(item.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            {Number(item.discount) > 0 && <p className="text-xs text-red-500">Desc: R$ {Number(item.discount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="docs" className="mt-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Documentos Gerados</h3>
                    <Button variant="outline" size="sm" onClick={() => generateDocMutation.mutate()} disabled={generateDocMutation.isPending}>
                      {generateDocMutation.isPending ? 'Gerando...' : 'Gerar DOCX'}
                    </Button>
                  </div>
                  {/* Ideally list docs here from contract.documents relation */}
                  <div className="text-sm text-muted-foreground italic border-t pt-4">
                    Nenhum documento pronto ainda. Clique em gerar.
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-border shadow-sm p-6">
            <h3 className="font-semibold text-lg mb-4">Histórico</h3>
            <ContractHistoryTimeline events={contract.history || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
