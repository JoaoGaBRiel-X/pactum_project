'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, Users, Calendar, ArrowLeft, Edit, Eye } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function CorporateGroupDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch(`/corporate-groups/${id}`);
        setGroup(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="p-12 text-center text-slate-500 font-medium animate-pulse">Carregando detalhes do grupo...</div>;
  if (!group) return <div className="p-12 text-center text-red-500 font-medium">Grupo Econômico não encontrado.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 text-slate-800">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-start gap-5">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl shadow-inner">
            <Building2 className="text-blue-600 w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">{group.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-slate-500 font-medium">
              <span className="flex items-center gap-1.5"><Users size={16}/> {group.customers?.length || 0} Empresas Vinculadas</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              <span className="font-mono text-sm">ID: {group.id.split('-')[0]}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm" onClick={() => router.push('/corporate-groups')}>
            <ArrowLeft size={16} className="mr-2" /> Voltar
          </Button>
          <Button variant="outline" className="border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm" onClick={() => router.push(`/corporate-groups/${id}/edit`)}>
            <Edit size={16} className="mr-2" /> Editar Grupo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna Esquerda - Informações Básicas */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-4 border-b border-slate-50 bg-slate-50/50">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800"><Calendar size={18} className="text-slate-400"/> Registro</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Criado em</p>
                <p className="text-slate-800 font-medium">{new Date(group.createdAt).toLocaleDateString('pt-BR')} às {new Date(group.createdAt).toLocaleTimeString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Última atualização</p>
                <p className="text-slate-800 font-medium">{new Date(group.updatedAt).toLocaleDateString('pt-BR')} às {new Date(group.updatedAt).toLocaleTimeString('pt-BR')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Central/Direita */}
        <div className="lg:col-span-2 space-y-6">

          {/* Seção Clientes Vinculados */}
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
             <CardHeader className="pb-4 border-b border-slate-50 bg-slate-50/50">
              <CardTitle className="flex items-center justify-between text-slate-800">
                <span className="flex items-center gap-2"><Building2 size={20} className="text-slate-400"/> Empresas Vinculadas</span>
              </CardTitle>
              <CardDescription className="text-slate-500">Lista de todas as empresas pertencentes a este grupo econômico.</CardDescription>
            </CardHeader>
            <div className="p-0">
              <Table>
                <TableHeader className="bg-slate-50 border-b border-slate-200">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-slate-700 py-4 px-6">Empresa</TableHead>
                    <TableHead className="font-semibold text-slate-700 py-4 text-right px-6">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.customers?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-16 text-slate-500">
                        Nenhuma empresa vinculada a este grupo.
                      </TableCell>
                    </TableRow>
                  ) : (
                    group.customers?.map((customer: any) => (
                      <TableRow key={customer.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0 group">
                        <TableCell className="px-6 py-4">
                          <div className="font-semibold text-slate-800">{customer.corporateName}</div>
                          <div className="text-sm text-slate-500 font-mono mt-0.5">{customer.document}</div>
                        </TableCell>
                        <TableCell className="text-right px-6 py-4">
                          <Link href={`/customers/${customer.id}`}>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 bg-white border border-slate-200 shadow-sm opacity-80 group-hover:opacity-100 transition-opacity" title="Ver Cliente">
                              <Eye size={16} />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
