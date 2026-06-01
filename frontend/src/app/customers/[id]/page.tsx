'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, Mail, Phone, MapPin, FileText, Plus, UserCircle, Briefcase, Activity, Users, FileSignature, CheckCircle2, ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import { CommunicationHistoryList } from '@/components/customers/CommunicationHistoryList';
import { Badge } from '@/components/ui/badge';

export default function CustomerDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch(`/customers/${id}`);
        setCustomer(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="p-12 text-center text-slate-500 font-medium animate-pulse">Carregando detalhes do cliente...</div>;
  if (!customer) return <div className="p-12 text-center text-red-500 font-medium">Cliente não encontrado.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 text-slate-800">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-start gap-5">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl shadow-inner">
            <Building2 className="text-blue-600 w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">{customer.corporateName}</h1>
            <div className="flex flex-wrap items-center gap-3 text-slate-500 font-medium">
              <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 font-mono">
                {customer.document}
              </Badge>
              {customer.tradeName && (
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  {customer.tradeName}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm" onClick={() => router.push('/customers')}>
            <ArrowLeft size={16} className="mr-2" /> Voltar
          </Button>
          <Button variant="outline" className="border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm" onClick={() => router.push(`/customers/${id}/edit`)}>
            <Edit size={16} className="mr-2" /> Editar Cliente
          </Button>
          <Link href="/contracts/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200">
              <Plus size={16} className="mr-2" /> Novo Contrato
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna Esquerda - Informações Básicas, Contatos, Sócios */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-4 border-b border-slate-50 bg-slate-50/50">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800"><MapPin size={18} className="text-slate-400"/> Endereço</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-slate-700">
                {customer.street ? `${customer.street}, ${customer.number || 'S/N'}` : 'Não informado'}
                {customer.complement && ` - ${customer.complement}`}
              </p>
              {customer.neighborhood && <p className="text-slate-600 text-sm mt-1">{customer.neighborhood}</p>}
              {(customer.city || customer.state) && <p className="text-slate-600 text-sm mt-1">{customer.city} / {customer.state}</p>}
              {customer.zipCode && <p className="text-slate-500 text-sm mt-1 font-mono">{customer.zipCode}</p>}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-4 border-b border-slate-50 bg-slate-50/50">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800"><Briefcase size={18} className="text-slate-400"/> Grupo Econômico</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {customer.corporateGroup ? (
                <Link href={`/corporate-groups/${customer.corporateGroup.id}`} className="inline-flex items-center gap-2 text-indigo-700 font-medium hover:text-indigo-800 hover:underline bg-indigo-50 px-3 py-1.5 rounded-md border border-indigo-100">
                  <Building2 size={16} />
                  {customer.corporateGroup.name}
                </Link>
              ) : (
                <span className="text-slate-500 italic">Não pertence a nenhum grupo.</span>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-4 border-b border-slate-50 bg-slate-50/50">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800"><UserCircle size={18} className="text-slate-400"/> Contatos</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {customer.contacts?.length > 0 ? customer.contacts.map((contact: any) => (
                <div key={contact.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-slate-800">{contact.name}</p>
                    {contact.role && <Badge variant="outline" className="text-xs bg-white text-slate-500">{contact.role}</Badge>}
                  </div>
                  <div className="text-sm text-slate-600 space-y-1.5">
                    {contact.email && <p className="flex items-center gap-2 hover:text-blue-600 transition-colors"><Mail size={14} className="text-slate-400"/> {contact.email}</p>}
                    {contact.phone && <p className="flex items-center gap-2"><Phone size={14} className="text-slate-400"/> {contact.phone}</p>}
                  </div>
                </div>
              )) : (
                <p className="text-slate-500 italic">Nenhum contato cadastrado.</p>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Coluna Central/Direita */}
        <div className="lg:col-span-2 space-y-6">

          {/* Seção Sócios e Rep. Legais */}
          <Card className="border-slate-200 shadow-sm bg-white">
             <CardHeader className="pb-4 border-b border-slate-50 bg-slate-50/50">
              <CardTitle className="flex items-center justify-between text-slate-800">
                <span className="flex items-center gap-2"><Users size={20} className="text-slate-400"/> Sócios e Assinantes</span>
              </CardTitle>
              <CardDescription className="text-slate-500">Quadro societário e procuradores legais.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Sócios da Empresa</h3>
                {customer.partners?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {customer.partners.map((partner: any) => (
                      <div key={partner.id} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-slate-800">{partner.name}</span>
                          {partner.share != null && <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none">{Number(partner.share)}%</Badge>}
                        </div>
                        <span className="text-sm text-slate-500 font-mono">{partner.document}</span>
                        {partner.isLegalRep && (
                          <div className="mt-2 pt-2 border-t border-slate-50 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                            <CheckCircle2 size={14} /> Assina Contrato
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm italic">Nenhum sócio cadastrado.</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Outros Representantes Legais</h3>
                {customer.legalRepresentatives?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {customer.legalRepresentatives.map((rep: any) => (
                      <div key={rep.id} className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-slate-800">{rep.name}</span>
                          <FileSignature size={16} className="text-blue-500" />
                        </div>
                        <span className="text-sm text-slate-500 font-mono">{rep.cpf}</span>
                        {(rep.email || rep.phone) && (
                          <div className="mt-2 pt-2 border-t border-blue-100/50 text-xs text-slate-600 space-y-1">
                            {rep.email && <div>{rep.email}</div>}
                            {rep.phone && <div>{rep.phone}</div>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm italic">Nenhum representante externo cadastrado.</p>
                )}
              </div>

            </CardContent>
          </Card>

          {/* Seção Contratos */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-4 border-b border-slate-50 bg-slate-50/50">
              <CardTitle className="flex items-center justify-between text-slate-800">
                <span className="flex items-center gap-2"><FileText size={20} className="text-slate-400"/> Contratos Atrelados</span>
                <span className="text-sm bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-semibold">{customer.contracts?.length || 0}</span>
              </CardTitle>
              <CardDescription className="text-slate-500">Gerencie os serviços ativos e inativos deste cliente.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {customer.contracts?.length > 0 ? (
                <div className="space-y-4">
                  {customer.contracts.map((contract: any) => (
                    <div key={contract.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all bg-white group">
                      <div>
                        <Link href={`/contracts/${contract.id}`} className="font-semibold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">
                          Contrato #{contract.id.split('-')[0].toUpperCase()}
                        </Link>
                        <p className="text-sm font-medium text-slate-500 mt-1">{contract.product?.name}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <Badge variant={contract.status === 'ACTIVE' ? 'default' : 'secondary'} className={contract.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow-none border-none' : 'bg-slate-100 text-slate-600 border-none'}>
                            {contract.status}
                          </Badge>
                          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                            <Activity size={14} /> Renovação: {contract.renewalMode === 'AUTOMATIC' ? 'Automática' : 'Manual'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-5 sm:mt-0 text-right flex flex-col items-end">
                        <div className="text-xl font-bold text-slate-900 tracking-tight">
                          {Number(contract.totalValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                        <Button variant="outline" size="sm" className="mt-3 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-sm" onClick={() => router.push(`/contracts/${contract.id}`)}>
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <FileText className="mx-auto text-slate-300 mb-3 h-12 w-12" />
                  <p className="text-slate-700 font-semibold text-lg">Nenhum contrato encontrado</p>
                  <p className="text-sm text-slate-500 mt-1 mb-6 max-w-sm mx-auto">Este cliente ainda não possui serviços ativos. Crie o primeiro contrato para começar.</p>
                  <Link href="/contracts/new">
                    <Button className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm">
                      Criar Primeiro Contrato
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-4 border-b border-slate-50 bg-slate-50/50">
              <CardTitle className="flex items-center gap-2 text-slate-800"><Mail size={20} className="text-slate-400"/> Histórico de Comunicações</CardTitle>
              <CardDescription className="text-slate-500">Acompanhe todos os e-mails e avisos disparados para o cliente.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <CommunicationHistoryList customerId={id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
