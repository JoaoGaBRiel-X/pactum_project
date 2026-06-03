'use client';

import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Package } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const groupSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof groupSchema>;

export default function NewProductGroupPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      isActive: true,
    }
  });

  const mutation = useMutation({
    mutationFn: (newGroup: FormValues) => apiFetch('/product-groups', {
      method: 'POST',
      body: JSON.stringify(newGroup),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-groups'] });
      router.push('/product-groups');
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-2">
        <Package className="text-primary w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Novo Grupo de Produtos</h1>
          <p className="text-muted-foreground">Cadastre um novo grupo para agregar produtos e variações.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Grupo *</Label>
            <Input id="name" {...register("name")} placeholder="Ex: Sistemas de Gestão" />
            {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <textarea id="description" className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...register("description")} placeholder="Ex: Grupo contendo ERP e módulos financeiros" />
            {errors.description && <p className="text-destructive text-sm">{errors.description.message}</p>}
          </div>

          <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
            <input 
              type="checkbox" 
              id="isActive"
              {...register("isActive")} 
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <Label htmlFor="isActive" className="cursor-pointer text-sm font-medium text-slate-700">
              Grupo Ativo
            </Label>
          </div>
        </div>

        {mutation.isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            <strong>Erro ao salvar:</strong> {mutation.error instanceof Error ? mutation.error.message : 'Erro desconhecido. Verifique os dados e tente novamente.'}
          </div>
        )}

        <div className="flex justify-end gap-4 bg-white p-4 rounded-xl border border-border shadow-sm sticky bottom-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" size="lg" className="w-48 shadow-lg shadow-primary/30" disabled={mutation.isPending}>
            {mutation.isPending ? 'Salvando...' : 'Salvar Grupo'}
          </Button>
        </div>
      </form>
    </div>
  );
}
