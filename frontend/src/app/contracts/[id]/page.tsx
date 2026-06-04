'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { FileText, ArrowLeft, Play, RefreshCw, FileSignature, Upload, Send, Plus, AlertCircle, Trash2 } from 'lucide-react';
import { use, useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { IMaskInput } from 'react-imask';
import { toast } from 'sonner';

export default function ContractDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const contractId = resolvedParams.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isRenewalOpen, setIsRenewalOpen] = useState(false);
  const [manualRate, setManualRate] = useState<number | ''>('');
  
  const [isAmendOpen, setIsAmendOpen] = useState(false);
  const [amendItems, setAmendItems] = useState<any[]>([]);
  const [amendGlobalDiscount, setAmendGlobalDiscount] = useState<number>(0);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  const { data: contract, isLoading } = useQuery({
    queryKey: ['contracts', contractId],
    queryFn: () => apiFetch(`/contracts/${contractId}`),
  });

  const { data: indexes } = useQuery({
    queryKey: ['adjustments-indexes'],
    queryFn: () => apiFetch('/adjustments/indexes'),
  });

  const { data: templates } = useQuery({
    queryKey: ['templates'],
    queryFn: () => apiFetch('/documents/templates').catch(() => []),
  });

  const { data: tenantSettings } = useQuery({
    queryKey: ['tenant-settings'],
    queryFn: () => apiFetch('/tenant-settings').catch(() => null),
  });

  const generateDocMutation = useMutation({
    mutationFn: (templateId: string) => apiFetch('/documents/generate', {
      method: 'POST',
      body: JSON.stringify({ contractId, templateId }),
    }),
    onSuccess: () => {
      toast.success('Contrato gerado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['contracts', contractId] });
    },
    onError: (err: any) => {
      toast.error(`Erro ao gerar documento: ${err.message}`);
    }
  });

  const manualSignMutation = useMutation({
    mutationFn: (docId: string) => apiFetch(`/documents/${docId}/manual-sign`, { method: 'POST' }),
    onSuccess: () => {
      toast.success('Documento assinado manualmente!');
      queryClient.invalidateQueries({ queryKey: ['contracts', contractId] });
    }
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (docId: string) => apiFetch(`/documents/${docId}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Documento removido com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['contracts', contractId] });
    },
    onError: (err: any) => {
      toast.error(`Erro ao remover documento: ${err.message}`);
    }
  });

  const sendForSignatureMutation = useMutation({
    mutationFn: () => apiFetch(`/contracts/${contractId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'PENDING_SIGNATURE', reason: 'Enviado para assinatura do cliente' }),
    }),
    onSuccess: () => {
      toast.success('Contrato enviado para assinatura (Status atualizado)!');
      queryClient.invalidateQueries({ queryKey: ['contracts', contractId] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
    onError: (err: any) => {
      toast.error(`Erro ao enviar para assinatura: ${err.message}`);
    }
  });

  const activateMutation = useMutation({
    mutationFn: () => apiFetch(`/contracts/${contractId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'ACTIVE', reason: 'Ativado manualmente via sistema' }),
    }),
    onSuccess: () => {
      toast.success('Contrato ativado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['contracts', contractId] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
    onError: (err: any) => {
      toast.error(`Erro ao ativar: ${err.message}`);
    }
  });

  const renewalMutation = useMutation({
    mutationFn: (percentage: number) => apiFetch(`/adjustments/contracts/${contractId}/manual`, {
      method: 'POST',
      body: JSON.stringify({ percentage }),
    }),
    onSuccess: () => {
      toast.success('Contrato renovado/reajustado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['contracts', contractId] });
      setIsRenewalOpen(false);
    },
    onError: (err: any) => {
      toast.error(`Erro ao reajustar: ${err.message}`);
    }
  });

  const amendMutation = useMutation({
    mutationFn: (data: any) => apiFetch(`/contracts/${contractId}/amend`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast.success('Aditivo pendente gerado com sucesso! Um novo status aguarda assinatura/aprovação.');
      queryClient.invalidateQueries({ queryKey: ['contracts', contractId] });
      setIsAmendOpen(false);
    },
    onError: (err: any) => toast.error(`Erro ao gerar aditivo: ${err.message}`)
  });

  const applyAmendmentMutation = useMutation({
    mutationFn: () => apiFetch(`/contracts/${contractId}/amend/apply`, { method: 'POST' }),
    onSuccess: () => {
      toast.success('Aditivo aplicado e contrato atualizado!');
      queryClient.invalidateQueries({ queryKey: ['contracts', contractId] });
    },
    onError: (err: any) => toast.error(`Erro ao aplicar aditivo: ${err.message}`)
  });

  const cancelMutation = useMutation({
    mutationFn: () => apiFetch(`/contracts/${contractId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'CANCELLED', reason: 'Cancelamento solicitado pelo usuário' }),
    }),
    onSuccess: () => {
      toast.success('Contrato cancelado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['contracts', contractId] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      setIsCancelOpen(false);
    },
    onError: (err: any) => toast.error(`Erro ao cancelar: ${err.message}`)
  });

  const currentMonthStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const handleDownload = async (docId: string) => {
    try {
      const token = localStorage.getItem('gestao_token');
      const tenantId = localStorage.getItem('gestao_tenant_id');
      const res = await fetch(`http://localhost:3333/api/documents/${docId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId || ''
        }
      });
      if (!res.ok) throw new Error('Falha no download do PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contrato_${docId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      toast.error(e.message || 'Erro ao baixar documento');
    }
  };

  const defaultIndexRate = useMemo(() => {
    if (!contract?.adjustmentIndexId || !indexes) return 0;
    const index = indexes.find((i: any) => i.id === contract.adjustmentIndexId);
    if (!index) return 0;
    const rate = index.rates?.find((r: any) => r.competence === currentMonthStr);
    return rate ? Number(rate.accumulatedRate) : 0;
  }, [contract, indexes, currentMonthStr]);

  const handleOpenRenewal = () => {
    setManualRate(defaultIndexRate);
    setIsRenewalOpen(true);
  };

  const handleRenewalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualRate === '') return;
    renewalMutation.mutate(Number(manualRate));
  };

  const handleOpenAmend = () => {
    if (!contract) return;
    setAmendItems(contract.items.map((i: any) => ({ ...i })));
    setAmendGlobalDiscount(Number(contract.globalDiscount));
    setIsAmendOpen(true);
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Carregando detalhes...</div>;
  if (!contract) return <div className="p-8 text-center text-destructive">Contrato não encontrado.</div>;

  const currentTotal = Number(contract.totalValue);
  const previewTotal = manualRate !== '' ? currentTotal * (1 + (Number(manualRate) / 100)) : currentTotal;

  const hasDocuments = contract?.documents && contract.documents.length > 0;
  const hasSignedDocument = contract?.documents && contract.documents.some((d: any) => d.status === 'SIGNED');
  const activationBlocked = !tenantSettings?.allowActivationWithoutDocument && !hasSignedDocument;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/contracts')} className="text-slate-500">
            <ArrowLeft size={18} />
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="text-primary w-8 h-8" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-800">Contrato #{contract.id.split('-')[0]}</h1>
              <p className="text-muted-foreground flex gap-2 items-center">
                Status: <span className="font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded text-xs">{contract.status}</span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {contract.status === 'DRAFT' && (
            <Button 
              className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                if (!hasDocuments) {
                  toast.error('Gere um documento antes de enviar para assinatura.');
                  return;
                }
                if (window.confirm('Tem certeza que deseja enviar este contrato para assinatura?')) {
                  sendForSignatureMutation.mutate();
                }
              }}
              disabled={sendForSignatureMutation.isPending || !hasDocuments}
              title={(!hasDocuments) ? 'Gere um documento antes de enviar para assinatura' : 'Enviar contrato para assinatura (mockado)'}
            >
              {sendForSignatureMutation.isPending ? 'Enviando...' : (
                <><Send size={16} className="mr-2" /> Enviar para Assinatura</>
              )}
            </Button>
          )}

          {(contract.status === 'DRAFT' || contract.status === 'PENDING_SIGNATURE') && (
            <Button 
              className="shadow-sm shadow-green-500/20 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={() => {
                if (activationBlocked) {
                  toast.error('Assine o documento gerado ou ative a permissão nas configurações antes de ativar o contrato.');
                  return;
                }
                if (window.confirm('Tem certeza que deseja ativar este contrato? Isso habilitará o faturamento.')) {
                  activateMutation.mutate();
                }
              }}
              disabled={activateMutation.isPending || activationBlocked}
              title={activationBlocked ? 'Bloqueado pelas configurações: é necessário ter um documento assinado' : ''}
            >
              {activateMutation.isPending ? 'Ativando...' : (
                <><Play size={16} className="mr-2" /> Ativar Manualmente</>
              )}
            </Button>
          )}

          {contract.status === 'ACTIVE' && (
            <>
              <Button 
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 shadow-sm"
                onClick={handleOpenRenewal}
              >
                <RefreshCw size={16} className="mr-2" /> Reajustar (INCC)
              </Button>
              <Button 
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20"
                onClick={handleOpenAmend}
              >
                <Plus size={16} className="mr-2" /> Gerar Aditivo
              </Button>
              <Button 
                variant="destructive"
                className="shadow-sm shadow-red-500/20"
                onClick={() => setIsCancelOpen(true)}
              >
                <Trash2 size={16} className="mr-2" /> Cancelar Contrato
              </Button>
            </>
          )}
        </div>
      </div>

      {(activationBlocked && (contract.status === 'DRAFT' || contract.status === 'PENDING_SIGNATURE')) && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3 shadow-sm text-amber-800">
          <AlertCircle className="flex-shrink-0" />
          <p className="text-sm">
            <strong>Atenção:</strong> É necessário <span className="font-semibold underline">{!hasDocuments ? 'gerar um documento' : 'assinar manualmente o documento gerado'}</span> na aba inferior antes de conseguir ativá-lo manualmente.
          </p>
        </div>
      )}

      {contract.pendingAmendment && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm gap-4">
          <div className="flex gap-3">
            <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-amber-800">Aditivo Pendente</h3>
              <p className="text-sm text-amber-700">Há um aditivo aguardando aprovação/assinatura (Novo Total: R$ {Number(contract.pendingAmendment.totalValue).toLocaleString('pt-BR', {minimumFractionDigits:2})}). O faturamento segue com o escopo original até a aplicação.</p>
            </div>
          </div>
          <Button 
            className="bg-amber-600 hover:bg-amber-700 text-white flex-shrink-0"
            onClick={() => {
              if(confirm('Aplicar imediatamente este aditivo (Isso sobrescreverá os valores ativos)?')) {
                applyAmendmentMutation.mutate();
              }
            }}
            disabled={applyAmendmentMutation.isPending}
          >
            Aplicar Aditivo
          </Button>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-6">
        <div className="grid grid-cols-2 gap-6 border-b pb-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase">Dados do Cliente</h3>
            <p className="mt-2 font-medium text-slate-800">{contract.customer?.corporateName || 'Cliente não encontrado'}</p>
            <p className="text-xs text-muted-foreground">CNPJ: {contract.customer?.document || '---'}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase">Produto Contratado</h3>
            <p className="mt-2 font-medium text-slate-800">{contract.product?.name || 'Produto não encontrado'}</p>
            <p className="text-xs text-muted-foreground">ID Interno: {contract.productId.split('-')[0]}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase mb-4">Itens / Módulos</h3>
          <div className="space-y-2">
            {contract.items?.map((item: any) => {
              const moduleObj = contract.product?.modules?.find((m: any) => m.id === item.moduleId);
              return (
                <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border">
                  <div>
                    <div className="font-medium">Módulo: {moduleObj ? moduleObj.name : item.moduleId.split('-')[0]}</div>
                    <div className="text-xs text-muted-foreground">Qtde: {item.quantity} | Preço Unitário: R$ {Number(item.unitPrice).toFixed(2)}</div>
                  </div>
                  <div className="font-bold text-slate-700">
                    R$ {(item.quantity * Number(item.unitPrice) - Number(item.discount)).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex justify-between text-lg font-semibold text-slate-600">
            <span>Desconto Global:</span>
            <span className="text-red-500">- R$ {Number(contract.globalDiscount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-2xl font-black text-primary mt-2">
            <span>Valor Total Recorrente:</span>
            <span>R$ {Number(contract.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-semibold flex items-center gap-2"><FileSignature size={20} /> Documentos do Contrato</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm"><FileText size={16} className="mr-2" /> Gerar Novo Documento</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Gerar Documento</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <label className="text-sm font-semibold">Selecione o Template:</label>
                <select id="templateSelect" className="w-full border p-2 rounded">
                  <option value="">Selecione...</option>
                  {templates?.filter((t: any) => t.isActive).map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <DialogFooter>
                  <Button 
                    onClick={() => {
                      const sel = document.getElementById('templateSelect') as HTMLSelectElement;
                      if (sel.value) generateDocMutation.mutate(sel.value);
                    }}
                    disabled={generateDocMutation.isPending}
                  >
                    Gerar PDF
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {(!contract.documents || contract.documents.length === 0) ? (
          <p className="text-sm text-muted-foreground italic">Nenhum documento gerado para este contrato.</p>
        ) : (
          <div className="space-y-3">
            {contract.documents.map((doc: any) => (
              <div key={doc.id} className="flex justify-between items-center bg-slate-50 border p-3 rounded-md">
                <div>
                  <div className="font-semibold text-slate-800">Contrato PDF</div>
                  <div className="text-xs text-slate-500">Status: {doc.status} | Criado em: {new Date(doc.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => handleDownload(doc.id)}>
                    Baixar PDF
                  </Button>
                  {doc.status === 'GENERATED' && (
                    <>
                      <Button size="sm" variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50" onClick={() => {
                        toast.info('Funcionalidade Clicksign postergada. Utilize a assinatura manual para aprovar este documento.');
                      }}>
                        Enviar para Clicksign
                      </Button>
                      <Button size="sm" variant="outline" className="border-green-500 text-green-600 hover:bg-green-50" onClick={() => {
                        if (confirm('Deseja marcar este documento como Assinado Manualmente?')) {
                          manualSignMutation.mutate(doc.id);
                        }
                      }}>
                        <Upload size={14} className="mr-2" /> Assinatura Manual
                      </Button>
                    </>
                  )}
                  {doc.status === 'SIGNED' && (
                    <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded flex items-center">Assinado</span>
                  )}
                  {doc.status !== 'SIGNED' && (
                    <Button size="sm" variant="outline" className="border-red-500 text-red-600 hover:bg-red-50" onClick={() => {
                      if (confirm('Tem certeza que deseja remover este documento?')) {
                        deleteDocumentMutation.mutate(doc.id);
                      }
                    }} disabled={deleteDocumentMutation.isPending}>
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Histórico do Contrato */}
      <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
          <RefreshCw size={20} /> Histórico do Contrato
        </h2>
        {(!contract.history || contract.history.length === 0) ? (
          <p className="text-sm text-muted-foreground italic">Nenhum histórico disponível.</p>
        ) : (
          <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pl-6">
            {contract.history.map((hist: any, index: number) => (
              <div key={hist.id} className="relative">
                <div className="absolute -left-[33px] top-0 bg-white border-2 border-primary w-4 h-4 rounded-full"></div>
                <div className="mb-1 text-xs font-semibold text-slate-500">
                  {new Date(hist.changedAt).toLocaleString()}
                </div>
                <div className="font-semibold text-slate-800">
                  Status alterado para: <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{hist.status}</span>
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  Motivo: {hist.reason || 'Nenhum motivo informado'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Valor Total no momento: R$ {Number(hist.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isRenewalOpen} onOpenChange={setIsRenewalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Renovar Contrato e Aplicar Reajuste</DialogTitle></DialogHeader>
          <form onSubmit={handleRenewalSubmit} className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Valor Atual:</span>
                <span className="font-semibold text-slate-800">R$ {currentTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500 mt-2">
                <span>Índice Configurado:</span>
                <span className="font-semibold text-slate-800">
                  {contract.adjustmentIndexId ? 'Taxa padrão: ' + defaultIndexRate + '%' : 'Sem índice associado'}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold">Taxa de Reajuste a Aplicar (%)</label>
              <IMaskInput
                mask={Number}
                scale={2}
                padFractionalZeros={true}
                normalizeZeros={true}
                radix=","
                mapToRadix={['.']}
                unmask={'typed'}
                required
                value={String(manualRate)}
                onAccept={(val) => setManualRate(Number(val))}
                className="w-full border p-2 rounded mt-1"
              />
            </div>

            <div className="flex justify-between items-center text-lg mt-4 pt-4 border-t">
              <span className="font-bold text-slate-700">Novo Valor Previsto:</span>
              <span className="font-bold text-primary">R$ {previewTotal.toFixed(2)}</span>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRenewalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={renewalMutation.isPending}>Aplicar Reajuste</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAmendOpen} onOpenChange={setIsAmendOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Gerar Aditivo Contratual</DialogTitle></DialogHeader>
          <div className="space-y-6">
            <p className="text-sm text-slate-500">Altere as quantidades ou adicione novos módulos. Isso gerará um escopo pendente que entrará em vigor após aprovação/assinatura.</p>
            
            <div className="space-y-3">
              <h4 className="font-bold text-sm">Módulos do Contrato</h4>
              {contract?.product?.modules?.map((m: any) => {
                const existingItem = amendItems.find((i) => i.moduleId === m.id);
                const isLimitReached = m.maxQuantity && existingItem?.quantity >= m.maxQuantity;
                const minQtd = m.isBaseOffer ? 1 : 0;

                return (
                  <div key={m.id} className={`flex flex-col md:flex-row md:items-center justify-between p-3 rounded-lg border gap-4 transition-all ${isLimitReached ? 'bg-slate-100 opacity-80 border-slate-300' : 'bg-slate-50 border-slate-200'}`}>
                    <div>
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        {m.name}
                        {m.isBaseOffer && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Obrigatório</span>}
                        {isLimitReached && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Limite Atingido</span>}
                      </div>
                      <div className="text-xs text-slate-500">
                        Preço Base: R$ {Number(m.price).toFixed(2)}
                        {m.maxQuantity ? ` • Máx permitida: ${m.maxQuantity}` : ''}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      {existingItem ? (
                        <>
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-semibold text-slate-700">Qtd:</label>
                            <input 
                              type="number" min={minQtd} max={m.maxQuantity || undefined} 
                              className="w-16 h-8 text-center bg-white disabled:bg-slate-100 disabled:text-slate-500" 
                              value={existingItem.quantity}
                              disabled={isLimitReached && minQtd === m.maxQuantity}
                              onChange={(e) => {
                                let newQ = Number(e.target.value);
                                if (m.maxQuantity && newQ > m.maxQuantity) newQ = m.maxQuantity;
                                if (newQ < minQtd) newQ = minQtd;
                                if (newQ <= 0) {
                                  setAmendItems(amendItems.filter((i) => i.moduleId !== m.id));
                                } else {
                                  setAmendItems(amendItems.map((i) => i.moduleId === m.id ? { ...i, quantity: newQ } : i));
                                }
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-semibold text-slate-700">Desc (R$):</label>
                            <IMaskInput 
                              mask={Number}
                              scale={2}
                              padFractionalZeros={true}
                              normalizeZeros={true}
                              radix=","
                              mapToRadix={['.']}
                              unmask={'typed'}
                              className="w-24 h-8 bg-white border border-input rounded-md px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
                              value={String(existingItem.discount)}
                              onAccept={(val) => {
                                setAmendItems(amendItems.map((i) => i.moduleId === m.id ? { ...i, discount: Number(val) } : i));
                              }}
                            />
                          </div>
                          {!m.isBaseOffer && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" 
                              onClick={() => setAmendItems(amendItems.filter((i) => i.moduleId !== m.id))} 
                              title="Remover Módulo"
                            >
                              <Trash2 size={14} />
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button size="sm" variant="outline" className="bg-white" onClick={() => setAmendItems([...amendItems, { moduleId: m.id, quantity: 1, unitPrice: m.price, discount: 0 }])}>
                          <Plus size={14} className="mr-1"/> Adicionar
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-4 bg-slate-100 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">Desconto Global (R$):</span>
                <IMaskInput 
                  mask={Number}
                  scale={2}
                  padFractionalZeros={true}
                  normalizeZeros={true}
                  radix=","
                  mapToRadix={['.']}
                  unmask={'typed'}
                  className="w-32 h-10 bg-white border border-input rounded-md px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
                  value={String(amendGlobalDiscount)}
                  onAccept={(val) => setAmendGlobalDiscount(Number(val))}
                />
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                <span className="font-bold text-slate-700 text-lg">Novo Total (Mensalidade):</span>
                <span className="font-black text-indigo-700 text-2xl">
                  R$ {Math.max(0, amendItems.reduce((acc, item) => acc + (Number(item.unitPrice) * item.quantity - Number(item.discount)), 0) - amendGlobalDiscount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAmendOpen(false)}>Cancelar</Button>
              <Button 
                onClick={() => amendMutation.mutate({ items: amendItems, globalDiscount: amendGlobalDiscount })}
                disabled={amendMutation.isPending || amendItems.length === 0}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Gerar Aditivo
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle size={20} />
              Confirmar Cancelamento
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-700 mb-4">
              Você está prestes a cancelar este contrato. Essa ação aplicará as <strong>Regras de Data de Corte</strong> vigentes na plataforma.
            </p>
            <div className="bg-red-50 border border-red-100 p-3 rounded-lg text-sm text-red-800">
              <ul className="list-disc pl-5 space-y-1">
                <li>Se o cancelamento for <strong>antes ou no dia</strong> de corte, a próxima fatura será cancelada.</li>
                <li>Se o cancelamento for <strong>após o dia</strong> de corte, a próxima fatura será mantida (cobrada), e apenas as subsequentes serão canceladas.</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelOpen(false)} disabled={cancelMutation.isPending}>
              Voltar
            </Button>
            <Button variant="destructive" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}>
              {cancelMutation.isPending ? 'Cancelando...' : 'Confirmar Cancelamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
