'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Box, Edit, Layers, Info, CheckCircle2, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useParams, useRouter } from 'next/navigation';

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => apiFetch(`/products/${productId}`),
    enabled: !!productId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4 text-slate-500 animate-pulse">
          <Package size={48} className="text-blue-300" />
          <p className="text-lg font-medium">Carregando detalhes do produto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 font-medium">Erro ao carregar os detalhes do produto.</p>
        <Link href="/products">
          <Button variant="outline" className="mt-4">
            Voltar para Produtos
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate metrics
  const activeModulesCount = product.modules?.filter((m: any) => m.isActive).length || 0;
  const baseOfferModulesCount = product.modules?.filter((m: any) => m.isBaseOffer).length || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 text-slate-800">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-start gap-5">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl shadow-inner shrink-0">
            <Package className="text-blue-600 w-10 h-10" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">{product.name}</h1>
              <Badge variant={product.isActive ? 'default' : 'secondary'} className={product.isActive ? 'bg-green-100 text-green-800 hover:bg-green-100 shadow-none border-none' : 'shadow-none border-none'}>
                {product.isActive ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 text-sm">
                <Box size={16} className="text-slate-400" /> {product.modules?.length || 0} Módulos
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              {product.productGroup ? (
                <Link href={`/product-groups/${product.productGroup.id}`} className="text-blue-600 hover:underline">
                  {product.productGroup.name}
                </Link>
              ) : (
                <span className="text-slate-400 italic">Sem grupo associado</span>
              )}
            </div>
            {product.description && (
              <p className="text-slate-600 mt-3 max-w-2xl">{product.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm" onClick={() => router.push('/products')}>
            <ArrowLeft size={16} className="mr-2" /> Voltar
          </Button>
          <Button variant="outline" className="border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm" onClick={() => router.push(`/products/${productId}/edit`)}>
            <Edit size={16} className="mr-2" /> Editar Produto
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Metrics */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
               <Layers size={80} />
            </div>
            <CardContent className="p-6">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500"/> Módulos Ativos
              </p>
              <h3 className="text-3xl font-bold text-slate-800">
                {activeModulesCount}
              </h3>
              <p className="text-xs text-slate-500 mt-2">De um total de {product.modules?.length || 0} cadastrados</p>
            </CardContent>
          </Card>
          
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
               <Activity size={80} />
            </div>
            <CardContent className="p-6">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Box size={16} className="text-blue-500"/> Ofertas Base
              </p>
              <h3 className="text-3xl font-bold text-slate-800">
                {baseOfferModulesCount}
              </h3>
              <p className="text-xs text-slate-500 mt-2">Módulos que compõem a oferta principal</p>
            </CardContent>
          </Card>
        </div>

        {/* Central/Right Column - Modules Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-50 bg-slate-50/50">
              <CardTitle className="flex items-center justify-between text-slate-800">
                <span className="flex items-center gap-2"><Box size={20} className="text-slate-400"/> Módulos Comercializáveis</span>
                <span className="text-sm bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-semibold">{product.modules?.length || 0}</span>
              </CardTitle>
              <CardDescription className="text-slate-500 mt-1">Lista de módulos que compõem este produto de software.</CardDescription>
            </CardHeader>
            <div className="p-0">
              {(!product.modules || product.modules.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 bg-slate-50/30">
                  <Info size={40} className="text-slate-300 mb-3" />
                  <p className="text-base font-medium">Nenhum módulo cadastrado.</p>
                  <p className="text-sm text-slate-400 mt-1">Edite este produto para adicionar módulos.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50 border-b border-slate-200">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold text-slate-700 py-4 px-6 w-[40%]">Nome do Módulo</TableHead>
                      <TableHead className="font-semibold text-slate-700 py-4 text-center">Tipo</TableHead>
                      <TableHead className="font-semibold text-slate-700 py-4 text-center">Status</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700 py-4 px-6">Valor Base</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.modules.map((module: any) => (
                      <TableRow key={module.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0">
                        <TableCell className="px-6 py-4">
                          <div className="font-semibold text-slate-800">{module.name}</div>
                          {module.maxQuantity && (
                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium border border-slate-200">
                                Limite: {module.maxQuantity}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center py-4">
                          {module.isBaseOffer ? (
                            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 shadow-none border-none font-medium">Oferta Base</Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-500 font-medium border-slate-200 bg-white">Adicional</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center py-4">
                          {module.isActive ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              Inativo
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right py-4 px-6 font-semibold text-slate-700 text-base">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(module.price || 0))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
