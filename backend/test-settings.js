const http = require('http');

async function testSettings() {
  console.log("Logging in...");
  let resLogin = await fetch("http://localhost:3333/api/authentication/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@lefer.com.br", password: "admin" })
  });

  if (!resLogin.ok) {
    resLogin = await fetch("http://localhost:3333/api/authentication/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@lefer.com.br", password: "admin123" })
    });
  }

  const { accessToken, tenantLinks } = await resLogin.json();
  const tenantId = tenantLinks[0].tenantId;

  const res = await fetch("http://localhost:3333/api/tenant-settings", {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "x-tenant-id": tenantId
    }
  });

  console.log("Status:", res.status);
  const data = await res.text();
  console.log("Response:", data);
}

testSettings();
