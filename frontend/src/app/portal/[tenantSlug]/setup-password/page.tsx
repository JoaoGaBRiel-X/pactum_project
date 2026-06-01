'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { use } from 'react';

const setupSchema = z.object({
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type SetupFormValues = z.infer<typeof setupSchema>;

export default function SetupPasswordPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { tenantSlug } = use(params);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema)
  });

  const mutation = useMutation({
    mutationFn: (data: { token: string, password: string }) => apiFetch(`/portal/${tenantSlug}/auth/setup-password`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      setIsSuccess(true);
      setTimeout(() => {
        router.push(`/portal/${tenantSlug}/login`);
      }, 3000);
    },
  });

  const onSubmit = (data: SetupFormValues) => {
    if (!token) return;
    mutation.mutate({ token, password: data.password });
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-slate-100">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Link Inválido</h2>
          <p className="text-slate-600 mb-6">O link de definição de senha é inválido ou não foi fornecido. Por favor, solicite um novo acesso ao seu gestor.</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-slate-100">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Senha Definida!</h2>
          <p className="text-slate-600 mb-6">Sua senha foi configurada com sucesso. Você será redirecionado para o login em instantes.</p>
          <Button onClick={() => router.push(`/portal/${tenantSlug}/login`)} className="w-full bg-blue-600 hover:bg-blue-700">
            Ir para o Login agora
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock size={32} />
        </div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Defina sua Senha</h2>
          <p className="text-slate-600 text-sm">Crie uma senha segura para acessar o Portal do Cliente da {tenantSlug.toUpperCase()}.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-slate-700">Nova Senha</Label>
            <Input 
              type="password" 
              {...register('password')} 
              className={errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700">Confirme a Senha</Label>
            <Input 
              type="password" 
              {...register('confirmPassword')} 
              className={errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          {mutation.isError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
              {(mutation.error as any)?.message || 'Erro ao definir a senha. O link pode ter expirado.'}
            </div>
          )}

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base shadow-md" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Salvando...</>
            ) : (
              'Salvar Senha e Acessar'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
