'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, CheckCircle, AlertCircle, FileText, Upload, Search, Building2 } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function FinancialPage() {
  const [selectedReceivable, setSelectedReceivable] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>('BOLETO');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  
  const [selectedForBoleto, setSelectedForBoleto] = useState<any>(null);
  const [boletoFile, setBoletoFile] = useState<File | null>(null);

  const queryClient = useQueryClient();

  const { data: receivables, isLoading } = useQuery({
    queryKey: ['receivables'],
    queryFn: () => apiFetch('/financial/receivables'),
  });

  const generateBillingMutation = useMutation({
    mutationFn: () => apiFetch('/financial/generate-billing', { method: 'POST' }),
    onSuccess: () => {
      alert('Faturamento do mês gerado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
    },
    onError: (err: any) => alert(`Erro: ${err.message}`)
  });

  const registerPaymentMutation = useMutation({
    mutationFn: (data: { id: string, amount: number, paymentDate: string }) => 
      apiFetch(`/financial/receivables/${data.id}/pay`, {
        method: 'POST',
        body: JSON.stringify({ amount: data.amount, paymentDate: data.paymentDate })
      }),
    onSuccess: () => {
      alert('Pagamento registrado com sucesso!');
      setSelectedReceivable(null);
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
    },
    onError: (err: any) => alert(`Erro: ${err.message}`)
  });

  const uploadBoletoMutation = useMutation({
    mutationFn: async (data: { id: string, file: File }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      
      return apiFetch(`/financial/receivables/${data.id}/boleto`, {
        method: 'POST',
        body: formData
      });
    },
    onSuccess: () => {
      alert('Boleto anexado com sucesso!');
      setSelectedForBoleto(null);
      setBoletoFile(null);
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
    },
    onError: (err: any) => alert(`Erro: ${err.message}`)
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-semibold">Pendente</span>;
      case 'PAID': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">Pago</span>;
      case 'OVERDUE': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">Atrasado</span>;
      case 'RENEGOTIATED': return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">Renegociado</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <DollarSign className="text-primary w-8 h-8 hidden md:block" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Financeiro</h1>
            <p className="text-slate-500 mt-1">Gestão de recebíveis, pagamentos e renegociações.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/financial/renegotiation">
            <Button variant="outline" className="border-slate-300">
              Negociar Dívidas
            </Button>
          </Link>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6" 
            onClick={() => generateBillingMutation.mutate()}
            disabled={generateBillingMutation.isPending}
          >
            <FileText size={16} className="mr-2" /> 
            {generateBillingMutation.isPending ? 'Gerando...' : 'Simular Faturamento Mês'}
          </Button>
        </div>
      </div>

      <Card className="border-blue-200 shadow-sm bg-blue-50/40 overflow-hidden">
        <div className="bg-blue-100/50 border-b border-blue-200 px-6 py-4">
          <h2 className="text-base font-semibold flex items-center gap-2 text-blue-900">
            <Search size={18} className="text-blue-600"/> Filtros
          </h2>
          <p className="text-sm text-blue-700/80 mt-1">Refine a listagem financeira.</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">Busca (Cliente/Contrato)</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Buscar recebível..." 
                  className="pl-9 border-slate-200 focus-visible:ring-blue-500" 
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
              <TableHead className="font-semibold text-slate-700 py-4 px-6">Vencimento</TableHead>
              <TableHead className="w-[30%] font-semibold text-slate-700 py-4">Cliente / Contrato</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4">Competência</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4">Valor</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-700 py-4 px-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500 animate-pulse">Carregando...</TableCell>
              </TableRow>
            )}
            {receivables?.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search size={32} className="text-slate-300 mb-2" />
                    <p className="text-base font-medium text-slate-600">Nenhuma conta a receber encontrada.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {receivables?.map((r: any) => (
              <TableRow key={r.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0 group">
                <TableCell className="font-medium text-slate-800 px-6 py-4">
                  {new Date(r.dueDate).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <Building2 size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <Link href={`/customers/${r.customerId}`} className="hover:text-blue-700 transition-colors">
                      {r.customer.corporateName}
                    </Link>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 ml-6">
                    {r.contract ? (
                      <Link href={`/contracts/${r.contractId}`} className="hover:text-blue-600 hover:underline">
                        Contrato: {r.contract.id.split('-')[0]}
                      </Link>
                    ) : 'Avulso'}
                  </div>
                </TableCell>
                <TableCell className="py-4">{r.competence || '-'}</TableCell>
                <TableCell className="font-semibold text-primary py-4">
                  R$ {Number(r.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="py-4">{getStatusBadge(r.status)}</TableCell>
                <TableCell className="text-right px-6 py-4">
                  <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    {r.status !== 'PAID' && r.status !== 'RENEGOTIATED' && (
                      <Button variant="ghost" size="sm" className="h-9 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 bg-white border border-slate-200 shadow-sm font-medium" onClick={() => {
                        setSelectedReceivable(r);
                        setPaymentAmount(r.amount);
                      }}>
                        <CheckCircle size={16} className="mr-1.5" /> Liquidar
                      </Button>
                    )}
                    {r.status !== 'PAID' && r.status !== 'RENEGOTIATED' && !r.boletoUrl && (
                      <Button variant="ghost" size="sm" className="h-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200 shadow-sm font-medium" onClick={() => setSelectedForBoleto(r)}>
                        <Upload size={16} className="mr-1.5" /> Anexar
                      </Button>
                    )}
                    {r.boletoUrl && (
                      <a href={`${process.env.NEXT_PUBLIC_API_URL || ''}/api${r.boletoUrl}`} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="sm" className="h-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 bg-white border border-slate-200 shadow-sm font-medium">
                          <FileText size={16} className="mr-1.5" /> Boleto
                        </Button>
                      </a>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Pagamento Manual */}
      {selectedReceivable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Registrar Pagamento Manual</h3>
              <button onClick={() => setSelectedReceivable(null)} className="text-slate-500 hover:text-slate-800">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800 border border-blue-100">
                Líquidando título de <strong>{selectedReceivable.customer.corporateName}</strong>, vencimento em {new Date(selectedReceivable.dueDate).toLocaleDateString('pt-BR')}.
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Valor Pago (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full h-10 border rounded px-3"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Método de Pagamento</label>
                <select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-10 border rounded px-3 bg-white"
                >
                  <option value="BOLETO">Boleto Bancário</option>
                  <option value="PIX">PIX</option>
                  <option value="MANUAL">Dinheiro / Outros</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t mt-4">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Upload size={16} /> Comprovante (PDF/Imagem)
                </label>
                <input 
                  type="file" 
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
            <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setSelectedReceivable(null)}>Cancelar</Button>
              <Button onClick={() => registerPaymentMutation.mutate({ id: selectedReceivable.id, amount: Number(paymentAmount), paymentDate })} disabled={registerPaymentMutation.isPending}>
                {registerPaymentMutation.isPending ? 'Salvando...' : 'Confirmar Baixa'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Upload de Boleto */}
      {selectedForBoleto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Anexar PDF do Boleto</h3>
              <button onClick={() => setSelectedForBoleto(null)} className="text-slate-500 hover:text-slate-800">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800 border border-blue-100">
                Anexando boleto para <strong>{selectedForBoleto.customer.corporateName}</strong>, competência {selectedForBoleto.competence || '-'}.
              </div>
              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FileText size={16} /> Arquivo PDF
                </label>
                <input 
                  type="file" 
                  accept="application/pdf"
                  onChange={(e) => setBoletoFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
            <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setSelectedForBoleto(null)}>Cancelar</Button>
              <Button onClick={() => boletoFile && uploadBoletoMutation.mutate({ id: selectedForBoleto.id, file: boletoFile })} disabled={uploadBoletoMutation.isPending || !boletoFile}>
                {uploadBoletoMutation.isPending ? 'Enviando...' : 'Confirmar Upload'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
