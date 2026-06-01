'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/lib/api';

export default function PortalLoginPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const router = useRouter();
  const { tenantSlug } = use(params);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepConnected, setKeepConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [mode, setMode] = useState<'login' | 'recover'>('login');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch(`/portal/${tenantSlug}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password, keepConnected }),
      });

      localStorage.setItem('portal_token', data.access_token);
      localStorage.setItem('portal_refresh_token', data.refresh_token);
      localStorage.setItem('portal_user', JSON.stringify(data.user));

      router.push(`/portal/${tenantSlug}/dashboard`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const data = await apiFetch(`/portal/${tenantSlug}/auth/request-magic-link`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSuccessMsg(data.message || 'Link enviado com sucesso. Verifique seu e-mail.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
          Portal do Cliente
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Acesso exclusivo para clientes da empresa <span className="font-semibold text-blue-600 uppercase">{tenantSlug}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {mode === 'login' ? (
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <div className="mt-1">
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Senha</label>
                <div className="mt-1">
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md border border-red-200">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="keepConnected"
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                    checked={keepConnected}
                    onChange={(e) => setKeepConnected(e.target.checked)}
                  />
                  <label htmlFor="keepConnected" className="cursor-pointer text-sm font-medium text-slate-700">
                    Mantenha-me conectado
                  </label>
                </div>
                <div className="text-sm">
                  <button type="button" onClick={() => { setMode('recover'); setError(''); }} className="font-medium text-blue-600 hover:text-blue-500">
                    Primeiro Acesso / Esqueci a senha
                  </button>
                </div>
              </div>

              <div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Entrando...' : 'Acessar Portal'}
                </Button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleRecover}>
              <div>
                <label className="block text-sm font-medium text-slate-700">Qual o seu e-mail?</label>
                <div className="mt-1">
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-mail cadastrado"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">Enviaremos um link seguro para você definir sua senha e acessar o portal.</p>
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md border border-red-200">
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="text-green-700 text-sm bg-green-50 p-3 rounded-md border border-green-200">
                  {successMsg}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading || !!successMsg}>
                  {loading ? 'Enviando...' : 'Receber Link de Acesso'}
                </Button>
                
                <Button type="button" variant="outline" className="w-full" onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}>
                  Voltar para o Login
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
