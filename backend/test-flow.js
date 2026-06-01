

async function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

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

    // 2. Criar ou Atualizar Template "CONTRACT_ACTIVATED"
    console.log("2. Setting up Notification Template...");
    await fetch(`${API_URL}/notification-templates`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'CONTRACT_ACTIVATED',
        subject: 'Seu contrato com a Lefer foi ativado!',
        content: 'Olá {{customer.corporateName}}, seu contrato #{contract.id} foi ativado com sucesso!',
        category: 'CONTRACT',
        isActive: true
      })
    });

    // 3. Criar um Cliente de Teste
    console.log("3. Creating test customer...");
    const custRes = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        corporateName: 'Empresa Teste Notificação LTDA',
        document: `99${Date.now().toString().slice(-12)}`,
        contacts: [{ name: 'João Notificações', email: 'joao.notificacao@teste.com' }]
      })
    });
    if (!custRes.ok) {
        const errText = await custRes.text();
        throw new Error("Failed to create customer. Status: " + custRes.status + " Body: " + errText);
    }
    const customer = await custRes.json();
    console.log(`Customer created: ${customer.id}`);

    // 4. Buscar ou Criar Produto
    console.log("4. Fetching products...");
    const prodRes = await fetch(`${API_URL}/products`, { headers });
    let products = await prodRes.json();
    let product = products.find(p => p.modules && p.modules.length > 0);
    
    if (!product) {
      console.log("4b. No product with modules found, creating one...");
      const newProdRes = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: 'Software Teste E2E',
          description: 'Produto criado pelo script de teste',
          modules: [{ name: 'Módulo Básico', description: 'Módulo de teste', price: 100.00 }]
        })
      });
      product = await newProdRes.json();
      if (!product.id) throw new Error("Failed to create product: " + JSON.stringify(product));
      
      // Re-fetch to get modules
      const productDetailRes = await fetch(`${API_URL}/products/${product.id}`, { headers });
      product = await productDetailRes.json();
      console.log(`Product created: ${product.id}`);
    }
    
    if (!product.modules || product.modules.length === 0) throw new Error("Product has no modules");

    // 5. Criar Contrato
    console.log("5. Creating draft contract...");
    const contractRes = await fetch(`${API_URL}/contracts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        customerId: customer.id,
        productId: product.id,
        items: [{ moduleId: product.modules[0].id, quantity: 1, discount: 0 }]
      })
    });
    const contract = await contractRes.json();
    if (!contract.id) throw new Error("Failed to create contract: " + JSON.stringify(contract));
    console.log(`Contract created: ${contract.id}`);

    // 6. Ativar Contrato
    console.log("6. Activating contract to trigger notification...");
    const activateRes = await fetch(`${API_URL}/contracts/${contract.id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        status: 'ACTIVE',
        reason: 'Ativação para teste de notificação'
      })
    });
    const activatedContract = await activateRes.json();
    if (activatedContract.status !== 'ACTIVE') throw new Error("Failed to activate contract");

    // 7. Esperar processamento da fila
    console.log("7. Waiting 5 seconds for BullMQ to process email...");
    await delay(5000);

    // 8. Checar Histórico de Comunicações
    console.log("8. Fetching communication history...");
    const historyRes = await fetch(`${API_URL}/notification-templates/history/customer/${customer.id}`, { headers });
    const history = await historyRes.json();
    
    console.log("=== TEST RESULTS ===");
    console.log(`Histórico encontrado: ${history.length} registro(s)`);
    if (history.length > 0) {
      console.log(`Template: ${history[0].templateName}`);
      console.log(`Assunto: ${history[0].subject}`);
      console.log(`Destinatário: ${history[0].recipient}`);
      console.log(`Status: ${history[0].status}`);
      if (history[0].errorMessage) console.log(`Erro: ${history[0].errorMessage}`);
      
      if (history[0].status === 'SENT') {
        console.log("✅ TEST PASSED: Flow executed and email was sent successfully (check logs for preview URL).");
      } else {
        console.log("⚠️ TEST WARNING: Email was queued but status is not SENT. Check BullMQ logs.");
      }
    } else {
      console.log("❌ TEST FAILED: No communication history found.");
    }
    
  } catch(e) {
    console.error("Test failed with exception:", e);
  }
}
runTest();
