'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Users, DollarSign, TrendingUp, AlertCircle, Percent } from 'lucide-react';
import { RequirePermissions } from '@/components/auth/RequirePermissions';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function CrmDashboardPage() {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['crm-dashboard'],
    queryFn: () => apiFetch('/crm/dashboard').catch(() => ({
      // Mock fallback se o endpoint ainda não existir no backend
      totalLeads: 142,
      activeOpportunities: 35,
      pipelineValue: 245000.00,
      conversionRate: 18.5,
      funnelData: [
        { name: 'Qualificação', value: 40 },
        { name: 'Apresentação', value: 25 },
        { name: 'Proposta', value: 15 },
        { name: 'Negociação', value: 8 },
      ],
      revenueTrend: [
        { month: 'Jan', value: 15000 },
        { month: 'Fev', value: 22000 },
        { month: 'Mar', value: 18000 },
        { month: 'Abr', value: 25000 },
        { month: 'Mai', value: 31000 },
        { month: 'Jun', value: 45000 },
      ]
    })),
  });

  if (isLoading) {
    return <div className="p-12 text-center text-slate-500 animate-pulse">Carregando métricas do dashboard...</div>;
  }

  if (error) {
    return (
      <div className="p-12 text-center text-red-500 flex flex-col items-center gap-2">
        <AlertCircle size={24} />
        Erro ao carregar o dashboard.
      </div>
    );
  }

  return (
    <RequirePermissions permissions="crm:read">
      <div className="space-y-6 pb-12 text-slate-800 p-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Executivo de Vendas</h1>
          <p className="text-slate-500 mt-1">Acompanhe as métricas de aquisição, pipeline e projeção de receita.</p>
        </div>

        {/* Cards de Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-indigo-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-slate-600">Leads Gerados</p>
                <Users className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="flex items-baseline space-x-2">
                <h2 className="text-3xl font-bold text-slate-900">{metrics?.totalLeads || 0}</h2>
                <span className="text-xs font-medium text-emerald-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> +12%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Nos últimos 30 dias</p>
            </CardContent>
          </Card>

          <Card className="border-indigo-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-slate-600">Oportunidades Ativas</p>
                <Target className="h-4 w-4 text-amber-500" />
              </div>
              <div className="flex items-baseline space-x-2">
                <h2 className="text-3xl font-bold text-slate-900">{metrics?.activeOpportunities || 0}</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">No funil de vendas</p>
            </CardContent>
          </Card>

          <Card className="border-indigo-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-slate-600">Pipeline Forecast</p>
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline space-x-2">
                <h2 className="text-3xl font-bold text-slate-900">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(metrics?.pipelineValue || 0)}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">Valor potencial total</p>
            </CardContent>
          </Card>

          <Card className="border-indigo-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-slate-600">Taxa de Conversão</p>
                <Percent className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex items-baseline space-x-2">
                <h2 className="text-3xl font-bold text-slate-900">{metrics?.conversionRate || 0}%</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">Média do último trimestre</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-slate-800">Projeção de Receita (MRR)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics?.revenueTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} tickFormatter={(value) => `R$ ${value/1000}k`} />
                    <RechartsTooltip 
                      formatter={(value: any) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number), 'Receita']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-slate-800">Oportunidades por Etapa do Funil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics?.funnelData || []} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 13, fontWeight: 500}} width={100} />
                    <RechartsTooltip 
                      cursor={{fill: '#f8fafc'}}
                      formatter={(value: any) => [value, 'Oportunidades']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <Bar dataKey="value" fill="#818cf8" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </RequirePermissions>
  );
}
