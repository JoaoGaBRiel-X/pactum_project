'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Building, Plus, Users, Database } from 'lucide-react';

export default function TenantsPage() {
  const router = useRouter();

  const { data: tenants, isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => apiFetch('/tenants'), // public route for global admin
  });

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Building className="text-primary w-8 h-8 hidden md:block" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Locatários (Tenants)</h1>
            <p className="text-slate-500 mt-1">Gestão global de instâncias SaaS, clientes e seus schemas isolados.</p>
          </div>
        </div>
        <Button onClick={() => router.push('/admin/tenants/new')} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6">
          <Plus size={16} className="mr-2" /> Novo Tenant
        </Button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-slate-500 animate-pulse">Carregando tenants...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {tenants?.map((tenant: any) => (
            <div key={tenant.id} className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{tenant.name}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-1">CNPJ: {tenant.document}</p>
                </div>
              </div>
              
              <div className="space-y-3 mt-6 border-t pt-4">
                <div className="flex items-center text-sm text-slate-600">
                  <Database size={16} className="mr-2 text-slate-400" />
                  <span className="font-medium">Schema:</span>
                  <span className="ml-2 font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{tenant.schema}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Users size={16} className="mr-2 text-slate-400" />
                  <span className="font-medium">Usuários:</span>
                  <span className="ml-2">{tenant._count?.userLinks || 0} ativos</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-blue-600 border-blue-600 hover:bg-blue-50"
                  onClick={() => router.push(`/admin/tenants/${tenant.id}/edit`)}
                >
                  Editar Dados
                </Button>
              </div>
            </div>
          ))}

          {(!tenants || tenants.length === 0) && (
            <div className="col-span-full p-12 text-center border-2 border-dashed rounded-xl text-slate-400">
              <Building className="mx-auto h-12 w-12 mb-3 opacity-20" />
              <p>Nenhum tenant cadastrado no sistema.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
