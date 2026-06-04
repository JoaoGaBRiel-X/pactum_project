'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

export default function UsersPage() {
  const [data, setData] = useState<{ activeUsers: any[]; pendingInvitations: any[] }>({ activeUsers: [], pendingInvitations: [] });
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, rolesData] = await Promise.all([
        apiFetch('/users'),
        apiFetch('/users/roles')
      ]);
      setData(usersData);
      setRoles(rolesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteRole) return alert('Preencha os campos obrigatórios');
    
    setInviting(true);
    try {
      await apiFetch('/users/invite', {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail, roleProfileId: inviteRole })
      });
      alert('Convite enviado com sucesso!');
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteRole('');
      loadData();
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setInviting(false);
    }
  };

  if (loading) return <div className="p-8">Carregando usuários...</div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Usuários</h1>
          <p className="text-sm text-slate-500">Gerencie acessos e permissões do tenant atual.</p>
        </div>
        <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus size={16} /> Convidar Usuário</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar Convite de Acesso</DialogTitle>
              <DialogDescription>
                O usuário receberá um link por e-mail para criar a senha e acessar este ambiente.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail do Convidado</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="usuario@empresa.com.br" 
                  required 
                  value={inviteEmail} 
                  onChange={e => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Nível de Permissão (Perfil)</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Selecione um perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={inviting}>
                {inviting ? 'Enviando...' : 'Enviar Convite'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Usuários Ativos</h2>
        <div className="border rounded-md bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Perfil</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.activeUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-slate-500">Nenhum usuário ativo.</TableCell>
                </TableRow>
              ) : data.activeUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback>{user.name?.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{user.roleProfile}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {data.pendingInvitations.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-semibold">Convites Pendentes</h2>
          <div className="border rounded-md bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Data de Expiração</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.pendingInvitations.map(inv => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.email}</TableCell>
                    <TableCell>{new Date(inv.expiresAt).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                        Aguardando Aceite
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
