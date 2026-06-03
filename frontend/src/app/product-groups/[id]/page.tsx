/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Boxes, DollarSign, Activity, Edit, Layers, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'next/navigation';

export default function ProductGroupDetailsPage() {
  const params = useParams();
  const groupId = params?.id as string;

  const { data: group, isLoading, error } = useQuery({
    queryKey: ['product-groups', groupId],
    queryFn: () => apiFetch(`/product-groups/${groupId}`),
    enabled: !!groupId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4 text-slate-500 animate-pulse">
          <Package size={48} className="text-blue-300" />
          <p className="text-lg font-medium">Carregando detalhes do grupo...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 font-medium">Erro ao carregar os detalhes do grupo.</p>
        <Link href="/product-groups">
          <Button variant="outline" className="mt-4">
            Voltar para Grupos
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate statistics based on Contracts
  const totalProducts = group.products?.length || 0;
  const activeProducts = group.products?.filter((p: any) => p.isActive).length || 0;

  let totalActiveContracts = 0;
  let totalRevenue = 0;
  let totalContractedModules = 0;

  group.products?.forEach((product: any) => {
    if (product.contracts) {
      totalActiveContracts += product.contracts.length;
      product.contracts.forEach((contract: any) => {
        totalRevenue += Number(contract.totalValue || 0);
        if (contract.items) {
          contract.items.forEach((item: any) => {
            totalContractedModules += Number(item.quantity || 1);
          });
        }
      });
    }
  });

  const averageContractValue = totalActiveContracts > 0 ? totalRevenue / totalActiveContracts : 0;

  return (
    <div className="space-y-8 pb-12 text-slate-800">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-start gap-5">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl shadow-inner shrink-0">
            <Package className="text-blue-600 w-10 h-10" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">{group.name}</h1>
              <Badge variant={group.isActive ? 'default' : 'secondary'} className={group.isActive ? 'bg-green-100 text-green-800 hover:bg-green-100 shadow-none border-none' : 'shadow-none border-none'}>
                {group.isActive ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 text-sm">
                <Boxes size={16} className="text-slate-400" /> {group.products?.length || 0} Produtos
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              <span className="font-mono text-sm">ID: {group.id.split('-')[0]}</span>
            </div>
            {group.description && (
              <p className="text-slate-600 mt-3 max-w-2xl">{group.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/product-groups">
            <Button variant="outline" className="border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm">
              <ArrowLeft size={16} className="mr-2" /> Voltar
            </Button>
          </Link>
          <Link href={`/product-groups/${group.id}/edit`}>
            <Button variant="outline" className="border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm">
              <Edit size={16} className="mr-2" /> Editar Grupo
            </Button>
          </Link>
        </div>
      </div>

      {/* Contract Statistics Section */}
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Activity className="text-blue-600" size={20} />
          Desempenho Comercial (Contratos Ativos)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-sm border-slate-200 bg-white hover:border-blue-200 hover:shadow-md transition-all">
            <CardContent className="p-6 flex flex-col justify-center">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Contratos Ativos</p>
                  <h3 className="text-3xl font-bold text-slate-800">{totalActiveContracts}</h3>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <Package size={22} />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Referente a <span className="font-medium text-slate-700">{activeProducts}</span> produtos do catálogo
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 bg-white hover:border-emerald-200 hover:shadow-md transition-all">
            <CardContent className="p-6 flex flex-col justify-center">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Receita Total</p>
                  <h3 className="text-3xl font-bold text-slate-800">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
                  </h3>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                  <DollarSign size={22} />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Soma do valor total dos contratos</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md transition-all">
            <CardContent className="p-6 flex flex-col justify-center">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Módulos Contratados</p>
                  <h3 className="text-3xl font-bold text-slate-800">{totalContractedModules}</h3>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Boxes size={22} />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Quantidade total de itens comercializados</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 bg-white hover:border-amber-200 hover:shadow-md transition-all">
            <CardContent className="p-6 flex flex-col justify-center">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Ticket Médio</p>
                  <h3 className="text-3xl font-bold text-slate-800">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(averageContractValue)}
                  </h3>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                  <Activity size={22} />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Média de valor por contrato ativo</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Products and Modules Detail */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="text-blue-600" size={24} />
          <h2 className="text-2xl font-bold text-slate-800">Produtos Vinculados</h2>
        </div>

        {group.products?.length === 0 ? (
          <Card className="bg-slate-50 border-dashed border-slate-300">
            <CardContent className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Info size={40} className="text-slate-300 mb-4" />
              <p className="text-lg font-medium">Nenhum produto vinculado a este grupo.</p>
              <p className="text-sm text-slate-400 mt-1">Os produtos podem ser vinculados durante a criação ou edição de um Produto.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {group.products?.map((product: any) => (
              <Card key={product.id} className="overflow-hidden shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50/80 border-b border-slate-200 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                        {product.name}
                        <Badge variant={product.isActive ? 'outline' : 'secondary'} className="ml-2 text-xs font-normal">
                          {product.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </CardTitle>
                      {product.description && (
                        <CardDescription className="mt-1.5 text-sm">{product.description}</CardDescription>
                      )}
                    </div>
                    <Link href={`/products/${product.id}/edit`}>
                      <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-600">
                        <Edit size={14} className="mr-1" /> Editar Produto
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                
                <div className="p-0">
                  {(!product.modules || product.modules.length === 0) ? (
                    <div className="p-6 text-center text-slate-500 text-sm">
                      Nenhum módulo cadastrado para este produto.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader className="bg-white">
                        <TableRow>
                          <TableHead className="w-[40%] font-semibold">Nome do Módulo</TableHead>
                          <TableHead className="font-semibold text-center">Tipo</TableHead>
                          <TableHead className="font-semibold text-center">Status</TableHead>
                          <TableHead className="text-right font-semibold">Valor Base</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.modules.map((module: any) => (
                          <TableRow key={module.id} className="hover:bg-slate-50 transition-colors">
                            <TableCell className="font-medium text-slate-700">
                              <div className="flex flex-col">
                                <span>{module.name}</span>
                                {module.description && (
                                  <span className="text-xs text-slate-500 font-normal mt-0.5 truncate max-w-md" title={module.description}>
                                    {module.description}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {module.isBaseOffer ? (
                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 font-medium">Oferta Base</Badge>
                              ) : (
                                <Badge variant="outline" className="text-slate-500 font-normal">Adicional</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${module.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                {module.isActive ? 'Ativo' : 'Inativo'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-semibold text-slate-700">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(module.price || 0))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
