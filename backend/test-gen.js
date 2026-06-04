const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs/promises');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const axios = require('axios');
const FormData = require('form-data');

async function test() {
  const contractId = 'e15e7dfb-34f2-450e-9887-a0c9e1d2571f';
  
  const { Pool } = require('pg');
  const { PrismaPg } = require('@prisma/adapter-pg');
  const dbUrl = new URL(process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/gestao_contratos?schema=public');
  const pool = new Pool({
    user: dbUrl.username, password: dbUrl.password, host: dbUrl.hostname, port: parseInt(dbUrl.port, 10), database: dbUrl.pathname.slice(1), max: 5
  });
  
  const res = await pool.query("SELECT nspname FROM pg_namespace WHERE nspname LIKE 'tenant_%';");
  let tenantSchema = null;
  for (const row of res.rows) {
    const adapter = new PrismaPg(pool, { schema: row.nspname });
    const tenantClient = new PrismaClient({ adapter });
    const c = await tenantClient.contract.findUnique({ where: { id: contractId } });
    if (c) {
      tenantSchema = row.nspname;
      break;
    }
  }
  
  if (!tenantSchema) { console.log('Contract not found in any tenant'); return; }
  console.log('Found contract in', tenantSchema);
  
  const adapter = new PrismaPg(pool, { schema: tenantSchema });
  const tenantClient = new PrismaClient({ adapter });
  
  const contract = await tenantClient.contract.findUnique({
    where: { id: contractId },
    include: { customer: { include: { contacts: true } }, product: true, items: true }
  });
  
  const template = await tenantClient.documentTemplate.findFirst({ orderBy: { createdAt: 'desc' } });
  if (!template) { console.log('No template found'); return; }
  
  console.log('Using template:', template.path);
  
  try {
    const templateBuffer = await fs.readFile(template.path);
    console.log('Template read OK');
    
    const viewData = {
      tenant: { name: 'Test', document: '11', legalRepName: 'Test', legalRepCpf: '11' },
      customer: {
        name: contract.customer.corporateName,
        cnpj: contract.customer.document,
        corporateName: contract.customer.corporateName,
        tradeName: contract.customer.tradeName || contract.customer.corporateName,
        document: contract.customer.document,
        address: contract.customer.street ? 'Address' : 'Sem endereço',
        contactName: 'Contato', contactCpf: 'CPF'
      },
      contract: {
        value: '100', globalDiscount: '0', totalValue: '100', renewalMode: 'Manual'
      },
      software: { name: contract.product.name, description: '' },
      modules: []
    };
    
    const zip = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    doc.render(viewData);
    const filledDocxBuffer = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
    console.log('Docx filled OK');
    
    const form = new FormData();
    form.append('files', filledDocxBuffer, { filename: 'contract.docx' });
    console.log('Sending to gotenberg...');
    const gotenbergUrl = 'http://localhost:3001';
    await axios.post(gotenbergUrl + '/forms/libreoffice/convert', form, { headers: form.getHeaders(), responseType: 'arraybuffer' });
    console.log('PDF generated OK');
    
  } catch (e) {
    console.error('ERROR:', e.message);
    if (e.properties && e.properties.errors) console.error(e.properties.errors);
    if (e.response) console.error(Buffer.from(e.response.data).toString('utf-8'));
  }
}
test().catch(console.error);
