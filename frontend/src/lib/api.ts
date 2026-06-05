export async function apiFetch(endpoint: string, options: RequestInit & { _isRetry?: boolean, rawResponse?: boolean } = {}) {
  const isServer = typeof window === 'undefined';
  const isClient = !isServer;
  const isPortalEndpoint = endpoint.startsWith('/portal');

  const defaultHeaders: Record<string, string> = {};
  
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  if (isClient) {
    const token = isPortalEndpoint 
      ? localStorage.getItem('portal_token') 
      : localStorage.getItem('gestao_token');

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    if (!isPortalEndpoint) {
      const tenantId = localStorage.getItem('gestao_tenant_id');
      if (tenantId) {
        defaultHeaders['x-tenant-id'] = tenantId;
      }
    }
  }
  
  const baseUrl = isServer
    ? (process.env.INTERNAL_API_URL || 'http://backend:3000')
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333');
  const res = await fetch(`${baseUrl}/api${endpoint}`, {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
  });
  
  if (!res.ok) {
    if (res.status === 401 && isClient && !options._isRetry && !endpoint.includes('/login') && !endpoint.includes('/refresh') && !endpoint.includes('/request-magic-link')) {
      const refreshToken = isPortalEndpoint 
        ? localStorage.getItem('portal_refresh_token') 
        : localStorage.getItem('gestao_refresh_token');

      if (refreshToken) {
        try {
          let refreshUrl = `${baseUrl}/api/authentication/refresh`;
          if (isPortalEndpoint) {
             const match = endpoint.match(/^\/portal\/([^/]+)/);
             if (match) {
                 refreshUrl = `${baseUrl}/api/portal/${match[1]}/auth/refresh`;
             }
          }

          const refreshRes = await fetch(refreshUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            if (isPortalEndpoint) {
                localStorage.setItem('portal_token', data.access_token);
                localStorage.setItem('portal_refresh_token', data.refresh_token);
            } else {
                localStorage.setItem('gestao_token', data.accessToken);
                localStorage.setItem('gestao_refresh_token', data.refreshToken);
            }
            
            // Retry original request
            return apiFetch(endpoint, { ...options, _isRetry: true });
          }
        } catch (e) {
          // ignore, fall through to logout
        }
      }
      
      // Se não houver refresh token ou o refresh falhar
      if (isPortalEndpoint) {
          localStorage.removeItem('portal_token');
          localStorage.removeItem('portal_refresh_token');
          localStorage.removeItem('portal_user');
          const match = endpoint.match(/^\/portal\/([^/]+)/);
          if (match) {
             window.location.href = `/portal/${match[1]}/login`;
          } else {
             window.location.href = '/login';
          }
      } else {
          localStorage.removeItem('gestao_token');
          localStorage.removeItem('gestao_refresh_token');
          localStorage.removeItem('gestao_tenant_id');
          window.location.href = '/login';
      }
    }

    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Erro na requisição da API');
  }
  
  // Se for 204 No Content, não fazemos o parse do json
  if (res.status === 204) {
    return null;
  }
  
  if (options.rawResponse) {
    return res;
  }

  return res.json().catch(() => ({}));
}
