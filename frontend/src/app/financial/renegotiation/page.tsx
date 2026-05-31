'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Handshake, AlertCircle, Calculator } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function RenegotiationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedReceivables, setSelectedReceivables] = useState<string[]>([]);
  const [discount, setDiscount] = useState('0');

  const { data: customers } = useQuery({ queryKey: ['customers'], queryFn: () => apiFetch('/customers') });
  const { data: allReceivables } = useQuery({ 
    queryKey: ['receivables'], 
    queryFn: () => apiFetch('/financial/receivables') 
  });

  const customerReceivables = useMemo(() => {
    if (!selectedCustomerId || !allReceivables) return [];
    return allReceivables.filter((r: any) => 
      r.customerId === selectedCustomerId && 
      (r.status === 'PENDING' || r.status === 'OVERDUE')
    );
  }, [selectedCustomerId, allReceivables]);

  const { originalDebt, interestApplied, penaltyApplied, finalAmount } = useMemo(() => {
    const selected = customerReceivables.filter((r:any) => selectedReceivables.includes(r.id));
    const debt = selected.reduce((sum: number, r: any) => sum + Number(r.amount), 0);
    const interest = debt * 0.05; // 5%
    const penalty = debt * 0.02; // 2%
    const final = debt + interest + penalty - Number(discount);
    return {
      originalDebt: debt,
      interestApplied: interest,
      penaltyApplied: penalty,
      finalAmount: Math.max(0, final)
    };
  }, [customerReceivables, selectedReceivables, discount]);

  const toggleReceivable = (id: string) => {
    setSelectedReceivables(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const mutation = useMutation({
    mutationFn: () => apiFetch('/financial/renegotiations', {
      method: 'POST',
      body: JSON.stringify({
        customerId: selectedCustomerId,
        receivableIds: selectedReceivables,
        discount: Number(discount)
      }),
    }),
    onSuccess: () => {
      alert('Renegociação aprovada com sucesso! O novo título foi gerado.');
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      router.push('/financial');
    },
    onError: (err: any) => alert(`Erro ao renegociar: ${err.message}`)
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-2">
        <Handshake className="text-primary w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Renegociação de Dívidas</h1>
          <p className="text-muted-foreground">Consolide títulos em atraso, aplique juros e gere um novo acordo.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-6">
        <div className="space-y-2">
          <Label>Selecione o Cliente</Label>
          <select 
            value={selectedCustomerId}
            onChange={(e) => {
              setSelectedCustomerId(e.target.value);
              setSelectedReceivables([]);
            }}
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
          >
            <option value="">Selecione...</option>
            {customers?.map((c: any) => (
              <option key={c.id} value={c.id}>{c.corporateName}</option>
            ))}
          </select>
        </div>

        {selectedCustomerId && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 border-b pb-2">Títulos em Aberto ou Atrasados</h3>
            
            {customerReceivables.length === 0 ? (
              <p className="text-muted-foreground text-sm">Este cliente não possui títulos pendentes.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {customerReceivables.map((r: any) => (
                  <label key={r.id} className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${selectedReceivables.includes(r.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50 border-slate-200'}`}>
                    <input 
                      type="checkbox" 
                      checked={selectedReceivables.includes(r.id)}
                      onChange={() => toggleReceivable(r.id)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{r.description}</div>
                      <div className="text-xs text-muted-foreground">Venc: {new Date(r.dueDate).toLocaleDateString()}</div>
                    </div>
                    <div className="font-bold text-slate-700">R$ {Number(r.amount).toFixed(2)}</div>
                    {r.status === 'OVERDUE' && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded font-bold">Atrasado</span>}
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedReceivables.length > 0 && (
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Calculator size={18}/> Simulação do Acordo</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-slate-600">Dívida Original:</div>
              <div className="text-right font-medium">R$ {originalDebt.toFixed(2)}</div>
              
              <div className="text-slate-600">Juros de Mora (Simulado 5%):</div>
              <div className="text-right text-red-600">+ R$ {interestApplied.toFixed(2)}</div>
              
              <div className="text-slate-600">Multa (Simulado 2%):</div>
              <div className="text-right text-red-600">+ R$ {penaltyApplied.toFixed(2)}</div>
              
              <div className="text-slate-600 flex items-center h-10">Desconto Concedido:</div>
              <div className="text-right">
                <Input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  value={discount} 
                  onChange={(e) => setDiscount(e.target.value)} 
                  className="w-32 text-right float-right"
                />
              </div>
            </div>

            <div className="border-t pt-4 flex justify-between items-center">
              <div className="text-lg font-bold text-slate-800">Novo Valor Total:</div>
              <div className="text-2xl font-black text-primary">R$ {finalAmount.toFixed(2)}</div>
            </div>
            <p className="text-xs text-muted-foreground text-right">* O vencimento do novo acordo será para 5 dias corridos.</p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
        <Button 
          size="lg" 
          disabled={selectedReceivables.length === 0 || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? 'Processando...' : 'Confirmar e Gerar Acordo'}
        </Button>
      </div>
    </div>
  );
}
