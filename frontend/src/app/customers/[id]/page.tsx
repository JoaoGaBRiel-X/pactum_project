'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, Mail, Phone, MapPin, FileText, Plus, UserCircle, Briefcase, Activity } from 'lucide-react';
import Link from 'next/link';
import { CommunicationHistoryList } from '@/components/customers/CommunicationHistoryList';

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

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Carregando detalhes do cliente...</div>;
  if (!customer) return <div className="p-8 text-center text-destructive">Cliente não encontrado.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Building2 className="text-blue-600 dark:text-blue-400 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">{customer.corporateName}</h1>
            <p className="text-muted-foreground">{customer.document} {customer.tradeName ? `• ${customer.tradeName}` : ''}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/customers/${id}/edit`)}>Editar Cliente</Button>
          <Link href="/contracts/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white"><Plus size={16} className="mr-2" /> Novo Contrato</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna Esquerda - Informações Básicas */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2"><MapPin size={18}/> Endereço</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 dark:text-slate-300">{customer.address || 'Não informado'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2"><Briefcase size={18}/> Grupo Econômico</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.corporateGroup ? (
                <Link href={`/corporate-groups/${customer.corporateGroup.id}`} className="text-blue-600 hover:underline">
                  {customer.corporateGroup.name}
                </Link>
              ) : (
                <span className="text-muted-foreground">Não pertence a nenhum grupo.</span>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2"><UserCircle size={18}/> Contatos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {customer.contacts?.length > 0 ? customer.contacts.map((contact: any) => (
                <div key={contact.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
                  <p className="font-medium">{contact.name}</p>
                  <div className="text-sm text-muted-foreground mt-1 space-y-1">
                    {contact.email && <p className="flex items-center gap-2"><Mail size={14}/> {contact.email}</p>}
                    {contact.phone && <p className="flex items-center gap-2"><Phone size={14}/> {contact.phone}</p>}
                  </div>
                </div>
              )) : (
                <p className="text-muted-foreground">Nenhum contato cadastrado.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita - Contratos e Histórico */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2"><FileText size={20}/> Contratos Atrelados</span>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{customer.contracts?.length || 0}</span>
              </CardTitle>
              <CardDescription>Gerencie os serviços ativos e inativos deste cliente.</CardDescription>
            </CardHeader>
            <CardContent>
              {customer.contracts?.length > 0 ? (
                <div className="space-y-3">
                  {customer.contracts.map((contract: any) => (
                    <div key={contract.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:border-blue-400 transition-colors bg-white dark:bg-slate-950">
                      <div>
                        <Link href={`/contracts/${contract.id}`} className="font-semibold text-slate-800 dark:text-slate-100 hover:text-blue-600 hover:underline">
                          Contrato #{contract.id.split('-')[0].toUpperCase()}
                        </Link>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{contract.product?.name}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Activity size={12}/> Status: {contract.status}</span>
                          <span>Renovação: {contract.renewalMode === 'AUTOMATIC' ? 'Automática' : 'Manual'}</span>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 text-right">
                        <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
                          {Number(contract.totalValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                        <Button variant="ghost" size="sm" className="mt-1" onClick={() => router.push(`/contracts/${contract.id}`)}>Ver Detalhes</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/20 rounded-lg border border-dashed">
                  <FileText className="mx-auto text-slate-400 mb-2 h-10 w-10" />
                  <p className="text-slate-600 dark:text-slate-400 font-medium">Nenhum contrato encontrado</p>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">Este cliente ainda não possui serviços ativos.</p>
                  <Link href="/contracts/new">
                    <Button variant="outline" size="sm">Criar Primeiro Contrato</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Mail size={20}/> Histórico de Comunicações</CardTitle>
              <CardDescription>Acompanhe todos os e-mails e avisos disparados para o cliente.</CardDescription>
            </CardHeader>
            <CardContent>
              <CommunicationHistoryList customerId={id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
