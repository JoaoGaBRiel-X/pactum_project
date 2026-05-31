'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { FileText, ArrowLeft, Play, RefreshCw, FileSignature, Upload } from 'lucide-react';
import { use, useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { IMaskInput } from 'react-imask';

export default function ContractDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const contractId = resolvedParams.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isRenewalOpen, setIsRenewalOpen] = useState(false);
  const [manualRate, setManualRate] = useState<number | ''>('');

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

  const generateDocMutation = useMutation({
    mutationFn: (templateId: string) => apiFetch('/documents/generate', {
      method: 'POST',
      body: JSON.stringify({ contractId, templateId }),
    }),
    onSuccess: () => {
      alert('Contrato gerado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['contracts', contractId] });
    },
    onError: (err: any) => {
      alert(`Erro ao gerar documento: ${err.message}`);
    }
  });

  const manualSignMutation = useMutation({
    mutationFn: (docId: string) => apiFetch(`/documents/${docId}/manual-sign`, { method: 'POST' }),
    onSuccess: () => {
      alert('Documento assinado manualmente!');
      queryClient.invalidateQueries({ queryKey: ['contracts', contractId] });
    }
  });

  const activateMutation = useMutation({
    mutationFn: () => apiFetch(`/contracts/${contractId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'ACTIVE', reason: 'Ativado manualmente via sistema' }),
    }),
    onSuccess: () => {
      alert('Contrato ativado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['contracts', contractId] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
    onError: (err: any) => {
      alert(`Erro ao ativar: ${err.message}`);
    }
  });

  const renewalMutation = useMutation({
    mutationFn: (percentage: number) => apiFetch(`/adjustments/contracts/${contractId}/manual`, {
      method: 'POST',
      body: JSON.stringify({ percentage }),
    }),
    onSuccess: () => {
      alert('Contrato renovado/reajustado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['contracts', contractId] });
      setIsRenewalOpen(false);
    },
    onError: (err: any) => {
      alert(`Erro ao reajustar: ${err.message}`);
    }
  });

  const currentMonthStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

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

  if (isLoading) return <div className="p-8 text-center text-slate-500">Carregando detalhes...</div>;
  if (!contract) return <div className="p-8 text-center text-destructive">Contrato não encontrado.</div>;

  const currentTotal = Number(contract.totalValue);
  const previewTotal = manualRate !== '' ? currentTotal * (1 + (Number(manualRate) / 100)) : currentTotal;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
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
          {(contract.status === 'DRAFT' || contract.status === 'PENDING_SIGNATURE') && (
            <Button 
              className="shadow-lg shadow-green-500/30 bg-green-600 hover:bg-green-700" 
              onClick={() => {
                if (window.confirm('Tem certeza que deseja ativar este contrato? Isso habilitará o faturamento.')) {
                  activateMutation.mutate();
                }
              }}
              disabled={activateMutation.isPending}
            >
              {activateMutation.isPending ? 'Ativando...' : (
                <><Play size={16} className="mr-2" /> Ativar Manualmente</>
              )}
            </Button>
          )}

          {contract.status === 'ACTIVE' && (
            <Button 
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
              onClick={handleOpenRenewal}
            >
              <RefreshCw size={16} className="mr-2" /> Renovar / Reajustar
            </Button>
          )}
        </div>
      </div>

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
                  {templates?.map((t: any) => (
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
                  {doc.status === 'GENERATED' && (
                    <>
                      <Button size="sm" variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
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
                    <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded">Assinado</span>
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
    </div>
  );
}
