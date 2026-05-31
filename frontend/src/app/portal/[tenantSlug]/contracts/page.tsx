'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PortalContractsPage({ params }: { params: { tenantSlug: string } }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">
          Meus Contratos
        </h1>
        <Link href={`/portal/${params.tenantSlug}/dashboard`}>
          <Button variant="outline">Voltar ao Início</Button>
        </Link>
      </div>

      <div className="bg-white p-8 text-center text-slate-500 rounded-lg shadow border border-slate-100">
        <p>A visualização de contratos detalhados será disponibilizada em breve.</p>
      </div>
    </div>
  );
}
