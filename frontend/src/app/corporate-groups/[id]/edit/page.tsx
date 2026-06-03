'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { use } from 'react';

const groupSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
});

type FormValues = z.infer<typeof groupSchema>;

export default function EditCorporateGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const resolvedParams = use(params);

  const { data: group, isLoading } = useQuery({
    queryKey: ['corporate-group', resolvedParams.id],
    queryFn: () => apiFetch(`/corporate-groups/${resolvedParams.id}`),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(groupSchema)
  });

  useEffect(() => {
    if (group) {
      reset({
        name: group.name,
      });
    }
  }, [group, reset]);

  const mutation = useMutation({
    mutationFn: (updatedGroup: FormValues) => apiFetch(`/corporate-groups/${resolvedParams.id}`, {
      method: 'PATCH',
      body: JSON.stringify(updatedGroup),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporate-groups'] });
      queryClient.invalidateQueries({ queryKey: ['corporate-group', resolvedParams.id] });
      router.push('/corporate-groups');
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Carregando grupo...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Building2 className="text-primary w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Editar Grupo Econômico</h1>
          <p className="text-muted-foreground">Atualize os dados do grupo.</p>
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

        {mutation.isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            <strong>Erro ao salvar:</strong> {mutation.error instanceof Error ? mutation.error.message : 'Erro desconhecido. Verifique os dados e tente novamente.'}
          </div>
        )}

        <div className="flex justify-end gap-4 bg-white p-4 rounded-xl border border-border shadow-sm">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" size="lg" className="shadow-lg shadow-primary/30" disabled={mutation.isPending}>
            {mutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </div>
  );
}
