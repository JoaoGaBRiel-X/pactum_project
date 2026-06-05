'use client';

import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await apiFetch('/authentication/me');
      setProfile(data);
      setName(data.name || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/authentication/me', {
        method: 'PATCH',
        body: JSON.stringify({ name, password: password || undefined }),
      });
      alert('Perfil atualizado com sucesso!');
      setPassword('');
      window.location.reload(); // Refresh header
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await apiFetch('/authentication/me/avatar', {
        method: 'POST',
        body: formData,
      });
      alert('Foto atualizada!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar foto.');
    }
  };

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Configurações de Perfil</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Sua Foto</CardTitle>
          <CardDescription>Esta foto será exibida no cabeçalho e em ações que você realizar.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={getImageUrl(profile?.avatarUrl)} />
            <AvatarFallback className="bg-slate-800 text-white text-xl">
              {profile?.name?.substring(0, 2).toUpperCase() || 'AD'}
            </AvatarFallback>
          </Avatar>
          <div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              Alterar Foto
            </Button>
            <p className="text-xs text-slate-500 mt-2">Recomendado: JPG, PNG (Max 2MB)</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Atualize seu nome e sua senha de acesso.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail (Login)</Label>
              <Input id="email" value={profile?.email} disabled className="bg-slate-50" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha (deixe em branco para não alterar)</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
