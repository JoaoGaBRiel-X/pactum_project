import { redirect } from 'next/navigation';

export default async function PortalRootPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  
  // Por padrão, redirecionamos para a tela de login.
  // Se o usuário já estiver logado, a proteção de rotas no dashboard deve gerenciar isso.
  redirect(`/portal/${tenantSlug}/login`);
}
