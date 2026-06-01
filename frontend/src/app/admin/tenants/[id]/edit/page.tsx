'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Building, Save, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { IMaskInput } from 'react-imask';

export default function EditTenantPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const tenantId = params.id as string;

  const [formData, setFormData] = useState({
    name: '',
    document: '',
    legalRepName: '',
    legalRepCpf: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: () => apiFetch(`/tenants/${tenantId}`),
  });

  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name || '',
        document: tenant.document || '',
        legalRepName: tenant.legalRepName || '',
        legalRepCpf: tenant.legalRepCpf || '',
      });
    }
  }, [tenant]);

  const updateTenantMutation = useMutation({
    mutationFn: (data: typeof formData) => apiFetch(`/tenants/${tenantId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...data,
        document: data.document.replace(/\D/g, ''),
        legalRepCpf: data.legalRepCpf.replace(/\D/g, '')
      }),
    }),
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] });
      setTimeout(() => router.push('/admin/tenants'), 2000);
    },
    onError: (error: any) => {
      alert(`Erro ao editar tenant: ${error.message}`);
    },
    onSettled: () => {
      setIsSaving(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    updateTenantMutation.mutate(formData);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto mt-20 space-y-6">
        <div className="bg-white p-10 rounded-2xl border border-green-100 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
            <CheckCircle2 size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Locatário Atualizado!</h2>
            <p className="text-slate-500 mt-2">Os dados do locatário foram atualizados com sucesso.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) return <div className="p-8 text-center text-slate-500">Carregando dados do locatário...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Backoffice Indicator */}
      <div className="bg-slate-900 text-white text-xs py-2 px-6 flex items-center gap-2 font-medium tracking-wide">
        <ShieldCheck size={14} className="text-blue-400" /> LEFER - ÁREA INTERNA (BACKOFFICE)
      </div>

      <div className="max-w-7xl mx-auto space-y-6 py-12 px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/admin/tenants')} className="text-slate-500 hover:bg-slate-200">
            <ArrowLeft size={18} />
          </Button>
          <div className="flex items-center gap-2">
            <Building className="text-slate-800 w-8 h-8" />
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Editar Tenant</h1>
          </div>
        </div>

      <div className="bg-white p-8 rounded-xl border border-border shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">Dados da Empresa (SaaS)</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Razão Social</label>
                <input
                  type="text"
                  required
                  className="w-full border p-2 rounded"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome da empresa locatária"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CNPJ</label>
                <IMaskInput
                  mask="00.000.000/0000-00"
                  required
                  className="w-full border p-2 rounded"
                  value={formData.document}
                  onAccept={(val) => setFormData({ ...formData, document: String(val) })}
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Representante Legal</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  value={formData.legalRepName}
                  onChange={(e) => setFormData({ ...formData, legalRepName: e.target.value })}
                  placeholder="Nome do assinante do contrato"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CPF do Representante</label>
                <IMaskInput
                  mask="000.000.000-00"
                  className="w-full border p-2 rounded"
                  value={formData.legalRepCpf}
                  onAccept={(val) => setFormData({ ...formData, legalRepCpf: String(val) })}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t">
            <Button 
              type="submit" 
              className="shadow-lg shadow-primary/30 w-48"
              disabled={isSaving}
            >
              {isSaving ? 'Salvando...' : (
                <><Save size={16} className="mr-2" /> Atualizar Locatário</>
              )}
            </Button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}
