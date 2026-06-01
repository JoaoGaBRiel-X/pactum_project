'use client';

import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const groupSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
});

type FormValues = z.infer<typeof groupSchema>;

export default function NewCorporateGroupPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(groupSchema)
  });

  const mutation = useMutation({
    mutationFn: (newGroup: FormValues) => apiFetch('/corporate-groups', {
      method: 'POST',
      body: JSON.stringify(newGroup),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporate-groups'] });
      router.push('/corporate-groups');
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Building2 className="text-primary w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Novo Grupo Econômico</h1>
          <p className="text-muted-foreground">Cadastre um novo grupo para agregar clientes.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Grupo *</Label>
            <Input id="name" {...register("name")} placeholder="Ex: Grupo Lefer" />
            {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-4 bg-white p-4 rounded-xl border border-border shadow-sm">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" size="lg" className="shadow-lg shadow-primary/30" disabled={mutation.isPending}>
            {mutation.isPending ? 'Salvando...' : 'Salvar Grupo'}
          </Button>
        </div>
      </form>
    </div>
  );
}
