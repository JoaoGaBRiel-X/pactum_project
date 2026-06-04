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
import { Plus, Users, Shield, Pencil, Mail, UserPlus, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function UsersPage() {
  const [data, setData] = useState<{ activeUsers: any[]; pendingInvitations: any[] }>({ activeUsers: [], pendingInvitations: [] });
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Invite Modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const [inviting, setInviting] = useState(false);

  // Edit Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

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

  const handleEditUser = (user: any) => {
    setEditingUser({ ...user });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUpdating(true);
    try {
      await apiFetch(`/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          roleProfileId: editingUser.roleProfileId,
          maxDiscount: editingUser.maxDiscount
        })
      });
      alert('Usuário atualizado com sucesso!');
      setIsEditModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(`Erro ao atualizar: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="animate-pulse flex flex-col items-center gap-4 text-slate-400">
        <Users className="h-12 w-12 opacity-20" />
        <p>Carregando usuários...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="text-primary w-8 h-8 hidden md:block" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestão de Usuários</h1>
            <p className="text-slate-500 mt-1">Gerencie os acessos, permissões e limites de desconto da sua equipe.</p>
          </div>
        </div>
        <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 shadow-sm">
              <UserPlus size={16} className="mr-2" /> Convidar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-500" />
                Enviar Convite de Acesso
              </DialogTitle>
              <DialogDescription>
                O usuário receberá um link seguro por e-mail para definir sua senha e acessar o ambiente.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold text-slate-700">E-mail do Convidado</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="exemplo@suaempresa.com.br" 
                  required 
                  value={inviteEmail} 
                  onChange={e => setInviteEmail(e.target.value)}
                  className="bg-slate-50 focus-visible:bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="font-semibold text-slate-700">Perfil de Acesso (Nível de Permissão)</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger id="role" className="bg-slate-50 focus:bg-white">
                    <SelectValue placeholder="Selecione um perfil adequado" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-2">
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={inviting}>
                  {inviting ? 'Enviando...' : 'Confirmar e Enviar Convite'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {data.pendingInvitations.length > 0 && (
        <Card className="border-amber-200 shadow-sm bg-white overflow-hidden rounded-2xl relative">
          <div className="bg-gradient-to-r from-amber-50 to-white border-b border-amber-100 px-6 py-4">
            <h2 className="text-sm font-bold flex items-center gap-2 text-amber-800 tracking-wide uppercase">
              <Mail size={16} className="text-amber-600"/> Convites Pendentes
            </h2>
          </div>
          <div className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="pl-6">E-mail</TableHead>
                  <TableHead>Data de Expiração</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.pendingInvitations.map(inv => (
                  <TableRow key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="pl-6 font-medium text-slate-700">{inv.email}</TableCell>
                    <TableCell className="text-slate-500">{new Date(inv.expiresAt).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-700 border border-amber-200 rounded-md text-[11px] font-bold uppercase tracking-wider shadow-sm">
                        Aguardando Aceite
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <Card className="border-indigo-100 shadow-sm bg-white overflow-hidden rounded-2xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -z-10 pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="bg-gradient-to-r from-indigo-50/80 to-white/20 border-b border-indigo-100/50 px-6 py-4 backdrop-blur-sm">
          <h2 className="text-sm font-bold flex items-center gap-2 text-indigo-900 tracking-wide uppercase">
            <Shield size={16} className="text-indigo-600"/> Usuários Ativos
          </h2>
        </div>
        <div className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="pl-6">Usuário</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Limite de Desconto</TableHead>
                <TableHead className="text-right pr-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.activeUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="h-8 w-8 text-slate-300" />
                      <span>Nenhum usuário ativo neste locatário.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.activeUsers.map(user => (
                <TableRow key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-slate-200 shadow-sm">
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold">
                          {user.name?.substring(0,2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{user.name}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium">{user.email}</TableCell>
                  <TableCell>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-[11px] font-bold uppercase tracking-wider shadow-sm">
                      {user.roleProfile}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.maxDiscount ? (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[11px] font-bold uppercase tracking-wider shadow-sm">
                        {user.maxDiscount}% MAX
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-200 rounded-md text-[11px] font-bold uppercase tracking-wider shadow-sm">
                        Global
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditUser(user)}
                      className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-500" />
              Editar Permissões do Usuário
            </DialogTitle>
            <DialogDescription>
              Ajuste o perfil de acesso e os limites de alçada específicos deste usuário.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleUpdateUser} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="font-semibold text-slate-700">Nome do Usuário</Label>
                <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-slate-600 font-medium">
                  {editingUser.name}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role" className="font-semibold text-slate-700">Perfil de Acesso</Label>
                <Select value={editingUser.roleProfileId} onValueChange={(val) => setEditingUser({ ...editingUser, roleProfileId: val })}>
                  <SelectTrigger id="edit-role" className="bg-slate-50 focus:bg-white">
                    <SelectValue placeholder="Selecione um perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDiscount" className="font-semibold text-slate-700">Limite de Desconto Máximo (%)</Label>
                <Input 
                  id="maxDiscount" 
                  type="number" 
                  step="0.01" 
                  placeholder="Vazio = Limite Global" 
                  value={editingUser.maxDiscount !== null ? editingUser.maxDiscount : ''} 
                  onChange={(e) => setEditingUser({ ...editingUser, maxDiscount: e.target.value === '' ? null : Number(e.target.value) })}
                  className="bg-slate-50 focus-visible:bg-white"
                />
                <p className="text-xs text-slate-500 leading-relaxed">
                  Descontos acima deste limite exigirão aprovação de um superior. Deixe em branco para usar a configuração global do locatário.
                </p>
              </div>
              <div className="pt-2">
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={updating}>
                  {updating ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
