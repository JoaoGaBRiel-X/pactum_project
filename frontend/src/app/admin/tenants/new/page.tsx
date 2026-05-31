'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building, Save } from 'lucide-react';
import { IMaskInput } from 'react-imask';

export default function NewTenantPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });
  const [isProvisioning, setIsProvisioning] = useState(false);

  const createTenantMutation = useMutation({
    mutationFn: (data: typeof formData) => apiFetch('/tenants', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        document: data.document.replace(/\D/g, '') // remove mask
      }),
    }),
    onSuccess: () => {
      alert('Tenant provisionado com sucesso! O banco de dados foi configurado isoladamente.');
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      router.push('/admin/tenants');
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

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/admin/tenants')} className="text-slate-500">
          <ArrowLeft size={18} />
        </Button>
        <div className="flex items-center gap-2">
          <Building className="text-primary w-8 h-8" />
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
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">Primeiro Usuário (Administrador)</h2>
            
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  className="w-full border p-2 rounded"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  placeholder="admin@empresa.com.br"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Senha (Mín. 8 chars, 1 Maiúscula, 1 Número)</label>
                <input
                  type="password"
                  required
                  className="w-full border p-2 rounded"
                  value={formData.adminPassword}
                  onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                  placeholder="********"
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
  );
}
