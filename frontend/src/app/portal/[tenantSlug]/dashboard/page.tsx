'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function PortalDashboard({ params }: { params: { tenantSlug: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push(`/portal/${params.tenantSlug}/login`);
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'CUSTOMER') {
      router.push(`/portal/${params.tenantSlug}/login`);
      return;
    }
    setUser(parsedUser);
  }, [params.tenantSlug, router]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">
        Bem-vindo, {user.name}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href={`/portal/${params.tenantSlug}/contracts`}>
          <Card className="hover:border-blue-300 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium text-slate-700">Meus Contratos</CardTitle>
              <FileText className="text-blue-500" size={24} />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Visualize seus contratos ativos e status.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/portal/${params.tenantSlug}/financial`}>
          <Card className="hover:border-green-300 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium text-slate-700">Financeiro</CardTitle>
              <DollarSign className="text-green-500" size={24} />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Acesse seus boletos, notas fiscais e histórico de pagamentos.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
