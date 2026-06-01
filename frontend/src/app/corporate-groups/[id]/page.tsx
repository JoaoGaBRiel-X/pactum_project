'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, Users, Calendar, ArrowLeft, Edit, Eye, Plus, Search, DollarSign, Activity, FileText, Trash2, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function CorporateGroupDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [group, setGroup] = useState<any>(null);
  const [financialSummary, setFinancialSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [onlyWithoutGroup, setOnlyWithoutGroup] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [isLinking, setIsLinking] = useState(false);

  const fetchGroupData = async () => {
    try {
      const [groupData, summaryData] = await Promise.all([
        apiFetch(`/corporate-groups/${id}`),
        apiFetch(`/corporate-groups/${id}/financial-summary`)
      ]);
      setGroup(groupData);
      setFinancialSummary(summaryData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    async function load() {
      await fetchGroupData();
      setLoading(false);
    }
    load();
  }, [id]);

  const loadAllCustomers = async () => {
    if (allCustomers.length > 0) return;
    try {
      const data = await apiFetch('/customers');
      setAllCustomers(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    loadAllCustomers();
    setSelectedCustomerIds([]);
    setSearchTerm('');
  };

  const handleLinkCustomers = async () => {
    if (selectedCustomerIds.length === 0) return;
    setIsLinking(true);
    try {
      await apiFetch(`/corporate-groups/${id}/customers`, {
        method: 'POST',
        body: JSON.stringify({ customerIds: selectedCustomerIds })
      });
      setIsModalOpen(false);
      await fetchGroupData();
    } catch (e) {
      console.error(e);
      alert('Erro ao vincular clientes.');
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkCustomer = async (customerId: string) => {
    if (!window.confirm('Deseja realmente desvincular esta empresa do grupo?')) return;
    try {
      await apiFetch(`/corporate-groups/${id}/customers/${customerId}`, {
        method: 'DELETE'
      });
      await fetchGroupData();
    } catch (e) {
      console.error(e);
      alert('Erro ao desvincular empresa.');
    }
  };

  const availableCustomers = allCustomers.filter(c => {
    if (c.id === group?.id) return false;
    if (group?.customers?.some((gc: any) => gc.id === c.id)) return false;
    if (onlyWithoutGroup && c.corporateGroupId) return false;
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (!c.corporateName?.toLowerCase().includes(search) && !c.document?.includes(search)) {
        return false;
      }
    }
    return true;
  });

  const toggleCustomerSelection = (customerId: string) => {
    if (selectedCustomerIds.includes(customerId)) {
      setSelectedCustomerIds(selectedCustomerIds.filter(cid => cid !== customerId));
    } else {
      setSelectedCustomerIds([...selectedCustomerIds, customerId]);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500 font-medium animate-pulse">Carregando detalhes do grupo...</div>;
  if (!group) return <div className="p-12 text-center text-red-500 font-medium">Grupo Econômico não encontrado.</div>;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

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

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
             <DollarSign size={80} />
          </div>
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Activity size={16} className="text-blue-500"/> Total em Contratos Ativos
            </p>
            <h3 className="text-3xl font-bold text-slate-800">
              {formatCurrency(financialSummary?.totalActiveContractsValue || 0)}
            </h3>
            <p className="text-xs text-slate-500 mt-2">Soma do MRR de todas as empresas do grupo</p>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
             <FileText size={80} />
          </div>
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500"/> Contratos Ativos
            </p>
            <h3 className="text-3xl font-bold text-slate-800">
              {financialSummary?.activeContractsCount || 0}
            </h3>
            <p className="text-xs text-slate-500 mt-2">Volume total de contratos em vigência</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
             <Activity size={80} />
          </div>
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Activity size={16} className="text-red-500"/> Dívida Pendente
            </p>
            <h3 className="text-3xl font-bold text-slate-800">
              {formatCurrency(financialSummary?.totalPendingDebt || 0)}
            </h3>
            <p className="text-xs text-slate-500 mt-2">Soma de recebíveis pendentes ou atrasados</p>
          </CardContent>
        </Card>
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
             <CardHeader className="pb-4 border-b border-slate-50 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Building2 size={20} className="text-slate-400"/> Empresas Vinculadas
                </CardTitle>
                <CardDescription className="text-slate-500 mt-1">Lista de todas as empresas pertencentes a este grupo econômico.</CardDescription>
              </div>
              
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleOpenModal} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200 shrink-0">
                    <LinkIcon size={16} className="mr-2" /> Vincular Empresa
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Vincular Empresas ao Grupo</DialogTitle>
                    <DialogDescription>
                      Selecione uma ou mais empresas para vincular ao grupo <strong>{group.name}</strong>.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input 
                          placeholder="Buscar por nome ou CNPJ..." 
                          className="pl-9"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer whitespace-nowrap bg-slate-50 px-3 py-2 rounded-md border border-slate-200">
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-600 w-4 h-4 cursor-pointer"
                          checked={onlyWithoutGroup}
                          onChange={(e) => setOnlyWithoutGroup(e.target.checked)}
                        />
                        Somente empresas sem grupo
                      </label>
                    </div>

                    <div className="border border-slate-200 rounded-md max-h-[350px] overflow-y-auto bg-white shadow-inner">
                      <Table>
                        <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                          <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Empresa</TableHead>
                            <TableHead>Grupo Atual</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {availableCustomers.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center py-10 text-slate-500">
                                Nenhuma empresa encontrada com os filtros atuais.
                              </TableCell>
                            </TableRow>
                          ) : (
                            availableCustomers.map(customer => (
                              <TableRow key={customer.id} className="cursor-pointer hover:bg-blue-50/50 transition-colors" onClick={() => toggleCustomerSelection(customer.id)}>
                                <TableCell>
                                  <input 
                                    type="checkbox"
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-600 w-4 h-4 cursor-pointer"
                                    checked={selectedCustomerIds.includes(customer.id)}
                                    onChange={() => {}} // handled by row click
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="font-semibold text-slate-800">{customer.corporateName}</div>
                                  <div className="text-xs text-slate-500 font-mono mt-0.5">{customer.document}</div>
                                </TableCell>
                                <TableCell>
                                  {customer.corporateGroup ? (
                                    <span className="text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-800 rounded">
                                      {customer.corporateGroup.name}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-slate-400 italic">Nenhum</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    <p className="text-sm font-medium text-slate-600 bg-slate-50 p-2 rounded text-center border border-slate-100">
                      <strong className="text-blue-600">{selectedCustomerIds.length}</strong> empresa(s) selecionada(s)
                    </p>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                    <Button onClick={handleLinkCustomers} disabled={selectedCustomerIds.length === 0 || isLinking} className="bg-blue-600 hover:bg-blue-700 text-white">
                      {isLinking ? 'Vinculando...' : 'Confirmar Vínculo'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                      <TableRow key={customer.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0 group-row">
                        <TableCell className="px-6 py-4">
                          <Link href={`/customers/${customer.id}`} className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                            {customer.corporateName}
                          </Link>
                          <div className="text-sm text-slate-500 font-mono mt-0.5">{customer.document}</div>
                        </TableCell>
                        <TableCell className="text-right px-6 py-4">
                          <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                            <Link href={`/customers/${customer.id}`}>
                              <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 bg-white border border-slate-200 shadow-sm" title="Ver Cliente">
                                <Eye size={16} />
                              </Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 bg-white border border-slate-200 shadow-sm" 
                              title="Desvincular Empresa"
                              onClick={() => handleUnlinkCustomer(customer.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
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
