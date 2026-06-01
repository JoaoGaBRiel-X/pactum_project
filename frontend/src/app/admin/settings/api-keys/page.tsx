'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api';
import { Trash2, Copy, Check } from 'lucide-react';
import { format } from 'date-fns';

type ApiKey = {
  id: string;
  name: string;
  clientId: string;
  createdAt: string;
};

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [name, setName] = useState('');
  const [newKey, setNewKey] = useState<{ clientId: string; clientSecret: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadApiKeys = async () => {
    try {
      const response = await apiFetch('/tenant-management/api-keys');
      setApiKeys(response);
    } catch (error) {
      console.error('Failed to load API keys', error);
    }
  };

  useEffect(() => {
    loadApiKeys();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const response = await apiFetch('/tenant-management/api-keys', {
        method: 'POST',
        body: JSON.stringify({ name })
      });
      setNewKey({
        clientId: response.clientId,
        clientSecret: response.clientSecret,
      });
      setName('');
      loadApiKeys();
    } catch (error) {
      console.error('Failed to create API key', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Tem certeza que deseja revogar esta chave? Qualquer integração usando ela parará de funcionar.')) {
      return;
    }

    try {
      await apiFetch(`/tenant-management/api-keys/${id}`, { method: 'DELETE' });
      loadApiKeys();
    } catch (error) {
      console.error('Failed to revoke API key', error);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chaves de API</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as credenciais de API para integrações de sistemas de terceiros (B2B) com o seu locatário.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Nova Chave de API</CardTitle>
              <CardDescription>Crie uma credencial para conectar um novo sistema.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Integração</Label>
                  <Input 
                    id="name" 
                    placeholder="Ex: ERP SAP, CRM Salesforce" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading || !name.trim()}>
                  {loading ? 'Criando...' : 'Gerar Credenciais'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          {newKey && (
            <Card className="border-green-500 bg-green-50 dark:bg-green-950">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-400">Credenciais Geradas com Sucesso!</CardTitle>
                <CardDescription className="text-green-600 dark:text-green-500">
                  Copie o Client Secret agora. Por motivos de segurança, ele não será exibido novamente.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Client ID</Label>
                  <Input readOnly value={newKey.clientId} className="font-mono" />
                </div>
                <div className="space-y-2">
                  <Label>Client Secret</Label>
                  <div className="flex gap-2">
                    <Input readOnly value={newKey.clientSecret} className="font-mono flex-1" />
                    <Button type="button" variant="outline" onClick={() => handleCopy(newKey.clientSecret)}>
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </Button>
                  </div>
                </div>
                <Button type="button" variant="secondary" className="w-full" onClick={() => setNewKey(null)}>
                  Eu já copiei o Client Secret
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Chaves Ativas</CardTitle>
              <CardDescription>Sistemas que possuem acesso à API do seu locatário.</CardDescription>
            </CardHeader>
            <CardContent>
              {apiKeys.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma chave de API configurada.
                </div>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{key.name}</p>
                        <p className="text-sm text-muted-foreground font-mono mt-1">ID: {key.clientId}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Criado em: {format(new Date(key.createdAt), "dd/MM/yyyy 'às' HH:mm")}
                        </p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => handleRevoke(key.id)}>
                        <Trash2 size={16} className="mr-2" />
                        Revogar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
