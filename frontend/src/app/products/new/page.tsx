'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash, Package, Box } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const moduleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Nome é obrigatório'),
  price: z.coerce.number().min(0, 'Preço inválido'),
  isActive: z.boolean().default(true),
  isBaseOffer: z.boolean().default(false),
  maxQuantity: z.coerce.number().optional().nullable(),
});

const productSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  description: z.string().optional(),
  productGroupId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  modules: z.array(moduleSchema).min(1, 'Adicione pelo menos um módulo'),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function NewProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: groups } = useQuery({
    queryKey: ['product-groups'],
    queryFn: () => apiFetch('/product-groups'),
  });

  const { register, control, handleSubmit, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      isActive: true,
      modules: [{ name: '', price: 0, isActive: true, isBaseOffer: false, maxQuantity: null }],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "modules",
  });

  const mutation = useMutation({
    mutationFn: (newProduct: ProductFormValues) => apiFetch('/products', {
      method: 'POST',
      body: JSON.stringify(newProduct),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      router.push('/products');
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-2">
        <Package className="text-primary w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Novo Produto</h1>
          <p className="text-muted-foreground">Cadastre o software e seus respectivos módulos.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Dados do Produto */}
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2"><Package size={20} /> Detalhes do Produto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input id="name" {...register("name")} placeholder="Ex: ERP Completo" />
              {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="productGroupId">Grupo de Produtos</Label>
              <select 
                id="productGroupId" 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("productGroupId")}
              >
                <option value="">Sem grupo</option>
                {groups?.map((group: any) => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="isActive">Status</Label>
              <select 
                id="isActive" 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("isActive", { setValueAs: (v) => String(v) === 'true' })}
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input id="description" {...register("description")} placeholder="Descrição do produto (opcional)" />
            </div>
          </div>
        </div>

        {/* Módulos */}
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Box size={20} /> Módulos Comercializáveis</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', price: 0, isActive: true, isBaseOffer: false, maxQuantity: null })}>
              <Plus size={16} className="mr-2" /> Adicionar Módulo
            </Button>
          </div>

          {errors.modules?.root && <p className="text-destructive text-sm">{errors.modules.root.message}</p>}
          {errors.modules?.message && <p className="text-destructive text-sm">{errors.modules.message}</p>}

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-50 p-4 rounded-lg border border-border">
                <div className="space-y-2 col-span-4">
                  <Label>Nome do Módulo *</Label>
                  <Input {...register(`modules.${index}.name`)} placeholder="Ex: Financeiro, PDV" />
                  {errors.modules?.[index]?.name && <p className="text-destructive text-xs">{errors.modules[index]?.name?.message}</p>}
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Preço Base (R$)</Label>
                  <Input type="number" step="0.01" {...register(`modules.${index}.price`)} placeholder="0.00" />
                  {errors.modules?.[index]?.price && <p className="text-destructive text-xs">{errors.modules[index]?.price?.message}</p>}
                </div>
                <div className="space-y-2 col-span-3">
                  <Label>Qtd Limite</Label>
                  <Input type="number" min="1" {...register(`modules.${index}.maxQuantity`)} placeholder="Livre" />
                  {errors.modules?.[index]?.maxQuantity && <p className="text-destructive text-xs">{errors.modules[index]?.maxQuantity?.message}</p>}
                </div>
                <div className="space-y-2 col-span-2 flex items-center gap-2 pb-2">
                  <input 
                    type="checkbox" 
                    id={`baseOffer_${index}`} 
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                    {...register(`modules.${index}.isBaseOffer`)} 
                  />
                  <Label htmlFor={`baseOffer_${index}`} className="mb-0 cursor-pointer text-sm">Base da Oferta</Label>
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}>
                    <Trash size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 bg-white p-4 rounded-xl border border-border shadow-sm sticky bottom-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" size="lg" className="w-48 shadow-lg shadow-primary/30" disabled={mutation.isPending}>
            {mutation.isPending ? 'Salvando...' : 'Salvar Produto'}
          </Button>
        </div>
        
        {mutation.isError && (
          <p className="text-destructive text-center font-medium bg-red-50 p-3 rounded-md border border-red-200">
            Erro ao salvar: {mutation.error.message}
          </p>
        )}
      </form>
    </div>
  );
}
