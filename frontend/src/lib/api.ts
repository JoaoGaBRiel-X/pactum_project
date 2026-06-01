export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const isClient = typeof window !== 'undefined';
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (isClient) {
    const token = localStorage.getItem('gestao_token') || localStorage.getItem('portal_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    const tenantId = localStorage.getItem('gestao_tenant_id');
    if (tenantId) {
      defaultHeaders['x-tenant-id'] = tenantId;
    }
  }
  
  const res = await fetch(`http://localhost:3333/api${endpoint}`, {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Erro na requisição da API');
  }
  
  return res.json();
}
