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
import { ArrowLeft, Save } from 'lucide-react';
import { RequirePermissions } from '@/components/auth/RequirePermissions';

export default function NewRepresentativePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    document: '',
    email: '',
    phone: '',
    setupFeeCommissionPercentage: 0,
    recurringCommissionPercentage: 0,
    pixKey: '',
    bankCode: '',
    agency: '',
    accountNumber: '',
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      // Cast numéricos para a API
      const payload = {
        ...data,
        setupFeeCommissionPercentage: Number(data.setupFeeCommissionPercentage),
        recurringCommissionPercentage: Number(data.recurringCommissionPercentage)
      };
      return apiFetch('/representatives', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['representatives'] });
      router.push('/representatives');
    },
    onError: (err: any) => {
      alert(`Erro ao criar parceiro: ${err.message}`);
      setIsSubmitting(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    createMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <RequirePermissions permissions="representatives:manage">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/representatives">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-amber-600 bg-white border border-slate-200">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Novo Representante</h1>
            <p className="text-slate-500 text-sm mt-1">Cadastre os dados e comissionamento do parceiro.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-amber-100 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-lg text-amber-900">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome / Razão Social *</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Nome do parceiro" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document">CPF/CNPJ *</Label>
                  <Input id="document" name="document" value={formData.document} onChange={handleChange} required placeholder="Apenas números" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="contato@parceiro.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="(00) 00000-0000" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-100 shadow-sm bg-white mt-6">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-lg text-amber-900">Regras de Comissionamento</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="setupFeeCommissionPercentage">Comissão de Setup (%)</Label>
                  <Input id="setupFeeCommissionPercentage" name="setupFeeCommissionPercentage" type="number" min="0" max="100" step="0.01" value={formData.setupFeeCommissionPercentage} onChange={handleChange} />
                  <p className="text-xs text-slate-400">Porcentagem sobre a taxa de adesão (setup) do sistema.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recurringCommissionPercentage">Comissão Recorrente (%)</Label>
                  <Input id="recurringCommissionPercentage" name="recurringCommissionPercentage" type="number" min="0" max="100" step="0.01" value={formData.recurringCommissionPercentage} onChange={handleChange} />
                  <p className="text-xs text-slate-400">Porcentagem sobre a mensalidade enquanto o contrato durar.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-100 shadow-sm bg-white mt-6">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-lg text-amber-900">Dados Bancários / Recebimento</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="pixKey">Chave PIX</Label>
                  <Input id="pixKey" name="pixKey" value={formData.pixKey} onChange={handleChange} placeholder="CPF/CNPJ, E-mail ou Celular" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankCode">Banco (Código)</Label>
                  <Input id="bankCode" name="bankCode" value={formData.bankCode} onChange={handleChange} placeholder="Ex: 341 (Itaú)" />
                </div>
                <div className="space-y-2 flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="agency">Agência</Label>
                    <Input id="agency" name="agency" value={formData.agency} onChange={handleChange} placeholder="Sem dígito" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="accountNumber">Conta (com dígito)</Label>
                    <Input id="accountNumber" name="accountNumber" value={formData.accountNumber} onChange={handleChange} placeholder="00000-0" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 flex justify-end gap-4">
            <Link href="/representatives">
              <Button type="button" variant="outline" className="border-slate-300">Cancelar</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting} className="bg-amber-600 hover:bg-amber-700 text-white min-w-[120px] gap-2">
              <Save size={18} />
              {isSubmitting ? 'Salvando...' : 'Salvar Parceiro'}
            </Button>
          </div>
        </form>
      </div>
    </RequirePermissions>
  );
}
