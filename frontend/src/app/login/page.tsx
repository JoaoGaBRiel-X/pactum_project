'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'A senha é obrigatória'),
  keepConnected: z.boolean().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('gestao_token');
    if (token) {
      apiFetch('/authentication/me')
        .then((profile) => {
          if (profile.isSuperAdmin && !localStorage.getItem('gestao_tenant_id')) {
            window.location.href = '/admin/tenants';
          } else {
            window.location.href = '/';
          }
        })
        .catch(() => {
          localStorage.removeItem('gestao_token');
          localStorage.removeItem('gestao_refresh_token');
        });
    }
  }, []);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', keepConnected: false },
  });

  const onSubmit = async (data: LoginValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFetch('/authentication/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.mfaRequired) {
        // Redirecionar para tela de MFA (ainda não implementada)
        setError('MFA requerido, favor entrar em contato.');
      } else {
        localStorage.setItem('gestao_token', response.accessToken);
        localStorage.setItem('gestao_refresh_token', response.refreshToken);
        
        // Fetch user tenants para definir o tenant_id ativo
        const tenants = await apiFetch('/authentication/me/tenants');
        const profile = await apiFetch('/authentication/me');

        if (tenants.length > 0) {
          localStorage.setItem('gestao_tenant_id', tenants[0].tenantId);
          window.location.href = '/';
        } else if (profile.isSuperAdmin) {
          localStorage.removeItem('gestao_tenant_id');
          window.location.href = '/admin/tenants';
        } else {
          setError('Usuário não possui acesso a nenhum locatário.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Gestão de Contratos</CardTitle>
          <CardDescription>
            Insira suas credenciais para acessar a plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@empresa.com"
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                {...form.register('password')}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="keepConnected"
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                {...form.register('keepConnected')}
              />
              <Label htmlFor="keepConnected" className="cursor-pointer text-sm font-medium text-slate-700">
                Mantenha-me conectado
              </Label>
            </div>
            
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
