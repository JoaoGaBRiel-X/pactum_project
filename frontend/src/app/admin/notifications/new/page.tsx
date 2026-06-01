'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';

export default function NewNotificationTemplatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    category: 'COMMERCIAL',
    subject: '',
    content: '',
    isActive: true,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => apiFetch('/notification-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      router.push('/admin/notifications');
    },
    onError: (err: any) => alert(`Erro: ${err.message}`)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/notifications">
          <Button variant="outline" size="icon"><ArrowLeft size={16} /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Novo Template</h1>
          <p className="text-muted-foreground">Crie um novo template de e-mail.</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg flex gap-3 text-sm">
        <Info className="shrink-0" size={20} />
        <div>
          <p className="font-semibold mb-1">Variáveis Disponíveis:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><code>{`{{customer.corporateName}}`}</code> - Nome do Cliente</li>
            <li><code>{`{{receivable.amount}}`}</code> - Valor do Boleto/Fatura</li>
            <li><code>{`{{receivable.dueDate}}`}</code> - Vencimento</li>
            <li><code>{`{{receivable.boletoUrl}}`}</code> - Link do Boleto</li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Identificador (Nome Único)</label>
            <Input 
              required 
              placeholder="Ex: NEW_BOLETO" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Categoria</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="COMMERCIAL">Comercial</option>
              <option value="FINANCIAL">Financeiro</option>
              <option value="CONTRACT">Contratos</option>
              <option value="RENEWAL">Renovação</option>
            </select>
          </div>
          <div className="space-y-2 flex flex-col justify-end">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 h-10">
              <input 
                type="checkbox" 
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="w-4 h-4"
              />
              Template Ativo
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Assunto do E-mail</label>
          <Input 
            required 
            placeholder="Ex: Novo boleto disponível para {{customer.corporateName}}" 
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Corpo do E-mail (HTML permitido)</label>
          <textarea 
            required
            rows={10}
            className="w-full border rounded-md p-3 text-sm font-mono"
            placeholder={`<h1>Olá {{customer.corporateName}},</h1>\n<p>Seu boleto no valor de R$ {{receivable.amount}} está disponível.</p>\n<a href="http://localhost:3333{{receivable.boletoUrl}}">Baixar Boleto</a>`}
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
          />
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Salvando...' : 'Salvar Template'}
          </Button>
        </div>
      </form>
    </div>
  );
}
