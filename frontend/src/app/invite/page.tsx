'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function InviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      const response = await fetch(`${baseUrl}/api/users/accept-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name, passwordHash: password }), // Will be hashed backend
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Falha ao aceitar o convite');
      }

      alert('Conta criada com sucesso! Faça login para continuar.');
      router.push('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-red-600">Link Inválido</CardTitle>
          <CardDescription>O link de convite fornecido não é válido ou já expirou.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Criar sua conta</CardTitle>
        <CardDescription>
          Bem-vindo! Preencha os dados abaixo para aceitar o convite e acessar o sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Seu Nome Completo</Label>
            <Input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João Silva"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Crie uma Senha</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Processando...' : 'Aceitar Convite e Criar Conta'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function InvitePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Suspense fallback={<div>Carregando...</div>}>
        <InviteForm />
      </Suspense>
    </div>
  );
}
