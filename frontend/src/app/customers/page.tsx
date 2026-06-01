'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Pencil, Trash2, Search, MapPin, Eye, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [contractFilter, setContractFilter] = useState('all');
  
  const { data: customers, isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: () => apiFetch('/customers'),
  });

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/customers/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (err: any) => {
      alert(`Erro ao excluir: ${err.message || 'Desconhecido'}`);
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente? Se houver contratos vinculados a ação falhará.')) {
      deleteMutation.mutate(id);
    }
  };

  // Derive unique states and corporate groups for the filters
  const uniqueStates = useMemo(() => {
    if (!customers) return [];
    const states = new Set(customers.map((c: any) => c.state).filter(Boolean));
    return Array.from(states).sort() as string[];
  }, [customers]);

  const uniqueGroups = useMemo(() => {
    if (!customers) return [];
    const groups = new Map();
    customers.forEach((c: any) => {
      if (c.corporateGroup) {
        groups.set(c.corporateGroup.id, c.corporateGroup.name);
      }
    });
    return Array.from(groups.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [customers]);

  const filteredCustomers = customers?.filter((c: any) => {
    // 1. Text Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        (c.corporateName && c.corporateName.toLowerCase().includes(term)) ||
        (c.tradeName && c.tradeName.toLowerCase().includes(term)) ||
        (c.document && c.document.includes(term));
      if (!matchesSearch) return false;
    }

    // 2. State Filter
    if (stateFilter !== 'all' && c.state !== stateFilter) return false;

    // 3. Corporate Group Filter
    if (groupFilter !== 'all') {
      if (groupFilter === 'none') {
        if (c.corporateGroupId) return false;
      } else {
        if (c.corporateGroupId !== groupFilter) return false;
      }
    }

    // 4. Contract Filter
    if (contractFilter !== 'all') {
      const hasActiveContract = c.contracts?.some((contract: any) => contract.status === 'ACTIVE');
      if (contractFilter === 'active' && !hasActiveContract) return false;
      if (contractFilter === 'inactive' && hasActiveContract) return false;
    }

    return true;
  }) || [];

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestão de Clientes</h1>
          <p className="text-slate-500 mt-1">Gerencie as empresas cadastradas no sistema, seus dados e grupos.</p>
        </div>
        <Link href="/customers/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6">Novo Cliente</Button>
        </Link>
      </div>

      <Card className="border-blue-200 shadow-sm bg-blue-50/40 overflow-hidden">
        <div className="bg-blue-100/50 border-b border-blue-200 px-6 py-4">
          <h2 className="text-base font-semibold flex items-center gap-2 text-blue-900">
            <Search size={18} className="text-blue-600"/> Filtros
          </h2>
          <p className="text-sm text-blue-700/80 mt-1">Refine a listagem de clientes usando os critérios abaixo.</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">Busca (Razão Social/CNPJ)</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Buscar cliente..." 
                  className="pl-9 border-slate-200 focus-visible:ring-blue-500" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">Status do Contrato</label>
              <Select value={contractFilter} onValueChange={setContractFilter}>
                <SelectTrigger className="border-slate-200 focus:ring-blue-500">
                  <SelectValue placeholder="Todos os Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Com Contrato Ativo</SelectItem>
                  <SelectItem value="inactive">Sem Contrato Ativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">Grupo Econômico</label>
              <Select value={groupFilter} onValueChange={setGroupFilter}>
                <SelectTrigger className="border-slate-200 focus:ring-blue-500">
                  <SelectValue placeholder="Todos os Grupos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Grupos</SelectItem>
                  <SelectItem value="none">Sem Grupo (Avulsos)</SelectItem>
                  {uniqueGroups.map(([id, name]) => (
                    <SelectItem key={id} value={id}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">Localidade (UF)</label>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="border-slate-200 focus:ring-blue-500">
                  <SelectValue placeholder="Todos os Estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Estados</SelectItem>
                  {uniqueStates.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[35%] font-semibold text-slate-700 py-4 px-6">Cliente</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4">Localidade</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4">Grupo Econômico</TableHead>
              <TableHead className="font-semibold text-center text-slate-700 py-4">Status Contrato</TableHead>
              <TableHead className="text-right font-semibold text-slate-700 py-4 px-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-slate-500 animate-pulse">Carregando clientes...</TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-red-500 flex flex-col items-center gap-2">
                  <AlertCircle size={24} />
                  Erro ao carregar clientes: {error.message}
                </TableCell>
              </TableRow>
            )}
            {filteredCustomers.length === 0 && !isLoading && !error && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16 text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search size={32} className="text-slate-300 mb-2" />
                    <p className="text-base font-medium text-slate-600">Nenhum cliente encontrado</p>
                    <p className="text-sm text-slate-400">Tente ajustar os filtros acima para ver mais resultados.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {filteredCustomers.map((customer: any) => {
              const hasActiveContract = customer.contracts?.some((c: any) => c.status === 'ACTIVE');
              
              return (
                <TableRow key={customer.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0 group">
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col">
                      <Link href={`/customers/${customer.id}`} className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors">{customer.corporateName}</Link>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 font-mono font-medium px-2 py-0.5 rounded-md">
                          {customer.document}
                        </Badge>
                        {customer.tradeName && (
                          <span className="text-xs text-slate-500 truncate max-w-[200px] font-medium flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            {customer.tradeName}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-4">
                    {customer.city && customer.state ? (
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                        <MapPin size={14} className="text-slate-400" />
                        {customer.city} <span className="text-slate-400 font-normal">/ {customer.state}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Não informada</span>
                    )}
                  </TableCell>
                  
                  <TableCell className="py-4">
                    {customer.corporateGroup ? (
                      <Badge variant="outline" className="bg-indigo-50/50 text-indigo-700 border-indigo-200 hover:bg-indigo-50 px-2.5 py-1">
                        {customer.corporateGroup.name}
                      </Badge>
                    ) : (
                      <span className="text-slate-400 text-sm">-</span>
                    )}
                  </TableCell>

                  <TableCell className="text-center py-4">
                    {hasActiveContract ? (
                      <Badge className="bg-emerald-100/80 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 shadow-sm inline-flex items-center gap-1.5 px-2.5 py-1">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <span className="font-medium">Ativo</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-500 border-slate-200 bg-slate-50 hover:bg-slate-100 inline-flex items-center gap-1.5 px-2.5 py-1">
                        <XCircle size={14} className="text-slate-400" />
                        <span className="font-medium">Inativo</span>
                      </Badge>
                    )}
                  </TableCell>
                  
                  <TableCell className="text-right px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Link href={`/customers/${customer.id}`}>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 bg-white border border-slate-200 shadow-sm" title="Ver Detalhes">
                          <Eye size={16} />
                        </Button>
                      </Link>
                      <Link href={`/customers/${customer.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200 shadow-sm" title="Editar Cliente">
                          <Pencil size={16} />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 bg-white border border-slate-200 shadow-sm" title="Excluir" onClick={() => handleDelete(customer.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
