export async function apiFetch(endpoint: string, options: RequestInit & { _isRetry?: boolean } = {}) {
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
    if (res.status === 401 && isClient && !options._isRetry && endpoint !== '/authentication/login' && endpoint !== '/authentication/refresh') {
      const refreshToken = localStorage.getItem('gestao_refresh_token');
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`http://localhost:3333/api/authentication/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            localStorage.setItem('gestao_token', data.accessToken);
            localStorage.setItem('gestao_refresh_token', data.refreshToken);
            
            // Retry original request
            return apiFetch(endpoint, { ...options, _isRetry: true });
          }
        } catch (e) {
          // ignore, fall through to logout
        }
      }
      // Se não houver refresh token ou o refresh falhar
      localStorage.removeItem('gestao_token');
      localStorage.removeItem('gestao_refresh_token');
      localStorage.removeItem('gestao_tenant_id');
      window.location.href = '/login';
    }

    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Erro na requisição da API');
  }
  
  // Se for 204 No Content, não fazemos o parse do json
  if (res.status === 204) {
    return null;
  }
  
  return res.json().catch(() => ({}));
}
