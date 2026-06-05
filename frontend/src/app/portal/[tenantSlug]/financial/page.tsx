'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function PortalFinancialPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const router = useRouter();
  const { tenantSlug } = use(params);
  
  useEffect(() => {
    const userData = localStorage.getItem('portal_user');
    if (!userData) {
      router.push(`/portal/${tenantSlug}/login`);
    }
  }, [tenantSlug, router]);

  const { data: receivables, isLoading } = useQuery({
    queryKey: ['portal-financial', tenantSlug],
    queryFn: () => apiFetch(`/portal/${tenantSlug}/financial`),
  });

  if (isLoading) return <div>Carregando histórico...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">
          Financeiro
        </h1>
        <Link href={`/portal/${tenantSlug}/dashboard`}>
          <Button variant="outline">Voltar ao Início</Button>
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vencimento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Descrição / Contrato</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Valor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ação</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {receivables?.map((item: any) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                  {new Date(item.dueDate).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  Mensalidade ({item.contract?.product?.name || 'N/A'})
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                  R$ {Number(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.status === 'PAID' ? 'bg-green-100 text-green-800' :
                    item.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status === 'PAID' ? 'Pago' : item.status === 'OVERDUE' ? 'Atrasado' : 'Pendente'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {item.boletoUrl ? (
                    <a href={`${process.env.NEXT_PUBLIC_API_URL || ''}/api${item.boletoUrl}`} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm" className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50">
                        <Download size={14} className="mr-2" />
                        Baixar Boleto
                      </Button>
                    </a>
                  ) : (
                    <span className="text-slate-400 text-xs">Indisponível</span>
                  )}
                </td>
              </tr>
            ))}
            {receivables?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  Nenhum registro financeiro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
