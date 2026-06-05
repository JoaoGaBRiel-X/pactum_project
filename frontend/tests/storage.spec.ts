import { test, expect } from '@playwright/test';

test('verify storage route handles paths with slashes correctly', async ({ request }) => {
  // We hit the backend directly via the Traefik endpoint to see if the routing is correct.
  // It shouldn't return a "Cannot GET" HTML page. Instead it should return a JSON error (404 File not found)
  // because the file probably doesn't exist in the local MinIO, but the route should be matched correctly!
  const response = await request.get('http://dev-api.192.168.50.200.nip.io:8000/api/storage/tenant-c0f47203-a3bc-4255-9248-401b9a4f432c/logo-1780669722376.png');
  
  // The route should return 404 since the file might not exist, but it MUST be a JSON response
  expect(response.status()).toBe(404);
  
  const contentType = response.headers()['content-type'];
  expect(contentType).toContain('application/json');
  
  const body = await response.json();
  expect(body.message).toBe('File not found');
  expect(body.statusCode).toBe(404);
});
