async function runTest() {
  const API_URL = 'http://localhost:3333/api';
  
  try {
    console.log("1. Logging in...");
    const loginRes = await fetch(`${API_URL}/authentication/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@lefer.com.br', password: 'admin' }) // Trying 'admin', usually the seed is 'admin' or 'admin123'
    });
    let loginData = await loginRes.json();
    if (loginRes.status !== 201 && loginRes.status !== 200) {
      console.log("Failed with 'admin', trying 'admin123'...");
      const loginRes2 = await fetch(`${API_URL}/authentication/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@lefer.com.br', password: 'admin123' })
      });
      loginData = await loginRes2.json();
      if (loginRes2.status !== 201 && loginRes2.status !== 200) {
         throw new Error("Could not login: " + JSON.stringify(loginData));
      }
    }
    
    const token = loginData.accessToken;
    console.log("Login OK! Token acquired.");

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Obter Tenants
    const tenantsRes = await fetch(`${API_URL}/authentication/me/tenants`, { headers });
    const tenants = await tenantsRes.json();
    const tenantId = tenants[0]?.tenantId;
    if (!tenantId) throw new Error("No tenant found for user");
    
    headers['x-tenant-id'] = tenantId;
    console.log(`Using Tenant ID: ${tenantId}`);

    console.log("\n--- TESTANDO ENDPOINTS DO DASHBOARD ---");

    // 1. GET /dashboard/metrics
    console.log("\n> Fetching /dashboard/metrics...");
    const metricsRes = await fetch(`${API_URL}/dashboard/metrics`, { headers });
    if (!metricsRes.ok) throw new Error(`Failed to fetch metrics: ${metricsRes.statusText}`);
    const metrics = await metricsRes.json();
    console.log("Metrics:", JSON.stringify(metrics, null, 2));

    // 2. GET /dashboard/upcoming-renewals
    console.log("\n> Fetching /dashboard/upcoming-renewals...");
    const renewalsRes = await fetch(`${API_URL}/dashboard/upcoming-renewals`, { headers });
    if (!renewalsRes.ok) throw new Error(`Failed to fetch upcoming renewals: ${renewalsRes.statusText}`);
    const renewals = await renewalsRes.json();
    console.log("Upcoming Renewals:", JSON.stringify(renewals, null, 2));

    console.log("\n> Fetching /dashboard/recent-overdue...");
    const overdueRes = await fetch(`${API_URL}/dashboard/recent-overdue`, { headers });
    if (!overdueRes.ok) {
      const errText = await overdueRes.text();
      throw new Error(`Failed to fetch recent overdue: ${overdueRes.statusText}. Body: ${errText}`);
    }
    const overdue = await overdueRes.json();
    console.log("Recent Overdue:", JSON.stringify(overdue, null, 2));

    console.log("\n✅ TODOS OS TESTES DO DASHBOARD PASSARAM!");

  } catch(e) {
    console.error("Test failed with exception:", e);
  }
}
runTest();
