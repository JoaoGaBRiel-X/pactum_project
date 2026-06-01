'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building, Save, ShieldCheck, Copy, CheckCircle2 } from 'lucide-react';
import { IMaskInput } from 'react-imask';

export default function NewTenantPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    adminName: '',
    adminEmail: '',
    legalRepName: '',
    legalRepCpf: '',
  });
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [successData, setSuccessData] = useState<{ tenantName: string, tempPassword?: string } | null>(null);

  const createTenantMutation = useMutation({
    mutationFn: (data: typeof formData) => apiFetch('/tenants', {
      method: 'POST',
      headers: {
        'x-api-key': 'lefer-secret-dev-key' // TODO: Mover para variável de ambiente
      },
      body: JSON.stringify({
        ...data,
        document: data.document.replace(/\D/g, '') // remove mask
      }),
    }),
    onSuccess: (responseData: any) => {
      setSuccessData({
        tenantName: responseData.tenant?.name || formData.name,
        tempPassword: responseData.temporaryPassword
      });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
    onError: (error: any) => {
      alert(`Erro ao criar tenant: ${error.message}`);
    },
    onSettled: () => {
      setIsProvisioning(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProvisioning(true);
    createTenantMutation.mutate(formData);
  };

  if (successData) {
    return (
      <div className="max-w-2xl mx-auto mt-20 space-y-6">
        <div className="bg-white p-10 rounded-2xl border border-green-100 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
            <CheckCircle2 size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Locatário Provisionado!</h2>
            <p className="text-slate-500 mt-2">O banco de dados para <strong>{successData.tenantName}</strong> foi criado com sucesso.</p>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border text-left mt-8">
            <h3 className="font-semibold text-slate-700 mb-2">Credenciais de Acesso (Administrador)</h3>
            <p className="text-sm text-slate-500 mb-4">
              O sistema gerou uma senha temporária segura. Copie e envie ao cliente. No primeiro acesso, ele poderá alterá-la.
            </p>
            {/* TODO: Melhoria Futura - Remover exibição da senha na tela quando a integração SMTP (e-mail) estiver pronta */}
            <div className="flex items-center justify-between bg-white border rounded-lg p-4">
              <code className="text-lg font-mono font-bold text-primary">{successData.tempPassword}</code>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(successData.tempPassword || '');
                  alert('Senha copiada!');
                }}
              >
                <Copy size={14} className="mr-2" /> Copiar Senha
              </Button>
            </div>
          </div>

          <div className="pt-6">
            <Button size="lg" className="w-full" onClick={() => router.push('/admin/tenants')}>
              Voltar para o Painel Interno
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Novo Tenant</h1>
          </div>
        </div>

      <div className="bg-white p-8 rounded-xl border border-border shadow-sm">
        <div className="mb-8 p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-200 text-sm">
          <strong>Aviso:</strong> A criação de um Tenant provisionará um novo <em>Schema PostgreSQL</em> dedicado e executará as migrações necessárias. Esse processo pode demorar alguns segundos.
        </div>

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

          <div className="space-y-4 pt-4">
            <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">Primeiro Usuário (Administrador)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Administrador</label>
                <input
                  type="text"
                  required
                  className="w-full border p-2 rounded"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  placeholder="Ex: João da Silva"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">E-mail do Administrador</label>
                <input
                  type="email"
                  required
                  className="w-full border p-2 rounded"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  placeholder="admin@empresa.com.br"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t">
            <Button 
              type="submit" 
              className="shadow-lg shadow-primary/30 w-48"
              disabled={isProvisioning}
            >
              {isProvisioning ? 'Provisionando Banco...' : (
                <><Save size={16} className="mr-2" /> Salvar Locatário</>
              )}
            </Button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}
