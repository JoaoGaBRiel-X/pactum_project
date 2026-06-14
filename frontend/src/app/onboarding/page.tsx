'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, AlertCircle, PlusCircle, ClipboardCheck, Calendar, Activity, CheckCircle2, Clock } from 'lucide-react';
import { RequirePermissions } from '@/components/auth/RequirePermissions';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function OnboardingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['onboarding-projects'],
    queryFn: () => apiFetch('/onboarding/projects').catch(() => ([
      // Fallback/Mock até o endpoint existir
      { id: '1', contract: { id: 'c1', customer: { corporateName: 'Restaurante Sabor' } }, status: 'IN_PROGRESS', startDate: new Date().toISOString(), expectedEndDate: new Date(Date.now() + 86400000 * 7).toISOString(), totalTasks: 10, completedTasks: 4 },
      { id: '2', contract: { id: 'c2', customer: { corporateName: 'Padaria Central' } }, status: 'PENDING', startDate: new Date().toISOString(), expectedEndDate: new Date(Date.now() + 86400000 * 15).toISOString(), totalTasks: 8, completedTasks: 0 },
      { id: '3', contract: { id: 'c3', customer: { corporateName: 'Pizzaria Napolitana' } }, status: 'COMPLETED', startDate: new Date(Date.now() - 86400000 * 15).toISOString(), expectedEndDate: new Date().toISOString(), totalTasks: 12, completedTasks: 12 }
    ])),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200"><Clock size={12} className="mr-1"/> Aguardando Início</Badge>;
      case 'IN_PROGRESS': return <Badge className="bg-blue-100 text-blue-700 border border-blue-200 shadow-none"><Activity size={12} className="mr-1"/> Em Andamento</Badge>;
      case 'COMPLETED': return <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-none"><CheckCircle2 size={12} className="mr-1"/> Concluído</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const filteredProjects = projects?.filter((p: any) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        (p.contract?.customer?.corporateName && p.contract.customer.corporateName.toLowerCase().includes(term))
      );
    }
    return true;
  }) || [];

  return (
    <div className="space-y-6 pb-12 text-slate-800 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Implantações (Onboarding)</h1>
          <p className="text-slate-500 mt-1">Acompanhe as tarefas e progresso de ativação dos clientes pós-venda.</p>
        </div>
        <RequirePermissions permissions="onboarding:manage">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 gap-2">
            <PlusCircle size={18} /> Novo Projeto
          </Button>
        </RequirePermissions>
      </div>

      <Card className="border-indigo-100 shadow-sm bg-indigo-50/30 overflow-hidden">
        <div className="bg-indigo-50/80 border-b border-indigo-100 px-6 py-4">
          <h2 className="text-base font-semibold flex items-center gap-2 text-indigo-900">
            <Search size={18} className="text-indigo-600"/> Filtros
          </h2>
        </div>
        <div className="p-6">
          <div className="w-full md:max-w-md">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">Busca por Cliente</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar projeto..." 
                className="pl-9 border-slate-200 focus-visible:ring-indigo-500" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {isLoading && (
        <div className="p-12 text-center text-slate-500 animate-pulse">Carregando projetos de implantação...</div>
      )}

      {error && (
        <div className="p-12 text-center text-red-500 flex flex-col items-center gap-2 border border-red-200 rounded-xl bg-red-50">
          <AlertCircle size={24} />
          Erro ao carregar projetos: {error.message}
        </div>
      )}

      {!isLoading && !error && filteredProjects.length === 0 && (
        <div className="text-center py-16 text-slate-500 border border-slate-200 rounded-xl bg-white shadow-sm">
          <div className="flex flex-col items-center justify-center gap-2">
            <ClipboardCheck size={32} className="text-slate-300 mb-2" />
            <p className="text-base font-medium text-slate-600">Nenhum projeto encontrado</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project: any) => {
          const progress = project.totalTasks > 0 ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0;
          
          return (
            <Card key={project.id} className="border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col h-full bg-white group cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  {getStatusBadge(project.status)}
                </div>
                <CardTitle className="text-lg text-indigo-900 group-hover:text-indigo-700 transition-colors">
                  {project.contract?.customer?.corporateName}
                </CardTitle>
                <CardDescription className="text-xs font-mono text-slate-500">
                  Projeto #{project.id.substring(0, 8)}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-0 pb-6 flex-1 flex flex-col justify-end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-1.5" title="Data de Início">
                      <Calendar size={14} className="text-slate-400" />
                      {new Date(project.startDate).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex items-center gap-1.5" title="Previsão de Fim">
                      <Clock size={14} className="text-slate-400" />
                      {new Date(project.expectedEndDate).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 pt-4 border-t border-slate-100">
                    <div className="flex justify-between text-xs font-medium text-slate-700">
                      <span>Progresso</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-slate-100" />
                    <p className="text-xs text-slate-500 text-right mt-1">
                      {project.completedTasks} de {project.totalTasks} tarefas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
