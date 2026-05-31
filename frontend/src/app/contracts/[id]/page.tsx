'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { FileText, ArrowLeft, Play, CheckCircle } from 'lucide-react';
import { use } from 'react';

export default function ContractDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const contractId = resolvedParams.id;
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: contract, isLoading } = useQuery({
    queryKey: ['contracts', contractId],
    queryFn: () => apiFetch(`/contracts/${contractId}`),
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

  if (isLoading) return <div className="p-8 text-center text-slate-500">Carregando detalhes...</div>;
  if (!contract) return <div className="p-8 text-center text-destructive">Contrato não encontrado.</div>;

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
        
        {/* Manually activate if it is DRAFT or PENDING_SIGNATURE */}
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
    </div>
  );
}
