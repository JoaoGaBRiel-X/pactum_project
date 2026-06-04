'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, Save, AlertCircle, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Available permissions in the system
const AVAILABLE_PERMISSIONS = [
  { id: 'customers:create', label: 'Criar Clientes', module: 'Clientes' },
  { id: 'customers:read', label: 'Ver Todos os Clientes', module: 'Clientes' },
  { id: 'customers:read_own', label: 'Ver Próprios Clientes', module: 'Clientes' },
  { id: 'customers:update', label: 'Editar Clientes', module: 'Clientes' },
  { id: 'customers:delete', label: 'Excluir Clientes', module: 'Clientes' },
  
  { id: 'contracts:create', label: 'Criar Contratos', module: 'Contratos' },
  { id: 'contracts:read', label: 'Ver Todos os Contratos', module: 'Contratos' },
  { id: 'contracts:read_own', label: 'Ver Próprios Contratos', module: 'Contratos' },
  { id: 'contracts:update', label: 'Editar Contratos', module: 'Contratos' },
  { id: 'contracts:delete', label: 'Excluir Contratos', module: 'Contratos' },
  { id: 'contracts:approve_discount', label: 'Aprovar Descontos', module: 'Contratos' },
  
  { id: 'financial:read', label: 'Ver Financeiro', module: 'Financeiro' },
  { id: 'financial:manage', label: 'Gerenciar Financeiro', module: 'Financeiro' },
  
  { id: 'settings:manage', label: 'Gerenciar Configurações', module: 'Configurações' },
  { id: 'users:manage', label: 'Gerenciar Usuários', module: 'Usuários' },
  { id: 'roles:create', label: 'Criar Perfis de Acesso', module: 'Perfis de Acesso' },
  { id: 'roles:read', label: 'Ver Perfis de Acesso', module: 'Perfis de Acesso' },
  { id: 'roles:update', label: 'Editar Perfis de Acesso', module: 'Perfis de Acesso' },
  { id: 'roles:delete', label: 'Excluir Perfis de Acesso', module: 'Perfis de Acesso' },
];

const roleSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, 'Selecione pelo menos uma permissão'),
});

type RoleFormData = z.infer<typeof roleSchema>;

export default function RoleEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === 'new';

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
    }
  });

  const selectedPermissions = watch('permissions');

  const { data: role, isLoading } = useQuery({
    queryKey: ['roles', id],
    queryFn: () => apiFetch(`/roles/${id}`),
    enabled: !isNew,
  });

  useEffect(() => {
    if (role && !isNew) {
      reset({
        name: role.name,
        description: role.description || '',
        permissions: role.permissions || [],
      });
    }
  }, [role, isNew, reset]);

  const mutation = useMutation({
    mutationFn: (data: RoleFormData) => {
      if (isNew) {
        return apiFetch('/roles', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } else {
        return apiFetch(`/roles/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: () => {
      router.push('/admin/settings/roles');
    },
    onError: (err: any) => {
      alert(`Erro ao salvar: ${err.message || 'Desconhecido'}`);
    }
  });

  const onSubmit = (data: RoleFormData) => {
    mutation.mutate(data);
  };

  const togglePermission = (permId: string, checked: boolean) => {
    if (checked) {
      setValue('permissions', [...selectedPermissions, permId], { shouldValidate: true });
    } else {
      setValue('permissions', selectedPermissions.filter(p => p !== permId), { shouldValidate: true });
    }
  };

  // Group permissions by module
  const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_PERMISSIONS>);

  if (isLoading) {
    return <div className="p-8 flex items-center justify-center">Carregando...</div>;
  }

  if (role?.isSystem) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center">
        <ShieldAlert size={48} className="text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold">Perfil de Sistema</h2>
        <p className="text-slate-500 mt-2">Este perfil não pode ser editado pois é um perfil padrão do sistema.</p>
        <Link href="/admin/settings/roles" className="mt-6">
          <Button variant="outline">Voltar para Perfis</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/settings/roles">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-slate-100 hover:bg-slate-200">
            <ChevronLeft size={20} className="text-slate-700" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isNew ? 'Novo Perfil de Acesso' : `Editar Perfil: ${role?.name}`}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Configure o nome e as permissões atreladas a este perfil.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nome do Perfil <span className="text-red-500">*</span></label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Ex: Analista Comercial" className={errors.name ? 'border-red-500' : ''} />}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Descrição</label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => <Textarea {...field} placeholder="Descrição opcional..." className="min-h-[100px]" />}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permissões <span className="text-red-500">*</span></CardTitle>
            <CardDescription>
              Selecione as ações que os usuários com este perfil poderão executar.
              <br/>
              Aviso: Perfis com permissões elevadas terão acesso a dados sensíveis de todos os tenants se configurados de forma inadequada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errors.permissions && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2 mb-6 text-sm">
                <AlertCircle size={16} />
                {errors.permissions.message}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
                <div key={moduleName} className="space-y-3">
                  <h3 className="font-semibold text-slate-800 border-b pb-2">{moduleName}</h3>
                  <div className="space-y-2.5">
                    {perms.map(perm => {
                      const isChecked = selectedPermissions.includes(perm.id);
                      return (
                        <div key={perm.id} className="flex items-start space-x-3">
                          <Checkbox 
                            id={perm.id} 
                            checked={isChecked}
                            onCheckedChange={(checked) => togglePermission(perm.id, checked as boolean)}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label
                              htmlFor={perm.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {perm.label}
                            </label>
                            <p className="text-xs text-slate-500 font-mono">
                              {perm.id}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/admin/settings/roles">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={mutation.isPending} className="bg-blue-600 hover:bg-blue-700">
            {mutation.isPending ? 'Salvando...' : <><Save size={16} className="mr-2" /> Salvar Perfil</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
