'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Upload, Tag, Calendar, Layers, Power, PowerOff, CheckCircle2, XCircle, Download, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function TemplatesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('STANDARD');
  const [file, setFile] = useState<File | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => apiFetch('/documents/templates'),
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Selecione um arquivo');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);
      formData.append('description', description);
      formData.append('category', category);

      const res = await apiFetch('/documents/templates', {
        method: 'POST',
        body: formData,
      });

      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setOpen(false);
      setName('');
      setDescription('');
      setCategory('STANDARD');
      setFile(null);
    }
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    uploadMutation.mutate();
  };

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string, isActive: boolean }) => {
      const res = await apiFetch(`/documents/templates/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ isActive }),
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/documents/templates/${id}`, { method: 'DELETE' });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template removido com sucesso!');
    },
    onError: (err: any) => {
      toast.error(`Erro ao remover template: ${err.message}`);
    }
  });

  const handleDownload = async (id: string, fileName: string) => {
    try {
      const res = await apiFetch(`/documents/templates/${id}/download`, { rawResponse: true });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error(`Erro ao baixar template: ${err.message}`);
    }
  };

  const templateList = (templates || []).filter((t: any) => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return t.isActive;
    if (filter === 'INACTIVE') return !t.isActive;
    return true;
  });

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <FileText className="text-primary w-8 h-8 hidden md:block" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Templates de Contrato</h1>
            <p className="text-slate-500 mt-1">Gerencie os modelos .docx para geração de contratos e aditivos.</p>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 shadow-sm">
              <Upload size={16} className="mr-2" /> Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl text-slate-800">Upload de Template</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-5 mt-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Categoria</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="STANDARD">Contrato Padrão</option>
                  <option value="ADDENDUM">Aditivo</option>
                  <option value="NOTIFICATION">Notificação</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Nome do Template</Label>
                <Input value={name} onChange={e => setName(e.target.value)} required placeholder="Ex: Contrato Base SaaS" className="border-slate-300 focus-visible:ring-blue-500" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Descrição</Label>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Breve descrição" className="border-slate-300 focus-visible:ring-blue-500" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Arquivo .docx</Label>
                <Input type="file" accept=".docx" onChange={e => setFile(e.target.files?.[0] || null)} required className="border-slate-300 focus-visible:ring-blue-500 cursor-pointer" />
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-300 text-slate-600 hover:bg-slate-50">Cancelar</Button>
                <Button type="submit" disabled={uploadMutation.isPending || !file} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {uploadMutation.isPending ? 'Enviando...' : 'Fazer Upload'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex bg-slate-50 border border-slate-200 p-1.5 rounded-lg w-fit gap-1">
        <Button variant={filter === 'ACTIVE' ? 'default' : 'ghost'} size="sm" onClick={() => setFilter('ACTIVE')} className={filter === 'ACTIVE' ? 'bg-white shadow-sm text-slate-800 hover:bg-white' : 'text-slate-500'}>Ativos</Button>
        <Button variant={filter === 'INACTIVE' ? 'default' : 'ghost'} size="sm" onClick={() => setFilter('INACTIVE')} className={filter === 'INACTIVE' ? 'bg-white shadow-sm text-slate-800 hover:bg-white' : 'text-slate-500'}>Inativos</Button>
        <Button variant={filter === 'ALL' ? 'default' : 'ghost'} size="sm" onClick={() => setFilter('ALL')} className={filter === 'ALL' ? 'bg-white shadow-sm text-slate-800 hover:bg-white' : 'text-slate-500'}>Todos</Button>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-slate-700 py-4 px-6 w-1/3">Nome do Template</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4">Categoria</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4 text-center">Status</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4 text-center">Versão Ativa</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4 text-center">Data</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4 text-right px-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-slate-500 animate-pulse">Carregando templates...</TableCell></TableRow>
            ) : templateList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText size={32} className="text-slate-300 mb-2" />
                    <p className="text-base font-medium text-slate-600">Nenhum template cadastrado.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              templateList.map((t: any) => (
                <TableRow key={t.id} className={`hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0 ${!t.isActive ? 'opacity-60' : ''}`}>
                  <TableCell className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{t.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{t.description || 'Sem descrição'}</div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-1.5">
                      <Tag size={14} className="text-blue-500" />
                      <span className="font-medium text-slate-700 text-sm">
                        {t.category === 'STANDARD' ? 'Padrão' : t.category === 'ADDENDUM' ? 'Aditivo' : t.category}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    {t.isActive ? (
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 rounded-full px-2.5 py-0.5 text-xs font-bold">
                        <CheckCircle2 size={12} /> Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full px-2.5 py-0.5 text-xs font-bold">
                        <XCircle size={12} /> Inativo
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-0.5 text-xs font-bold">
                      v{t.version || 1}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 text-center text-slate-600 text-sm">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="py-4 text-right px-6">
                    <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDownload(t.id, t.name)}
                        className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 bg-white border border-slate-200 shadow-sm rounded-md"
                        title="Baixar Arquivo .docx"
                      >
                        <Download size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => toggleMutation.mutate({ id: t.id, isActive: !t.isActive })}
                        className={`h-8 w-8 bg-white border border-slate-200 shadow-sm rounded-md ${t.isActive ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50' : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                        disabled={toggleMutation.isPending}
                        title={t.isActive ? 'Inativar Template' : 'Ativar Template'}
                      >
                        {t.isActive ? <PowerOff size={14} /> : <Power size={14} />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          if(confirm('Tem certeza que deseja remover este template? Esta ação não pode ser desfeita.')) {
                            deleteMutation.mutate(t.id);
                          }
                        }}
                        className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 bg-white border border-slate-200 shadow-sm rounded-md"
                        disabled={deleteMutation.isPending}
                        title="Remover Template"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
