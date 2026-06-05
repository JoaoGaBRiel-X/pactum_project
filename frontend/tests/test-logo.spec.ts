import { test, expect } from '@playwright/test';

test('validate logo api response', async ({ request }) => {
  // Let's test the storage endpoint to see if it even works
  // We don't have a known key, but we can check what the response for a missing key is, or if it throws a 500
  // First, let's login or just check if it's reachable.
  console.log("Testing API reachability...");
  const apiRes = await request.get('http://dev-api.192.168.50.200.nip.io:8000/api/tenant-settings');
  console.log("Tenant Settings Status:", apiRes.status());
  
  // Try to get a non-existent logo to see if it properly returns 404 instead of 500
  const storageRes = await request.get('http://dev-api.192.168.50.200.nip.io:8000/api/storage/non-existent-logo.png');
  console.log("Storage Missing File Status:", storageRes.status());
  
  // Wait, if we don't know the exact logo URL, we can't test a real one directly.
  // Unless we create one or mock it.
  // Actually, we can fetch the logoUrl from the tenant-settings if it's public.
  // Wait, @Public() is on getSettings! So we can fetch it!
  const settingsBody = await apiRes.json();
  console.log("Settings:", settingsBody);
  
  if (settingsBody && settingsBody.logoUrl) {
      const realLogoUrl = `http://dev-api.192.168.50.200.nip.io:8000/api${settingsBody.logoUrl}`;
      console.log("Fetching real logo at:", realLogoUrl);
      const realStorageRes = await request.get(realLogoUrl);
      console.log("Real Logo Status:", realStorageRes.status());
      console.log("Real Logo Content-Type:", realStorageRes.headers()['content-type']);
  }
});
