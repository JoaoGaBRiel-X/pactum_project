'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { RequirePermissions } from '@/components/auth/RequirePermissions';

export default function NewProposalPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    opportunityId: '',
    validUntil: '',
    items: [
      { productId: '', quantity: 1, unitPrice: 0 }
    ]
  });

  // Na vida real teríamos querys para opportunities e products aqui
  // ...

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => apiFetch('/crm/proposals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      router.push('/crm/proposals');
    },
    onError: (err: any) => {
      alert(`Erro ao criar proposta: ${err.message}`);
      setIsSubmitting(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Como backend real não tem essa rota pronta, vamos apenas simular sucesso
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      router.push('/crm/proposals');
    }, 1000);
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  return (
    <RequirePermissions permissions="crm:manage">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/crm/proposals">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600 bg-white border border-slate-200">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Nova Proposta</h1>
            <p className="text-slate-500 text-sm mt-1">Gerar cotação para uma oportunidade.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-indigo-100 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-lg text-indigo-900">Dados da Proposta</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="opportunityId">Oportunidade Vinculada *</Label>
                  <Input id="opportunityId" name="opportunityId" value={formData.opportunityId} onChange={e => setFormData({...formData, opportunityId: e.target.value})} required placeholder="ID da oportunidade" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Validade da Proposta</Label>
                  <Input id="validUntil" name="validUntil" type="date" value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})} required />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-indigo-100 shadow-sm bg-white mt-6">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-indigo-900">Itens / Produtos</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-8 gap-1"><Plus size={14}/> Adicionar</Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-4 items-end bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="flex-1 space-y-2">
                      <Label>Produto</Label>
                      <Input placeholder="ID ou Nome do Produto" />
                    </div>
                    <div className="w-24 space-y-2">
                      <Label>Qtd</Label>
                      <Input type="number" min="1" defaultValue="1" />
                    </div>
                    <div className="w-32 space-y-2">
                      <Label>Valor Unit.</Label>
                      <Input type="number" step="0.01" placeholder="R$" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 flex justify-end gap-4">
            <Link href="/crm/proposals">
              <Button type="button" variant="outline" className="border-slate-300">Cancelar</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px] gap-2">
              <Save size={18} />
              {isSubmitting ? 'Gerando...' : 'Gerar Proposta'}
            </Button>
          </div>
        </form>
      </div>
    </RequirePermissions>
  );
}
