'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
});

const productSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  modules: z.array(moduleSchema).min(1, 'Adicione pelo menos um módulo'),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = use(params);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => apiFetch(`/products/${id}`),
  });

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      isActive: true,
      modules: [],
    }
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description || '',
        isActive: product.isActive,
        // Somente exibe módulos que estão ativos para o usuário editar (os inativos ficam ocultos)
        modules: product.modules?.filter((m: any) => m.isActive).map((m: any) => ({
          id: m.id,
          name: m.name,
          price: m.price,
          isActive: m.isActive,
        })) || [],
      });
    }
  }, [product, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "modules",
  });

  const mutation = useMutation({
    mutationFn: (updatedProduct: ProductFormValues) => apiFetch(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedProduct),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      router.push('/products');
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  if (isLoading) return <div className="p-8 text-center">Carregando produto...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-2">
        <Package className="text-primary w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Editar Produto</h1>
          <p className="text-muted-foreground">Atualize o software e seus respectivos módulos.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Dados do Produto */}
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2"><Package size={20} /> Detalhes do Produto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input id="name" {...register("name")} placeholder="Ex: ERP Completo" />
              {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
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
            <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', price: 0, isActive: true })}>
              <Plus size={16} className="mr-2" /> Adicionar Módulo
            </Button>
          </div>

          {errors.modules?.root && <p className="text-destructive text-sm">{errors.modules.root.message}</p>}
          {errors.modules?.message && <p className="text-destructive text-sm">{errors.modules.message}</p>}

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 p-4 rounded-lg border border-border">
                <input type="hidden" {...register(`modules.${index}.id`)} />
                <div className="space-y-2 col-span-2">
                  <Label>Nome do Módulo *</Label>
                  <Input {...register(`modules.${index}.name`)} placeholder="Ex: Financeiro, PDV" />
                  {errors.modules?.[index]?.name && <p className="text-destructive text-xs">{errors.modules[index]?.name?.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Preço Base (R$)</Label>
                  <Input type="number" step="0.01" {...register(`modules.${index}.price`)} placeholder="0.00" />
                  {errors.modules?.[index]?.price && <p className="text-destructive text-xs">{errors.modules[index]?.price?.message}</p>}
                </div>
                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}>
                  <Trash size={16} />
                </Button>
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
            Erro ao salvar: {mutation.error?.message}
          </p>
        )}
      </form>
    </div>
  );
}
