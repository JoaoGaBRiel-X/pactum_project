'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token de redefinição ausente ou inválido.');
    }
  }, [token]);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      const response = await apiFetch('/authentication/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password: data.password }),
      });

      setMessage(response.message || 'Senha redefinida com sucesso.');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir a senha.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && !error) {
    return <div className="p-4 text-center">Carregando...</div>;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Criar Nova Senha</CardTitle>
        <CardDescription>
          Digite sua nova senha abaixo
        </CardDescription>
      </CardHeader>
      <CardContent>
        {message ? (
          <div className="space-y-4">
            <div className="p-3 text-sm text-green-700 bg-green-50 rounded-md border border-green-200">
              {message}
            </div>
            <p className="text-sm text-center text-slate-500">
              Redirecionando para o login...
            </p>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                type="password"
                {...form.register('password')}
                disabled={!token}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...form.register('confirmPassword')}
                disabled={!token}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || !token}>
              {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
            </Button>

            <div className="text-center mt-4">
              <Link href="/login" className="text-sm text-slate-500 hover:text-slate-800 hover:underline">
                Voltar para o Login
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Suspense fallback={<div>Carregando...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
