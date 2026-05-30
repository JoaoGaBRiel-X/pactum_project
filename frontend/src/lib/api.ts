export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'x-tenant-id': 'tenant_1', // Temporariamente mockado
  };
  
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
